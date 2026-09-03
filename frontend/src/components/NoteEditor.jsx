import { useState } from 'react'
import { Star, Pencil, Trash2, RotateCcw, Tag } from 'lucide-react'
import { useNotes } from '../context/NotesContext'
import DOMPurify from 'dompurify'

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

export default function NoteEditor() {
  const { selectedNote, meta, toggleFavorite, moveToTrash, restoreFromTrash, permanentDelete, setTag, setShowModal, setEditingNote, tags: tagList } = useNotes()
  const [showTagMenu, setShowTagMenu] = useState(false)

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

  const id = noteId(selectedNote)
  const m = meta[id] || {}
  const isTrash = m.deleted
  const tagColors = { Work: '#A855F7', Personal: '#3b82f6', Ideas: '#22c55e', Study: '#f59e0b' }
  const safeContent = DOMPurify.sanitize(selectedNote.content || '')

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-start justify-between gap-4 shrink-0 bg-[var(--bg-primary)] z-10">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1 line-clamp-2">
            {stripHtml(selectedNote.title) || 'Untitled'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {m.tag && (
              <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-medium" style={{ background: tagColors[m.tag] || '#6B7280' }}>
                {m.tag}
              </span>
            )}
            {m.tag && <span>·</span>}
            <span>{selectedNote.updatedAt || selectedNote.createdAt
              ? new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently created'
            }</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTagMenu(!showTagMenu)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
              title="Set tag"
            >
              <Tag size={18} />
            </button>
            {showTagMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-20 w-32">
                {tagList.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { setTag(id, tag); setShowTagMenu(false) }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-surface)] flex items-center gap-2 ${m.tag === tag ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: tagColors[tag] }} />
                    {tag}
                  </button>
                ))}
                {m.tag && (
                  <button
                    type="button"
                    onClick={() => { setTag(id, null); setShowTagMenu(false) }}
                    className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-[var(--bg-surface)]"
                  >
                    Remove tag
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => toggleFavorite(id)}
            className={`p-2 rounded-lg transition-colors ${m.favorite ? 'text-amber-400' : 'text-[var(--text-secondary)] hover:text-amber-400 hover:bg-[var(--accent-light)]'}`}
            title="Favorite"
          >
            <Star size={18} fill={m.favorite ? 'currentColor' : 'none'} />
          </button>
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={() => restoreFromTrash(id)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                title="Restore"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={() => permanentDelete(id)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Permanently"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleEdit} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors" title="Edit">
                <Pencil size={18} />
              </button>
              <button type="button" onClick={() => moveToTrash(id)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)] [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-secondary)] [&_code]:bg-[var(--bg-surface)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_a]:text-[var(--accent)] [&_a]:underline [&_*]:max-w-full"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </div>
    </div>
  )
}
