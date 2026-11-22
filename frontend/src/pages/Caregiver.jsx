import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function Caregiver() {
  const { dependents, refreshDependents, activeDependentId, setActiveDependentId } = useAuth()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDep, setDeleteDep] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Parent',
    date_of_birth: '',
    emergency_contact: '',
    notes: ''
  })

  const openAddModal = () => {
    setFormData({
      name: '',
      relationship: 'Parent',
      date_of_birth: '',
      emergency_contact: '',
      notes: ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.post('/caregiver/dependents', formData)
      setModalOpen(false)
      await refreshDependents()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add dependent.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDep) return
    try {
      await api.delete(`/caregiver/dependents/${deleteDep.id}`)
      if (activeDependentId === deleteDep.id) {
        setActiveDependentId(null)
      }
      setDeleteDep(null)
      await refreshDependents()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove dependent.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caregiver Hub & Dependent Management"
        subtitle="Manage profiles for family members, elderly parents, or dependents under your care."
        actions={
          <button onClick={openAddModal} className="btn-primary">
            + Add Dependent
          </button>
        }
      />

      {loading ? (
        <Spinner label="Updating profiles..." />
      ) : dependents.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <span className="text-3xl block mb-2">👥</span>
          <p className="text-base font-semibold text-slate-600">No dependents registered yet</p>
          <p className="text-xs mt-1">Add elderly family members or children to manage their prescriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dependents.map(dep => {
            const isSelected = activeDependentId === dep.id
            return (
              <div
                key={dep.id}
                className={`card p-6 border transition-all flex flex-col justify-between ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{dep.name}</h3>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        {dep.relationship}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        Active Mode
                      </span>
                    )}
                  </div>

                  {dep.date_of_birth && (
                    <p className="text-xs text-slate-500 mt-3">
                      Birthday: <strong className="text-slate-700">{dep.date_of_birth}</strong>
                    </p>
                  )}
                  {dep.emergency_contact && (
                    <p className="text-xs text-slate-500 mt-1">
                      Emergency: <strong className="text-slate-700">{dep.emergency_contact}</strong>
                    </p>
                  )}
                  {dep.notes && (
                    <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded-lg">
                      "{dep.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveDependentId(isSelected ? null : dep.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {isSelected ? 'Exit Proxy' : 'Switch to Profile'}
                  </button>
                  <button
                    onClick={() => setDeleteDep(dep)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Dependent Modal */}
      {modalOpen && (
        <Modal
          title="Add Family Member / Dependent"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                Save Dependent
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grandma Elena Santos"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                  className="input-field"
                >
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="input-field font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="+63 912 345 6789"
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Medical Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Allergies, physician contacts, special conditions..."
                rows={2}
                className="input-field"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDep && (
        <Modal
          title="Remove Dependent"
          onClose={() => setDeleteDep(null)}
          footer={
            <>
              <button onClick={() => setDeleteDep(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Remove Profile
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong className="text-slate-900">{deleteDep.name}</strong> from your caregiver profile?
          </p>
        </Modal>
      )}
    </div>
  )
}
