import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

/**
 * ThemeToggle - Theme switching component for dark/light mode
 * Provides toggle button with system preference option
 */
const ThemeToggle = ({ variant = 'icon' }) => {
  const { theme, isDark, isSystemPreference, toggleTheme, setThemeMode } = useTheme()

  // Icon toggle variant (for sidebar/header)
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="theme-toggle-icon"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-accent-primary)'
          e.currentTarget.style.color = '#000'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--glass-bg)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
      >
        {isDark ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
      </button>
    )
  }

  // Dropdown variant with system preference option
  if (variant === 'dropdown') {
    return (
      <div
        className="theme-toggle-dropdown"
        style={{
          position: 'relative',
        }}
      >
        <select
          value={isSystemPreference ? 'system' : theme}
          onChange={(e) => setThemeMode(e.target.value)}
          aria-label="Theme preference"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <option value="system" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={16} style={{ marginRight: '8px' }} aria-hidden="true" />
            System
          </option>
          <option value="light" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={16} style={{ marginRight: '8px' }} aria-hidden="true" />
            Light
          </option>
          <option value="dark" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Moon size={16} style={{ marginRight: '8px' }} aria-hidden="true" />
            Dark
          </option>
        </select>
      </div>
    )
  }

  // Full button with label
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-full"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-accent-primary)'
        e.currentTarget.style.color = '#000'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--glass-bg)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
    >
      {isDark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
      <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  )
}

export default ThemeToggle