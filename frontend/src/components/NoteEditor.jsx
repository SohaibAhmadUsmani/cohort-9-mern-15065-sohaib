import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { Star, Pencil, Trash2, MoreHorizontal, Clock } from 'lucide-react'
import { useNotes } from '../context/NotesContext'

const toolbarOptions = [
  [{ header: [1, 2, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline', 'strike'],
  ['code', 'link', 'blockquote'],
  ['undo', 'redo'],
]

export default function NoteEditor() {
  const { selectedNote, editingNote, setEditingNote, setShowModal, setShowDelete, updateNote } = useNotes()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || '')
      setContent(selectedNote.content || '')
      setIsEditing(false)
    }
  }, [selectedNote])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      await updateNote(selectedNote._id, title, content)
      setIsEditing(false)
    } catch {
      // toast in context
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    setEditingNote(selectedNote)
    setShowModal(true)
  }

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center">
            <Pencil size={24} className="opacity-40" />
          </div>
          <p className="text-sm">Select a note to view</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key={selectedNote._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{selectedNote.title}</h1>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Clock size={12} />
            <span>Updated {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-yellow-400 hover:bg-[var(--bg-surface)] transition-colors" title="Favorite">
            <Star size={18} />
          </button>
          <button onClick={handleEdit} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-colors" title="Edit">
            <Pencil size={18} />
          </button>
          <button onClick={() => setShowDelete(selectedNote)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-[var(--bg-surface)] transition-colors" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)] [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-secondary)] [&_code]:bg-[var(--bg-surface)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_a]:text-[var(--accent)] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: selectedNote.content }}
        />
      </div>
    </motion.div>
  )
}
