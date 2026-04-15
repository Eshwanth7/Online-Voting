import axios from 'axios'
import { logoutRef } from '../context/AuthContext'

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

const API = axios.create({
  baseURL: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
})

if (baseURL.includes('your-backend-server-url')) {
  console.warn('⚠️ Warning: VITE_API_URL appears to be using a placeholder URL. Please update it in your Vercel Environment Variables.')
}

// Add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle error responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage AND update React state via logoutRef.
      // Without this, the user would still appear logged in until a page refresh.
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (logoutRef.current) {
        logoutRef.current()
      }

      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API
