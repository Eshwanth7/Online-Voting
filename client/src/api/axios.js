import axios from 'axios'

const configuredUrl = import.meta.env.VITE_API_URL
const baseURL = configuredUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://online-voting7.vercel.app/api')
const API = axios.create({
  baseURL: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
})

if (baseURL.includes('your-backend-server-url')) {
  console.warn('⚠️ Warning: VITE_API_URL appears to be using a placeholder URL. Please update it in your Vercel Environment Variables.')
}


// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API
