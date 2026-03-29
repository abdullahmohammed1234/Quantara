import React, { useEffect } from 'react'
import { toastManager } from '../lib/api'

/**
 * Toast Container Component
 * Renders all active toast notifications
 */
const ToastContainer = () => {
  const [toasts, setToasts] = React.useState([])
  
  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return () => unsubscribe()
  }, [])
  
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

/**
 * Individual Toast Component
 */
const Toast = ({ id, message, type, duration }) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)
  
  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])
  
  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      toastManager.dismiss(id)
    }, 300)
  }
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return '•'
    }
  }
  
  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
      onClick={handleDismiss}
    >
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); handleDismiss() }}>
        ✕
      </button>
    </div>
  )
}

export default ToastContainer