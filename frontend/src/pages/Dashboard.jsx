import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import Sidebar from '../components/Sidebar'
import NoteCard from '../components/NoteCard'
import NoteEditor from '../components/NoteEditor'
import NoteModal from '../components/NoteModal'
import DeleteModal from '../components/DeleteModal'
import EmptyState from '../components/EmptyState'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { notes, filteredNotes, loading, selectedNote, search, setSearch, fetchNotes } = useNotes()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar dark={dark} setDark={setDark} onLogout={handleLogout} />
      </div>

      {/* Notes List */}
      <div className="w-80 h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
        {/* Search */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">All Notes</h2>
          <span className="text-xs text-[var(--text-secondary)]">{filteredNotes.length} notes</span>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-xl skeleton h-20" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
              {search ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredNotes.map((note, i) => (
                <NoteCard key={note._id} note={note} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 w-full max-w-lg px-8">
              <div className="h-6 skeleton rounded w-2/3" />
              <div className="h-4 skeleton rounded w-1/3" />
              <div className="h-40 skeleton rounded-xl" />
            </div>
          </div>
        ) : notes.length === 0 ? (
          <EmptyState />
        ) : (
          <NoteEditor />
        )}
      </div>

      {/* Modals */}
      <NoteModal />
      <DeleteModal />
    </div>
  )
}
