import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Client-side validations
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8 || password.length > 15) {
      setError('Password must be between 8 and 15 characters long.')
      return
    }

    if (isRegister && !name.trim()) {
      setError('Full name is required.')
      return
    }

    setLoading(true)

    try {
      if (isRegister) {
        await register({ name: name.trim(), email: email.trim().toLowerCase(), password, role })
        setIsRegister(false)
        setPassword('')
        setSuccessMessage('Registration successful! Please sign in.')
        toast.success('Registration successful! Please sign in.')
      } else {
        await login(email.trim().toLowerCase(), password)
        toast.success('Signed in successfully!')
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    if (val.length > 0 && (val.length < 8 || val.length > 15)) {
      setError('Password must be between 8 and 15 characters.')
    } else {
      setError('')
    }
  }

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    if (val.length > 0 && !validateEmail(val)) {
      setError('Invalid email address format.')
    } else {
      setError('')
    }
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

        {/* Success Message Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-sm">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="text-rose-500 font-bold text-sm">✕</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Full Name *</label>
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
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="name@example.com"
              className="input-field"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 block">Password *</label>
              <span className="text-[10px] text-slate-400 font-medium">8-15 characters</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                maxLength={15}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="input-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-base p-1 transition-colors select-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
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

        {/* Switch Login/Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
              setSuccessMessage('')
            }}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register now"}
          </button>
        </div>
      </div>
    </div>
  )
}
