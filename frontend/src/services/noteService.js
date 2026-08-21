import api from './api'

const noteService = {
  getNotes: () => api.get('/notes').then(res => res.data.notes),
  getNote: (id) => api.get(`/notes/${id}`).then(res => res.data.note),
  createNote: (data) => api.post('/notes', data).then(res => res.data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data).then(res => res.data),
  deleteNote: (id) => api.delete(`/notes/${id}`).then(res => res.data),
}

export default noteService
