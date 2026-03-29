import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamification } from '../context/GamificationContext'
import { motion } from 'framer-motion'

/**
 * ChallengePlayground - Interactive puzzle-solving interface for quantum challenges
 */
const ChallengePlayground = ({ challenge, onComplete, onClose }) => {
  const navigate = useNavigate()
  const { addXp } = useGamification()
  
  const [step, setStep] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)

  // Challenge-specific puzzle logic
  const getChallengeContent = (challengeId) => {
    const contents = {
      'qubit_create': {
        title: 'Qubit Creator',
        description: 'Create a new qubit and initialize it to |0⟩ state',
        steps: [
          { text: 'Click the "Add Qubit" button to create your first qubit', type: 'action' },
          { text: 'The qubit is now in the |0⟩ state by default', type: 'info' },
          { text: 'Click "Initialize" to confirm the state', type: 'action' },
        ],
        hint: 'Qubits start in |0⟩ state by default. Click Add Qubit to create one.',
        solution: 'create',
      },
      'superposition_state': {
        title: 'State Builder',
        description: 'Create a superposition state using the H gate',
        steps: [
          { text: 'Create a qubit in the |0⟩ state', type: 'action' },
          { text: 'Apply the Hadamard (H) gate to create superposition', type: 'action' },
          { text: 'The qubit is now in state (|0⟩ + |1⟩)/√2', type: 'info' },
        ],
        hint: 'Use the H gate to create superposition. It transforms |0⟩ to (|0⟩+|1⟩)/√2',
        solution: 'H',
      },
      'entangle_qubits': {
        title: 'Entanglement Link',
        description: 'Entangle two qubits using CNOT gate',
        steps: [
          { text: 'Create two qubits in |0⟩ state', type: 'action' },
          { text: 'Apply H gate to the first qubit (control)', type: 'action' },
          { text: 'Apply CNOT with first qubit as control, second as target', type: 'action' },
        ],
        hint: 'First apply H to create superposition, then use CNOT to entangle.',
        solution: 'CNOT',
      },
      'bell_state': {
        title: 'Bell State Generator',
        description: 'Create the Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2',
        steps: [
          { text: 'Create two qubits in |00⟩ state', type: 'action' },
          { text: 'Apply H gate to first qubit', type: 'action' },
          { text: 'Apply CNOT gate (control: qubit 0, target: qubit 1)', type: 'action' },
        ],
        hint: 'H on first qubit followed by CNOT creates the Bell state |Φ+⟩',
        solution: 'bell',
      },
      'circuit_1': {
        title: 'Simple Circuit',
        description: 'Build a circuit with H and CNOT gates',
        steps: [
          { text: 'Add 2 qubits to the circuit', type: 'action' },
          { text: 'Add H gate on qubit 0', type: 'action' },
          { text: 'Add CNOT gate with qubit 0 as control', type: 'action' },
        ],
        hint: 'Create a 2-qubit circuit with H on first qubit and CNOT to second.',
        solution: 'circuit',
      },
    }
    return contents[challengeId] || {
      title: challenge?.title || 'Challenge',
      description: challenge?.description || 'Solve this quantum puzzle',
      steps: [
        { text: 'Analyze the quantum circuit', type: 'info' },
        { text: 'Determine the correct output', type: 'action' },
      ],
      hint: 'Think about how quantum gates transform the state.',
      solution: 'answer',
    }
  }

  const content = getChallengeContent(challenge?.id)

  const handleNextStep = () => {
    if (step < content.steps.length - 1) {
      setStep(step + 1)
    } else {
      // Complete the challenge
      setIsCorrect(true)
      setTimeout(() => {
        onComplete(challenge.id, 100)
        onClose()
      }, 1500)
    }
  }

  const containerStyle = {
    background: 'linear-gradient(135deg, #12121a, #0d0d14)',
    border: '1px solid #00d4ff',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '600px',
    width: '90%',
  }

  const stepStyle = (index) => ({
    padding: '16px',
    marginBottom: '12px',
    borderRadius: '12px',
    background: index === step 
      ? 'linear-gradient(135deg, #00d4ff20, #00d4ff10)'
      : index < step 
        ? 'linear-gradient(135deg, #10b98120, #10b98110)'
        : 'linear-gradient(135deg, #1a1a2e, #0d0d14)',
    border: `1px solid ${index === step ? '#00d4ff40' : index < step ? '#10b98140' : '#2a2a3e'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={containerStyle}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '24px',
              color: '#fff',
              marginBottom: '4px',
            }}>
              {content.title}
            </h2>
            <p style={{ color: '#8a8a9a', fontSize: '13px' }}>
              {content.description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2a2a3e',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
        }}>
          {content.steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i <= step ? '#00d4ff' : '#2a2a3e',
              }}
            />
          ))}
        </div>

        {/* Current Step */}
        <div style={stepStyle(step)}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#00d4ff20',
            border: '1px solid #00d4ff40',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00d4ff',
            fontWeight: 'bold',
          }}>
            {step + 1}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: '14px' }}>
              {content.steps[step].text}
            </p>
          </div>
        </div>

        {/* All Steps Preview */}
        <div style={{ marginBottom: '24px' }}>
          {content.steps.map((s, i) => (
            <div key={i} style={{
              ...stepStyle(i),
              opacity: i === step ? 1 : 0.5,
              cursor: 'pointer',
            }}
            onClick={() => i < step && setStep(i)}
            >
              <span style={{
                color: i < step ? '#10b981' : 'var(--gray-base)',
                fontSize: '14px',
              }}>
                {i < step ? '✓' : '○'}
              </span>
              <span style={{
                color: i <= step ? 'var(--text-secondary)' : 'var(--gray-base)',
                fontSize: '12px',
              }}>
                {s.text.substring(0, 40)}...
              </span>
            </div>
          ))}
        </div>

        {/* Hint */}
        {showHint && (
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b20, #f59e0b10)',
            border: '1px solid #f59e0b40',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}>
            <span style={{ color: '#f59e0b', fontSize: '12px' }}>💡 Hint: </span>
            <span style={{ color: '#8a8a9a', fontSize: '12px' }}>
              {content.hint}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setShowHint(!showHint)}
            style={{
              background: 'transparent',
              border: '1px solid #f59e0b40',
              borderRadius: '8px',
              padding: '12px 20px',
              color: '#f59e0b',
              cursor: 'pointer',
            }}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={isCorrect}
            style={{
              background: isCorrect 
                ? 'linear-gradient(135deg, #10b981, #34d399)'
                : 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              color: '#fff',
              cursor: isCorrect ? 'default' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isCorrect 
              ? '✓ Completed!' 
              : step < content.steps.length - 1 
                ? 'Next Step →' 
                : 'Complete Challenge'}
          </button>
        </div>

        {/* XP Reward */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          color: '#f59e0b',
          fontSize: '14px',
        }}>
          Reward: +{challenge?.xp || 0} XP
        </div>
      </div>
    </motion.div>
  )
}

export default ChallengePlayground
