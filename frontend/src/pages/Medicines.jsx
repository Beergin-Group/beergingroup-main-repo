import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function Medicines() {
  const { activeDependentId } = useAuth()
  const { toast } = useToast()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [deleteMed, setDeleteMed] = useState(null)
  const [refillMed, setRefillMed] = useState(null)
  const [refillAmount, setRefillAmount] = useState(30)
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'tablet',
    instructions: '',
    is_prn: false,
    stock_count: 30,
    low_stock_threshold: 5,
    color: '#0d9488',
    shape: 'round',
    icon: 'pill'
  })

  const loadMedicines = async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeDependentId) params.dependent_id = activeDependentId
      const res = await api.get('/medicines', { params })
      if (res.data?.success) {
        setMedicines(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load medicines:', err)
      toast.error('Failed to load medicines catalog.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedicines()
  }, [activeDependentId])

  const openAddModal = () => {
    setEditingMed(null)
    setFormData({
      name: '',
      dosage: '',
      form: 'tablet',
      instructions: '',
      is_prn: false,
      stock_count: 30,
      low_stock_threshold: 5,
      color: '#0d9488',
      shape: 'round',
      icon: 'pill'
    })
    setModalOpen(true)
  }

  const openEditModal = (med) => {
    setEditingMed(med)
    setFormData({
      name: med.name,
      dosage: med.dosage,
      form: med.form || 'tablet',
      instructions: med.instructions || '',
      is_prn: med.instructions?.toLowerCase().includes('as-needed') || false,
      stock_count: med.stock_count || 0,
      low_stock_threshold: med.low_stock_threshold || 5,
      color: med.color || '#0d9488',
      shape: med.shape || 'round',
      icon: med.icon || 'pill'
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Deduplication check: Same name, dosage, form, and color
    if (!editingMed) {
      const isDuplicate = medicines.some(
        m =>
          m.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
          m.dosage.trim().toLowerCase() === formData.dosage.trim().toLowerCase() &&
          (m.form || 'tablet').toLowerCase() === (formData.form || 'tablet').toLowerCase() &&
          (m.color || '').toLowerCase() === (formData.color || '').toLowerCase()
      )

      if (isDuplicate) {
        toast.error('Duplicate medicine! A card with identical name, dosage, form, and color already exists.')
        return
      }
    }

    try {
      const payload = {
        ...formData,
        instructions: formData.is_prn && !formData.instructions.toLowerCase().includes('as-needed')
          ? `${formData.instructions ? formData.instructions + ' • ' : ''}Taken as-needed (PRN)`
          : formData.instructions
      }

      if (editingMed) {
        await api.put(`/medicines/${editingMed.id}`, payload)
        toast.success(`Updated ${formData.name} successfully!`)
      } else {
        await api.post('/medicines', {
          ...payload,
          dependent_id: activeDependentId
        })
        toast.success(`Added ${formData.name} to catalog!`)
      }
      setModalOpen(false)
      loadMedicines()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save medicine.'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!deleteMed) return
    try {
      await api.delete(`/medicines/${deleteMed.id}`)
      toast.info(`Deleted ${deleteMed.name}.`)
      setDeleteMed(null)
      loadMedicines()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete medicine.'
      toast.error(msg)
    }
  }

  const handleRefill = async () => {
    if (!refillMed) return
    try {
      await api.post(`/medicines/${refillMed.id}/refill`, { amount: refillAmount })
      toast.success(`Refilled ${refillAmount} units of ${refillMed.name}.`)
      setRefillMed(null)
      loadMedicines()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to refill stock.'
      toast.error(msg)
    }
  }

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.dosage.toLowerCase().includes(search.toLowerCase()) ||
    m.form.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine & Prescription Catalog"
        subtitle="Manage your medication inventory, stock counts, and dosage specifications."
        actions={
          <button onClick={openAddModal} className="btn-primary">
            + Add Medicine
          </button>
        }
      />

      {/* Search Bar */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Search by medicine name, dosage, or form..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {loading ? (
        <Spinner label="Loading medicines..." />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <span className="text-3xl block mb-2">💊</span>
          <p className="text-base font-semibold text-slate-600">No medicines found</p>
          <p className="text-xs mt-1">Add your prescriptions to start tracking your medication.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(med => {
            const isLowStock = med.stock_count <= med.low_stock_threshold
            const isPrn = med.instructions?.toLowerCase().includes('as-needed') || med.instructions?.toLowerCase().includes('prn')

            return (
              <div key={med.id} className="card p-5 border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: med.color || '#0d9488' }}
                      />
                      <h3 className="font-extrabold text-slate-900 text-base">{med.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPrn && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          PRN
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {med.dosage}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 capitalize mt-2 font-medium">
                    Form: <strong className="text-slate-700">{med.form || 'Tablet'}</strong>
                  </p>
                  {med.instructions && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{med.instructions}"
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Inventory</span>
                      <span className="text-base font-extrabold text-slate-800 font-mono">
                        {med.stock_count} units
                      </span>
                    </div>
                    <StatusBadge
                      status={isLowStock ? 'low_stock' : 'in_stock'}
                      label={isLowStock ? `Low Stock (${med.stock_count})` : 'In Stock'}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => { setRefillMed(med); setRefillAmount(30) }}
                    className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    + Refill
                  </button>
                  <button
                    onClick={() => openEditModal(med)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteMed(med)}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {modalOpen && (
        <Modal
          title={editingMed ? 'Edit Medicine' : 'Add New Medicine'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingMed ? 'Save Changes' : 'Add Medicine'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amoxicillin, Paracetamol, Loperamide"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dosage *</label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g. 500mg, 10ml, 1 sachet"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Form</label>
                <select
                  value={formData.form}
                  onChange={e => setFormData({ ...formData, form: e.target.value })}
                  className="input-field"
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="syrup">Syrup / Liquid</option>
                  <option value="powder">Powder</option>
                  <option value="injection">Injection</option>
                  <option value="inhaler">Inhaler</option>
                  <option value="drops">Drops</option>
                  <option value="patch">Patch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Instructions / Meal Relation</label>
              <input
                type="text"
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="e.g. Take with a glass of water after meals"
                className="input-field"
              />
            </div>

            {/* As-Needed (PRN) Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <input
                type="checkbox"
                id="is_prn_checkbox"
                checked={formData.is_prn}
                onChange={e => setFormData({ ...formData, is_prn: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="is_prn_checkbox" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-slate-900 block">As-Needed Medication (PRN)</span>
                <span className="text-slate-500">
                  Allow taking this medication as needed without mandatory reminder schedules (e.g. Loperamide, Pain relievers).
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Initial Stock Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_count}
                  onChange={e => setFormData({ ...formData, stock_count: parseInt(e.target.value, 10) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.low_stock_threshold}
                  onChange={e => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value, 10) || 1 })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tag Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                />
                <span className="text-xs font-mono text-slate-600">{formData.color}</span>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Refill Modal */}
      {refillMed && (
        <Modal
          title={`Refill Stock: ${refillMed.name}`}
          onClose={() => setRefillMed(null)}
          footer={
            <>
              <button onClick={() => setRefillMed(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleRefill} className="btn-primary">
                Add to Inventory
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Current stock: <strong className="font-bold text-slate-900">{refillMed.stock_count} units</strong>
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Units to Add</label>
              <input
                type="number"
                min="1"
                value={refillAmount}
                onChange={e => setRefillAmount(parseInt(e.target.value, 10) || 1)}
                className="input-field"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteMed && (
        <Modal
          title="Confirm Delete"
          onClose={() => setDeleteMed(null)}
          footer={
            <>
              <button onClick={() => setDeleteMed(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete Medicine
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{deleteMed.name}</strong>?
            This will also delete associated routines and history logs.
          </p>
        </Modal>
      )}
    </div>
  )
}
