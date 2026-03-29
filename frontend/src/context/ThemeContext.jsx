import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

/**
 * ThemeContext - Manages dark/light theme mode for Quantara
 * Supports system preference detection and manual toggle
 */

const ThemeContext = createContext(null)

// Theme colors for light mode
const lightTheme = {
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  accentPrimary: '#0891b2',
  accentSecondary: '#7c3aed',
  accentTertiary: '#06b6d4',
  textPrimary: '#0f172a',
  textSecondary: 'var(--gray-400)',
  textMuted: 'var(--gray-500)',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(8, 145, 178, 0.2)',
}

// Theme colors for dark mode
const darkTheme = {
  bgPrimary: '#0a0e17',
  bgSecondary: '#111827',
  bgTertiary: '#1a2332',
  accentPrimary: '#00d4ff',
  accentSecondary: '#8b5cf6',
  accentTertiary: '#06b6d4',
  textPrimary: '#f0f9ff',
  textSecondary: 'var(--gray-400)',
  textMuted: 'var(--gray-500)',
  glassBg: 'rgba(17, 24, 39, 0.7)',
  glassBorder: 'rgba(0, 212, 255, 0.2)',
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')
  const [isSystemPreference, setIsSystemPreference] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('quantara-theme')
    if (storedTheme) {
      setTheme(storedTheme)
      setIsSystemPreference(false)
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      setIsSystemPreference(true)
    }
  }, [])

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement
    const themeColors = theme === 'dark' ? darkTheme : lightTheme
    
    // Set CSS variables
    root.style.setProperty('--color-bg-primary', themeColors.bgPrimary)
    root.style.setProperty('--color-bg-secondary', themeColors.bgSecondary)
    root.style.setProperty('--color-bg-tertiary', themeColors.bgTertiary)
    root.style.setProperty('--color-accent-primary', themeColors.accentPrimary)
    root.style.setProperty('--color-accent-secondary', themeColors.accentSecondary)
    root.style.setProperty('--color-accent-tertiary', themeColors.accentTertiary)
    root.style.setProperty('--text-primary', themeColors.textPrimary)
    root.style.setProperty('--text-secondary', themeColors.textSecondary)
    root.style.setProperty('--text-muted', themeColors.textMuted)
    root.style.setProperty('--glass-bg', themeColors.glassBg)
    root.style.setProperty('--glass-border', themeColors.glassBorder)
    
    // Set data attribute for component-level styling
    root.setAttribute('data-theme', theme)
    
    // Persist to localStorage
    localStorage.setItem('quantara-theme', theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      if (isSystemPreference) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isSystemPreference])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    setIsSystemPreference(false)
  }, [])

  // Set specific theme
  const setThemeMode = useCallback((mode) => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      setIsSystemPreference(true)
    } else {
      setTheme(mode)
      setIsSystemPreference(false)
    }
  }, [])

  const value = {
    theme,
    isDark: theme === 'dark',
    isSystemPreference,
    toggleTheme,
    setThemeMode,
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    return {
      theme: 'dark',
      isDark: true,
      isSystemPreference: false,
      toggleTheme: () => {},
      setThemeMode: () => {},
      themes: { dark: darkTheme, light: lightTheme },
    }
  }
  return context
}

export default ThemeContext