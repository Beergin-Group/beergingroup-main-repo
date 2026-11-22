import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import DoseCountdown from '../components/DoseCountdown'
import Modal from '../components/Modal'

export default function Dashboard() {
  const { user, activeDependentId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDose, setSelectedDose] = useState(null)
  const [logNotes, setLogNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadDashboard = async () => {
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [activeDependentId])

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
      setModalOpen(false)
      setSelectedDose(null)
      setLogNotes('')
      await loadDashboard()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update dose')
    } finally {
      setActionLoading(false)
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'} 👋`}
        subtitle="Here is your daily medication schedule and upcoming dose countdown."
        actions={
          <button onClick={loadDashboard} className="btn-secondary">
            ↻ Refresh
          </button>
        }
      />

      {/* 4 Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Scheduled at <strong className="text-slate-700">{new Date(nextDose.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                {nextDose.instructions && ` • ${nextDose.instructions}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-teal-100">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Countdown</span>
              <DoseCountdown targetTimeIso={nextDose.scheduled_time} />
            </div>
            <button
              onClick={() => handleRecordDose(nextDose, 'taken')}
              disabled={actionLoading}
              className="btn-primary"
            >
              ✓ Take Now
            </button>
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
                {doses.map((dose, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {new Date(dose.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        {dose.status !== 'taken' ? (
                          <>
                            <button
                              onClick={() => handleRecordDose(dose, 'taken')}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-100 transition-colors"
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
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">
                            Recorded at {new Date(dose.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                {new Date(selectedDose.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
