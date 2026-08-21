import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { useNotes } from '../context/NotesContext'

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
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

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [editingNote, showModal])

  const handleClose = () => {
    setShowModal(false)
    setEditingNote(null)
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
      // toast handled in context
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
              <input
                type="text"
                placeholder="Note title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1 min-h-0">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={{ toolbar: toolbarOptions }}
                  placeholder="Write your note..."
                  className="h-full [&_.ql-container]:rounded-b-lg [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[40vh] [&_.ql-editor]:overflow-y-auto dark:[&_.ql-toolbar]:bg-gray-700 dark:[&_.ql-toolbar]:border-gray-600 dark:[&_.ql-container]:bg-gray-700 dark:[&_.ql-container]:border-gray-600 dark:[&_.ql-editor]:text-white dark:[&_.ql-picker-label]:text-white dark:[&_.ql-stroke]:stroke-gray-300 dark:[&_.ql-fill]:fill-gray-300"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !content.trim()}
                  className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingNote ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
