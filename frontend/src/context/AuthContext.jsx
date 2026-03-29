import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

/**
 * AuthContext - Backend-based authentication with offline support
 * Uses FastAPI backend for register/login with localStorage fallback
 */

const AuthContext = createContext(null)

// API base URL - configurable for different environments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Storage keys
const USER_KEY = 'quantara_user'
const PROGRESS_KEY = 'quantara_progress'
const ACHIEVEMENTS_KEY = 'quantara_achievements'
const OFFLINE_MODE_KEY = 'quantara_offline_mode'

// Check if we're online
const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'synced' | 'error'

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false)
      // Try to sync when coming back online
      syncData()
    }
    const handleOffline = () => {
      setIsOfflineMode(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      // Set initial offline mode
      if (!navigator.onLine) {
        setIsOfflineMode(true)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // Sync local data with server when online
  const syncData = useCallback(async () => {
    if (!user || !isOnline()) return
    
    setSyncStatus('syncing')
    try {
      // Try to sync progress to server
      const storedProgress = localStorage.getItem(PROGRESS_KEY)
      if (storedProgress) {
        await fetch(`${API_URL}/auth/sync-progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: storedProgress,
        })
      }
      setSyncStatus('synced')
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
    }
  }, [user])

  // Register a new user
  const register = useCallback(async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user in localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  // Login with email and password
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user in localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error || 'Invalid credentials' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // Save progress to localStorage
  const updateProgress = useCallback((progressData) => {
    try {
      const existing = localStorage.getItem(PROGRESS_KEY)
      const currentProgress = existing ? JSON.parse(existing) : {}
      
      const updated = {
        ...currentProgress,
        ...progressData,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }, [])

  // Get progress from localStorage
  const getProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (err) {
      return null
    }
  }, [])

  // Save achievements
  const updateAchievements = useCallback((achievementData) => {
    try {
      const existing = localStorage.getItem(ACHIEVEMENTS_KEY)
      const current = existing ? JSON.parse(existing) : []
      
      const updated = [...current, ...achievementData]
      
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Error saving achievements:', err)
    }
  }, [])

  // Get achievements
  const getAchievements = useCallback(() => {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      return []
    }
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isOfflineMode,
    syncStatus,
    register,
    login,
    logout,
    updateProgress,
    getProgress,
    updateAchievements,
    getAchievements,
    syncData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isOfflineMode: false,
      syncStatus: 'idle',
      register: async () => ({ success: false }),
      login: async () => ({ success: false }),
      logout: () => {},
      updateProgress: () => {},
      getProgress: () => null,
      updateAchievements: () => {},
      getAchievements: () => [],
      syncData: async () => {},
    }
  }
  return context
}

export default AuthContext
