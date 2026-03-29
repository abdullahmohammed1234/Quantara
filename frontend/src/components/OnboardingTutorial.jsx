/**
 * OnboardingTutorial - Interactive tutorial system for new users
 * 
 * Provides step-by-step guided tours explaining quantum computing concepts
 * and platform features. Supports progress tracking, tooltips, and
 * contextual help throughout the application.
 * 
 * @module OnboardingTutorial
 * @since 1.0.0
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Tutorial context for global state management
const TutorialContext = createContext(null)

/**
 * Tutorial steps definition
 * Each step contains:
 * - id: Unique identifier
 * - title: Step heading
 * - content: Detailed explanation
 * - target: Optional CSS selector for highlighting
 * - position: Preferred tooltip position (top, bottom, left, right)
 * - quantumConcept: Related quantum computing concept
 */
const TUTORIAL_STEPS = {
  welcome: {
    id: 'welcome',
    title: 'Welcome to Quantara',
    content: 'Your journey into quantum computing starts here. This interactive platform lets you build, simulate, and visualize quantum circuits in real-time.',
    position: 'center',
    quantumConcept: null
  },
  qubitBasics: {
    id: 'qubitBasics',
    title: 'Understanding Qubits',
    content: 'A qubit (quantum bit) is the fundamental unit of quantum information. Unlike classical bits (0 or 1), a qubit can exist in a superposition of both states simultaneously until measured.',
    position: 'right',
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
    position: 'left',
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
    position: 'bottom',
    target: '.gate-library-horizontal',
    quantumConcept: null
  },
  measurement: {
    id: 'measurement',
    title: 'Measurement',
    content: 'Measurement collapses the quantum state to a classical outcome. Add measurement gates (M) to your circuit to see the probability distribution of possible states.',
    position: 'right',
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
    position: 'left',
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
    position: 'top',
    target: '.run-btn',
    quantumConcept: {
      name: 'Quantum Simulation',
      description: 'Simulating quantum systems on classical computers is exponentially expensive - this is why quantum computers are valuable'
    }
  },
  visualization: {
    id: 'visualization',
    title: 'Quantum State Visualization',
    content: 'The Bloch sphere visualization shows your qubits\' quantum states. Each point on the sphere represents a possible quantum state, with the poles representing |0⟩ and |1⟩.',
    position: 'right',
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
 * OnboardingTutorial Provider Component
 * Wraps the application to provide tutorial functionality
 */
export const OnboardingProvider = ({ children, initialStep = 'welcome', onComplete }) => {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isActive, setIsActive] = useState(false)
  const [completedSteps, setCompletedSteps] = useState([])
  const [showConceptTooltip, setShowConceptTooltip] = useState(null)

  // Get tutorial step data
  const getStep = useCallback((stepId) => {
    return TUTORIAL_STEPS[stepId] || null
  }, [])

  // Navigate to next step
  const nextStep = useCallback(() => {
    const stepKeys = Object.keys(TUTORIAL_STEPS)
    const currentIndex = stepKeys.indexOf(currentStep)
    
    if (currentIndex < stepKeys.length - 1) {
      const next = stepKeys[currentIndex + 1]
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(next)
    } else {
      // Tutorial complete
      setCompletedSteps(prev => [...prev, currentStep])
      setIsActive(false)
      onComplete?.()
    }
  }, [currentStep, onComplete])

  // Navigate to previous step
  const prevStep = useCallback(() => {
    const stepKeys = Object.keys(TUTORIAL_STEPS)
    const currentIndex = stepKeys.indexOf(currentStep)
    
    if (currentIndex > 0) {
      setCurrentStep(stepKeys[currentIndex - 1])
    }
  }, [currentStep])

  // Jump to specific step
  const goToStep = useCallback((stepId) => {
    if (TUTORIAL_STEPS[stepId]) {
      setCurrentStep(stepId)
    }
  }, [])

  // Start tutorial
  const startTutorial = useCallback((stepId = 'welcome') => {
    setCurrentStep(stepId)
    setIsActive(true)
    setCompletedSteps([])
  }, [])

  // End tutorial
  const endTutorial = useCallback(() => {
    setIsActive(false)
  }, [])

  // Show concept tooltip
  const showTooltip = useCallback((conceptKey) => {
    setShowConceptTooltip(conceptKey)
  }, [])

  // Hide concept tooltip
  const hideTooltip = useCallback(() => {
    setShowConceptTooltip(null)
  }, [])

  // Check if step is completed
  const isStepCompleted = useCallback((stepId) => {
    return completedSteps.includes(stepId)
  }, [completedSteps])

  // Get progress percentage
  const progress = useCallback(() => {
    const totalSteps = Object.keys(TUTORIAL_STEPS).length
    return Math.round((completedSteps.length / totalSteps) * 100)
  }, [completedSteps])

  const value = {
    currentStep,
    isActive,
    completedSteps,
    showConceptTooltip,
    getStep,
    nextStep,
    prevStep,
    goToStep,
    startTutorial,
    endTutorial,
    showTooltip,
    hideTooltip,
    isStepCompleted,
    progress,
    TUTORIAL_STEPS,
    QUANTUM_CONCEPTS
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

/**
 * Hook to access tutorial context
 * @returns {Object} Tutorial context value
 */
export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within an OnboardingProvider')
  }
  return context
}

/**
 * TutorialTooltip - Contextual help tooltip for quantum concepts
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} props.conceptKey - Key from QUANTUM_CONCEPTS
 * @param {string} [props.position='top'] - Tooltip position
 * @param {React.ReactNode} [props.children] - Trigger element
 * @returns {JSX.Element} Tooltip with quantum concept information
 */
export const TutorialTooltip = ({ conceptKey, position = 'top', children }) => {
  const { QUANTUM_CONCEPTS, showTooltip, hideTooltip, showConceptTooltip } = useTutorial()
  const concept = QUANTUM_CONCEPTS[conceptKey]
  const isVisible = showConceptTooltip === conceptKey

  if (!concept) return <>{children}</>

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
  }

  return (
    <div 
      className="tutorial-tooltip-wrapper"
      onMouseEnter={() => showTooltip(conceptKey)}
      onMouseLeave={() => hideTooltip()}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="quantum-tooltip"
            style={{
              position: 'absolute',
              ...positionStyles[position],
              width: '280px',
              padding: '16px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.1)',
              zIndex: 1000,
              color: '#fff',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#00d4ff', 
              marginBottom: '8px',
              fontFamily: 'Orbitron, sans-serif'
            }}>
              {concept.name}
            </div>
            <div style={{ fontSize: '13px', color: '#e5e7eb', marginBottom: '8px', lineHeight: 1.5 }}>
              {concept.definition}
            </div>
            {concept.formula && (
              <div style={{ 
                fontSize: '12px', 
                fontFamily: 'monospace',
                color: '#a855f7', 
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '6px 10px',
                borderRadius: '6px',
                marginBottom: '8px'
              }}>
                {concept.formula}
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>
              {concept.details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * TutorialOverlay - Main tutorial presentation component
 * 
 * Displays the current tutorial step with navigation controls
 * and quantum concept explanations.
 * 
 * @component
 * @returns {JSX.Element|null} Tutorial overlay or null if inactive
 */
export const TutorialOverlay = () => {
  const { 
    isActive, 
    currentStep, 
    getStep, 
    nextStep, 
    prevStep, 
    endTutorial,
    progress,
    TUTORIAL_STEPS
  } = useTutorial()

  const step = getStep(currentStep)

  if (!isActive || !step) return null

  const stepKeys = Object.keys(TUTORIAL_STEPS)
  const currentIndex = stepKeys.indexOf(currentStep)
  const isLastStep = currentIndex === stepKeys.length - 1
  const isFirstStep = currentIndex === 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
      onClick={(e) => e.target === e.currentTarget && endTutorial()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          width: '480px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.1)',
          boxSizing: 'border-box'
        }}
      >
        {/* Progress bar */}
        <div style={{ 
          height: '4px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '2px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
              borderRadius: '2px'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress()}%` }}
          />
        </div>

        {/* Step indicator */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          marginBottom: '16px',
          justifyContent: 'center'
        }}>
          {stepKeys.map((key, idx) => (
            <div
              key={key}
              style={{
                width: idx === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentIndex 
                  ? '#00d4ff' 
                  : idx < currentIndex 
                    ? '#a855f7' 
                    : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '16px',
          fontFamily: 'Orbitron, sans-serif'
        }}>
          {step.title}
        </h2>

        {/* Content */}
        <p style={{
          fontSize: '15px',
          color: '#d1d5db',
          lineHeight: 1.7,
          marginBottom: '20px'
        }}>
          {step.content}
        </p>

        {/* Quantum Concept Card */}
        {step.quantumConcept && (
          <div style={{
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#00d4ff',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px'
            }}>
              {step.quantumConcept.name}
            </div>
            {step.quantumConcept.formula && (
              <div style={{
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#a855f7',
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                {step.quantumConcept.formula}
              </div>
            )}
            <div style={{
              fontSize: '13px',
              color: '#9ca3af',
              lineHeight: 1.6
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
          marginTop: '20px'
        }}>
          <button
            onClick={endTutorial}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#9ca3af',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Skip Tutorial
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isFirstStep && (
              <button
                onClick={prevStep}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ← Previous
              </button>
            )}
            <button
              onClick={nextStep}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                border: 'none',
                borderRadius: '8px',
                color: '#0a0a0a',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isLastStep ? 'Complete ✓' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * HelpButton - Floating help button for starting tutorials
 * 
 * @component
 * @returns {JSX.Element} Floating help button
 */
export const HelpButton = () => {
  const { startTutorial, isActive } = useTutorial()

  if (isActive) return null

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => startTutorial()}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
      title="Start Tutorial"
    >
      <span style={{ fontSize: '24px' }}>❓</span>
    </motion.button>
  )
}

/**
 * ContextualHelp - Context-aware help panel for circuit builder
 * 
 * Provides relevant help content based on the current context
 * and user's actions within the application.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {string} [props.context='general'] - Help context (general, circuit, gates, measurement, simulation)
 * @returns {JSX.Element} Contextual help panel
 */
export const ContextualHelp = ({ context = 'general' }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const helpContent = {
    general: {
      title: 'Getting Started',
      icon: '🚀',
      items: [
        { label: 'What is quantum computing?', content: 'Quantum computing uses quantum mechanical phenomena like superposition and entanglement to perform computation. It can solve certain problems exponentially faster than classical computers.' },
        { label: 'How do I start?', content: 'Begin by selecting the number of qubits (2-6) using the qubit buttons. Then click gates in the library to add them to your circuit.' },
        { label: 'What can I build?', content: 'You can create quantum circuits for algorithms like Deutsch-Jozsa, Grover\'s search, quantum teleportation, and more.' }
      ]
    },
    circuit: {
      title: 'Circuit Builder Help',
      icon: '⚛️',
      items: [
        { label: 'Adding gates', content: 'Click on a gate in the library to add it to your circuit. For single-qubit gates, select target qubits first.' },
        { label: 'Multi-qubit gates', content: 'For CNOT and other multi-qubit gates, select both control and target qubits. The first selected qubit becomes the control.' },
        { label: 'Removing gates', content: 'Click the × button on any gate card in the circuit timeline to remove it.' },
        { label: 'Clearing circuit', content: 'Click the Clear button to remove all gates and start fresh.' }
      ]
    },
    gates: {
      title: 'Quantum Gates',
      icon: '🎛️',
      items: [
        { label: 'Hadamard (H)', content: 'Creates superposition. H|0⟩ = (|0⟩ + |1⟩)/√2. Essential for most quantum algorithms.' },
        { label: 'Pauli Gates (X, Y, Z)', content: 'X flips bits (NOT), Y flips with phase, Z changes phase. Each is a π rotation on the Bloch sphere.' },
        { label: 'Phase Gates (S, T)', content: 'S applies π/2 phase, T applies π/4 phase. Used in phase estimation algorithms.' },
        { label: 'Rotation Gates', content: 'Rx, Ry, Rz rotate the qubit around different axes by a specified angle in radians.' },
        { label: 'CNOT', content: 'Controlled-NOT: flips target if control is |1⟩. Creates entanglement between qubits.' }
      ]
    },
    measurement: {
      title: 'Measurement',
      icon: '📊',
      items: [
        { label: 'Adding measurement', content: 'Click the Measure tab and select M to add measurement gates to all qubits.' },
        { label: 'Understanding results', content: 'The simulation shows probability percentages for each possible state. With n qubits, there are 2^n possible states.' },
        { label: 'Superposition collapse', content: 'When measured, superposition collapses to a definite state. Running multiple shots shows the probability distribution.' }
      ]
    },
    simulation: {
      title: 'Running Simulations',
      icon: '▶️',
      items: [
        { label: 'How simulation works', content: 'The simulator applies each gate sequentially to compute the final quantum state and measurement probabilities.' },
        { label: 'Number of shots', content: 'Each simulation runs 1000 shots by default. More shots = more accurate probability estimates.' },
        { label: 'Visualization', content: 'The Bloch sphere shows your qubits\' quantum states. Rotation angles (θ, φ) represent the state vector.' }
      ]
    }
  }

  const currentContent = helpContent[context] || helpContent.general

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      width: isExpanded ? '360px' : '200px',
      maxHeight: '400px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      zIndex: 100,
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderBottom: isExpanded ? '1px solid rgba(0, 212, 255, 0.1)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{currentContent.icon}</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            {currentContent.title}
          </span>
        </div>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
          {isExpanded ? '▼' : '▲'}
        </span>
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '12px', maxHeight: '320px', overflowY: 'auto' }}>
          {currentContent.items.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: index < currentContent.items.length - 1 ? '12px' : 0
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#00d4ff',
                marginBottom: '4px'
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.5
              }}>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Export all components as a module for default export
const OnboardingTutorialModule = {
  OnboardingProvider,
  TutorialOverlay,
  TutorialTooltip,
  ContextualHelp,
  HelpButton,
  useTutorial,
  QUANTUM_CONCEPTS,
  TUTORIAL_STEPS
}

export default OnboardingTutorialModule
