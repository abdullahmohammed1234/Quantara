import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGamification } from '../context/GamificationContext'
import { CHALLENGE_DEFINITIONS } from '../context/GamificationContext'
import { motion, AnimatePresence } from 'framer-motion'
import { SuperpositionChallenge, EntanglementGame, Simple3DCircuit } from '../components/3D'

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

// Challenge step definitions with detailed instructions
const CHALLENGE_STEPS = {
  qubit_create: {
    steps: [
      { id: 1, title: 'Create Qubit', instruction: 'Create a new quantum qubit initialized to |0⟩ state', hint: 'Use the quantum simulator to create a new qubit' },
      { id: 2, title: 'Initialize', instruction: 'Verify the qubit is in the |0⟩ state', hint: 'The default state of a qubit is |0⟩' },
    ],
  },
  superposition_state: {
    steps: [
      { id: 1, title: 'Create Qubit', instruction: 'Create a new qubit in |0⟩ state', hint: 'Start with a basic qubit' },
      { id: 2, title: 'Apply H Gate', instruction: 'Apply the Hadamard (H) gate to create superposition', hint: 'The H gate transforms |0⟩ to (|0⟩ + |1⟩)/√2' },
      { id: 3, title: 'Verify State', instruction: 'Run the circuit and check the measurement probabilities', hint: 'You should see ~50% |0⟩ and ~50% |1⟩' },
    ],
  },
  entangle_qubits: {
    steps: [
      { id: 1, title: 'Create Two Qubits', instruction: 'Create two qubits initialized to |0⟩', hint: 'Start with q[0] and q[1]' },
      { id: 2, title: 'Apply H Gate', instruction: 'Apply H gate to the first qubit (q[0])', hint: 'This creates superposition on the first qubit' },
      { id: 3, title: 'Apply CNOT', instruction: 'Apply CNOT with q[0] as control and q[1] as target', hint: 'This entangles the two qubits' },
      { id: 4, title: 'Verify Entanglement', instruction: 'Run the circuit - both qubits should be correlated', hint: 'Measure both qubits - they should be correlated' },
    ],
  },
  bell_state: {
    steps: [
      { id: 1, title: 'Create Two Qubits', instruction: 'Create two qubits in |0⟩ state', hint: 'Start with q[0] and q[1]' },
      { id: 2, title: 'Apply H Gate', instruction: 'Apply H gate to q[0]', hint: 'Creates superposition on first qubit' },
      { id: 3, title: 'Apply CNOT', instruction: 'Apply CNOT from q[0] to q[1]', hint: 'Entangles the qubits into Bell state |Φ+⟩' },
      { id: 4, title: 'Verify Bell State', instruction: 'Run and verify you get correlated results', hint: 'Both qubits should always measure the same value' },
    ],
  },
  circuit_1: {
    steps: [
      { id: 1, title: 'Create Qubits', instruction: 'Create two qubits', hint: 'You need at least 2 qubits for CNOT' },
      { id: 2, title: 'Apply H Gate', instruction: 'Apply H gate to qubit 0', hint: 'Creates superposition' },
      { id: 3, title: 'Apply CNOT', instruction: 'Apply CNOT with q[0] as control, q[1] as target', hint: 'Creates entanglement' },
      { id: 4, title: 'Run Circuit', instruction: 'Execute the circuit and observe results', hint: 'You should see correlated measurements' },
    ],
  },
}

// Default steps for undefined challenges
const DEFAULT_STEPS = {
  steps: [
    { id: 1, title: 'Understand Challenge', instruction: 'Read and understand the challenge objective', hint: 'Think about what quantum operation you need to perform' },
    { id: 2, title: 'Build Circuit', instruction: 'Build the quantum circuit to achieve the goal', hint: 'Use appropriate gates for your task' },
    { id: 3, title: 'Run and Verify', instruction: 'Execute the circuit and verify the results', hint: 'Check if your output matches the expected result' },
  ],
}

/**
 * ChallengePage - Full page for solving quantum challenges
 * Features: Step-by-step instructions on left, coding workspace on right
 */
