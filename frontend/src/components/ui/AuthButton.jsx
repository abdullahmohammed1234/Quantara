import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/**
 * AuthButton - Shows user info and logout option
 */
const AuthButton = () => {
  const [showMenu, setShowMenu] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setShowMenu(false)
    navigate('/')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #1a1a2e',
          background: '#111827',
          color: '#f0f9ff',
          cursor: 'pointer',
          fontSize: '14px',
        }}
        aria-label="User menu"
        aria-expanded={showMenu}
      >
        <span style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#00d4ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
        }}>
          {user.avatar}
        </span>
        <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.username}
        </span>
      </button>

      {showMenu && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          marginBottom: '8px',
          background: '#111827',
          border: '1px solid #1a1a2e',
          borderRadius: '8px',
          padding: '8px',
          zIndex: 100,
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid #1a1a2e',
            marginBottom: '8px',
          }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Signed in as</div>
            <div style={{ fontSize: '14px', color: '#f0f9ff' }}>{user.username}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default AuthButton
