// Bottom Navigation - Mobile Navigation Bar
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

// Navigation items for mobile - fewer items to fit
const mobileNavItems = [
  { path: '/', label: 'Home', icon: '⬡' },
  { path: '/qubits', label: 'Qubits', icon: '◈' },
  { path: '/circuits', label: 'Circuits', icon: '⊞' },
  { path: '/algorithms', label: 'Algos', icon: '🧠' },
  { path: '/games', label: 'Games', icon: '🎮' },
]

/**
 * BottomNavigation Component
 * Mobile-optimized bottom navigation bar with touch-friendly icons
 */
const BottomNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pressedIndex, setPressedIndex] = useState(null)

  const handleNavigate = (path, index) => {
    setPressedIndex(index)
    navigate(path)
  }

  return (
    <motion.nav 
      className="bottom-nav"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bottom-nav-inner">
        {mobileNavItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))
          
          return (
            <div
              key={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path, index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(item.path, index)}
            >
              <motion.div
                className="bottom-nav-icon"
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                <span className="nav-icon-text">{item.icon}</span>
                {isActive && (
                  <motion.div
                    className="nav-active-indicator"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span className="bottom-nav-label">{item.label}</span>
            </div>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default BottomNavigation