const ChallengePage = () => {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const { completeChallenge, addXp } = useGamification()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [circuit, setCircuit] = useState([])
  const [qubits, setQubits] = useState(2)
  const [output, setOutput] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Get challenge data
  const challenge = CHALLENGE_DEFINITIONS.find(c => c.id === challengeId) || CHALLENGE_DEFINITIONS[0]
  const challengeSteps = CHALLENGE_STEPS[challengeId] || DEFAULT_STEPS
  
  // Breadcrumb navigation items
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Challenge', path: '/challenge/' + challengeId },
  ]
  
  // Available quantum gates
  const availableGates = ['H', 'X', 'Y', 'Z', 'CNOT', 'S', 'T', 'RX', 'RY', 'RZ']
  
  // Add gate to circuit
  const addGate = (gate) => {
    if (gate === 'CNOT') {
      setCircuit([...circuit, { gate: 'CNOT', target: 1, control: 0 }])
    } else if (gate.startsWith('R')) {
      setCircuit([...circuit, { gate, target: 0, angle: Math.PI / 4 }])
    } else {
      setCircuit([...circuit, { gate, target: 0 }])
    }
  }
  
  // Remove gate from circuit
  const removeGate = (index) => {
    setCircuit(circuit.filter((_, i) => i !== index))
  }
  
  // Run the circuit (simulate quantum execution)
  const runCircuit = async () => {
    setIsRunning(true)
    setOutput(null)
    
    // Announce to screen readers
    const liveRegion = document.getElementById('circuit-live-region')
    if (liveRegion) {
      liveRegion.textContent = 'Executing quantum circuit...'
    }
    
    // Simulate quantum execution with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple simulation - generate measurement results based on circuit
    const results = []
    for (let i = 0; i < 100; i++) {
      let state = 0
      circuit.forEach(op => {
        if (op.gate === 'H') {
          state = (state + Math.random() > 0.5 ? 1 : 0)
        } else if (op.gate === 'X') {
          state = state ^ 1
        } else if (op.gate === 'CNOT') {
          // Entanglement creates correlation
          const controlBit = Math.random() > 0.5 ? 1 : 0
          state = (controlBit << 1) | controlBit
        }
      })
      results.push(state)
    }
    
    // Count measurements
    const counts = {}
    results.forEach(r => {
      const key = r.toString(2).padStart(qubits, '0')
      counts[key] = (counts[key] || 0) + 1
    })
    
    setOutput(counts)
    setIsRunning(false)
  }
  
  // Complete the current step
  const completeStep = () => {
    if (currentStep < challengeSteps.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowHint(false)
    } else {
      // Challenge completed
      setIsCompleted(true)
      completeChallenge(challengeId)
      addXp(challenge.xp)
    }
  }
  
  // Reset circuit
  const resetCircuit = () => {
    setCircuit([])
    setOutput(null)
    setCurrentStep(0)
    setIsCompleted(false)
  }
  
  // Go back to games
  const goBack = () => {
    navigate('/games')
  }
  
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      color: '#e0e0e0',
    }}>
      {/* ARIA live region for screen reader announcements */}
      <div 
        id="circuit-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      
      {/* Left Panel - Challenge Instructions */}
      <div style={{
        width: '400px',
        borderRight: '1px solid rgba(0, 212, 255, 0.2)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={goBack}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              color: '#00d4ff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            ← Back to Games
          </button>
          <h2 style={{
            color: '#00d4ff',
            margin: 0,
            fontSize: '24px',
            fontFamily: 'Orbitron, sans-serif',
          }}>
            {challenge.title}
          </h2>
          <p style={{
            color: '#888',
            margin: '8px 0',
            fontSize: '14px',
          }}>
            {challenge.description}
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '12px',
          }}>
            <span style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#00d4ff',
            }}>
              Difficulty: {challenge.difficulty}/5
            </span>
            <span style={{
              background: 'rgba(255, 170, 0, 0.1)',
              border: '1px solid rgba(255, 170, 0, 0.3)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#ffaa00',
            }}>
              {challenge.xp} XP
            </span>
          </div>
        </div>
        
        {/* Steps */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <h3 style={{
            color: '#00d4ff',
            fontSize: '16px',
            marginBottom: '16px',
            fontFamily: 'Orbitron, sans-serif',
          }}>
            STEPS
          </h3>
          
          {challengeSteps.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={false}
              animate={{
                opacity: index <= currentStep ? 1 : 0.4,
                scale: index === currentStep ? 1.02 : 1,
              }}
              style={{
                background: index === currentStep 
                  ? 'rgba(0, 212, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${index === currentStep ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                cursor: index <= currentStep ? 'pointer' : 'default',
              }}
              onClick={() => index <= currentStep && setCurrentStep(index)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: index < currentStep ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: index < currentStep ? '#000' : '#00d4ff',
                }}>
                  {index < currentStep ? '✓' : step.id}
                </div>
                <span style={{
                  fontWeight: 'bold',
                  color: index === currentStep ? '#fff' : '#aaa',
                }}>
                  {step.title}
                </span>
              </div>
              
              {index === currentStep && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                >
                  <p style={{
                    color: '#ccc',
                    fontSize: '14px',
                    margin: '12px 0',
                    lineHeight: '1.5',
                  }}>
                    {step.instruction}
                  </p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowHint(!showHint)
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 170, 0, 0.4)',
                      color: '#ffaa00',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                  
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{
                        background: 'rgba(255, 170, 0, 0.1)',
                        border: '1px solid rgba(255, 170, 0, 0.3)',
                        borderRadius: '4px',
                        padding: '12px',
                        marginTop: '8px',
                      }}
                    >
                      <span style={{ color: '#ffaa00', fontSize: '13px' }}>
                        💡 {step.hint}
                      </span>
                    </motion.div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      completeStep()
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0088aa 100%)',
                      border: 'none',
                      color: '#000',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginTop: '12px',
                      width: '100%',
                    }}
                  >
                    {currentStep < challengeSteps.steps.length - 1 ? 'Mark Step Complete →' : 'Complete Challenge!'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Right Panel - Quantum Coding Workspace */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        overflow: 'auto',
      }}>
        <h3 style={{
          color: '#00d4ff',
          fontSize: '18px',
          marginBottom: '16px',
          fontFamily: 'Orbitron, sans-serif',
        }}>
          QUANTUM WORKSPACE
        </h3>
        
        {/* Qubit Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
        }}>
          <span style={{ color: '#888' }}>Qubits:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => {
                  setQubits(n)
                  setCircuit([])
                }}
                style={{
                  background: qubits === n ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                  border: `1px solid ${qubits === n ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)'}`,
                  color: qubits === n ? '#00d4ff' : '#888',
                  padding: '6px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        
        {/* Gate Palette */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '24px',
        }}>
          {availableGates.map(gate => (
            <button
              key={gate}
              onClick={() => addGate(gate)}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.4)',
                color: '#00d4ff',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
              }}
            >
              {gate}
            </button>
          ))}
        </div>
        
        {/* Circuit Display */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          minHeight: '120px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {[...Array(qubits)].map((_, qIndex) => (
              <div key={qIndex} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  color: '#666',
                  width: '40px',
                  fontSize: '12px',
                }}>
                  q[{qIndex}]
                </span>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  flex: 1,
                  height: '32px',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  {circuit.map((op, i) => {
                    if (op.target === qIndex || (op.control === qIndex && op.gate === 'CNOT')) {
                      return (
                        <div
                          key={i}
                          style={{
                            background: op.gate === 'CNOT' ? '#ff6b6b' : 'rgba(0, 212, 255, 0.3)',
                            border: `1px solid ${op.gate === 'CNOT' ? '#ff4444' : '#00d4ff'}`,
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: op.gate === 'CNOT' ? '#fff' : '#00d4ff',
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                          onClick={() => removeGate(i)}
                          title="Click to remove"
                        >
                          {op.gate}
                          {op.gate === 'CNOT' && (
                            <span style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>
                              ↓
                            </span>
                          )}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {circuit.length === 0 && (
            <div style={{
              color: '#666',
              textAlign: 'center',
              padding: '24px',
              fontStyle: 'italic',
            }}>
              Click gates above to build your circuit
            </div>
          )}
        </div>
        
        {/* 3D Circuit Visualization */}
        {circuit.length > 0 && (
          <div style={{
            marginBottom: '24px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '8px 16px',
              borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#8b5cf6',
              fontSize: '12px',
              fontFamily: 'Orbitron, sans-serif',
            }}>
              3D VISUALIZATION
            </div>
            <Simple3DCircuit gates={circuit} numQubits={qubits} />
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <button
            onClick={runCircuit}
            disabled={isRunning || circuit.length === 0}
            style={{
              background: isRunning || circuit.length === 0 
                ? 'rgba(0, 212, 255, 0.2)' 
                : 'linear-gradient(135deg, #00d4ff 0%, #0088aa 100%)',
              border: 'none',
              color: isRunning || circuit.length === 0 ? '#666' : '#000',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: isRunning || circuit.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {isRunning ? 'Running...' : '▶ Run Circuit'}
          </button>
          <button
            onClick={resetCircuit}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 100, 100, 0.4)',
              color: '#ff6464',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reset
          </button>
        </div>
        
        {/* Output */}
        {output && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <h4 style={{
              color: '#00ff88',
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontFamily: 'Orbitron, sans-serif',
            }}>
              MEASUREMENT RESULTS
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {Object.entries(output).map(([state, count]) => (
                <div
                  key={state}
                  style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '6px',
                    padding: '12px',
                    textAlign: 'center',
                    minWidth: '80px',
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#00ff88',
                    fontFamily: 'monospace',
                  }}>
                    |{state}⟩
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '4px',
                  }}>
                    {count}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Completion Message */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 255, 136, 0.2) 100%)',
                border: '2px solid #00ff88',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginTop: '24px',
              }}
            >
              <h3 style={{
                color: '#00ff88',
                fontSize: '24px',
                margin: '0 0 8px 0',
                fontFamily: 'Orbitron, sans-serif',
              }}>
                🎉 Challenge Complete!
              </h3>
              <p style={{
                color: '#ccc',
                fontSize: '16px',
                margin: '0 0 16px 0',
              }}>
                You earned <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{challenge.xp} XP</span>
              </p>
              <button
                onClick={goBack}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0088aa 100%)',
                  border: 'none',
                  color: '#000',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ChallengePage