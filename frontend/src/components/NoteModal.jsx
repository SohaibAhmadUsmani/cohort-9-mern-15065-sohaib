import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { X } from 'lucide-react'
import { useNotes } from '../context/NotesContext'

const toolbarOptions = [
  [{ header: [1, 2, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['clean'],
]

export default function NoteModal() {
  const { editingNote, showModal, setShowModal, setEditingNote, addNote, updateNote } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [quillKey, setQuillKey] = useState(0)

  useEffect(() => {
    if (showModal) {
      if (editingNote) {
        setTitle(editingNote.title)
        setContent(editingNote.content)
      } else {
        setTitle('')
        setContent('')
      }
      setQuillKey(k => k + 1)
    }
  }, [editingNote, showModal])

  const handleClose = () => {
    setShowModal(false)
    setEditingNote(null)
    setTitle('')
    setContent('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      if (editingNote) {
        await updateNote(editingNote._id, title, content)
      } else {
        await addNote(title, content)
      }
    } catch {
      // toast in context
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--border)]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
              <input
                type="text"
                placeholder="Note title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 text-sm"
              />
              <div className="flex-1 min-h-0 flex flex-col">
                <ReactQuill
                  key={quillKey}
                  theme="snow"
                  defaultValue={content}
                  onChange={setContent}
                  modules={{ toolbar: toolbarOptions }}
                  placeholder="Write your note..."
                  className="flex-1 flex flex-col min-h-0 [&_.ql-container]:flex-1 [&_.ql-container]:min-h-0 [&_.ql-container]:h-auto [&_.ql-editor]:min-h-[200px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !content.trim()}
                  className="px-5 py-2 text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingNote ? 'Update' : 'Save Note'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
