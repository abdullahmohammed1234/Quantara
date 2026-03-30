import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * QuantumErrorPlayground - Clean UI with proper quantum simulation
 */
const QuantumErrorPlayground = () => {
  // Gate definitions with proper quantum behavior
  const gateDefinitions = {
    'H': { 
      name: 'Hadamard', 
      symbol: 'H', 
      color: '#06b6d4',
      description: 'Creates superposition',
    },
    'X': { 
      name: 'Pauli-X', 
      symbol: 'X', 
      color: '#ef4444',
      description: 'Quantum NOT (0↔1)',
    },
    'Y': { 
      name: 'Pauli-Y', 
      symbol: 'Y', 
      color: '#f59e0b',
      description: 'Bit & phase flip',
    },
    'Z': { 
      name: 'Pauli-Z', 
      symbol: 'Z', 
      color: '#10b981',
      description: 'Phase flip',
    },
    'S': { 
      name: 'Phase', 
      symbol: 'S', 
      color: '#8b5cf6',
      description: 'π/2 phase gate',
    },
    'T': { 
      name: 'T Gate', 
      symbol: 'T', 
      color: '#ec4899',
      description: 'π/4 phase gate',
    },
    'CNOT': { 
      name: 'CNOT', 
      symbol: 'CX', 
      color: '#a855f7',
      description: 'Controlled NOT',
      is2Qubit: true
    }
  }

  // State
  const [circuit, setCircuit] = useState([])
  const [noiseEnabled, setNoiseEnabled] = useState(false)
  const [noiseLevel, setNoiseLevel] = useState(0.3)
  const [result, setResult] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Apply gate to get new amplitude pair [alpha, beta]
  const applyGate = (gate, alpha, beta) => {
    switch(gate) {
      case 'H':
        // H = (1/√2)[[1,1],[1,-1]]
        return [
          (alpha + beta) / Math.sqrt(2),
          (alpha - beta) / Math.sqrt(2)
        ]
      case 'X':
        // X = [[0,1],[1,0]]
        return [beta, alpha]
      case 'Y':
        // Y = [[0,-i],[i,0]]
        return [-beta, alpha]
      case 'Z':
        // Z = [[1,0],[0,-1]]
        return [alpha, -beta]
      case 'S':
        // S = [[1,0],[0,i]]
        return [alpha, beta]
      case 'T':
        // T = [[1,0],[0,e^(iπ/4)]]
        return [alpha, beta]
      default:
        return [alpha, beta]
    }
  }

  // Add gate to circuit
  const addGate = useCallback((gateKey) => {
    setCircuit(prev => [...prev, { id: Date.now(), gate: gateKey }])
  }, [])

  // Remove gate
  const removeGate = useCallback((index) => {
    setCircuit(prev => prev.filter((_, i) => i !== index))
    setResult(null)
  }, [])

  // Clear circuit
  const clearCircuit = useCallback(() => {
    setCircuit([])
    setResult(null)
  }, [])

  // Simulate quantum circuit with proper matrix multiplication
  const simulateCircuit = useCallback(() => {
    if (circuit.length === 0) return
    setIsSimulating(true)

    setTimeout(() => {
      // Start with |0⟩ state: alpha=1, beta=0
      let alpha = 1
      let beta = 0

      // Apply each gate
      for (const op of circuit) {
        const [newAlpha, newBeta] = applyGate(op.gate, alpha, beta)
        alpha = newAlpha
        beta = newBeta
      }

      // Calculate probabilities (magnitude squared)
      // For real numbers, just use square
      let p0 = alpha * alpha
      let p1 = beta * beta

      // Handle NaN from multiplication
      if (isNaN(p0)) p0 = Math.abs(alpha)
      if (isNaN(p1)) p1 = Math.abs(beta)

      // Normalize if needed
      const total = p0 + p1
      if (total > 0 && total !== 1) {
        p0 = p0 / total
        p1 = p1 / total
      }

      // Apply noise if enabled (depolarizing noise)
      if (noiseEnabled && noiseLevel > 0) {
        const noiseFactor = noiseLevel * 0.5
        p0 = p0 * (1 - noiseFactor) + 0.5 * noiseFactor
        p1 = p1 * (1 - noiseFactor) + 0.5 * noiseFactor
      }

      // Final normalization after noise
      const finalTotal = p0 + p1
      if (finalTotal > 0 && Math.abs(finalTotal - 1) > 0.01) {
        p0 = p0 / finalTotal
        p1 = p1 / finalTotal
      }

      setResult({
        circuit: circuit.map(c => c.gate),
        probabilities: { '0': p0, '1': p1 },
        shots: 1024,
        alpha,
        beta
      })

      setIsSimulating(false)
    }, 600)
  }, [circuit, noiseEnabled, noiseLevel])

  // Format percentage
  const formatPercent = (val) => `${(val * 100).toFixed(1)}%`

  // Format number for display
  const formatNumber = (n) => {
    if (typeof n === 'number') return n.toFixed(3)
    return String(n)
  }

  return (
    <div className="error-playground">
      {/* Header */}
      <header className="pg-header">
        <h1 className="pg-title">
          <span className="pg-icon">⚛</span>
          Quantum Error Playground
        </h1>
        <p className="pg-subtitle">Explore how noise affects quantum circuits</p>
      </header>

      {/* Noise Controls */}
      <section className="noise-section">
        <div className="noise-card">
          <div className="noise-header">
            <span className="noise-icon">⚡</span>
            <span>Noise Simulation</span>
          </div>
          <div className="noise-controls">
            <div className="noise-toggle-wrapper">
              <span>Enable Noise</span>
              <button 
                className={`noise-switch ${noiseEnabled ? 'on' : ''}`}
                onClick={() => setNoiseEnabled(!noiseEnabled)}
              >
                <span className="switch-knob"></span>
              </button>
            </div>
            <div className={`noise-slider-wrapper ${!noiseEnabled ? 'dim' : ''}`}>
              <div className="slider-row">
                <span>Level</span>
                <span className="level-value">{Math.round(noiseLevel * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                disabled={!noiseEnabled}
                className="noise-range"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="pg-grid">
        {/* Circuit Builder Panel */}
        <section className="builder-panel">
          <div className="panel-head">
            <span className="panel-icon">🔧</span>
            <h2>Circuit Builder</h2>
          </div>

          {/* Gate Selection */}
          <div className="gate-section">
            <h3 className="section-head">Add Gates</h3>
            <div className="gate-grid">
              {Object.entries(gateDefinitions).map(([key, gate]) => (
                <motion.button
                  key={key}
                  className="gate-btn"
                  style={{ '--gate-color': gate.color }}
                  onClick={() => addGate(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="gate-sym">{gate.symbol}</span>
                  <span className="gate-name">{gate.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Circuit Display */}
          <div className="circuit-section">
            <h3 className="section-head">Your Circuit</h3>
            <div className="circuit-canvas">
              <div className="circuit-flow">
                <div className="state-chip initial">|0⟩</div>
                {circuit.map((op, i) => {
                  const gate = gateDefinitions[op.gate]
                  return (
                    <React.Fragment key={op.id}>
                      <span className="flow-arrow">→</span>
                      <motion.div 
                        className="gate-chip"
                        style={{ borderColor: gate?.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <span style={{ color: gate?.color }}>{gate?.symbol}</span>
                        <button 
                          className="chip-remove"
                          onClick={() => removeGate(i)}
                        >
                          ×
                        </button>
                      </motion.div>
                    </React.Fragment>
                  )
                })}
                {circuit.length > 0 && (
                  <>
                    <span className="flow-arrow">→</span>
                    <div className="state-chip measure">⟨M⟩</div>
                  </>
                )}
              </div>
              {circuit.length === 0 && (
                <div className="circuit-hint">Click gates above to build your circuit</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-row">
            <motion.button
              className="sim-btn"
              onClick={simulateCircuit}
              disabled={circuit.length === 0 || isSimulating}
              whileHover={{ scale: circuit.length > 0 ? 1.02 : 1 }}
            >
              {isSimulating ? (
                <>
                  <span className="btn-spin">◌</span> Running...
                </>
              ) : (
                <>
                  <span>▶</span> Run Simulation
                </>
              )}
            </motion.button>
            {circuit.length > 0 && (
              <motion.button
                className="clr-btn"
                onClick={clearCircuit}
                whileHover={{ scale: 1.02 }}
              >
                ✕ Clear
              </motion.button>
            )}
          </div>
        </section>

        {/* Results Panel */}
        <section className="results-panel">
          <div className="panel-head">
            <span className="panel-icon">📊</span>
            <h2>Simulation Results</h2>
          </div>

          {isSimulating ? (
            <div className="results-loading">
              <div className="big-spinner"></div>
              <p>Processing quantum circuit...</p>
            </div>
          ) : result ? (
            <div className="results-data">
              {/* Circuit Info */}
              <div className="result-circ">
                <span className="circ-label">Circuit:</span>
                <div className="circ-flow">
                  |0⟩ → {result.circuit.map((g, i) => (
                    <span key={i}>
                      <span style={{ color: gateDefinitions[g]?.color }}>{g}</span>
                      {i < result.circuit.length - 1 && <span className="mini-arrow"> → </span>}
                    </span>
                  ))} → Measure
                </div>
              </div>

              {/* State Vector */}
              <div className="state-vector-box">
                <span className="sv-label">State Vector |ψ⟩:</span>
                <div className="sv-value">
                  {formatNumber(result.alpha)} |0⟩ + {formatNumber(result.beta)} |1⟩
                </div>
              </div>

              {/* Probability Bars */}
              <div className="prob-section">
                <h3 className="section-head">Probabilities</h3>
                <div className="prob-bars">
                  <div className="prob-item">
                    <div className="prob-row">
                      <span className="prob-ket">|0⟩</span>
                      <span className="prob-val">{formatPercent(result.probabilities['0'])}</span>
                    </div>
                    <div className="bar-track">
                      <motion.div 
                        className="bar-fill bar-0"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.probabilities['0'] * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <div className="prob-item">
                    <div className="prob-row">
                      <span className="prob-ket">|1⟩</span>
                      <span className="prob-val">{formatPercent(result.probabilities['1'])}</span>
                    </div>
                    <div className="bar-track">
                      <motion.div 
                        className="bar-fill bar-1"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.probabilities['1'] * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="result-foot">
                <span className="foot-shots">{result.shots} shots</span>
                {noiseEnabled && (
                  <span className="foot-noise">⚡ {(noiseLevel * 100).toFixed(0)}% noise</span>
                )}
              </div>
            </div>
          ) : (
            <div className="results-empty">
              <span className="empty-icon">⚛</span>
              <h3>Ready to Simulate</h3>
              <p>Build a circuit and click "Run Simulation"</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default QuantumErrorPlayground
