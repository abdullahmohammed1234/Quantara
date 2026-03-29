/**
 * QuantumVisualization - Real-time quantum state visualization component
 * 
 * Renders interactive 3D-like visualizations of qubit states on the Bloch sphere
 * and multi-qubit system configurations. Supports entanglement indicators and
 * animated state transitions.
 * 
 * @module QuantumVisualization
 * @since 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import usePinchToZoom from '../hooks/usePinchToZoom'

/**
 * QubitSphere - Individual qubit visualization on Bloch sphere
 * 
 * Represents a single qubit's quantum state using a 3D spherical visualization.
 * The position on the sphere (theta, phi angles) represents the quantum state
 * vector |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {number} props.index - Qubit index in the system
 * @param {number} [props.theta=0] - Polar angle (0 to π) from z-axis
 * @param {number} [props.phi=0] - Azimuthal angle (0 to 2π) in xy-plane
 * @param {boolean} [props.isEntangled=false] - Whether qubit is entangled with others
 * @returns {JSX.Element} Animated qubit sphere visualization
 */
const QubitSphere = ({ index, theta = 0, phi = 0, isEntangled = false }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 0.5,
        y: prev.y + 0.3
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const x = Math.sin(theta) * Math.cos(phi)
  const y = Math.sin(theta) * Math.sin(phi)
  const z = Math.cos(theta)
  
  const stateColor = isEntangled ? '#8b5cf6' : `rgb(${Math.round(255 * (1 - (z + 1) / 2))}, ${Math.round(255 * ((z + 1) / 2))}, 255)`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        style={{ 
          width: 80, 
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${stateColor}, rgba(0,0,0,0.8))`,
          boxShadow: isEntangled 
            ? '0 0 30px rgba(139, 92, 246, 0.8), inset 0 0 20px rgba(255,255,255,0.2)'
            : '0 0 20px rgba(0, 212, 255, 0.4)',
          border: isEntangled ? '2px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(0, 212, 255, 0.3)',
          position: 'relative',
        }}
        animate={{ 
          rotateX: rotation.x, 
          rotateY: rotation.y,
        }}
        transition={{ duration: 0.1 }}
      >
        <motion.div
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#fff',
            left: `${50 + x * 25}%`,
            top: `${50 - y * 25}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px white',
          }}
          animate={{ 
            left: [`${50 + x * 25}%`, `${50 + x * 28}%`, `${50 + x * 25}%`],
            top: [`${50 - y * 25}%`, `${50 - y * 28}%`, `${50 - y * 25}%`],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#00d4ff' }}>|q{index}⟩</span>
        {isEntangled && (
          <div style={{ fontSize: 10, color: '#8b5cf6', marginTop: 2 }}>↔ Entangled</div>
        )}
      </div>
    </div>
  )
}

// Multi-Qubit Visualization
const MultiQubitVisualization = ({ numQubits, gateOperations }) => {
  const qubits = useMemo(() => {
    const states = []
    for (let i = 0; i < numQubits; i++) {
      const theta = Math.PI / 4 + i * Math.PI / 4
      const phi = Math.random() * 2 * Math.PI
      const isEntangled = gateOperations && gateOperations.some(op => 
        op.type === 'CNOT' && (op.control === i || op.target === i)
      )
      states.push({ index: i, theta, phi, isEntangled })
    }
    return states
  }, [numQubits, gateOperations])

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #12121a, #0d0d14)',
      border: '1px solid #1a1a2e',
      borderRadius: 12,
      padding: 20,
    }}>
      <h3 style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: '#fff', 
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Orbitron, sans-serif',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff' }} />
        Multi-Qubit Entanglement
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '20px 0' }}>
        {qubits.map((qubit, i) => (
          <QubitSphere 
            key={i}
            index={qubit.index}
            theta={qubit.theta}
            phi={qubit.phi}
            isEntangled={qubit.isEntangled}
          />
        ))}
      </div>
    </div>
  )
}

