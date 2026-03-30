import React, { useRef, useState, Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AIMessageProvider } from './context/AIMessageContext'
import { GamificationProvider } from './context/GamificationContext'
import { AuthProvider } from './context/AuthContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts'
import { usePWA } from './hooks/usePWA'
import { BackgroundGrid } from './components/ui/BackgroundEffects'
import Sidebar from './components/Sidebar'
import { BottomNavigation } from './components/ui'
import HomePage from './pages/HomePage'
import QubitsPage from './pages/QubitsPage'
import CircuitsPage from './pages/CircuitsPage'
import AlgorithmsPage from './pages/AlgorithmsPage'
import GateLibraryPage from './pages/GateLibraryPage'
import ChallengePage from './pages/ChallengePage'
import LandingPage from './pages/LandingPage'
import SharedCircuitPage from './pages/SharedCircuitPage'
import GlobalSearchModal from './components/GlobalSearchModal'
import PortalBoot from './components/PortalBoot'
import { OnboardingProvider } from './components/OnboardingTutorial'
import TutorialPage from './pages/TutorialPage'

// Lazy load heavy components for better performance
const TutorPanel = lazy(() => import('./components/TutorPanel'))
const QuantumErrorPlayground = lazy(() => import('./components/QuantumErrorPlayground'))

/**
 * Loading skeleton component for lazy-loaded components
 */
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

/**
 * Tutor panel loading skeleton
 */
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
 * AppContent - Main application layout with routing
 * Dark sci-fi design with sidebar, main content, and AI tutor panel
 * No authentication required - always accessible
 */
const AppContent = () => {
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
      {/* Grid background overlay - using standardized component */}
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
        <Outlet />
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

/**
 * Loading fallback for route components
 */
const RouteLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '400px',
    background: 'rgba(17, 24, 39, 0.7)',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '3px solid #1a1a2e',
      borderTopColor: '#00d4ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  </div>
)

/**
 * App - Root component
 * No authentication required - Landing page shown first, then main app with sidebar
 * Wrapped with OnboardingProvider for tutorial system
 */
const App = () => {
  // Use sessionStorage - clears when browser closes, shows on each new browser session
  const [showBoot, setShowBoot] = useState(() => {
    return !sessionStorage.getItem('quantara_boot_done')
  })

  const handleBootComplete = () => {
    sessionStorage.setItem('quantara_boot_done', 'true')
    setShowBoot(false)
  }

  return (
    <>
      <PortalBoot enabled={showBoot} onComplete={handleBootComplete} />
      <BrowserRouter>
        <AccessibilityProvider>
          <AuthProvider>
            <AIMessageProvider>
              <GamificationProvider>
                <OnboardingProvider>
                  <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/circuit/:shareId" element={<SharedCircuitPage />} />
                      <Route path="/shared/:shareId" element={<SharedCircuitPage />} />
                      <Route element={<AppContent />}>
                        <Route path="/dashboard" element={<HomePage />} />
                        <Route path="/qubits" element={<QubitsPage />} />
                        <Route path="/circuits" element={<CircuitsPage />} />
                        <Route path="/algorithms" element={<AlgorithmsPage />} />
                        <Route path="/gate-library" element={<GateLibraryPage />} />
                        <Route path="/challenge/:challengeId" element={<ChallengePage />} />
                        <Route path="/error-playground" element={<QuantumErrorPlayground />} />
                      <Route path="/tutorial" element={<TutorialPage />} />
                      </Route>
                    </Routes>
                  </OnboardingProvider>
                </GamificationProvider>
              </AIMessageProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </BrowserRouter>
      </>
  )
}

export default App
