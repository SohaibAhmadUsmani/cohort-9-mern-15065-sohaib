import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useNotes } from '../context/NotesContext'

export default function EmptyState() {
  const { setShowModal } = useNotes()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center p-8"
    >
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center">
          <FileText size={32} className="text-[var(--accent)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No notes yet</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs mx-auto">
          Your thoughts deserve a place. Start capturing your ideas, plans and memories.
        </p>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-colors"
        >
          + Create your first note
        </button>
      </div>
    </motion.div>
  )
}
