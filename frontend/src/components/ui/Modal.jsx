import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal Component - Reusable modal/dialog for export and share features
 * 
 * A glass-morphism style modal with:
 * - Dark sci-fi theme
 * - Smooth animations using framer-motion
 * - Close button and click-outside-to-close functionality
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback when modal should close
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size: 'small', 'medium', 'large'
 * @returns {JSX.Element|null} The Modal component
 */
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const sizeStyles = {
    small: { maxWidth: '400px', width: '90%' },
    medium: { maxWidth: '600px', width: '90%' },
    large: { maxWidth: '800px', width: '95%' }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                zIndex: 10000,
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98))',
                borderRadius: '16px',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.1)',
                ...sizeStyles[size],
                maxHeight: '90vh',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
                flexShrink: 0
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ color: '#00d4ff' }}>⚛</span>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#8a8a9a',
                    fontSize: '18px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.color = '#8a8a9a'
                  }}
                >
                  ✕
                </button>
              </div>
              
              {/* Content */}
              <div style={{ padding: '24px', flex: 1, minHeight: 0 }}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal
