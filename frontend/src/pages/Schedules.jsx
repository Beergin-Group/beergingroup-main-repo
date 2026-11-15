import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function Schedules() {
  const { activeDependentId } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteSchedule, setDeleteSchedule] = useState(null)

  const [formData, setFormData] = useState({
    medicine_id: '',
    frequency_type: 'daily',
    frequency_value: '1',
    dose_times: ['08:00'],
    meal_timing: 'after_meal',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeDependentId) params.dependent_id = activeDependentId
      const [schedRes, medRes] = await Promise.all([
        api.get('/schedules', { params }),
        api.get('/medicines', { params })
      ])
      if (schedRes.data?.success) setSchedules(schedRes.data.data)
      if (medRes.data?.success) setMedicines(medRes.data.data)
    } catch (err) {
      console.error('Failed to load schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeDependentId])

  const openAddModal = () => {
    setFormData({
      medicine_id: medicines.length > 0 ? medicines[0].id : '',
      frequency_type: 'daily',
      frequency_value: '1',
      dose_times: ['08:00'],
      meal_timing: 'after_meal',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    })
    setModalOpen(true)
  }

  const handleAddTime = () => {
    setFormData({
      ...formData,
      dose_times: [...formData.dose_times, '12:00']
    })
  }

  const handleRemoveTime = (index) => {
    setFormData({
      ...formData,
      dose_times: formData.dose_times.filter((_, i) => i !== index)
    })
  }

  const handleTimeChange = (index, value) => {
    const updated = [...formData.dose_times]
    updated[index] = value
    setFormData({ ...formData, dose_times: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.medicine_id) {
      alert('Please select a medicine.')
      return
    }
    try {
      await api.post('/schedules', {
        ...formData,
        dependent_id: activeDependentId
      })
      setModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create schedule.')
    }
  }

  const handleDelete = async () => {
    if (!deleteSchedule) return
    try {
      await api.delete(`/schedules/${deleteSchedule.id}`)
      setDeleteSchedule(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete schedule.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medication Routine Schedules"
        subtitle="Configure reminder times, daily frequency, and meal relations for each prescription."
        actions={
          <button onClick={openAddModal} className="btn-primary">
            + Add Schedule
          </button>
        }
      />

      {loading ? (
        <Spinner label="Loading routines..." />
      ) : schedules.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <span className="text-3xl block mb-2">📅</span>
          <p className="text-base font-semibold text-slate-600">No schedules created yet</p>
          <p className="text-xs mt-1">Define your daily medication schedule to receive reminders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map(sched => (
            <div key={sched.id} className="card p-6 border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm"
                      style={{ backgroundColor: sched.color || '#0d9488' }}
                    >
                      💊
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{sched.medicine_name}</h3>
                      <p className="text-xs text-slate-500">{sched.dosage}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    {sched.frequency_type}
                  </span>
                </div>

                {/* Timing Chips */}
                <div className="mt-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Dose Reminder Slots
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sched.dose_times?.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800">
                        ⏰ {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Meal Relation:</span>
                  <span className="font-semibold text-slate-700 capitalize">
                    {sched.meal_timing ? sched.meal_timing.replace('_', ' ') : 'None'}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Start Date:</span>
                  <span className="font-mono text-slate-700">{sched.start_date}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteSchedule(sched)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  Remove Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Schedule Modal */}
      {modalOpen && (
        <Modal
          title="Create Medication Routine"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                Save Routine
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Medicine *</label>
              <select
                required
                value={formData.medicine_id}
                onChange={e => setFormData({ ...formData, medicine_id: e.target.value })}
                className="input-field"
              >
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.dosage})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Frequency</label>
                <select
                  value={formData.frequency_type}
                  onChange={e => setFormData({ ...formData, frequency_type: e.target.value })}
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="as_needed">As Needed (PRN)</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Meal Relation</label>
                <select
                  value={formData.meal_timing}
                  onChange={e => setFormData({ ...formData, meal_timing: e.target.value })}
                  className="input-field"
                >
                  <option value="after_meal">After Meal</option>
                  <option value="before_meal">Before Meal</option>
                  <option value="with_meal">With Meal</option>
                  <option value="empty_stomach">Empty Stomach</option>
                  <option value="no_food_relation">No Food Relation</option>
                </select>
              </div>
            </div>

            {/* Dose Times List */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Dose Times</label>
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  + Add Time Slot
                </button>
              </div>
              <div className="space-y-2">
                {formData.dose_times.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      required
                      value={t}
                      onChange={e => handleTimeChange(idx, e.target.value)}
                      className="input-field font-mono"
                    />
                    {formData.dose_times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(idx)}
                        className="px-2.5 py-2 text-rose-500 hover:bg-rose-50 rounded-lg text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="input-field font-mono text-xs"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteSchedule && (
        <Modal
          title="Remove Schedule"
          onClose={() => setDeleteSchedule(null)}
          footer={
            <>
              <button onClick={() => setDeleteSchedule(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Remove
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to remove the schedule for <strong className="text-slate-900">{deleteSchedule.medicine_name}</strong>?
          </p>
        </Modal>
      )}
    </div>
  )
}
