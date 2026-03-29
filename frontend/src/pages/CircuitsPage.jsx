import React, { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CircuitBuilder from '../components/CircuitBuilder'
import CircuitActions from '../components/CircuitActions'

const CircuitsPage = () => {
  const [searchParams] = useSearchParams()
  const [circuitData, setCircuitData] = useState({ operations: [], numQubits: 2 })
  const [isLoadingCloned, setIsLoadingCloned] = useState(false)

  // Handle clone parameter from shared circuit links
  useEffect(() => {
    const cloneId = searchParams.get('clone')
    if (cloneId) {
      setIsLoadingCloned(true)
      fetch(`/api/integration/shared/${cloneId}`)
        .then(res => res.json())
        .then(data => {
          const circuitInfo = data?.circuit || data
          const gates = circuitInfo?.gates || []
          const numQubits = circuitInfo?.num_qubits || 2
          
          // Convert gates to array of gate names (strings) for CircuitBuilder
          // CircuitBuilder expects: string[] like ['H', 'X', 'CNOT']
          const gateNames = gates.map(gate => gate)
          
          setCircuitData({
            operations: gateNames,
            numQubits: numQubits
          })
          
          // Clear the clone parameter from URL to prevent re-loading on refresh
          // Use replace: true to avoid adding history entry
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('clone')
          window.history.replaceState({}, '', newUrl.toString())
          
          setIsLoadingCloned(false)
        })
        .catch(err => {
          console.error('Failed to load cloned circuit:', err)
          setIsLoadingCloned(false)
        })
    }
  }, [searchParams])

  const handleCircuitChange = useCallback((newOperations) => {
    setCircuitData(prev => ({
      ...prev,
      operations: newOperations
    }))
  }, [])

  // Handle numQubits changes from CircuitBuilder internal state
  // We'll track this via simulation results or just use initial value
  const handleRunSimulation = useCallback((results) => {
    if (results?.num_qubits) {
      setCircuitData(prev => ({
        ...prev,
        numQubits: results.num_qubits
      }))
    }
  }, [])

  return (
    <div style={{
      flex: 1,
      padding: '32px',
      overflow: 'auto',
      position: 'relative',
      zIndex: 1
    }}>
      {isLoadingCloned && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '8px 16px',
          background: 'rgba(0, 212, 255, 0.15)',
          color: '#00d4ff',
          textAlign: 'center',
          fontSize: '14px',
          zIndex: 10
        }}>
          Loading cloned circuit...
        </div>
      )}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '8px'
            }}>
              Quantum Circuits
            </h1>
            <p style={{ color: '#8a8a9a', fontSize: '16px' }}>
              Build and simulate quantum circuits with various gates
            </p>
          </div>
          
          {/* Export and Share Actions */}
          <CircuitActions 
            operations={circuitData.operations} 
            numQubits={circuitData.numQubits}
          />
        </div>
      </div>

      <CircuitBuilder 
        onCircuitChange={handleCircuitChange}
        onRunSimulation={handleRunSimulation}
        initialQubits={circuitData.numQubits}
        circuit={circuitData.operations}
      />
    </div>
  )
}

export default CircuitsPage
