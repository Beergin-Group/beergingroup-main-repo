import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'

const NAV_ITEMS = [
  { to: '/',            icon: '⊞', label: 'Dashboard' },
  { to: '/medicines',   icon: '💊', label: 'Medicines' },
  { to: '/schedules',   icon: '📅', label: 'Schedules' },
  { to: '/dose-logs',   icon: '📋', label: 'Dose History' },
  { to: '/adherence',   icon: '📊', label: 'Adherence Report' },
  { to: '/caregivers',  icon: '👥', label: 'Caregiver Hub' },
  { to: '/profile',     icon: '👤', label: 'Profile' },
]

export default function AppShell() {
  const { user, logout, activeDependentId, setActiveDependentId, dependents } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/login')
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  // Role guard: Hide Caregiver Hub if user is a patient
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.to === '/caregivers' && user?.role === 'patient') {
      return false
    }
    return true
  })

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
        } flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out z-30 overflow-hidden`}
      >
        <div className="w-64 min-w-[16rem]">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-tight">
                Medi<span className="text-teal-600">Remind</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block uppercase">
                Web System · Beergin
              </span>
            </div>
          </div>

          {/* Dependent Switcher (Caregiver Mode) */}
          {user?.role !== 'patient' && dependents.length > 0 && (
            <div className="px-4 py-3 border-b border-slate-100 bg-teal-50/40">
              <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                Viewing Patient / Dependent
              </label>
              <select
                value={activeDependentId || ''}
                onChange={e => setActiveDependentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full text-xs font-semibold bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Myself ({user?.name})</option>
                {dependents.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.relationship})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {filteredNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="w-64 min-w-[16rem] p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'Patient'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Log out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            aria-label="Log out"
          >
            ↪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Hamburger Button */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>📅 {todayStr}</span>
              <span>•</span>
              <span className="text-teal-600 font-semibold">Active Session</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeDependentId && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full">
                Caregiver Proxy Mode
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
              v2.0 (MVC)
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Modal
          title="Confirm Log Out"
          onClose={() => setShowLogoutModal(false)}
          footer={
            <>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="btn-danger"
              >
                Log Out
              </button>
            </>
          }
        >
          <div className="py-2 text-slate-700 text-sm">
            <p className="font-semibold text-base text-slate-900 mb-1">Are you sure you want to log out?</p>
            <p className="text-xs text-slate-500">
              You will need to enter your email and password again to access your medication records.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
