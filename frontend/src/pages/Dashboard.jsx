import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast, playAlarmSound } from '../context/ToastContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import DoseCountdown, { parseDoseTargetTime } from '../components/DoseCountdown'
import Modal from '../components/Modal'

export function formatScheduleTime(isoOrTimeStr) {
  if (!isoOrTimeStr) return '—'
  let hours = 0
  let minutes = 0

  if (typeof isoOrTimeStr === 'string' && isoOrTimeStr.includes('T')) {
    const timePart = isoOrTimeStr.split('T')[1].substring(0, 5)
    const [h, m] = timePart.split(':').map(Number)
    hours = h
    minutes = m
  } else if (typeof isoOrTimeStr === 'string' && /^\d{2}:\d{2}$/.test(isoOrTimeStr)) {
    const [h, m] = isoOrTimeStr.split(':').map(Number)
    hours = h
    minutes = m
  } else {
    const d = new Date(isoOrTimeStr)
    if (isNaN(d.getTime())) return String(isoOrTimeStr)
    hours = d.getHours()
    minutes = d.getMinutes()
  }

  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedH = hours % 12 || 12
  const formattedM = minutes < 10 ? `0${minutes}` : minutes
  const pad24H = hours < 10 ? `0${hours}` : hours
  return `${formattedH}:${formattedM} ${ampm} (${pad24H}:${formattedM})`
}

export function isDoseDue(scheduledTimeIso) {
  if (!scheduledTimeIso) return true
  const targetDate = parseDoseTargetTime(scheduledTimeIso)
  if (!targetDate) return true
  // Allow Take Now if current time is within or past the scheduled time
  return new Date().getTime() >= targetDate.getTime()
}

