import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useNotes } from '../context/NotesContext'

export default function NoteCard({ note, index }) {
  const { selectedNote, setSelectedNote, meta } = useNotes()
  const isSelected = selectedNote?._id === note._id
  const m = meta[note._id] || {}

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const preview = stripHtml(note.content || '').slice(0, 80)
  const time = note.updatedAt || note.createdAt
    ? new Date(note.updatedAt || note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''

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
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1 flex-1">{stripHtml(note.title)}</h3>
        {m.favorite && <Star size={12} className="text-yellow-400 fill-yellow-400 mt-0.5 ml-1 shrink-0" />}
      </div>
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">{preview}</p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--text-secondary)] opacity-60">{time}</span>
        {m.tag && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)]">{m.tag}</span>
        )}
      </div>
    </motion.button>
  )
}
