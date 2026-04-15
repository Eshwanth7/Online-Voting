import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Module-level ref so the axios interceptor can call logout without
// importing the context (which would create a circular dependency).
// This avoids stale React state when a 401 is received mid-session.
export const logoutRef = { current: null }

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // Corrupted user data — clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData)
    return res.data
  }

  // useCallback so logoutRef.current is always the latest stable reference
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  // Keep the module-level ref in sync with the latest logout function
  useEffect(() => {
    logoutRef.current = logout
  }, [logout])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