// Probability Bar Component
const ProbabilityBar = ({ probability, index, totalStates }) => {
  const stateLabel = index.toString(2).padStart(Math.log2(totalStates), '0')
  const isMajor = probability > 0.1
  
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#a0a0b0' }}>|{stateLabel}⟩</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#00d4ff' }}>{(probability * 100).toFixed(1)}%</span>
      </div>
      <div style={{ height: 24, background: 'rgba(0, 0, 0, 0.4)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          style={{
            height: '100%',
            borderRadius: 4,
            background: isMajor 
              ? 'linear-gradient(90deg, #00d4ff, #8b5cf6)'
              : 'rgba(0, 212, 255, 0.3)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${probability * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Probability Chart Component
const ProbabilityChart = ({ measurementProbabilities, numQubits }) => {
  const totalStates = Math.pow(2, numQubits)
  
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #12121a, #0d0d14)',
      border: '1px solid #1a1a2e',
      borderRadius: 12,
      padding: 20,
    }}>
      <h3 style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: '#fff', 
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Orbitron, sans-serif',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
        Measurement Probabilities
      </h3>
      <div style={{ overflowY: 'visible' }}>
        {measurementProbabilities.map((prob, i) => (
          <ProbabilityBar 
            key={i} 
            index={i} 
            probability={prob} 
            totalStates={totalStates}
          />
        ))}
      </div>
    </div>
  )
}

