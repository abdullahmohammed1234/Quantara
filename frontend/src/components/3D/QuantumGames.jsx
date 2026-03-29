import React, { useState, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Float, Sphere } from '@react-three/drei'
import * as THREE from 'three'

/**
 * QubitGamePiece - Interactive 3D qubit for games
 */
const QubitGamePiece = ({ 
  state = '0', 
  onClick, 
  position = [0, 0, 0],
  size = 0.5
}) => {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()
  
  const isZero = state === '0'
  const color = isZero ? '#00d4ff' : '#ec4899'
  const label = isZero ? '|0⟩' : '|1⟩'
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.02
    }
  })
  
  return (
    <group position={position}>
      <Float speed={hovered ? 4 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <RoundedBox
          ref={meshRef}
          args={[size, size, size]}
          radius={0.1}
          smoothness={4}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1 : 0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
        
        {/* State label */}
        <Text
          position={[0, size + 0.3, 0]}
          fontSize={0.2}
          color={color}
          anchorX="center"
        >
          {label}
        </Text>
        
        {/* Glow effect */}
        {hovered && (
          <Sphere args={[size * 0.8, 16, 16]}>
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2}
            />
          </Sphere>
        )}
      </Float>
    </group>
  )
}

/**
 * GateTarget - Target gate for game interactions
 */
const GateTarget = ({ 
  gate, 
  onHit, 
  position = [0, 0, 0],
  isActive = true 
}) => {
  const [hit, setHit] = useState(false)
  const targetRef = useRef()
  
  const colors = {
    'H': '#8b5cf6',
    'X': '#ef4444',
    'Y': '#22c55e',
    'Z': '#f59e0b',
    'CNOT': '#ff6b6b'
  }
  
  const color = colors[gate] || '#00d4ff'
  
  const handleHit = useCallback(() => {
    if (!hit && isActive) {
      setHit(true)
      onHit?.(gate)
    }
  }, [hit, isActive, gate, onHit])
  
  useFrame((state) => {
    if (targetRef.current && isActive && !hit) {
      targetRef.current.rotation.y = state.clock.elapsedTime
      targetRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })
  
  return (
    <group position={position}>
      <RoundedBox
        ref={targetRef}
        args={[0.8, 0.8, 0.2]}
        radius={0.1}
        onClick={handleHit}
      >
        <meshStandardMaterial
          color={hit ? '#10b981' : color}
          emissive={hit ? '#10b981' : color}
          emissiveIntensity={hit ? 1 : 0.6}
          transparent
          opacity={hit ? 0.5 : 0.9}
        />
      </RoundedBox>
      
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {gate}
      </Text>
    </group>
  )
}

/**
 * QuantumMazeGame - 3D quantum maze game
 */
export const QuantumMazeGame = ({ 
  onScore, 
  level = 1,
  targetGate = 'H'
}) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameState, setGameState] = useState('playing') // 'playing', 'won', 'lost'
  
  const handleGateHit = useCallback((gate) => {
    if (gate === targetGate) {
      const newScore = score + 100
      setScore(newScore)
      onScore?.(newScore)
      setGameState('won')
    } else {
      setGameState('lost')
    }
  }, [score, targetGate, onScore])
  
  // Random position for target
  const targetPosition = [
    (Math.random() - 0.5) * 8,
    (Math.random() - 0.5) * 4,
    0
  ]
  
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {/* Score overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        color: '#00d4ff',
        fontFamily: 'monospace',
        fontSize: '18px'
      }}>
        Score: {score}
      </div>
      
      {/* Game state overlay */}
      {gameState !== 'playing' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          textAlign: 'center',
          color: gameState === 'won' ? '#10b981' : '#ef4444'
        }}>
          <Text fontSize={0.5} color={gameState === 'won' ? '#10b981' : '#ef4444'}>
            {gameState === 'won' ? 'CORRECT!' : 'TRY AGAIN'}
          </Text>
        </div>
      )}
      
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#0a0e17']} />
        <fog attach="fog" args={['#0a0e17', 5, 20]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#00d4ff" />
        
        {/* Decorative floating qubits */}
        {['H', 'X', 'Y', 'Z'].map((gate, i) => (
          <QubitGamePiece
            key={gate}
            state={i % 2 === 0 ? '0' : '1'}
            position={[
              (i - 1.5) * 3,
              2,
              -2
            ]}
            size={0.3}
          />
        ))}
        
        {/* Target gate */}
        <GateTarget
          gate={targetGate}
          onHit={handleGateHit}
          position={targetPosition}
          isActive={gameState === 'playing'}
        />
        
        {/* Wrong options */}
        {['X', 'Y', 'Z'].filter(g => g !== targetGate).map((gate, i) => (
          <GateTarget
            key={gate}
            gate={gate}
            onHit={handleGateHit}
            position={[
              (i - 1) * 3,
              -2,
              -1
            ]}
            isActive={gameState === 'playing'}
          />
        ))}
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}

/**
 * SuperpositionChallenge - Game to create superposition states
 */