export default function Dashboard() {
  const { user, activeDependentId } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [alarmModalOpen, setAlarmModalOpen] = useState(false)
  const [selectedDose, setSelectedDose] = useState(null)
  const [logNotes, setLogNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeDependentId) params.dependent_id = activeDependentId
      const res = await api.get('/dose-logs/today', { params })
      if (res.data?.success) {
        setData(res.data)
      }
    } catch (err) {
      console.error('Failed to load today doses:', err)
      toast.error('Unable to fetch medication schedule.')
    } finally {
      setLoading(false)
    }
  }, [activeDependentId, toast])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleRecordDose = async (dose, status) => {
    try {
      setActionLoading(true)
      await api.post('/dose-logs/record', {
        schedule_id: dose.schedule_id,
        medicine_id: dose.medicine_id,
        scheduled_time: dose.scheduled_time,
        status: status,
        notes: logNotes,
        dependent_id: activeDependentId
      })

      if (status === 'taken') {
        toast.success(`Marked ${dose.medicine_name} as Taken!`)
      } else if (status === 'skipped') {
        toast.warning(`Marked ${dose.medicine_name} as Skipped.`)
      } else {
        toast.info(`Updated status for ${dose.medicine_name}.`)
      }

      setModalOpen(false)
      setAlarmModalOpen(false)
      setSelectedDose(null)
      setLogNotes('')
      await loadDashboard()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update dose status'
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAlarmTrigger = () => {
    if (data?.next_dose && data.next_dose.status === 'pending') {
      playAlarmSound()
      setAlarmModalOpen(true)
      toast.warning(`Medication Alarm: It's time to take ${data.next_dose.medicine_name}!`)
    }
  }

  const openLogModal = (dose) => {
    setSelectedDose(dose)
    setLogNotes(dose.notes || '')
    setModalOpen(true)
  }

  if (loading && !data) return <Spinner label="Loading today's doses..." />

  const summary = data?.summary || { total: 0, taken: 0, skipped: 0, pending: 0, completion_rate: 0 }
  const nextDose = data?.next_dose
  const doses = data?.data || []
  const canTakeNextDoseNow = nextDose ? isDoseDue(nextDose.scheduled_time) : false

  return (
    <div className="space-y-6">
      {/* Page Header (Removed redundant Refresh button) */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'} 👋`}
        subtitle="Here is your daily medication schedule and upcoming dose countdown."
      />

      {/* 5 Metric StatCards: Includes Skipped Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Today's Doses"
          value={summary.total}
          sub="scheduled slots"
          color="blue"
          icon="📅"
        />
        <StatCard
          label="Doses Taken"
          value={summary.taken}
          sub={`${summary.total - summary.taken} remaining`}
          color="emerald"
          icon="✓"
        />
        <StatCard
          label="Doses Skipped"
          value={summary.skipped || 0}
          sub="marked as skipped"
          color="rose"
          icon="✕"
        />
        <StatCard
          label="Pending / Due"
          value={summary.pending}
          sub="requires attention"
          color="amber"
          icon="⏳"
        />
        <StatCard
          label="Today's Adherence"
          value={`${summary.completion_rate}%`}
          sub={summary.completion_rate >= 80 ? 'Excellent progress' : 'Keep on track'}
          color="teal"
          icon="📈"
        />
      </div>

      {/* Next Dose Banner */}
      {nextDose ? (
        <div className="card bg-gradient-to-r from-teal-500/10 via-teal-50/50 to-white border border-teal-200/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-teal-600/20 flex-shrink-0">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                  Next Scheduled Dose
                </span>
                <StatusBadge status={nextDose.status} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                {nextDose.medicine_name} <span className="text-sm font-semibold text-slate-500">({nextDose.dosage})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled at <strong className="text-slate-700">{formatScheduleTime(nextDose.scheduled_time)}</strong>
                {nextDose.instructions && ` • ${nextDose.instructions}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-teal-100">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Countdown</span>
              <DoseCountdown targetTimeIso={nextDose.scheduled_time} onAlarm={handleAlarmTrigger} />
            </div>
            <div className="relative group">
              <button
                onClick={() => handleRecordDose(nextDose, 'taken')}
                disabled={actionLoading || !canTakeNextDoseNow}
                className={`py-2 px-4 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  canTakeNextDoseNow
                    ? 'btn-primary'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
                }`}
              >
                {actionLoading ? 'Saving...' : '✓ Take Now'}
              </button>
              {!canTakeNextDoseNow && (
                <div className="hidden group-hover:block absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg text-center z-20">
                  Locked: Available when scheduled dose time arrives.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 bg-slate-50 text-center border-dashed border-2 border-slate-200">
          <p className="text-sm font-semibold text-slate-600">🎉 No more upcoming doses scheduled for today!</p>
          <p className="text-xs text-slate-400 mt-1">Great job staying on top of your health regimen.</p>
        </div>
      )}

      {/* Today's Schedule Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Today's Dose Schedule</h2>
          <span className="text-xs font-medium text-slate-400">{doses.length} dose slots</span>
        </div>

        {doses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <span className="text-3xl block mb-2">📋</span>
            <p className="text-sm font-medium">No medication schedules active for today.</p>
            <p className="text-xs mt-1">Go to the Schedules page to set up your routine.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Scheduled Time</th>
                  <th className="px-6 py-3">Medicine</th>
                  <th className="px-6 py-3">Form & Timing</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doses.map((dose, idx) => {
                  const doseDue = isDoseDue(dose.scheduled_time)
                  const isTaken = dose.status === 'taken'
                  const isSkipped = dose.status === 'skipped'

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {formatScheduleTime(dose.scheduled_time)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: dose.color || '#0d9488' }}
                          />
                          <div>
                            <p className="font-bold text-slate-900">{dose.medicine_name}</p>
                            <p className="text-xs text-slate-400">{dose.dosage}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 capitalize">
                        <span>{dose.form || 'Tablet'}</span>
                        {dose.meal_timing && dose.meal_timing !== 'no_food_relation' && (
                          <span className="text-slate-400 block">{dose.meal_timing.replace('_', ' ')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={dose.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isTaken ? (
                            <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded-lg">
                              ✓ Taken at {formatScheduleTime(dose.recorded_at)}
                            </span>
                          ) : isSkipped ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-rose-600 font-semibold px-2 py-1 bg-rose-50 rounded-lg">
                                ✕ Skipped
                              </span>
                              <button
                                onClick={() => handleRecordDose(dose, 'pending')}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                                title="Undo Skipped status"
                              >
                                Undo
                              </button>
                            </div>
                          ) : (
                            /* Pending State */
                            <>
                              <button
                                onClick={() => handleRecordDose(dose, 'taken')}
                                disabled={actionLoading || !doseDue}
                                title={!doseDue ? 'Action locked until scheduled dose time arrives' : 'Mark as Taken'}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                                  doseDue
                                    ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                }`}
                              >
                                ✓ Take
                              </button>
                              <button
                                onClick={() => handleRecordDose(dose, 'skipped')}
                                disabled={actionLoading}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors"
                              >
                                ✕ Skip
                              </button>
                              <button
                                onClick={() => openLogModal(dose)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs hover:bg-slate-200 transition-colors"
                              >
                                Notes
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audible Dose Reminder Alarm Modal */}
      {alarmModalOpen && nextDose && (
        <Modal
          title="⏰ Dose Reminder Alert!"
          onClose={() => setAlarmModalOpen(false)}
          footer={
            <>
              <button
                onClick={() => setAlarmModalOpen(false)}
                className="btn-secondary"
              >
                Dismiss / Snooze
              </button>
              <button
                onClick={() => handleRecordDose(nextDose, 'taken')}
                disabled={actionLoading}
                className="btn-primary"
              >
                ✓ Mark as Taken
              </button>
            </>
          }
        >
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-sm animate-bounce">
              🔔
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                It's time to take your {nextDose.medicine_name}!
              </h3>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Dosage: <strong className="text-teal-700">{nextDose.dosage}</strong> ({nextDose.form || 'Tablet'})
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Scheduled at {formatScheduleTime(nextDose.scheduled_time)}
                {nextDose.instructions && ` • "${nextDose.instructions}"`}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Dose Notes Modal */}
      {modalOpen && selectedDose && (
        <Modal
          title={`Log Dose: ${selectedDose.medicine_name}`}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleRecordDose(selectedDose, 'taken')}
                disabled={actionLoading}
                className="btn-primary"
              >
                Mark as Taken
              </button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Scheduled Time</p>
              <p className="font-bold text-slate-800">
                {formatScheduleTime(selectedDose.scheduled_time)}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Dose Notes / Side Effects</label>
              <textarea
                value={logNotes}
                onChange={e => setLogNotes(e.target.value)}
                placeholder="e.g. Taken with breakfast, felt slight drowsiness..."
                rows={3}
                className="input-field"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
