import { FileText, Star, Trash2, Moon, Sun, LogOut, Download, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import { useRef } from 'react'

export default function Sidebar({ dark, setDark, onLogout }) {
  const { user } = useAuth()
  const { filter, setFilter, setShowModal, tagCounts, tags, exportNotes, importNotes } = useNotes()
  const fileInputRef = useRef(null)

  const navItems = [
    { id: 'all', label: 'All Notes', icon: FileText },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const tagColors = { Work: '#7c5cff', Personal: '#3b82f6', Ideas: '#22c55e', Study: '#f59e0b' }

  return (
    <aside className="w-64 h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)]">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3">
        <img src="/MemoraLogo.png" alt="Memora" className="w-9 h-9 rounded-xl" />
        <span className="text-lg font-semibold text-[var(--text-primary)]">Memora</span>
      </div>

      {/* New Note Button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#a78bfa] text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          New Note
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 mb-6">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 ${
              filter === item.id
                ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Tags */}
      <div className="px-5 mb-6">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Tags</h3>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(filter === tag ? 'all' : tag)}
            className={`w-full flex items-center justify-between py-1.5 transition-colors ${
              filter === tag ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: tagColors[tag] }} />
              <span className="text-sm text-[var(--text-secondary)]">{tag}</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)] opacity-60">{tagCounts[tag] || 0}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Export/Import */}
      <div className="px-4 mb-3 flex gap-2">
        <button
          onClick={exportNotes}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors border border-[var(--border)]"
        >
          <Download size={14} />
          Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors border border-[var(--border)]"
        >
          <Upload size={14} />
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={e => { if (e.target.files[0]) importNotes(e.target.files[0]); e.target.value = '' }}
          className="hidden"
        />
      </div>

      {/* Dark Mode Toggle */}
      <div className="px-4 mb-3">
        <button
          onClick={() => setDark(d => !d)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <div className="flex items-center gap-3">
            {dark ? <Moon size={18} /> : <Sun size={18} />}
            <span>Dark Mode</span>
          </div>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${dark ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${dark ? 'left-5' : 'left-0.5'}`} />
          </div>
        </button>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email || ''}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
