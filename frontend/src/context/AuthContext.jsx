import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api, { authConfig } from '../services/api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    let active = true
    api.get('/auth/me', authConfig())
      .then((res) => {
        if (active && localStorage.getItem('token') === token) {
          setUser(res.data.user)
        }
      })
      .catch(() => {
        if (active && localStorage.getItem('token') === token) {
          localStorage.removeItem('token')
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password })
      localStorage.setItem('token', res.data.token)
      try {
        const me = await api.get('/auth/me', authConfig())
        setUser(me.data.user)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      }
      return res.data
    } catch (err) {
      throw err
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      try {
        const me = await api.get('/auth/me', authConfig())
        setUser(me.data.user)
      } catch {
        localStorage.removeItem('token')
        setUser(null)
      }
      return res.data
    } catch (err) {
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const contextValue = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading, login, signup, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
