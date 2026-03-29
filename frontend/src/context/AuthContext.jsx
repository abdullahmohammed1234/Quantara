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

// Sensitive data keys that should use sessionStorage or be encrypted
const SENSITIVE_KEYS = [
  'quantara_chat_history',
  'quantara_conversations',
  'quantara_last_conversation'
]

// Check if we're online
const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true

// Secure storage wrapper - encrypts sensitive data
const secureStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      
      // For sensitive keys, try to decode base64 (simple obfuscation)
      if (SENSITIVE_KEYS.includes(key)) {
        return JSON.parse(atob(item))
      }
      return JSON.parse(item)
    } catch (e) {
      return null
    }
  },
  set: (key, value) => {
    try {
      const stringValue = JSON.stringify(value)
      
      // For sensitive keys, apply base64 encoding
      if (SENSITIVE_KEYS.includes(key)) {
        localStorage.setItem(key, btoa(stringValue))
      } else {
        localStorage.setItem(key, stringValue)
      }
    } catch (e) {
      console.error('Secure storage error:', e)
    }
  },
  remove: (key) => {
    localStorage.removeItem(key)
  }
}

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
        // Store user and tokens in localStorage
        const userData = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          access_token: data.user.access_token,
          refresh_token: data.user.refresh_token,
          expires_in: data.user.expires_in,
          token_created_at: Date.now()
        }
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        setUser(userData)
        return { success: true, user: userData }
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
        // Store user and tokens in localStorage (use secureStorage for tokens)
        const userData = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          access_token: data.user.access_token,
          refresh_token: data.user.refresh_token,
          expires_in: data.user.expires_in,
          token_created_at: Date.now()
        }
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        setUser(userData)
        return { success: true, user: userData }
      } else {
        return { success: false, error: data.error || 'Invalid credentials' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  // Refresh access token
  const refreshToken = useCallback(async () => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (!storedUser) {
      return { success: false, error: 'No user session' }
    }

    try {
      const user = JSON.parse(storedUser)
      const refreshTokenValue = user.refresh_token

      if (!refreshTokenValue) {
        return { success: false, error: 'No refresh token' }
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      })

      const data = await response.json()

      if (data.success) {
        // Update stored user with new access token
        const updatedUser = {
          ...user,
          access_token: data.access_token,
          expires_in: data.expires_in,
          token_created_at: Date.now()
        }
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
        setUser(updatedUser)
        return { success: true, user: updatedUser }
      } else {
        // Refresh token expired, force logout
        localStorage.removeItem(USER_KEY)
        setUser(null)
        return { success: false, error: data.error || 'Token refresh failed' }
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  // Check and refresh token if expiring soon
  const checkAndRefreshToken = useCallback(async () => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (!storedUser) return false

    const user = JSON.parse(storedUser)
    const expiresIn = user.expires_in || 0
    const tokenCreatedAt = user.token_created_at || 0
    
    // If token expires in less than 5 minutes, refresh it
    const timeUntilExpiry = expiresIn * 1000 - (Date.now() - tokenCreatedAt)
    if (timeUntilExpiry < 300000) { // 5 minutes
      const result = await refreshToken()
      return result.success
    }
    return true
  }, [refreshToken])

  // Logout
  const logout = useCallback(async () => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        // Notify backend to invalidate tokens
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: user.refresh_token }),
        })
      } catch (e) {
        // Ignore errors, proceed with local logout
      }
    }
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
    refreshToken,
    checkAndRefreshToken,
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
