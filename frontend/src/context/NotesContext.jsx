import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import noteService from '../services/noteService'
import toast from 'react-hot-toast'

const NotesContext = createContext(null)

const META_KEY = 'memora_notes_meta'

function loadMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}') }
  catch { return {} }
}

function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingNote, setEditingNote] = useState(null)
  const [meta, setMeta] = useState(loadMeta)

  useEffect(() => { saveMeta(meta) }, [meta])

  const updateMeta = useCallback((noteId, updates) => {
    setMeta(prev => ({
      ...prev,
      [noteId]: { ...(prev[noteId] || {}), ...updates }
    }))
  }, [])

  const toggleFavorite = useCallback((noteId) => {
    setMeta(prev => ({
      ...prev,
      [noteId]: { ...(prev[noteId] || {}), favorite: !(prev[noteId]?.favorite) }
    }))
  }, [])

  const moveToTrash = useCallback((noteId) => {
    updateMeta(noteId, { deleted: true })
    if (selectedNote?._id === noteId) setSelectedNote(null)
    toast.success('Moved to trash')
  }, [selectedNote, updateMeta])

  const restoreFromTrash = useCallback((noteId) => {
    updateMeta(noteId, { deleted: false })
    toast.success('Restored from trash')
  }, [updateMeta])

  const permanentDelete = useCallback(async (noteId) => {
    await noteService.deleteNote(noteId)
    setNotes(prev => prev.filter(n => n._id !== noteId))
    setMeta(prev => { const next = { ...prev }; delete next[noteId]; return next })
    if (selectedNote?._id === noteId) setSelectedNote(null)
    toast.success('Permanently deleted')
  }, [selectedNote])

  const setTag = useCallback((noteId, tag) => {
    updateMeta(noteId, { tag })
  }, [updateMeta])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await noteService.getNotes()
      setNotes(data)
      if (data.length > 0 && !selectedNote) {
        const first = data.find(n => !meta[n._id]?.deleted)
        if (first) setSelectedNote(first)
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
    moveToTrash(id)
  }, [moveToTrash])

  const exportNotes = useCallback(() => {
    const data = notes.map(n => ({
      title: n.title,
      content: n.content,
      tag: meta[n._id]?.tag || null,
      favorite: meta[n._id]?.favorite || false
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memora-notes-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${data.length} notes`)
  }, [notes, meta])

  const importNotes = useCallback(async (file) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error('Invalid format')
      let imported = 0
      for (const item of data) {
        if (!item.title || !item.content) continue
        const res = await noteService.createNote({ title: item.title, content: item.content })
        if (item.tag) updateMeta(res.note._id, { tag: item.tag })
        if (item.favorite) updateMeta(res.note._id, { favorite: true })
        imported++
      }
      await fetchNotes()
      toast.success(`Imported ${imported} notes`)
    } catch {
      toast.error('Failed to import — invalid file format')
    }
  }, [fetchNotes, updateMeta])

  const tagCounts = {}
  const tags = ['Work', 'Personal', 'Ideas', 'Study']
  notes.forEach(n => {
    const m = meta[n._id]
    if (m?.tag && !m?.deleted) {
      tagCounts[m.tag] = (tagCounts[m.tag] || 0) + 1
    }
  })

  const filteredNotes = notes.filter(note => {
    const m = meta[note._id]
    if (m?.deleted && filter !== 'trash') return false
    if (!m?.deleted && filter === 'trash') return false
    if (filter === 'favorites' && !m?.favorite) return false
    if (filter !== 'all' && filter !== 'favorites' && filter !== 'trash') {
      if (m?.tag !== filter) return false
    }
    if (search) {
      const q = search.toLowerCase()
      return (note.title || '').toLowerCase().includes(q) || (note.content || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <NotesContext.Provider value={{
      notes, filteredNotes, loading, selectedNote, showModal, showDelete,
      search, filter, editingNote, meta, tagCounts, tags,
      fetchNotes, addNote, updateNote, removeNote,
      setSelectedNote, setShowModal, setShowDelete,
      setSearch, setFilter, setEditingNote,
      toggleFavorite, moveToTrash, restoreFromTrash, permanentDelete, setTag,
      exportNotes, importNotes
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
