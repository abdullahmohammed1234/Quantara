import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

/**
 * Breadcrumb component for navigation
 */
const Breadcrumb = ({ items }) => (
  <nav aria-label="Breadcrumb" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '24px',
    fontSize: '13px'
  }}>
    {items.map((item, index) => (
      <React.Fragment key={item.path || index}>
        {index > 0 && <span style={{ color: '#4a4a5a' }}>/</span>}
        {item.path ? (
          <Link 
            to={item.path}
            style={{ 
              color: index === items.length - 1 ? '#fff' : '#00d4ff',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
          >
            {item.label}
          </Link>
        ) : (
          <span style={{ color: '#fff' }}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

/**
 * SharedCircuitPage - Displays a shared quantum circuit
 */
const SharedCircuitPage = () => {
  const { shareId } = useParams()
  const [circuit, setCircuit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch shared circuit
  useEffect(() => {
    const fetchSharedCircuit = async () => {
      try {
        const response = await fetch(`/api/integration/shared/${shareId}`)
        if (response.ok) {
          const data = await response.json()
          setCircuit(data)
        } else {
          setError('Circuit not found or has expired')
        }
      } catch (err) {
        setError('Failed to load shared circuit')
      } finally {
        setLoading(false)
      }
    }

    if (shareId) {
      fetchSharedCircuit()
    }
  }, [shareId])

  // Extract circuit info - backend returns it nested under 'circuit' key
  const circuitInfo = circuit?.circuit || circuit
  const gates = circuitInfo?.gates || []
  const numQubits = circuitInfo?.num_qubits || 1
  const shots = circuitInfo?.shots || 1000

  if (loading) {
    return (
      <div style={{ 
        flex: 1, 
        padding: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#00d4ff', fontSize: '18px' }}>Loading shared circuit...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        flex: 1, 
        padding: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>{error}</div>
          <Link 
            to="/circuits"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px',
              color: '#00d4ff',
              textDecoration: 'none'
            }}
          >
            Go to Circuits Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      flex: 1, 
      padding: '32px', 
      overflow: 'auto',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 600, 
          color: '#fff',
          marginBottom: '8px'
        }}>
          Shared Quantum Circuit
        </h1>
        <p style={{ color: '#8a8a9a', fontSize: '16px' }}>
          {circuit?.name || 'Quantum Circuit'} - Created with Quantara
        </p>
      </div>

      {/* Circuit Info */}
      <div style={{ 
        background: 'rgba(17, 24, 39, 0.7)', 
        borderRadius: '16px', 
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <h3 style={{ color: '#00d4ff', fontSize: '18px', marginBottom: '16px' }}>
          Circuit Details
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            padding: '16px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px' 
          }}>
            <div style={{ color: '#8a8a9a', fontSize: '12px', marginBottom: '4px' }}>
              Number of Qubits
            </div>
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
              {numQubits}
            </div>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px' 
          }}>
            <div style={{ color: '#8a8a9a', fontSize: '12px', marginBottom: '4px' }}>
              Number of Gates
            </div>
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
              {gates.length}
            </div>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px' 
          }}>
            <div style={{ color: '#8a8a9a', fontSize: '12px', marginBottom: '4px' }}>
              Shots
            </div>
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>
              {shots}
            </div>
          </div>
        </div>

        {circuit?.description && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ color: '#8a8a9a', fontSize: '12px', marginBottom: '4px' }}>
              Description
            </div>
            <div style={{ color: '#fff' }}>{circuit.description}</div>
          </div>
        )}
      </div>

      {/* Circuit Display */}
      <div style={{ 
        background: 'rgba(17, 24, 39, 0.7)', 
        borderRadius: '16px', 
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <h3 style={{ color: '#8b5cf6', fontSize: '18px', marginBottom: '16px' }}>
          Circuit Gates
        </h3>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '12px', 
          padding: '20px',
          minHeight: '80px'
        }}>
          {gates.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {/* Start state */}
              <div style={{
                padding: '12px 16px',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                |0⟩
              </div>
              
              {/* Gate sequence with arrows */}
              {gates.map((gate, index) => (
                <React.Fragment key={index}>
                  <span style={{ color: '#00d4ff' }}>→</span>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(0, 212, 255, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                  }}>
                    <span style={{ fontWeight: 700, color: '#00d4ff' }}>{gate}</span>
                  </div>
                </React.Fragment>
              ))}
              
              {/* Measurement */}
              <span style={{ color: '#00d4ff' }}>→</span>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                ⟨M⟩
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8a8a9a' }}>
              No gates in this circuit
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link 
          to="/circuits"
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '12px',
            color: '#00d4ff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          ← Build Your Own Circuit
        </Link>
      </div>
    </div>
  )
}

export default SharedCircuitPage
