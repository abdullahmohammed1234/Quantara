import { useEffect, useCallback, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * useKeyboardShortcuts - Custom hook for power user keyboard navigation
 * Provides keyboard shortcuts for quick navigation and actions
 */

// Define keyboard shortcuts
const SHORTCUTS = {
  // Navigation
  'g h': { action: 'navigate', path: '/', description: 'Go to Dashboard' },
  'g q': { action: 'navigate', path: '/qubits', description: 'Go to Qubits' },
  'g c': { action: 'navigate', path: '/circuits', description: 'Go to Circuits' },
  'g a': { action: 'navigate', path: '/algorithms', description: 'Go to Algorithms' },
  'g g': { action: 'navigate', path: '/gate-library', description: 'Go to Gate Library' },
  'g p': { action: 'navigate', path: '/progress', description: 'Go to Progress' },
  'g s': { action: 'navigate', path: '/games', description: 'Go to Games' },
  'g e': { action: 'navigate', path: '/error-playground', description: 'Go to Error Lab' },
  
  // Actions
  '?': { action: 'showHelp', description: 'Show keyboard shortcuts' },
  '/': { action: 'focusSearch', description: 'Focus search' },
  'Escape': { action: 'closeModal', description: 'Close modal' },
  'm': { action: 'toggleMenu', description: 'Toggle sidebar' },
}

// Jump menu navigation items
const JUMP_MENU_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '⬡' },
  { path: '/qubits', label: 'Qubits', icon: '◈' },
  { path: '/circuits', label: 'Circuits', icon: '⊞' },
  { path: '/algorithms', label: 'Algorithms', icon: '🧠' },
  { path: '/gate-library', label: 'Gate Library', icon: '📚' },
  { path: '/error-playground', label: 'Error Lab', icon: '⚡' },
]

export const useKeyboardShortcuts = (options = {}) => {
  const { onToggleTheme, onShowHelp, onFocusSearch, onCloseModal, onOpenJumpMenu, onOpenSearch, enabled = true } = options
  const navigate = useNavigate()
  const location = useLocation()
  const pressedKeys = useRef(new Set())
  const timeoutRef = useRef(null)
  const [showJumpMenu, setShowJumpMenu] = useState(false)

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return
    }

    // Handle Ctrl+K/Cmd+K for global search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      if (onOpenSearch) {
        onOpenSearch()
      }
      return
    }
    
    // Ignore other modifier key combinations
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return
    }

    const key = event.key.toLowerCase()

    // Clear shortcut after timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      pressedKeys.current.clear()
    }, 1000)

    // Add key to pressed keys
    pressedKeys.current.add(key)

    // Build shortcut string from pressed keys
    const shortcutString = Array.from(pressedKeys.current).join(' ')

    // Check if shortcut matches
    const shortcut = SHORTCUTS[shortcutString]
    if (shortcut) {
      event.preventDefault()
      
      switch (shortcut.action) {
        case 'navigate':
          navigate(shortcut.path)
          break
        case 'toggleTheme':
          onToggleTheme?.()
          break
        case 'showHelp':
          onShowHelp?.()
          break
        case 'focusSearch':
          onFocusSearch?.()
          break
        case 'closeModal':
          onCloseModal?.()
          break
        case 'toggleMenu':
          // Toggle sidebar visibility (would need implementation)
          break
        default:
          break
      }
    }
  }, [navigate, onToggleTheme, onShowHelp, onFocusSearch, onCloseModal, onOpenSearch])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleKeyDown, enabled])

  // Return available shortcuts for help display
  return {
    shortcuts: SHORTCUTS,
    showJumpMenu,
    setShowJumpMenu,
    jumpMenuItems: JUMP_MENU_ITEMS,
  }
}

/**
 * KeyboardShortcutsHelp - Component to display available shortcuts
 */
export const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  
  if (!isOpen) return null

  const groupedShortcuts = {
    'Navigation': [
      { keys: 'g h', description: 'Dashboard' },
      { keys: 'g q', description: 'Qubits' },
      { keys: 'g c', description: 'Circuits' },
      { keys: 'g a', description: 'Algorithms' },
      { keys: 'g g', description: 'Gate Library' },
      { keys: 'g p', description: 'Progress' },
      { keys: 'g s', description: 'Games' },
      { keys: 'g e', description: 'Error Lab' },
    ],
    'Actions': [
      { keys: '?', description: 'Show shortcuts' },
      { keys: '/', description: 'Focus search' },
      { keys: 'Esc', description: 'Close modal' },
      { keys: 'm', description: 'Toggle menu' },
    ],
  }

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
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          color: 'var(--text-primary)',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Keyboard Shortcuts
        </h2>

        {Object.entries(groupedShortcuts).map(([group, shortcuts]) => (
          <div key={group} style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              {group}
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {shortcuts.map(({ keys, description }) => (
                <div
                  key={keys}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {description}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {keys.split(' ').map((key, i) => (
                      <kbd
                        key={i}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: 'var(--color-accent-primary)',
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          marginTop: '16px',
        }}>
          Press <kbd style={{ padding: '2px 6px', background: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>?</kbd> anytime to show this help
        </p>
      </div>
    </div>
  )
}

/**
 * JumpMenu - Quick navigation menu triggered by Ctrl+K
 */
export const JumpMenu = ({ isOpen, onClose, items = JUMP_MENU_ITEMS }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef(null)
  
  // Focus input when menu opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleSelect = (path) => {
    navigate(path)
    onClose?.()
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '24px',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '60vh',
          overflow: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '16px',
            marginBottom: '16px',
          }}
        />
        
        {/* Navigation items */}
        <div style={{ display: 'grid', gap: '8px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleSelect(item.path)}
              role="option"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Footer hint */}
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          marginTop: '16px',
        }}>
          Press <kbd style={{ padding: '2px 6px', background: 'var(--color-bg-tertiary)', borderRadius: '4px' }}>Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}

export default useKeyboardShortcuts