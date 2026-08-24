import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Star, Trash2, Moon, Sun, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'

const tags = [
  { name: 'Work', color: '#7c5cff', count: 0 },
  { name: 'Personal', color: '#3b82f6', count: 0 },
  { name: 'Ideas', color: '#22c55e', count: 0 },
  { name: 'Study', color: '#f59e0b', count: 0 },
]

export default function Sidebar({ dark, setDark, onLogout }) {
  const { user } = useAuth()
  const { filter, setFilter, setShowModal } = useNotes()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { id: 'all', label: 'All Notes', icon: FileText },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ]

  return (
    <aside className="w-64 h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)]">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#a78bfa] flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
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
          <div key={tag.name} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
              <span className="text-sm text-[var(--text-secondary)]">{tag.name}</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)] opacity-60">{tag.count}</span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

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
