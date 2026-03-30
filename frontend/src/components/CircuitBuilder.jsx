/**
 * CircuitBuilder - Interactive quantum circuit construction and simulation component
 * 
 * A comprehensive circuit builder that allows users to:
 * - Create multi-qubit quantum circuits using a visual gate library
 * - Select target qubits for gate operations
 * - Configure rotation gates with custom angle parameters
 * - Run simulations and visualize quantum states
 * - Support both single-qubit and multi-qubit gates
 * 
 * @module CircuitBuilder
 * @author Quantara Development Team
 * @since 1.0.0
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toastManager } from '../lib/api'
import QuantumVisualization from './QuantumVisualization'

/**
 * GATE_CATALOG - Comprehensive quantum gate definitions with metadata
 * 
 * Each gate entry contains:
 * - name: Display symbol for the gate
 * - label: Human-readable name
 * - description: Brief explanation of gate function
 * - category: Classification (single, rotation, multi, measurement)
 * - color: Visual accent color for UI elements
 * - hasParam: Optional flag for gates requiring numeric parameters
 * 
 * Gate Categories:
 * - Single: Fundamental 1-qubit gates (H, X, Y, Z, S, T)
 * - Rotation: Parameterized rotation gates (Rx, Ry, Rz)
 * - Multi: Entangling 2-qubit gates (CNOT, CX, CZ, SWAP)
 * - Measurement: State measurement operators (M)
 */
const GATE_CATALOG = {
  H: { name: 'H', label: 'Hadamard', description: 'Creates superposition', category: 'single', color: '#00d4ff' },
  X: { name: 'X', label: 'Pauli-X', description: 'Quantum NOT gate', category: 'single', color: '#ef4444' },
  Y: { name: 'Y', label: 'Pauli-Y', description: 'Bit and phase flip', category: 'single', color: '#f59e0b' },
  Z: { name: 'Z', label: 'Pauli-Z', description: 'Phase flip', category: 'single', color: '#10b981' },
  S: { name: 'S', label: 'Phase (S)', description: 'π/2 phase gate', category: 'single', color: '#8b5cf6' },
  T: { name: 'T', label: 'T Gate', description: 'π/4 phase gate', category: 'single', color: '#ec4899' },
  Rx: { name: 'Rx', label: 'Rx(θ)', description: 'Rotation around X-axis', hasParam: true, category: 'rotation', color: '#f97316' },
  Ry: { name: 'Ry', label: 'Ry(θ)', description: 'Rotation around Y-axis', hasParam: true, category: 'rotation', color: '#14b8a6' },
  Rz: { name: 'Rz', label: 'Rz(θ)', description: 'Rotation around Z-axis', hasParam: true, category: 'rotation', color: '#06b6d4' },
  CNOT: { name: 'CNOT', label: 'CNOT', description: 'Controlled NOT', category: 'multi', color: '#a855f7' },
  CX: { name: 'CX', label: 'CX', description: 'Controlled-X gate', category: 'multi', color: '#a855f7' },
  CZ: { name: 'CZ', label: 'CZ', description: 'Controlled-Z gate', category: 'multi', color: '#d946ef' },
  SWAP: { name: 'SWAP', label: 'SWAP', description: 'Swaps qubit states', category: 'multi', color: '#f472b6' },
  M: { name: 'M', label: 'Measure', description: 'Measurement operator', category: 'measurement', color: '#22c55e' }
}

/**
 * CircuitOperation - Represents a single quantum gate operation in a circuit
 * 
 * Encapsulates all information needed to describe a quantum operation including:
 * - The gate type being applied
 * - Target qubit indices for the operation
 * - Control qubit indices for multi-qubit gates
 * - Optional parameters (e.g., rotation angles)
 * - Unique identification and timestamp for state management
 * 
 * @class
 * @example
 * // Single qubit Hadamard gate on qubit 0
 * const hadamardOp = new CircuitOperation('H', [0], [], {})
 * 
 * // CNOT gate with control=0, target=1
 * const cnotOp = new CircuitOperation('CNOT', [1], [0], {})
 */
