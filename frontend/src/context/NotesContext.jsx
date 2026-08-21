import { createContext, useContext, useState, useCallback } from 'react'
import noteService from '../services/noteService'
import toast from 'react-hot-toast'

const NotesContext = createContext(null)

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await noteService.getNotes()
      setNotes(data)
    } catch (err) {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  const addNote = useCallback(async (title, content) => {
    const res = await noteService.createNote({ title, content })
    setNotes(prev => [res.note, ...prev])
    toast.success('Note created')
    setShowModal(false)
  }, [])

  const updateNote = useCallback(async (id, title, content) => {
    const res = await noteService.updateNote(id, { title, content })
    setNotes(prev => prev.map(n => n._id === id ? res.note : n))
    toast.success('Note updated')
    setEditingNote(null)
    setShowModal(false)
  }, [])

  const removeNote = useCallback(async (id) => {
    await noteService.deleteNote(id)
    setNotes(prev => prev.filter(n => n._id !== id))
    toast.success('Note deleted')
    setShowDelete(null)
  }, [])

  return (
    <NotesContext.Provider value={{
      notes, loading, editingNote, showModal, showDelete,
      fetchNotes, addNote, updateNote, removeNote,
      setEditingNote, setShowModal, setShowDelete
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
