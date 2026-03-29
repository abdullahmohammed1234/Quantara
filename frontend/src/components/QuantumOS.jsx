/**
 * QuantumOS - Desktop-style quantum computing interface component
 * 
 * Simulates a desktop operating system environment for quantum computing operations.
 * Features include:
 * - macOS-style menu bar and dock
 * - Draggable/resizable application windows
 * - Simulated desktop with widgets and shortcuts
 * - Multi-app workspace management
 * 
 * @module QuantumOS
 * @since 1.0.0
 * @see {@link https://en.wikipedia.org/wiki/Quantum_computing} for quantum computing concepts
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * MenuBar - macOS-style top menu bar component
 * 
 * Displays system menu items and status indicators including:
 * - System menu (Quantum OS, File, Edit, View, Window, Help)
 * - Status icons (Wi-Fi, Battery, Performance Mode)
 * - Real-time clock display
 * 
 * @component
 * @returns {JSX.Element} Animated menu bar
 */
// Top Menu Bar - macOS style
const MenuBar = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const menuItems = ['Quantum OS', 'File', 'Edit', 'View', 'Window', 'Help']
  const statusItems = [
    { icon: '📶', label: 'Wi-Fi' },
    { icon: '🔋', label: '100%' },
    { icon: '⚡', label: 'Performance Mode' },
    { icon: '🔍', label: 'Search' },
  ]

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-8"
      style={{
        background: 'linear-gradient(180deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Left menu items */}
      <div className="flex items-center gap-4">
        {menuItems.map((item, index) => (
          <button
            key={item}
            className="text-sm transition-colors hover:text-white"
            style={{
              color: index === 0 ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: index === 0 ? 600 : 400,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right status items */}
      <div className="flex items-center gap-4">
        {statusItems.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center gap-1 text-xs cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <span>{item.icon}</span>
            {index === 3 && (
              <span className="ml-1">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * DockItem - Individual dock application launcher
 * 
 * Represents an application icon in the bottom dock with hover animations
 * and tooltip labels. Supports active state indicators and custom colors.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.icon - Emoji or icon for the application
 * @param {string} props.label - Display label for tooltip
 * @param {function} props.onClick - Click handler for launching app
 * @param {boolean} [props.isActive=false] - Active state indicator
 * @param {string} [props.color='#00d4ff'] - Accent color for active state
 * @returns {JSX.Element} Animated dock item with hover effect
 */
// App Dock Item
const DockItem = ({ icon, label, onClick, isActive, color }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        transition={{ duration: 0.2 }}
        className="absolute -top-10 px-3 py-1 rounded-lg text-xs whitespace-nowrap"
        style={{
          background: 'rgba(30, 30, 40, 0.95)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {label}
      </motion.div>

      {/* Icon */}
      <motion.div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{
          background: isActive 
            ? `linear-gradient(135deg, ${color}40, ${color}20)`
            : 'linear-gradient(135deg, rgba(40, 40, 50, 0.9), rgba(30, 30, 40, 0.9))',
          border: isActive 
            ? `2px solid ${color}`
            : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isHovered 
            ? `0 8px 30px ${color}40`
            : '0 4px 15px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Glow effect when active */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle at center, ${color}30, transparent 70%)`,
              boxShadow: `0 0 20px ${color}50`,
            }}
          />
        )}
        <span style={{ color: isActive ? color : '#fff' }}>{icon}</span>
        
        {/* Active indicator dot */}
        {isActive && (
          <div 
            className="absolute -bottom-1 w-1 h-1 rounded-full"
            style={{ background: color }}
          />
        )}
      </motion.div>

      {/* Dock reflection/shine */}
      <div 
        className="absolute bottom-0 w-12 h-3 rounded-b-2xl opacity-30"
        style={{
          background: `linear-gradient(to bottom, ${color}40, transparent)`,
        }}
      />
    </motion.div>
  )
}

// Bottom Dock - macOS style
const Dock = ({ activeApp, onAppClick }) => {
  const apps = [
    { id: 'home', icon: '⌂', label: 'Home', path: '/', color: '#00d4ff' },
    { id: 'qubits', icon: '◈', label: 'Qubits', path: '/qubits', color: '#00d4ff' },
    { id: 'circuits', icon: '⊞', label: 'Circuits', path: '/circuits', color: '#8b5cf6' },
    { id: 'error', icon: '⚡', label: 'Error Lab', path: '/error-playground', color: '#f59e0b' },
    { id: 'lab', icon: '⚗', label: 'Quantum Lab', path: '/quantum-lab', color: '#10b981' },
    { id: 'tutor', icon: '🤖', label: 'AI Tutor', path: '/tutor', color: '#8b5cf6' },
  ]

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className="flex items-end gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(40, 40, 55, 0.85) 0%, rgba(20, 20, 30, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {apps.map((app) => (
          <DockItem
            key={app.id}
            icon={app.icon}
            label={app.label}
            color={app.color}
            isActive={activeApp === app.id}
            onClick={() => onAppClick(app.path)}
          />
        ))}
        
        {/* Separator */}
        <div 
          className="w-px h-12 mx-2 rounded-full"
          style={{ background: 'rgba(255, 255, 255, 0.2)' }}
        />
        
        {/* Finder/Explorer style item */}
        <DockItem
          icon="📁"
          label="Files"
          color="#64748b"
          isActive={false}
          onClick={() => {}}
        />
      </div>
    </motion.div>
  )
}

// Window Component - Draggable window
const Window = ({ title, children, position, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute bg-quantum-navy-light rounded-xl overflow-hidden"
      style={{
        width: '600px',
        height: '400px',
        left: position?.x || 100,
        top: position?.y || 100,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Window Title Bar */}
      <div
        className="h-8 flex items-center justify-between px-3"
        style={{
          background: 'linear-gradient(180deg, rgba(40, 40, 55, 0.95) 0%, rgba(30, 30, 40, 0.95) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-white/70">{title}</span>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white text-sm"
        >
          ×
        </button>
      </div>
      
      {/* Window Content */}
      <div className="p-4 h-[calc(100%-32px)] overflow-auto">
        {children}
      </div>
    </motion.div>
  )
}

// Main QuantumOS Component
const QuantumOS = ({ activeApp, setActiveApp }) => {
  const navigate = useNavigate()
  const [windows, setWindows] = useState([])

  const handleAppClick = (path) => {
    setActiveApp(path.split('/')[1] || 'home')
    navigate(path)
  }

  return (
    <>
      <MenuBar />
      <Dock activeApp={activeApp} onAppClick={handleAppClick} />
    </>
  )
}

export default QuantumOS
