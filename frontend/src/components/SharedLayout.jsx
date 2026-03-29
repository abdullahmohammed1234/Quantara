import React, { useRef, useState, Suspense, lazy, useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts'
import { usePWA } from '../hooks/usePWA'
import { BackgroundGrid } from './ui/BackgroundEffects'
import Sidebar from './Sidebar'
import { BottomNavigation } from './ui'
import GlobalSearchModal from './GlobalSearchModal'

// Lazy load heavy components for better performance
const TutorPanel = lazy(() => import('./TutorPanel'))
const ComponentLoader = ({ height = '200px', width = '100%' }) => (
  <div 
    style={{
      height,
      width,
      background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px',
    }}
  />
)
const TutorPanelLoader = () => (
  <div style={{
    height: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }}>
    <ComponentLoader height="40px" />
    <ComponentLoader height="60%" />
    <ComponentLoader height="80px" />
    <ComponentLoader height="80px" />
    <ComponentLoader height="80px" />
  </div>
)

/**
 * SharedLayout - Layout wrapper for shared pages that need sidebar and tutor panel
 * Provides the full app experience for shared circuit views
 */
const SharedLayout = ({ children }) => {
  const tutorPanelRef = useRef(null)
  const showTutorPanel = true
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const { isUpdateAvailable, isOffline, skipWaiting } = usePWA()

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    onShowHelp: () => setShowShortcutsHelp(true),
    onCloseModal: () => {
      setShowShortcutsHelp(false)
      setShowGlobalSearch(false)
    },
    onOpenSearch: () => setShowGlobalSearch(true),
  })

  // Global keyboard shortcut listener for Ctrl/Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowGlobalSearch(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Skip link for keyboard users to bypass navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div 
        className="app-container"
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          background: '#0a0a0f',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background overlay */}
        <BackgroundGrid intensity="subtle" />

        {/* Sidebar Navigation */}
        <Sidebar className="sidebar" />

        {/* Main Content Area */}
        <main 
          id="main-content"
          aria-label="Main content"
          className="main-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'auto',
            position: 'relative',
            zIndex: 1,
            background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 100%)',
          }}>
          {children}
        </main>

        {/* AI Tutor Panel - Lazy loaded with skeleton */}
        {showTutorPanel && (
          <div 
            className="tutor-panel-wrapper"
            style={{
              width: 'var(--tutor-panel-width)',
              height: '100%',
              borderLeft: '1px solid #1a1a2e',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Suspense fallback={<TutorPanelLoader />}>
              <TutorPanel ref={tutorPanelRef} />
            </Suspense>
          </div>
        )}

        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsHelp 
          isOpen={showShortcutsHelp} 
          onClose={() => setShowShortcutsHelp(false)} 
        />

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
        />

        {/* PWA Update Notification */}
        {isUpdateAvailable && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#00d4ff',
            color: '#000',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
          }}>
            <span style={{ fontWeight: 500 }}>New version available!</span>
            <button
              onClick={skipWaiting}
              style={{
                background: '#000',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Update Now
            </button>
          </div>
        )}

        {/* Offline Indicator */}
        {isOffline && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
          }}>
            <span>⚠️ You're offline</span>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>
    </>
  )
}

export default SharedLayout