export const SuperpositionChallenge = ({ 
  onComplete,
  difficulty = 'easy'
}) => {
  const [qubitState, setQubitState] = useState('0')
  const [gatesApplied, setGatesApplied] = useState([])
  const [challengeComplete, setChallengeComplete] = useState(false)
  
  const applyGate = (gate) => {
    // Simplified gate logic
    let newState = qubitState
    if (gate === 'H') {
      newState = qubitState === '0' ? 'superposition' : '0'
    } else if (gate === 'X') {
      newState = qubitState === '0' ? '1' : '0'
    }
    
    setQubitState(newState)
    setGatesApplied([...gatesApplied, gate])
    
    if (newState === 'superposition') {
      setChallengeComplete(true)
      onComplete?.(true)
    }
  }
  
  return (
    <div style={{ width: '100%', padding: '20px' }}>
      <div style={{ 
        marginBottom: '20px', 
        color: '#00d4ff',
        fontFamily: 'monospace'
      }}>
        <h3>Create a Superposition State!</h3>
        <p>Current State: {qubitState === 'superposition' ? '|+⟩ (Superposition)' : `|${qubitState}⟩`}</p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        {['H', 'X', 'Z'].map(gate => (
          <button
            key={gate}
            onClick={() => applyGate(gate)}
            disabled={challengeComplete}
            style={{
              padding: '10px 20px',
              background: challengeComplete ? '#1e293b' : '#0f172a',
              border: '2px solid #00d4ff',
              borderRadius: '8px',
              color: '#00d4ff',
              fontSize: '16px',
              cursor: challengeComplete ? 'not-allowed' : 'pointer'
            }}
          >
            {gate}
          </button>
        ))}
      </div>
      
      <div style={{ 
        color: '#94a3b8',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        Gates Applied: {gatesApplied.join(' → ') || 'None'}
      </div>
      
      {challengeComplete && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          color: '#10b981',
          textAlign: 'center'
        }}>
          🎉 Superposition achieved! Well done!
        </div>
      )}
    </div>
  )
}

/**
 * EntanglementGame - Connect qubits to create entanglement
 */
export const EntanglementGame = ({ onComplete }) => {
  const [qubits, setQubits] = useState([
    { id: 0, state: '0', connected: false },
    { id: 1, state: '0', connected: false }
  ])
  const [selectedQubit, setSelectedQubit] = useState(null)
  const [entangled, setEntangled] = useState(false)
  
  const handleQubitClick = (id) => {
    if (entangled) return
    
    if (selectedQubit === null) {
      setSelectedQubit(id)
    } else if (selectedQubit !== id) {
      // Try to entangle
      const newQubits = qubits.map(q => ({
        ...q,
        connected: q.id === selectedQubit || q.id === id ? true : q.connected
      }))
      setQubits(newQubits)
      setEntangled(true)
      onComplete?.(true)
      setSelectedQubit(null)
    }
  }
  
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#0a0e17']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
        
        {qubits.map((qubit, i) => (
          <QubitGamePiece
            key={qubit.id}
            state={qubit.state}
            position={[(i - 0.5) * 4, 0, 0]}
            onClick={() => handleQubitClick(qubit.id)}
          />
        ))}
        
        {/* Connection line when both selected */}
        {entangled && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([-2, 0, 0, 2, 0, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff6b6b" linewidth={3} />
          </line>
        )}
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '10px',
        color: '#94a3b8',
        fontFamily: 'monospace'
      }}>
        {entangled 
          ? '🔗 Qubits Entangled!' 
          : selectedQubit !== null 
            ? 'Click another qubit to entangle' 
            : 'Click a qubit to select'}
      </div>
    </div>
  )
}

/**
 * QuantumTrivia3D - 3D quantum trivia game
 */
export const QuantumTrivia3D = ({ 
  questions = [],
  onAnswer 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [correct, setCorrect] = useState(false)
  
  const question = questions[currentQuestion]
  
  const handleAnswer = (answer) => {
    const isCorrect = answer === question?.correct
    setCorrect(isCorrect)
    setShowResult(true)
    onAnswer?.(isCorrect)
    
    setTimeout(() => {
      setShowResult(false)
      setCurrentQuestion((currentQuestion + 1) % questions.length)
    }, 1500)
  }
  
  if (!question) return null
  
  return (
    <div style={{ 
      width: '100%', 
      padding: '20px',
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 212, 255, 0.3)'
    }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '20px' }}>
        Question {currentQuestion + 1}
      </h3>
      <p style={{ color: '#ffffff', marginBottom: '20px', fontSize: '18px' }}>
        {question.question}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(option)}
            disabled={showResult}
            style={{
              padding: '15px',
              background: showResult 
                ? (option === question.correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                : 'rgba(15, 23, 42, 0.8)',
              border: '2px solid #00d4ff',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: showResult ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default {
  QuantumMazeGame,
  SuperpositionChallenge,
  EntanglementGame,
  QuantumTrivia3D
}