import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import NoteCard from '../components/NoteCard'
import NoteModal from '../components/NoteModal'
import DeleteModal from '../components/DeleteModal'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { notes, loading, fetchNotes, setShowModal } = useNotes()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notes App</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Toggle dark mode"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Notes</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Note
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notes yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first note to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Note
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {notes.map((note, i) => (
                <NoteCard key={note._id} note={note} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <NoteModal />
      <DeleteModal />
    </div>
  )
}
