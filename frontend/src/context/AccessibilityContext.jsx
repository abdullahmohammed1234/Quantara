import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

/**
 * AccessibilityContext - Manages accessibility features
 * Including: high contrast mode, reduced motion, screen reader optimizations
 */

const AccessibilityContext = createContext(null)

export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    highContrast: false,
    reduceMotion: false,
    largeText: false,
    screenReaderOptimized: false,
  })

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('quantara-accessibility')
    if (stored) {
      try {
        setPreferences(JSON.parse(stored))
      } catch {
        // Invalid data, use defaults
      }
    } else {
      // Check for system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches
      
      setPreferences(prev => ({
        ...prev,
        reduceMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }))
    }
  }, [])

  // Apply preferences to document
  useEffect(() => {
    const root = document.documentElement
    
    // High contrast
    if (preferences.highContrast) {
      root.setAttribute('data-high-contrast', 'true')
    } else {
      root.removeAttribute('data-high-contrast')
    }
    
    // Reduce motion
    if (preferences.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true')
    } else {
      root.removeAttribute('data-reduce-motion')
    }
    
    // Large text
    if (preferences.largeText) {
      root.setAttribute('data-large-text', 'true')
    } else {
      root.removeAttribute('data-large-text')
    }
    
    // Screen reader optimized
    if (preferences.screenReaderOptimized) {
      root.setAttribute('data-sr-optimized', 'true')
    } else {
      root.removeAttribute('data-sr-optimized')
    }
    
    // Save to localStorage
    localStorage.setItem('quantara-accessibility', JSON.stringify(preferences))
  }, [preferences])

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: more)')
    
    const handleMotionChange = (e) => {
      setPreferences(prev => ({ ...prev, reduceMotion: e.matches }))
    }
    
    const handleContrastChange = (e) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }))
    }
    
    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  // Update a single preference
  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }, [])

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    setPreferences(prev => ({ ...prev, highContrast: !prev.highContrast }))
  }, [])

  // Toggle reduced motion
  const toggleReduceMotion = useCallback(() => {
    setPreferences(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }))
  }, [])

  // Toggle large text
  const toggleLargeText = useCallback(() => {
    setPreferences(prev => ({ ...prev, largeText: !prev.largeText }))
  }, [])

  // Toggle screen reader optimization
  const toggleScreenReader = useCallback(() => {
    setPreferences(prev => ({ ...prev, screenReaderOptimized: !prev.screenReaderOptimized }))
  }, [])

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences({
      highContrast: false,
      reduceMotion: false,
      largeText: false,
      screenReaderOptimized: false,
    })
  }, [])

  const value = {
    preferences,
    updatePreference,
    toggleHighContrast,
    toggleReduceMotion,
    toggleLargeText,
    toggleScreenReader,
    resetPreferences,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Hook to access accessibility context
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    return {
      preferences: {
        highContrast: false,
        reduceMotion: false,
        largeText: false,
        screenReaderOptimized: false,
      },
      updatePreference: () => {},
      toggleHighContrast: () => {},
      toggleReduceMotion: () => {},
      toggleLargeText: () => {},
      toggleScreenReader: () => {},
      resetPreferences: () => {},
    }
  }
  return context
}

/**
 * AccessibilityPanel - Component to manage accessibility settings
 */
export const AccessibilityPanel = ({ isOpen, onClose }) => {
  const { preferences, toggleHighContrast, toggleReduceMotion, toggleLargeText, toggleScreenReader, resetPreferences } = useAccessibility()

  if (!isOpen) return null

  const Toggle = ({ label, description, checked, onChange }) => (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px',
      background: 'var(--color-bg-tertiary)',
      borderRadius: '8px',
      cursor: 'pointer',
    }}>
      <div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
            {description}
          </div>
        )}
      </div>
      <div style={{
        position: 'relative',
        width: '44px',
        height: '24px',
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: checked ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
          borderRadius: '12px',
          transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '22px' : '2px',
            width: '20px',
            height: '20px',
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.2s',
          }} />
        </div>
      </div>
    </label>
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '32px',
          width: '400px',
          maxWidth: '90vw',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          color: 'var(--text-primary)',
          marginBottom: '24px',
        }}>
          Accessibility
        </h2>

        <div style={{ display: 'grid', gap: '12px' }}>
          <Toggle
            label="High Contrast"
            description="Increase color contrast for better visibility"
            checked={preferences.highContrast}
            onChange={toggleHighContrast}
          />
          <Toggle
            label="Reduce Motion"
            description="Minimize animations and transitions"
            checked={preferences.reduceMotion}
            onChange={toggleReduceMotion}
          />
          <Toggle
            label="Large Text"
            description="Increase text size throughout the app"
            checked={preferences.largeText}
            onChange={toggleLargeText}
          />
          <Toggle
            label="Screen Reader Support"
            description="Optimize for screen readers"
            checked={preferences.screenReaderOptimized}
            onChange={toggleScreenReader}
          />
        </div>

        <button
          onClick={resetPreferences}
          style={{
            marginTop: '24px',
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default AccessibilityContext