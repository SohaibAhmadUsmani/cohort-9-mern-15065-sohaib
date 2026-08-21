import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notes App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your notes will appear here (coming in Day 5)
          </p>
        </div>
      </main>
    </div>
  )
}
