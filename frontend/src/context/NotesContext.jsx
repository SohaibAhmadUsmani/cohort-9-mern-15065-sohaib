import { createContext, useContext, useState, useCallback } from 'react'
import noteService from '../services/noteService'
import toast from 'react-hot-toast'

const NotesContext = createContext(null)

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingNote, setEditingNote] = useState(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await noteService.getNotes()
      setNotes(data)
      if (data.length > 0 && !selectedNote) {
        setSelectedNote(data[0])
      }
    } catch {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  const addNote = useCallback(async (title, content) => {
    const res = await noteService.createNote({ title, content })
    setNotes(prev => [res.note, ...prev])
    setSelectedNote(res.note)
    toast.success('Note created')
    setShowModal(false)
  }, [])

  const updateNote = useCallback(async (id, title, content) => {
    const res = await noteService.updateNote(id, { title, content })
    setNotes(prev => prev.map(n => n._id === id ? res.note : n))
    if (selectedNote?._id === id) setSelectedNote(res.note)
    toast.success('Note updated')
    setEditingNote(null)
    setShowModal(false)
  }, [selectedNote])

  const removeNote = useCallback(async (id) => {
    await noteService.deleteNote(id)
    setNotes(prev => prev.filter(n => n._id !== id))
    if (selectedNote?._id === id) {
      setSelectedNote(null)
    }
    toast.success('Note deleted')
    setShowDelete(null)
  }, [selectedNote])

  const filteredNotes = notes.filter(note => {
    if (search) {
      const q = search.toLowerCase()
      return (note.title || '').toLowerCase().includes(q) || (note.content || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <NotesContext.Provider value={{
      notes, filteredNotes, loading, selectedNote, showModal, showDelete,
      search, filter, editingNote,
      fetchNotes, addNote, updateNote, removeNote,
      setSelectedNote, setShowModal, setShowDelete,
      setSearch, setFilter, setEditingNote
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within NotesProvider')
  return ctx
}