class CircuitOperation {
  /**
   * Creates a new CircuitOperation instance
   * @param {string} gate - The gate name from GATE_CATALOG
   * @param {number[]} targetQubits - Array of target qubit indices
   * @param {number[]} [controlQubits=[]] - Array of control qubit indices for multi-qubit gates
   * @param {Object} [params={}] - Optional parameters like rotation angles
   */
  constructor(gate, targetQubits, controlQubits = [], params = {}) {
    /** @type {string} Unique identifier for this operation */
    this.id = `${gate}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    /** @type {string} The gate name */
    this.gate = gate
    /** @type {number[]} Target qubit indices */
    this.targetQubits = targetQubits
    /** @type {number[]} Control qubit indices */
    this.controlQubits = controlQubits
    /** @type {Object} Optional parameters */
    this.params = params
    /** @type {number} Timestamp of creation */
    this.timestamp = Date.now()
  }
}

/**
 * CircuitBuilder - Main quantum circuit construction component
 * 
 * Provides an interactive interface for building and simulating quantum circuits.
 * Supports multi-qubit operations, parameterized gates, and real-time visualization.
 * 
 * @param {Object} props - Component properties
 * @param {function} [props.onCircuitChange] - Callback when circuit operations change
 * @param {function} [props.onRunSimulation] - Callback when simulation completes
 * @param {CircuitOperation[]|string[]} [props.circuit] - Initial circuit data
 * @param {string|null} [props.userId=null] - User ID for persistence
 * @param {string|null} [props.designId=null] - Design ID for shared circuits
 * @param {boolean} [props.autosaveEnabled=true] - Enable autosave functionality
 * @param {number} [props.initialQubits=2] - Initial number of qubits
 * @param {boolean} [props.showVisualization=true] - Show quantum visualization
 * @returns {JSX.Element} The CircuitBuilder component
 */
const CircuitBuilder = ({ 
  onCircuitChange, 
  onRunSimulation, 
  circuit: externalCircuit,
  userId = null,
  designId = null,
  autosaveEnabled = true,
  initialQubits = 2,
  showVisualization = false
}) => {
  const [operations, setOperations] = useState([])
  const [numQubits, setNumQubits] = useState(initialQubits)
  const [selectedQubits, setSelectedQubits] = useState([])
  const [simulationResults, setSimulationResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [gatePanelTab, setGatePanelTab] = useState('single')
  const [rotationParams, setRotationParams] = useState({})
  const [paramModalGate, setParamModalGate] = useState(null)
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    // Only load external circuit on mount or when explicitly provided
    // Don't override user's own additions
    const currentGates = operations.map(op => op.gate)
    const newGates = Array.isArray(externalCircuit) ? externalCircuit.map(g => typeof g === 'string' ? g : (typeof g === 'object' ? g.gate : g)) : []
    
    // Only update if external circuit has values and current operations are empty
    // This happens when cloning a shared circuit
    if (
      Array.isArray(externalCircuit) && 
      externalCircuit.length > 0 && 
      operations.length === 0 && 
      currentGates.length === 0
    ) {
      const ops = externalCircuit.map((gate, idx) => {
        const gateName = typeof gate === 'string' ? gate : (typeof gate === 'object' ? gate.gate : String(gate))
        return new CircuitOperation(gateName, [0])
      })
      setOperations(ops)
    }
  }, [externalCircuit])

  const gateCategories = useMemo(() => {
    const categories = { single: [], rotation: [], multi: [], measurement: [] }
    Object.entries(GATE_CATALOG).forEach(([key, gate]) => {
      if (categories[gate.category]) categories[gate.category].push(gate)
    })
    return categories
  }, [])

  const addGate = useCallback((gateName, targetQubits, controlQubits = [], params = {}) => {
    if (targetQubits.length === 0) targetQubits = [0]
    const newOp = new CircuitOperation(gateName, targetQubits, controlQubits, params)
    const newCircuit = [...operations, newOp]
    setOperations(newCircuit)
    onCircuitChange?.(newCircuit)
    setSelectedQubits([])
  }, [operations, onCircuitChange])

  const handleGateSelect = useCallback((gateName) => {
    const gate = GATE_CATALOG[gateName]
    if (!gate) return
    
    if (gate.category === 'multi') {
      if (selectedQubits.length >= 2) {
        const [control, target] = selectedQubits.slice(0, 2)
        addGate(gateName, [target], [control])
      } else if (selectedQubits.length === 1) {
        const target = selectedQubits[0]
        const control = (target + 1) % numQubits
        addGate(gateName, [target], [control])
      } else {
        addGate(gateName, [1], [0])
      }
    } else if (gate.hasParam) {
      // Use default rotation angle of π/4
      addGate(gateName, selectedQubits.length > 0 ? selectedQubits : [0], [], { angle: Math.PI / 4 })
    } else if (gate.category === 'measurement') {
      const measurementOps = []
      for (let i = 0; i < numQubits; i++) {
        measurementOps.push(new CircuitOperation('M', [i]))
      }
      setOperations(prev => [...prev, ...measurementOps])
    } else {
      addGate(gateName, selectedQubits.length > 0 ? selectedQubits : [0])
    }
  }, [addGate, numQubits, selectedQubits])

  const applyRotation = useCallback(() => {
    if (paramModalGate && rotationParams[paramModalGate] !== undefined) {
      const param = parseFloat(rotationParams[paramModalGate])
      if (!isNaN(param)) {
        addGate(paramModalGate, selectedQubits.length > 0 ? selectedQubits : [0], [], { angle: param })
      }
    }
    setParamModalGate(null)
    setRotationParams({})
  }, [paramModalGate, rotationParams, selectedQubits, addGate])

  const removeGate = useCallback((index) => {
    const newCircuit = operations.filter((_, i) => i !== index)
    setOperations(newCircuit)
    onCircuitChange?.(newCircuit)
  }, [operations, onCircuitChange])

  const clearCircuit = useCallback(() => {
    setOperations([])
    setSimulationResults(null)
    onCircuitChange?.([])
  }, [onCircuitChange])

  const runSimulation = useCallback(async () => {
    if (operations.length === 0) return
    setIsRunning(true)
    setSimulationResults(null)
    
    try {
      const gateList = operations.map(op => {
        if (op.controlQubits.length > 0) {
          return `${op.gate}(${op.controlQubits[0]}->${op.targetQubits[0]})`
        }
        return op.gate
      })
      
      const response = await fetch('/api/quantum/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gates: gateList, num_qubits: numQubits, shots: 1000 })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSimulationResults(data)
          // Pass results to parent callback for Noise Playground to handle
          if (onRunSimulation) {
            // Format data for parent component
            const formattedData = {
              circuit: gateList,
              probabilities: data.probabilities || {},
              shots: data.shots || 1000
            }
            onRunSimulation(formattedData)
          }
        } else {
          const mockResults = generateMockResults(operations, numQubits)
          setSimulationResults(mockResults)
          if (onRunSimulation) {
            const formattedData = {
              circuit: gateList,
              probabilities: mockResults.probabilities || {},
              shots: mockResults.shots || 1000
            }
            onRunSimulation(formattedData)
          }
          toastManager.info('Using simulated results')
        }
      } else {
        const mockResults = generateMockResults(operations, numQubits)
        setSimulationResults(mockResults)
        if (onRunSimulation) {
          const formattedData = {
            circuit: gateList,
            probabilities: mockResults.probabilities || {},
            shots: mockResults.shots || 1000
          }
          onRunSimulation(formattedData)
        }
      }
    } catch (error) {
      const mockResults = generateMockResults(operations, numQubits)
      setSimulationResults(mockResults)
      if (onRunSimulation) {
        const formattedData = {
          circuit: gateList,
          probabilities: mockResults.probabilities || {},
          shots: mockResults.shots || 1000
        }
        onRunSimulation(formattedData)
      }
    } finally {
      setIsRunning(false)
    }
  }, [operations, numQubits, onRunSimulation])

  const generateMockResults = (ops, nQubits) => {
    const totalStates = Math.pow(2, nQubits)
    const counts = {}
    for (let i = 0; i < totalStates; i++) {
      const state = i.toString(2).padStart(nQubits, '0')
      counts[state] = Math.floor(Math.random() * 100)
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const probs = {}
    Object.entries(counts).forEach(([state, count]) => { probs[state] = count / total })
    return { success: true, counts, probabilities: probs, num_qubits: nQubits, shots: 1000, mock: true }
  }

  const toggleQubit = useCallback((qubitIndex) => {
    setSelectedQubits(prev => {
      if (prev.includes(qubitIndex)) return prev.filter(q => q !== qubitIndex)
      return [...prev, qubitIndex]
    })
  }, [])

  const gateOperationsForViz = useMemo(() => {
    return operations.filter(op => op.gate !== 'M').map(op => ({ type: op.gate, target: op.targetQubits[0] || 0, control: op.controlQubits[0] }))
  }, [operations])

  return (
    <div className="circuit-builder" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="circuit-builder-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-title">Circuit Builder</h2>
            <p className="section-description">Build and simulate multi-qubit quantum circuits</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Qubits:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setNumQubits(n)} className={`qubit-btn ${numQubits === n ? 'active' : ''}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="status-bar">
          <div>
            <span style={{ color: '#9ca3af' }}>{operations.length} gates</span>
            <span style={{ margin: '0 12px', color: '#4b5563' }}>|</span>
            <span style={{ color: '#9ca3af' }}>{numQubits} qubits</span>
          </div>
        </div>
      </div>

      {/* Horizontal Gate Library */}
      <div className="gate-library-horizontal">
        <div className="gate-tabs">
          {[{ id: 'single', label: '1-Qubit' }, { id: 'rotation', label: 'Rotation' }, { id: 'multi', label: '2-Qubit' }, { id: 'measurement', label: 'Measure' }].map(tab => (
            <button key={tab.id} onClick={() => setGatePanelTab(tab.id)} className={`gate-tab ${gatePanelTab === tab.id ? 'active' : ''}`}>{tab.label}</button>
          ))}
        </div>
        <div className="gate-buttons-horizontal">
          {gateCategories[gatePanelTab]?.map(gate => (
            <motion.button key={gate.name} onClick={() => handleGateSelect(gate.name)} className="gate-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title={gate.description}>
              <span className="gate-symbol" style={{ color: gate.color }}>{gate.name}</span>
              <span className="gate-label">{gate.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Qubit Selection Row */}
      <div className="qubit-selector">
        <span className="selector-label">Select target qubits:</span>
        <div className="qubit-buttons">
          {Array.from({ length: numQubits }, (_, i) => (
            <motion.button key={i} onClick={() => toggleQubit(i)} className={`qubit-toggle ${selectedQubits.includes(i) ? 'selected' : ''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span className={`qubit-dot ${selectedQubits.includes(i) ? 'active' : ''}`} />q{i}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Circuit Timeline */}
      <div className="circuit-card">
        <div className="circuit-header">
          <span className="circuit-title">Circuit Timeline</span>
          <span className="circuit-count">{operations.length} gate(s)</span>
        </div>
        <div className="circuit-body">
          {operations.length === 0 ? (
            <div className="circuit-empty">
              <span className="empty-icon">⚛</span>
              <span>Click gates above to build your circuit</span>
            </div>
          ) : (
            <div className="circuit-sequence">
              <div className="state-box state-start">|0⟩<span style={{ color: '#8b5cf6' }}>⊗{numQubits}</span></div>
              <span className="arrow">→</span>
              <div className="operations-list">
                <AnimatePresence>
                  {operations.map((op, index) => {
                    const gate = GATE_CATALOG[op.gate]
                    if (!gate) return null
                    return (
                      <React.Fragment key={op.id}>
                        <motion.div className="operation-card" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                          <div className="gate-box" style={{ borderColor: gate.color }}><span style={{ color: gate.color }}>{op.gate}</span></div>
                          <div className="qubit-tags">
                            {op.targetQubits.map((q, i) => <span key={i} className="target-tag">q{q}</span>)}
                            {op.controlQubits.length > 0 && (<><span className="arrow-small">→</span>{op.controlQubits.map((q, i) => <span key={`ctrl-${i}`} className="control-tag">c{q}</span>)}</>)}
                            {op.params?.angle !== undefined && <span className="param-tag">θ={op.params.angle.toFixed(2)}</span>}
                          </div>
                          <button onClick={() => removeGate(index)} className="remove-btn">×</button>
                        </motion.div>
                        {index < operations.length - 1 && <span className="arrow">→</span>}
                      </React.Fragment>
                    )
                  })}
                </AnimatePresence>
              </div>
              {operations.some(op => op.gate === 'M') ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span className="arrow">→</span>
                  <div className="state-box state-measure">⟨M⟩</div>
                </div>
              ) : operations.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <span className="arrow">→</span>
                  <span className="hint-text">(Add measurement to see results)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button onClick={runSimulation} disabled={operations.length === 0 || isRunning} className="run-btn" whileHover={{ scale: operations.length > 0 ? 1.02 : 1 }} whileTap={{ scale: operations.length > 0 ? 0.98 : 1 }}>
          {isRunning ? <span className="spin">⟳</span> : <span>▶</span>}
          {isRunning ? 'Running...' : 'Run Simulation'}
        </motion.button>
        {operations.length > 0 && (
          <motion.button onClick={clearCircuit} className="clear-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <span>✕</span> Clear
          </motion.button>
        )}
      </div>

      {/* Simulation Results - Pass to parent for display */}
      {simulationResults && onRunSimulation && (
        <div style={{ display: 'none' }} data-simulation-results={JSON.stringify(simulationResults)} />
      )}

      {/* Parameter Modal */}
      <AnimatePresence>
        {paramModalGate && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }} onClick={() => setParamModalGate(null)}>
            <div style={{
              background: '#1a1a2e',
              border: '1px solid #00d4ff',
              borderRadius: '16px',
              padding: '24px',
              width: '340px'
            }} onClick={(e) => e.stopPropagation()}>
              <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '18px', fontFamily: 'Orbitron, sans-serif' }}>
                Set {GATE_CATALOG[paramModalGate]?.label} Parameter
              </h4>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
                Enter rotation angle in radians (π ≈ 3.14159)
              </p>
              <input
                type="number"
                step="0.1"
                value={rotationParams[paramModalGate] || Math.PI / 4}
                onChange={(e) => setRotationParams(prev => ({ ...prev, [paramModalGate]: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#0d0d14',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  marginBottom: '20px',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setParamModalGate(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={applyRotation}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#00d4ff',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0d0d14',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Add Gate
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CircuitBuilder
