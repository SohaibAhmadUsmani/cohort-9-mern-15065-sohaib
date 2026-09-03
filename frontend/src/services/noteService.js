import api, { authConfig } from './api'

const noteService = {
  getNotes: () => api.get('/notes', authConfig()).then(res => res.data.notes),
  getNote: (id) => api.get(`/notes/${id}`, authConfig()).then(res => res.data.note),
  createNote: (data) => api.post('/notes', data, authConfig()).then(res => res.data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data, authConfig()).then(res => res.data),
  deleteNote: (id) => api.delete(`/notes/${id}`, authConfig()).then(res => res.data),
  generateNote: (prompt) => api.post('/ai/generate', { prompt }, authConfig()).then(res => res.data),
}

export default noteService
