import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export function authConfig(config = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...config.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  return { ...config, headers }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (!token) return config
  if (typeof config.headers?.set === 'function') {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  }
)

export default api
