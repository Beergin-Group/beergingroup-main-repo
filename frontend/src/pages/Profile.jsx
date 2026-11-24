import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

export default function Profile() {
  const { user, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Account & Security"
        subtitle="Manage your personal profile, role permissions, and session credentials."
      />

      <div className="card max-w-2xl p-8 space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-teal-600/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700">
              Role: {user?.role || 'Patient'}
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">User ID</span>
            <span className="font-mono font-semibold text-slate-800">#{user?.id}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Phone</span>
            <span className="font-semibold text-slate-800">{user?.phone || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Created At</span>
            <span className="font-semibold text-slate-800">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Security Token</span>
            <span className="font-mono text-xs text-emerald-600 font-bold">Active JWT Bearer</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Sign out of this session</p>
            <p className="text-[11px] text-slate-400">Tokens will be cleared from this browser.</p>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="btn-danger">
            Log Out Now
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <Modal
          title="Confirm Log Out"
          onClose={() => setShowLogoutModal(false)}
          footer={
            <>
              <button onClick={() => setShowLogoutModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmLogout} className="btn-danger">
                Confirm Log Out
              </button>
            </>
          }
        >
          <div className="py-2 text-slate-700 text-sm">
            <p className="font-semibold text-base text-slate-900 mb-1">Are you sure you want to log out?</p>
            <p className="text-xs text-slate-500">
              You will need to sign in again to access your medication records and schedules.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
