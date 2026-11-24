import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function Caregiver() {
  const { dependents, refreshDependents, activeDependentId, setActiveDependentId } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingDep, setEditingDep] = useState(null)
  const [deleteDep, setDeleteDep] = useState(null)
  const [search, setSearch] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Parent',
    custom_relationship: '',
    email: '',
    age: '',
    address: '',
    date_of_birth: '',
    emergency_contact: '',
    notes: ''
  })

  const openAddModal = () => {
    setFormData({
      name: '',
      relationship: 'Parent',
      custom_relationship: '',
      email: '',
      age: '',
      address: '',
      date_of_birth: '',
      emergency_contact: '',
      notes: ''
    })
    setModalOpen(true)
  }

  const openEditModal = (dep) => {
    setEditingDep(dep)
    const isStandardRel = ['Parent', 'Child', 'Spouse', 'Grandparent', 'Sibling'].includes(dep.relationship)

    setFormData({
      name: dep.name || '',
      relationship: isStandardRel ? dep.relationship : 'Other',
      custom_relationship: isStandardRel ? (dep.custom_relationship || '') : dep.relationship,
      email: dep.email || '',
      age: dep.age ? String(dep.age) : '',
      address: dep.address || '',
      date_of_birth: dep.date_of_birth || '',
      emergency_contact: dep.emergency_contact || '',
      notes: dep.notes || ''
    })
    setEditModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const finalRelationship =
      formData.relationship === 'Other' && formData.custom_relationship.trim()
        ? formData.custom_relationship.trim()
        : formData.relationship

    const payload = {
      ...formData,
      relationship: finalRelationship,
      age: formData.age ? parseInt(formData.age, 10) : null
    }

    try {
      setLoading(true)
      await api.post('/caregiver/dependents', payload)
      toast.success(`Added ${formData.name} to dependents!`)
      setModalOpen(false)
      await refreshDependents()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add dependent.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingDep) return

    const finalRelationship =
      formData.relationship === 'Other' && formData.custom_relationship.trim()
        ? formData.custom_relationship.trim()
        : formData.relationship

    const payload = {
      ...formData,
      relationship: finalRelationship,
      age: formData.age ? parseInt(formData.age, 10) : null
    }

    try {
      setLoading(true)
      await api.put(`/caregiver/dependents/${editingDep.id}`, payload)
      toast.success(`Updated ${formData.name}'s profile!`)
      setEditModalOpen(false)
      setEditingDep(null)
      await refreshDependents()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update dependent.'
      toast.error(msg)
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
      toast.info(`Removed ${deleteDep.name}.`)
      setDeleteDep(null)
      await refreshDependents()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove dependent.'
      toast.error(msg)
    }
  }

  const handleSwitchProfile = (depId, depName) => {
    if (activeDependentId === depId) {
      setActiveDependentId(null)
      toast.info('Switched back to your personal profile.')
    } else {
      setActiveDependentId(depId)
      toast.success(`Switched proxy view to ${depName}.`)
    }
  }

  const filteredDependents = dependents.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.emergency_contact || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.relationship || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.address || '').toLowerCase().includes(search.toLowerCase())
  )

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

      {/* Dependent Search Bar */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Search dependents by name, relationship, email, phone, or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {loading ? (
        <Spinner label="Updating profiles..." />
      ) : filteredDependents.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <span className="text-3xl block mb-2">👥</span>
          <p className="text-base font-semibold text-slate-600">No dependents match your search</p>
          <p className="text-xs mt-1">Add elderly family members or children to manage their prescriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDependents.map(dep => {
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
                      <h3 className="font-extrabold text-slate-900 text-lg">{dep.name}</h3>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        {dep.relationship}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        Active Mode
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    {dep.email && (
                      <p>
                        Email: <strong className="text-slate-700 font-mono">{dep.email}</strong>
                      </p>
                    )}
                    {dep.age && (
                      <p>
                        Age: <strong className="text-slate-700">{dep.age} years old</strong>
                      </p>
                    )}
                    {dep.address && (
                      <p>
                        Address: <strong className="text-slate-700">{dep.address}</strong>
                      </p>
                    )}
                    {dep.date_of_birth && (
                      <p>
                        Birthday: <strong className="text-slate-700">{dep.date_of_birth}</strong>
                      </p>
                    )}
                    {dep.emergency_contact && (
                      <p>
                        Emergency: <strong className="text-slate-700">{dep.emergency_contact}</strong>
                      </p>
                    )}
                    {dep.notes && (
                      <p className="mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                        "{dep.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSwitchProfile(dep.id, dep.name)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {isSelected ? 'Exit Proxy' : 'Switch to Profile'}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(dep)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteDep(dep)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 72"
                  className="input-field"
                />
              </div>
            </div>

            {/* Custom Relationship Input when "Other" is selected */}
            {formData.relationship === 'Other' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specify Relationship *</label>
                <input
                  type="text"
                  required
                  value={formData.custom_relationship}
                  onChange={e => setFormData({ ...formData, custom_relationship: e.target.value })}
                  placeholder="e.g. Guardian, Neighbor, Foster Child, Cousin"
                  className="input-field"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email / Gmail Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dependent@example.com"
                  className="input-field"
                />
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Address / Residence</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 123 Rizal St., Cebu City"
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Medical Notes & Conditions</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Hypertension, penicillin allergy, requires walking assistance"
                rows={2}
                className="input-field"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Dependent Modal */}
      {editModalOpen && editingDep && (
        <Modal
          title={`Edit Profile: ${editingDep.name}`}
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
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Custom Relationship Input when "Other" is selected */}
            {formData.relationship === 'Other' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specify Relationship *</label>
                <input
                  type="text"
                  required
                  value={formData.custom_relationship}
                  onChange={e => setFormData({ ...formData, custom_relationship: e.target.value })}
                  placeholder="e.g. Guardian, Neighbor, Cousin"
                  className="input-field"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email / Gmail Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Address / Residence</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={formData.emergency_contact}
                onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Medical Notes & Conditions</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
          title="Confirm Removal"
          onClose={() => setDeleteDep(null)}
          footer={
            <>
              <button onClick={() => setDeleteDep(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Remove Dependent
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong className="text-slate-900">{deleteDep.name}</strong>?
            Their profile and linked medication schedules will be detached.
          </p>
        </Modal>
      )}
    </div>
  )
}
