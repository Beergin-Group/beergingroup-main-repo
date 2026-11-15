import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
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
          {dependents.length > 0 && (
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
            {NAV_ITEMS.map(item => (
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
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
            onClick={handleLogout}
            title="Log out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ↪
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>📅 {todayStr}</span>
            <span>•</span>
            <span className="text-teal-600 font-semibold">Active Session</span>
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
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
