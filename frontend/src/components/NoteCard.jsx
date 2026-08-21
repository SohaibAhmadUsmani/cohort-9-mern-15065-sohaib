import { motion } from 'framer-motion'
import { useNotes } from '../context/NotesContext'

export default function NoteCard({ note, index }) {
  const { setEditingNote, setShowModal, setShowDelete } = useNotes()

  const handleEdit = () => {
    setEditingNote(note)
    setShowModal(true)
  }

  const handleDelete = () => {
    setShowDelete(note)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
    >
      <h3
        className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1"
        dangerouslySetInnerHTML={{ __html: note.title }}
      />
      <div
        className="text-sm text-gray-500 dark:text-gray-400 flex-1 line-clamp-6 mb-4 prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  )
}
