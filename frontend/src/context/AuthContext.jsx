import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('mediremind_token'))
  const [loading, setLoading] = useState(true)
  const [activeDependentId, setActiveDependentId] = useState(null)
  const [dependents, setDependents] = useState([])

  useEffect(() => {
    const storedUser = localStorage.getItem('mediremind_user')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      loadDependents()
    }
    setLoading(false)
  }, [token])

  const loadDependents = async () => {
    try {
      const res = await api.get('/caregiver/dependents')
      if (res.data?.success) {
        setDependents(res.data.data)
      }
    } catch (e) {
      // not caregiver or error
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data
    setToken(t)
    setUser(u)
    localStorage.setItem('mediremind_token', t)
    localStorage.setItem('mediremind_user', JSON.stringify(u))
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    await loadDependents()
    return u
  }

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData)
    const { token: t, user: u } = res.data
    setToken(t)
    setUser(u)
    localStorage.setItem('mediremind_token', t)
    localStorage.setItem('mediremind_user', JSON.stringify(u))
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    return u
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setActiveDependentId(null)
    setDependents([])
    localStorage.removeItem('mediremind_token')
    localStorage.removeItem('mediremind_user')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      loading,
      activeDependentId,
      setActiveDependentId,
      dependents,
      refreshDependents: loadDependents
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
