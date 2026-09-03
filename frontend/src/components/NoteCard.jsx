import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useNotes } from '../context/NotesContext'

function noteId(noteOrId) {
  const id = noteOrId?._id ?? noteOrId
  return id == null ? '' : String(id)
}

function stripHtml(html) {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function NoteCard({ note, index }) {
  const { selectedNote, setSelectedNote, meta } = useNotes()
  const isSelected = noteId(selectedNote) === noteId(note)
  const m = meta[noteId(note)] || {}
  const displayNote = isSelected && selectedNote ? selectedNote : note

  const previewHtml = DOMPurify.sanitize(displayNote.content || '', {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'u', 'p', 'br', 'span'],
  })
  const time = note.updatedAt || note.createdAt
    ? new Date(note.updatedAt || note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''

  const tagColors = { Work: '#A855F7', Personal: '#3b82f6', Ideas: '#22c55e', Study: '#f59e0b' }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => setSelectedNote(note)}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isSelected
          ? 'bg-[var(--accent-light)] border border-[var(--accent)]/30'
          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)]/80 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1 flex-1">{stripHtml(displayNote.title)}</h3>
        {m.favorite && <Star size={12} className="text-amber-400 fill-amber-400 mt-0.5 ml-1 shrink-0" />}
      </div>
      <div
        className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic"
        dangerouslySetInnerHTML={{ __html: previewHtml || stripHtml(displayNote.content).slice(0, 80) }}
      />
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[var(--text-secondary)] opacity-60">{time}</span>
        {m.tag && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: tagColors[m.tag] + '20', color: tagColors[m.tag] }}
          >
            {m.tag}
          </span>
        )}
      </div>
    </motion.button>
  )
}
