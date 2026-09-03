import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
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

function noteId(noteOrId) {
  const id = noteOrId?._id ?? noteOrId
  return id == null ? '' : String(id)
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

  const getFilteredNotes = useCallback((noteList, metaMap, activeFilter, searchQuery) => {
    return noteList.filter(note => {
      const id = noteId(note)
      const m = metaMap[id]
      if (m?.deleted && activeFilter !== 'trash') return false
      if (!m?.deleted && activeFilter === 'trash') return false
      if (activeFilter === 'favorites' && !m?.favorite) return false
      if (activeFilter !== 'all' && activeFilter !== 'favorites' && activeFilter !== 'trash') {
        if (m?.tag !== activeFilter) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (note.title || '').toLowerCase().includes(q) || (note.content || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [])

  const pickSelection = useCallback((noteList, metaMap, activeFilter, searchQuery, prefer) => {
    const visible = getFilteredNotes(noteList, metaMap, activeFilter, searchQuery)
    if (visible.length === 0) return null
    const preferId = noteId(prefer)
    if (preferId && visible.some(n => noteId(n) === preferId)) {
      return noteList.find(n => noteId(n) === preferId) || visible[0]
    }
    return visible[0]
  }, [getFilteredNotes])

  const selectNote = useCallback((note) => {
    setSelectedNote(note)
  }, [])

  const changeFilter = useCallback((nextFilter) => {
    setFilter(nextFilter)
    setSelectedNote(prev => pickSelection(notes, meta, nextFilter, search, prev))
  }, [notes, meta, search, pickSelection])

  const changeSearch = useCallback((nextSearch) => {
    setSearch(nextSearch)
  }, [])

  // Only change selection when filter/search hides the current note
  useEffect(() => {
    setSelectedNote(prev => {
      if (!prev) return prev
      const visible = getFilteredNotes(notes, meta, filter, search)
      if (visible.some(n => noteId(n) === noteId(prev))) {
        return notes.find(n => noteId(n) === noteId(prev)) || prev
      }
      return visible[0] || null
    })
  }, [filter, search])

  const updateMeta = useCallback((id, updates) => {
    const key = noteId(id)
    setMeta(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }))
  }, [])

  const toggleFavorite = useCallback((id) => {
    const key = noteId(id)
    setMeta(prev => ({
      ...prev,
      [key]: { ...prev[key], favorite: !prev[key]?.favorite }
    }))
  }, [])

  const moveToTrash = useCallback((id) => {
    const key = noteId(id)
    const nextMeta = { ...meta, [key]: { ...meta[key], deleted: true } }
    setMeta(nextMeta)
    setSelectedNote(current => {
      if (noteId(current) !== key) return current
      return pickSelection(notes, nextMeta, filter, search, null)
    })
    toast.success('Moved to trash')
  }, [notes, meta, filter, search, pickSelection])

  const restoreFromTrash = useCallback((id) => {
    updateMeta(id, { deleted: false })
    toast.success('Restored from trash')
  }, [updateMeta])

  const permanentDelete = useCallback(async (id) => {
    const key = noteId(id)
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Session expired. Please log in again.')
      window.dispatchEvent(new Event('auth:logout'))
      return
    }
    try {
      await noteService.deleteNote(key)
      const remaining = notes.filter(n => noteId(n) !== key)
      const nextMeta = { ...meta }
      delete nextMeta[key]
      setNotes(remaining)
      setMeta(nextMeta)
      setSelectedNote(prev => {
        if (noteId(prev) !== key) return prev
        return pickSelection(remaining, nextMeta, filter, search, null)
      })
      toast.success('Permanently deleted')
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete note')
      }
    }
  }, [notes, meta, filter, search, pickSelection])

  const setTag = useCallback((id, tag) => {
    updateMeta(id, { tag })
  }, [updateMeta])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await noteService.getNotes()
      setNotes(data)
      setSelectedNote(prev => {
        if (prev && data.some(n => noteId(n) === noteId(prev))) {
          return data.find(n => noteId(n) === noteId(prev)) || prev
        }
        const storedMeta = loadMeta()
        const first = data.find(n => !storedMeta[noteId(n)]?.deleted)
        return first || data[0] || null
      })
    } catch {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [])

  const addNote = useCallback(async (title, content) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Session expired. Please log in again.')
      window.dispatchEvent(new Event('auth:logout'))
      return
    }
    try {
      const res = await noteService.createNote({ title, content })
      if (!res?.note) {
        toast.error('Failed to create note')
        return
      }
      setNotes(prev => [res.note, ...prev])
      setSelectedNote(res.note)
      toast.success('Note created')
      setShowModal(false)
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
      } else {
        toast.error(err.response?.data?.message || 'Failed to create note')
      }
    }
  }, [])

  const updateNote = useCallback(async (id, title, content) => {
    try {
      const res = await noteService.updateNote(id, { title, content })
      const updated = res?.note
      const targetId = noteId(id)
      if (!updated || !noteId(updated)) {
        toast.error('Failed to update note')
        return
      }
      setNotes(prev => prev.map(n => noteId(n) === targetId ? { ...n, ...updated, title, content } : n))
      setSelectedNote({ ...updated, title, content })
      toast.success('Note updated')
      setEditingNote(null)
      setShowModal(false)
    } catch {
      toast.error('Failed to update note')
    }
  }, [])

  const removeNote = useCallback(async (id) => {
    moveToTrash(id)
  }, [moveToTrash])

  const exportNotes = useCallback(() => {
    const data = notes.map(n => ({
      title: n.title,
      content: n.content,
      tag: meta[noteId(n)]?.tag || null,
      favorite: meta[noteId(n)]?.favorite || false
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
    const m = meta[noteId(n)]
    if (m?.tag && !m?.deleted) {
      tagCounts[m.tag] = (tagCounts[m.tag] || 0) + 1
    }
  })

  const filteredNotes = getFilteredNotes(notes, meta, filter, search)

  const contextValue = useMemo(() => ({
    notes, filteredNotes, loading, selectedNote, showModal, showDelete,
    search, filter, editingNote, meta, tagCounts, tags,
    fetchNotes, addNote, updateNote, removeNote,
    setSelectedNote: selectNote, setShowModal, setShowDelete,
    setSearch: changeSearch, setFilter: changeFilter, setEditingNote,
    toggleFavorite, moveToTrash, restoreFromTrash, permanentDelete, setTag,
    exportNotes, importNotes
  }), [
    notes, filteredNotes, loading, selectedNote, showModal, showDelete,
    search, filter, editingNote, meta, tagCounts, tags,
    fetchNotes, addNote, updateNote, removeNote,
    selectNote, changeSearch, changeFilter,
    toggleFavorite, moveToTrash, restoreFromTrash, permanentDelete, setTag,
    exportNotes, importNotes
  ])

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within NotesProvider')
  return ctx
}
