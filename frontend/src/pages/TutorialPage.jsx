/**
 * TutorialPage - Full page tutorial view
 * 
 * Displays the interactive onboarding tutorial as a dedicated page.
 * Accessible from the sidebar navigation.
 * Uses the same content-area layout as other pages like /qubits.
 * 
 * @module TutorialPage
 * @since 1.0.0
 */

import React, { useState, useCallback, createContext, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Tutorial context for global state management
const TutorialContext = createContext(null)

/**
 * Tutorial steps definition
 */
const TUTORIAL_STEPS = {
  welcome: {
    id: 'welcome',
    title: 'Welcome to Quantara',
    content: 'Your journey into quantum computing starts here. This interactive platform lets you build, simulate, and visualize quantum circuits in real-time.',
    quantumConcept: null
  },
  qubitBasics: {
    id: 'qubitBasics',
    title: 'Understanding Qubits',
    content: 'A qubit (quantum bit) is the fundamental unit of quantum information. Unlike classical bits (0 or 1), a qubit can exist in a superposition of both states simultaneously until measured.',
    quantumConcept: {
      name: 'Qubit (Quantum Bit)',
      formula: '|ψ⟩ = α|0⟩ + β|1⟩',
      description: 'The quantum state is described by a complex amplitude vector where |α|² + |β|² = 1'
    }
  },
  hadamardGate: {
    id: 'hadamardGate',
    title: 'The Hadamard Gate',
    content: 'The Hadamard gate creates quantum superposition - it transforms a pure |0⟩ state into an equal superposition of |0⟩ and |1⟩. This is the foundation of quantum parallelism.',
    quantumConcept: {
      name: 'Superposition',
      formula: 'H|0⟩ = (|0⟩ + |1⟩)/√2',
      description: 'A quantum state existing in multiple classical states simultaneously'
    }
  },
  circuitBuilder: {
    id: 'circuitBuilder',
    title: 'Building Your First Circuit',
    content: 'Click on gates in the library to add them to your circuit. Select qubits by clicking on the qubit buttons, then choose a gate to apply. The circuit executes from left to right.',
    quantumConcept: null
  },
  measurement: {
    id: 'measurement',
    title: 'Measurement',
    content: 'Measurement collapses the quantum state to a classical outcome. Add measurement gates (M) to your circuit to see the probability distribution of possible states.',
    quantumConcept: {
      name: 'Measurement',
      formula: '|ψ⟩ → |0⟩ or |1⟩',
      description: 'The act of observing a quantum state causes it to collapse to one of the basis states'
    }
  },
  entanglement: {
    id: 'entanglement',
    title: 'Quantum Entanglement',
    content: 'Entangled qubits share correlations that cannot be explained classically. Use CNOT gates to create entanglement between qubits - this is key to quantum advantage.',
    quantumConcept: {
      name: 'Entanglement',
      formula: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
      description: 'Einstein called this "spooky action at a distance" - measuring one entangled qubit affects the other instantly'
    }
  },
  simulation: {
    id: 'simulation',
    title: 'Running Simulations',
    content: 'Click "Run Simulation" to execute your quantum circuit. The results show the probability distribution of all possible measurement outcomes.',
    quantumConcept: {
      name: 'Quantum Simulation',
      description: 'Simulating quantum systems on classical computers is exponentially expensive - this is why quantum computers are valuable'
    }
  },
  visualization: {
    id: 'visualization',
    title: 'Quantum State Visualization',
    content: 'The Bloch sphere visualization shows your qubits\' quantum states. Each point on the sphere represents a possible quantum state, with the poles representing |0⟩ and |1⟩.',
    quantumConcept: {
      name: 'Bloch Sphere',
      formula: '|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩',
      description: 'A geometric representation of pure qubit states on a unit sphere'
    }
  }
}

/**
 * Quantum concept definitions for tooltips
 */
export const QUANTUM_CONCEPTS = {
  qubit: {
    name: 'Qubit (Quantum Bit)',
    definition: 'The fundamental unit of quantum information, analogous to a classical bit but capable of existing in superposition.',
    formula: '|ψ⟩ = α|0⟩ + β|1⟩',
    details: 'Unlike classical bits that are either 0 or 1, a qubit can be in a combination of both states until measured.'
  },
  superposition: {
    name: 'Superposition',
    definition: 'A quantum state where a particle exists in multiple states simultaneously until measured.',
    formula: '|ψ⟩ = (|0⟩ + |1⟩)/√2',
    details: 'This is what gives quantum computers their exponential power - n qubits can represent 2^n states at once.'
  },
  entanglement: {
    name: 'Quantum Entanglement',
    definition: 'A phenomenon where qubits become correlated in ways that have no classical explanation.',
    formula: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
    details: 'Einstein called this "spooky action at a distance". Entanglement is crucial for quantum algorithms.'
  },
  hadamard: {
    name: 'Hadamard Gate',
    definition: 'A single-qubit gate that creates superposition by mapping |0⟩ to an equal superposition state.',
    formula: 'H = (1/√2)[[1, 1], [1, -1]]',
    details: 'The Hadamard gate is fundamental to quantum computing, used in most quantum algorithms.'
  },
  cnot: {
    name: 'CNOT Gate',
    definition: 'A two-qubit controlled-NOT gate that flips the target qubit if the control qubit is |1⟩.',
    formula: 'CNOT|00⟩ → |00⟩, CNOT|01⟩ → |01⟩, CNOT|10⟩ → |11⟩, CNOT|11⟩ → |10⟩',
    details: 'The CNOT gate is essential for creating entanglement between qubits.'
  },
  measurement: {
    name: 'Measurement',
    definition: 'The process of observing a quantum state, causing it to collapse to a classical state.',
    formula: 'P(|0⟩) = |α|², P(|1⟩) = |β|²',
    details: 'Measurement probability is determined by the squared magnitude of the quantum amplitudes.'
  },
  BlochSphere: {
    name: 'Bloch Sphere',
    definition: 'A geometric representation of pure qubit states as points on a unit sphere.',
    formula: '|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩',
    details: 'The north pole represents |0⟩, the south pole represents |1⟩, and points in between represent superpositions.'
  },
  gates: {
    name: 'Quantum Gates',
    definition: 'Unitary operations that transform quantum states, analogous to logic gates in classical computing.',
    details: 'Quantum gates must be unitary (reversible). Common gates include H, X, Y, Z, CNOT, and rotation gates.'
  },
  rotation: {
    name: 'Rotation Gates',
    definition: 'Parameterized gates that rotate the qubit state around the X, Y, or Z axis of the Bloch sphere.',
    formula: 'Rx(θ), Ry(θ), Rz(θ)',
    details: 'These gates take an angle parameter and rotate the quantum state by that amount around the specified axis.'
  }
}

/**
 * TutorialPage - Main page component with full tutorial experience
 */
const TutorialPage = () => {
  const [currentStep, setCurrentStep] = useState('welcome')
  const stepKeys = Object.keys(TUTORIAL_STEPS)
  const currentIndex = stepKeys.indexOf(currentStep)
  const isLastStep = currentIndex === stepKeys.length - 1
  const isFirstStep = currentIndex === 0

  const nextStep = useCallback(() => {
    if (currentIndex < stepKeys.length - 1) {
      setCurrentStep(stepKeys[currentIndex + 1])
    }
  }, [currentIndex, stepKeys])

  const prevStep = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentStep(stepKeys[currentIndex - 1])
    }
  }, [currentIndex, stepKeys])

  const progress = Math.round(((currentIndex + 1) / stepKeys.length) * 100)
  const step = TUTORIAL_STEPS[currentStep]

  return (
    <div className="content-area tutorial-page">
      <div className="page-header">
        <h1 className="page-title">Interactive Tutorial</h1>
        <p className="page-subtitle">
          Learn quantum computing concepts step by step
        </p>
      </div>

      {/* Main Tutorial Card */}
      <div className="glass-panel" style={{ 
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px'
      }}>
        {/* Progress bar */}
        <div style={{ 
          height: '6px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '3px',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
              borderRadius: '3px'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicator */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          justifyContent: 'center'
        }}>
          {stepKeys.map((key, idx) => (
            <div
              key={key}
              style={{
                width: idx === currentIndex ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: idx === currentIndex 
                  ? '#00d4ff' 
                  : idx < currentIndex 
                    ? '#a855f7' 
                    : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentStep(key)}
            />
          ))}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '16px',
          fontFamily: 'Orbitron, sans-serif',
          textAlign: 'center'
        }}>
          {step.title}
        </h2>

        {/* Content */}
        <p style={{
          fontSize: '17px',
          color: '#d1d5db',
          lineHeight: 1.8,
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {step.content}
        </p>

        {/* Quantum Concept Card */}
        {step.quantumConcept && (
          <div style={{
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#00d4ff',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              {step.quantumConcept.name}
            </div>
            {step.quantumConcept.formula && (
              <div style={{
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#a855f7',
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {step.quantumConcept.formula}
              </div>
            )}
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              lineHeight: 1.6,
              textAlign: 'center'
            }}>
              {step.quantumConcept.description}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            style={{
              padding: '12px 24px',
              background: isFirstStep ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '10px',
              color: isFirstStep ? '#666' : '#fff',
              fontSize: '15px',
              cursor: isFirstStep ? 'default' : 'pointer',
              opacity: isFirstStep ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {isLastStep && (
              <button
                onClick={() => setCurrentStep('welcome')}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#00d4ff',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Restart
              </button>
            )}
            <button
              onClick={nextStep}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                border: 'none',
                borderRadius: '10px',
                color: '#0a0a0a',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isLastStep ? 'Complete ✓' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Reference Section */}
      <div style={{ 
        marginTop: '48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            color: '#00d4ff',
            marginBottom: '12px'
          }}>
            📚 Quick Reference
          </h3>
          <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#fff' }}>Qubit:</strong> The basic unit of quantum information
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#fff' }}>Superposition:</strong> Multiple states at once
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#fff' }}>Entanglement:</strong> Correlated quantum states
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Measurement:</strong> Observing collapses state
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ 
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            color: '#a855f7',
            marginBottom: '12px'
          }}>
            🎛️ Common Gates
          </h3>
          <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#fff' }}>H:</strong> Hadamard - creates superposition
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#fff' }}>X, Y, Z:</strong> Pauli gates - rotations
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#fff' }}>CNOT:</strong> Creates entanglement
            </div>
            <div>
              <strong style={{ color: '#fff' }}>M:</strong> Measurement
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialPage