import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuthButton from './ui/AuthButton'

// Navigation items with icons
const navItems = [
  { path: '/', label: 'Dashboard', icon: '⬡', color: '#00d4ff' },
  { path: '/qubits', label: 'Qubits', icon: '◈', color: '#00d4ff' },
  { path: '/circuits', label: 'Circuits', icon: '⊞', color: '#8b5cf6' },
  { path: '/algorithms', label: 'Algorithms', icon: '🧠', color: '#ec4899' },
  { path: '/gate-library', label: 'Gate Library', icon: '📚', color: '#06b6d4' },
  { path: '/error-playground', label: 'Error Lab', icon: '⚡', color: '#f59e0b' },
  { path: '/quantum-lab', label: 'Quantum Lab', icon: '⚗', color: '#10b981' },
  { path: '/tutorial', label: 'Tutorial', icon: '❓', color: '#a855f7' }
]

/**
 * Sidebar Component - Dark Sci-Fi Design
 * Futuristic command center aesthetic
 * Uses CSS classes for consistent styling
 */
const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggle = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Handle mobile overlay click
  const handleOverlayClick = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile hamburger menu button */}
      <button
        className={`hamburger-menu ${isMobile ? 'flex' : 'hidden'}`}
        onClick={handleToggle}
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>
      
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className={`mobile-overlay ${isMobile ? 'block' : 'hidden'}`}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="sidebar sidebar-gradient"
        initial={false}
        animate={{ 
          x: isMobile && isMobileOpen ? 0 : 0,
        }}
        style={{
          width: isMobile ? (isMobileOpen ? '280px' : 0) : undefined,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1000,
        }}>
        {/* Decorative top line */}
        <div className="sidebar-decorative-line" />

        {/* Logo Section */}
        <div className="sidebar-logo-section">
          <div className="sidebar-logo-container">
            <div className="sidebar-logo-icon">
              ψ
            </div>
            <div>
              <div className="sidebar-logo-text">
                QUANTARA
              </div>
              <div className="sidebar-logo-subtext">
                QUANTUM OS
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">
            Navigation
          </div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => 
                `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? '#fff' : undefined,
              })}
            >
              {({ isActive }) => (
                <>
                  <span 
                    className={`sidebar-nav-icon ${isActive ? 'sidebar-nav-icon-active' : ''}`}
                    style={{ 
                      color: isActive ? item.color : undefined,
                      filter: isActive ? `drop-shadow(0 0 8px ${item.color})` : undefined,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className={`sidebar-nav-text ${isActive ? 'sidebar-nav-text-active' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status Section */}
        <div className="sidebar-status-section">
          <div className="sidebar-status-label">
            System Status
          </div>
          
          {/* Status indicators */}
          <div className="sidebar-status-indicators">
            <div className="sidebar-status-item">
              <div className="sidebar-status-dot sidebar-status-dot-green" />
              <span className="sidebar-status-text">Core: Online</span>
            </div>
            <div className="sidebar-status-item">
              <div className="sidebar-status-dot sidebar-status-dot-cyan" />
              <span className="sidebar-status-text">Qubits: Active</span>
            </div>
            <div className="sidebar-status-item">
              <div className="sidebar-status-dot sidebar-status-dot-purple" />
              <span className="sidebar-status-text">AI: Ready</span>
            </div>
          </div>

          {/* Auth Button */}
          <div className="sidebar-auth-section">
            <AuthButton />
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
