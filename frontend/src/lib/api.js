import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // ✅ Make sure this is correct!
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('🔍 Making request to:', config.baseURL + config.url)
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(err)
  }
)

export default api