import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    let active = true
    api.get('/auth/me')
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
    const res = await api.post('/auth/signup', { name, email, password })
    localStorage.setItem('token', res.data.token)
    const me = await api.get('/auth/me')
    setUser(me.data.user)
    return res.data
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    const me = await api.get('/auth/me')
    setUser(me.data.user)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
