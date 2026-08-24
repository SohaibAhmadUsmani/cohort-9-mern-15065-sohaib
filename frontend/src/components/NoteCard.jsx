import { motion } from 'framer-motion'
import { useNotes } from '../context/NotesContext'

export default function NoteCard({ note, index }) {
  const { selectedNote, setSelectedNote } = useNotes()
  const isSelected = selectedNote?._id === note._id

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const preview = stripHtml(note.content || '').slice(0, 100)
  const time = new Date(note.updatedAt || note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => setSelectedNote(note)}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-[#7c5cff]/20 to-[#a78bfa]/10 border border-[var(--accent)]/30'
          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)]/80 border border-transparent'
      }`}
    >
      <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1 mb-1">{stripHtml(note.title)}</h3>
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">{preview}</p>
      <span className="text-[10px] text-[var(--text-secondary)] opacity-60">{time}</span>
    </motion.button>
  )
}
