import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('patient@mediremind.com')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await register({ name, email, password, role })
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsRegister(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md shadow-teal-600/20 mb-3">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Medi<span className="text-teal-600">Remind</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {isRegister ? 'Create your medication management account' : 'Sign in to access your prescriptions and schedules'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Account Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="input-field"
              >
                <option value="patient">Patient (Self Management)</option>
                <option value="caregiver">Caregiver (Manage Family / Dependents)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-bold mt-2 text-sm shadow-md shadow-teal-600/20"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('patient@mediremind.com', 'password123')}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              👤 Patient Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('caregiver@mediremind.com', 'password123')}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              👥 Caregiver Demo
            </button>
          </div>
        </div>

        {/* Switch Login/Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register now"}
          </button>
        </div>
      </div>
    </div>
  )
}
