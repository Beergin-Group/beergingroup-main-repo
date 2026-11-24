import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatScheduleTime } from './Dashboard'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function Schedules() {
  const { activeDependentId } = useAuth()
  const { toast } = useToast()
  const [schedules, setSchedules] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
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
      toast.error('Failed to retrieve medication routines.')
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

  const openEditModal = (sched) => {
    setEditingSchedule(sched)
    const times = Array.isArray(sched.dose_times)
      ? sched.dose_times
      : typeof sched.dose_times === 'string'
      ? JSON.parse(sched.dose_times || '[]')
      : ['08:00']

    setFormData({
      medicine_id: sched.medicine_id,
      frequency_type: sched.frequency_type || 'daily',
      frequency_value: sched.frequency_value || '1',
      dose_times: times.length > 0 ? times : ['08:00'],
      meal_timing: sched.meal_timing || 'after_meal',
      start_date: sched.start_date || new Date().toISOString().split('T')[0],
      end_date: sched.end_date || ''
    })
    setEditModalOpen(true)
  }

  const handleAddTime = () => {
    setFormData({
      ...formData,
      dose_times: [...formData.dose_times, '12:00']
    })
  }

  const handleRemoveTime = (index) => {
    // Allow removing down to 0 times for PRN / as-needed medications
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
      toast.warning('Please select a medicine.')
      return
    }

    try {
      await api.post('/schedules', {
        ...formData,
        dependent_id: activeDependentId
      })
      toast.success('Medication routine created successfully!')
      setModalOpen(false)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create schedule.'
      toast.error(msg)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingSchedule) return

    try {
      await api.put(`/schedules/${editingSchedule.id}`, {
        ...formData,
        dependent_id: activeDependentId
      })
      toast.success('Schedule updated successfully!')
      setEditModalOpen(false)
      setEditingSchedule(null)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update schedule.'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!deleteSchedule) return
    try {
      await api.delete(`/schedules/${deleteSchedule.id}`)
      toast.info('Schedule removed.')
      setDeleteSchedule(null)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete schedule.'
      toast.error(msg)
    }
  }

  // Group schedules by medicine (Single-card grouping)
  const groupedSchedules = Object.values(
    schedules.reduce((acc, sched) => {
      const key = sched.medicine_id || sched.medicine_name || sched.id
      if (!acc[key]) {
        acc[key] = {
          medicine_id: sched.medicine_id,
          medicine_name: sched.medicine_name,
          dosage: sched.dosage,
          form: sched.form,
          color: sched.color || '#0d9488',
          items: []
        }
      }
      acc[key].items.push(sched)
      return acc
    }, {})
  )

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
      ) : groupedSchedules.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <span className="text-3xl block mb-2">📅</span>
          <p className="text-base font-semibold text-slate-600">No schedules created yet</p>
          <p className="text-xs mt-1">Define your daily medication schedule to receive reminders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groupedSchedules.map(group => (
            <div
              key={group.medicine_id || group.medicine_name}
              className="card p-6 border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Consolidated Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                      style={{ backgroundColor: group.color }}
                    >
                      💊
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">{group.medicine_name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{group.dosage} • {group.form || 'Tablet'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">
                    {group.items.length} {group.items.length === 1 ? 'Routine' : 'Routines'}
                  </span>
                </div>

                {/* Sub-routines under this single medicine card */}
                <div className="mt-4 space-y-4">
                  {group.items.map((sched, idx) => {
                    const times = Array.isArray(sched.dose_times)
                      ? sched.dose_times
                      : typeof sched.dose_times === 'string'
                      ? JSON.parse(sched.dose_times || '[]')
                      : []

                    return (
                      <div
                        key={sched.id}
                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Routine #{idx + 1} ({sched.frequency_type})
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(sched)}
                              className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteSchedule(sched)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Timing Chips */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Dose Reminder Slots
                          </label>
                          {times.length === 0 ? (
                            <span className="text-xs italic text-slate-400 font-medium">
                              PRN / As-needed (No fixed time slots)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {times.map((t, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 shadow-2xs"
                                >
                                  ⏰ {formatScheduleTime(t)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Meal Relation</span>
                            <span className="font-semibold text-slate-700 capitalize">
                              {sched.meal_timing ? sched.meal_timing.replace('_', ' ') : 'None'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Effective Date</span>
                            <span className="font-mono text-slate-700">
                              {sched.start_date} {sched.end_date ? `to ${sched.end_date}` : '(Ongoing)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
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
                  <option value="daily">Every Day</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As-Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Meal Relation</label>
                <select
                  value={formData.meal_timing}
                  onChange={e => setFormData({ ...formData, meal_timing: e.target.value })}
                  className="input-field"
                >
                  <option value="before_meal">Before Meal</option>
                  <option value="after_meal">After Meal</option>
                  <option value="with_meal">With Meal</option>
                  <option value="empty_stomach">Empty Stomach</option>
                  <option value="no_food_relation">No Food Relation</option>
                </select>
              </div>
            </div>

            {/* Reminder Times */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Dose Reminder Times {formData.frequency_type === 'as_needed' ? '(Optional for PRN)' : '*'}
                </label>
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  + Add Time Slot
                </button>
              </div>

              {formData.dose_times.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No specific reminder slots set. (As-needed medication)</p>
              ) : (
                <div className="space-y-2">
                  {formData.dose_times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={t}
                        onChange={e => handleTimeChange(idx, e.target.value)}
                        className="input-field font-mono"
                        required={formData.frequency_type !== 'as_needed'}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(idx)}
                        className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
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

      {/* In-Card Schedule Edit Modal */}
      {editModalOpen && editingSchedule && (
        <Modal
          title={`Edit Routine: ${editingSchedule.medicine_name}`}
          onClose={() => setEditModalOpen(false)}
          footer={
            <>
              <button onClick={() => setEditModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn-primary">
                Save Changes
              </button>
            </>
          }
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Frequency</label>
                <select
                  value={formData.frequency_type}
                  onChange={e => setFormData({ ...formData, frequency_type: e.target.value })}
                  className="input-field"
                >
                  <option value="daily">Every Day</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As-Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Meal Relation</label>
                <select
                  value={formData.meal_timing}
                  onChange={e => setFormData({ ...formData, meal_timing: e.target.value })}
                  className="input-field"
                >
                  <option value="before_meal">Before Meal</option>
                  <option value="after_meal">After Meal</option>
                  <option value="with_meal">With Meal</option>
                  <option value="empty_stomach">Empty Stomach</option>
                  <option value="no_food_relation">No Food Relation</option>
                </select>
              </div>
            </div>

            {/* Edit Reminder Times */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 block">Dose Reminder Times</label>
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  + Add Time Slot
                </button>
              </div>

              {formData.dose_times.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No specific reminder slots set. (As-needed medication)</p>
              ) : (
                <div className="space-y-2">
                  {formData.dose_times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={t}
                        onChange={e => handleTimeChange(idx, e.target.value)}
                        className="input-field font-mono"
                        required={formData.frequency_type !== 'as_needed'}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(idx)}
                        className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">End Date</label>
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
          title="Confirm Delete Routine"
          onClose={() => setDeleteSchedule(null)}
          footer={
            <>
              <button onClick={() => setDeleteSchedule(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete Schedule
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this schedule routine for{' '}
            <strong className="text-slate-900">{deleteSchedule.medicine_name}</strong>?
          </p>
        </Modal>
      )}
    </div>
  )
}