// State Evolution Timeline
const StateEvolutionTimeline = ({ evolutionSteps, currentStep }) => {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #12121a, #0d0d14)',
      border: '1px solid #1a1a2e',
      borderRadius: 12,
      padding: 20,
    }}>
      <h3 style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: '#fff', 
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Orbitron, sans-serif',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
        Real-time State Evolution
      </h3>
      
      <div style={{ position: 'relative', padding: '16px 0', paddingLeft: 24 }}>
        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'rgba(0, 212, 255, 0.2)' }}>
          <motion.div
            style={{ 
              position: 'absolute', 
              top: 0, 
              width: '100%', 
              height: `${(currentStep / (evolutionSteps.length - 1)) * 100}%`,
              background: 'linear-gradient(180deg, #00d4ff, #f59e0b)',
            }}
          />
        </div>
        
        {evolutionSteps.map((step, i) => (
          <motion.div
            key={i}
            style={{
              position: 'relative',
              paddingLeft: 20,
              paddingTop: 8,
              paddingBottom: 8,
              background: i === currentStep ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              borderRadius: 4,
              marginBottom: 4,
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{step.gate}</div>
            <div style={{ fontFamily: 'monospace', color: '#00d4ff', fontSize: 11, marginTop: 4 }}>
              {step.state}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Main Quantum Visualization Component
const QuantumVisualization = ({ numQubits = 2, gateOperations = [], isPlaying = true }) => {
  const [activeTab, setActiveTab] = useState('all')
  const [currentEvolutionStep, setCurrentEvolutionStep] = useState(0)
  const [playing, setPlaying] = useState(isPlaying)
  
  // Pinch-to-zoom for 3D visualizations
  const { scale, isPinching, handlers, resetZoom } = usePinchToZoom({
    minScale: 0.5,
    maxScale: 3,
    zoomSpeed: 1,
  })
  
  // Generate measurement probabilities
  const measurementProbabilities = useMemo(() => {
    const totalStates = Math.pow(2, numQubits)
    const probs = []
    
    let baseProb = 1 / totalStates
    for (let i = 0; i < totalStates; i++) {
      let prob = baseProb
      
      if (gateOperations) {
        gateOperations.forEach(op => {
          if (op.type === 'H') {
            prob *= 1 + 0.5 * Math.sin(i * Math.PI / 2)
          } else if (op.type === 'X') {
            const flipped = i ^ (1 << op.target)
            if (flipped === i) prob *= 1.5
          }
        })
      }
      
      probs.push(Math.min(prob, 1))
    }
    
    const sum = probs.reduce((a, b) => a + b, 0)
    return probs.map(p => p / sum)
  }, [numQubits, gateOperations])
  
  // Evolution steps
  const evolutionSteps = useMemo(() => {
    const steps = [{ gate: 'Initial |0⟩⊗n', state: '|00⟩' }]
    
    if (gateOperations) {
      gateOperations.forEach((op) => {
        const state = op.type === 'H' 
          ? `(${['|0⟩', '|1⟩'][op.target]}+${['|0⟩', '|1⟩'][op.target ^ 1]})/√2`
          : op.type === 'X'
          ? `X|${['0', '1'][op.target]}⟩`
          : op.type === 'CNOT'
          ? `CNOT|${['00', '01', '10', '11'][op.control * 2 + op.target]}⟩`
          : op.type
        
        steps.push({ gate: `${op.type} gate`, state })
      })
    }
    
    steps.push({ gate: 'Measurement', state: 'Probability Distribution' })
    return steps
  }, [gateOperations])
  
  // Auto-advance evolution steps
  useEffect(() => {
    if (!playing) return
    
    const interval = setInterval(() => {
      setCurrentEvolutionStep(prev => 
        prev < evolutionSteps.length - 1 ? prev + 1 : 0
      )
    }, 2000)
    
    return () => clearInterval(interval)
  }, [playing, evolutionSteps.length])

  // Default gate operations
  const activeGateOps = gateOperations && gateOperations.length > 0 ? gateOperations : [
    { type: 'H', target: 0 },
    { type: 'H', target: 1 },
    { type: 'CNOT', control: 0, target: 1 },
  ]

  const tabs = ['all', 'entanglement', 'probability', 'evolution']

  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #12121a, #0d0d14)',
        border: '1px solid #00d4ff30',
        borderRadius: 16,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
      {...handlers}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: 700, 
          color: '#fff',
          fontFamily: 'Orbitron, sans-serif',
          letterSpacing: '1px',
        }}>
          <span style={{ color: '#00d4ff' }}>◆</span> Quantum State Visualization
        </h2>
        
        {/* Tab selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 12px',
                fontSize: 11,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                color: activeTab === tab ? '#00d4ff' : '#94a3b8',
                border: activeTab === tab ? '1px solid rgba(0, 212, 255, 0.4)' : '1px solid transparent',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24, transform: `scale(${scale})`, transformOrigin: 'top left', width: `${100 / scale}%` }}>
        {(activeTab === 'all' || activeTab === 'entanglement') && (
          <MultiQubitVisualization 
            numQubits={numQubits} 
            gateOperations={activeGateOps}
          />
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {(activeTab === 'all' || activeTab === 'probability') && (
            <ProbabilityChart 
              measurementProbabilities={measurementProbabilities}
              numQubits={numQubits}
            />
          )}
          
          {(activeTab === 'all' || activeTab === 'evolution') && (
            <StateEvolutionTimeline 
              evolutionSteps={evolutionSteps}
              currentStep={currentEvolutionStep}
            />
          )}
        </div>
      </div>
      
      {/* Play/Pause control */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        <motion.button
          onClick={() => setPlaying(!playing)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 20,
            background: playing ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 212, 255, 0.2)',
            border: playing ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(0, 212, 255, 0.4)',
            color: playing ? '#f59e0b' : '#00d4ff',
            cursor: 'pointer',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 12,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: 14 }}>{playing ? '⏸' : '▶'}</span>
          <span>{playing ? 'Pause' : 'Play'} Evolution</span>
        </motion.button>
        
        {/* Zoom controls and indicator */}
        {scale !== 1 && (
          <div style={{ 
            marginLeft: 16, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8 
          }}>
            <button
              onClick={resetZoom}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#8b5cf6',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              Reset
            </button>
            <span style={{ 
              fontSize: 11, 
              color: '#00d4ff',
              fontFamily: 'monospace',
            }}>
              {Math.round(scale * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuantumVisualization
