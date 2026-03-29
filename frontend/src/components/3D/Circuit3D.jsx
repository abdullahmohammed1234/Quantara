import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line, RoundedBox, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Gate3D - 3D representation of a quantum gate
 * Creates volumetric gate boxes with labels and glow effects
 */
const Gate3D = ({ gate, position, color = '#00d4ff', size = [0.8, 0.8, 0.2] }) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const gateLabel = gate.name || gate
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <RoundedBox
          ref={meshRef}
          args={size}
          radius={0.08}
          smoothness={4}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={hovered ? '#ffffff' : color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </RoundedBox>
      </Float>
      
      {/* Gate Label */}
      <Text
        position={[0, 0, size[2] / 2 + 0.01]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {gateLabel}
      </Text>
      
      {/* Glow effect */}
      {hovered && (
        <RoundedBox args={[size[0] * 1.2, size[1] * 1.2, size[2] * 0.5]} radius={0.1} smoothness={4}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </RoundedBox>
      )}
    </group>
  )
}

/**
 * ControlLine3D - 3D line connecting controlled gates
 */
const ControlLine3D = ({ start, end }) => {
  const points = useMemo(() => {
    return [start, end]
  }, [start, end])
  
  return (
    <Line
      points={points}
      color="#ff6b6b"
      lineWidth={3}
    />
  )
}

/**
 * QubitLine3D - 3D representation of qubit wire
 */
const QubitLine3D = ({ position, label, length = 10 }) => {
  const points = useMemo(() => {
    return [
      [position[0] - length / 2, position[1], position[2]],
      [position[0] + length / 2, position[1], position[2]]
    ]
  }, [position, length])
  
  return (
    <group>
      <Line points={points} color="#4ade80" lineWidth={2} />
      <Text
        position={[position[0] - length / 2 - 0.5, position[1], position[2]]}
        fontSize={0.3}
        color="#4ade80"
      >
        |{label}⟩ 
      </Text>
    </group>
  )
}

/**
 * Measurement3D - 3D measurement gate
 */
const Measurement3D = ({ position }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.2]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Text position={[0, 0, 0.15]} fontSize={0.2} color="#ffffff">
        M
      </Text>
    </group>
  )
}

/**
 * Circuit3DCanvas - Main 3D canvas for quantum circuit
 */
export const Circuit3DCanvas = ({ circuit, height = 400 }) => {
  const [selectedGate, setSelectedGate] = useState(null)
  
  // Parse circuit and create 3D elements
  const { gates, controls, measurements } = useMemo(() => {
    const gates = []
    const controls = []
    const measurements = []
    
    let currentX = 0
    const gateSpacing = 1.2
    
    if (Array.isArray(circuit)) {
      circuit.forEach((gateObj, index) => {
        const gate = typeof gateObj === 'string' ? gateObj : gateObj.gate
        const targetQubit = gateObj.target || 0
        const controlQubit = gateObj.control
        
        // Single qubit gates
        if (!controlQubit) {
          gates.push({
            name: gate,
            position: [currentX, -targetQubit * 1.2, 0],
            color: getGateColor(gate)
          })
          currentX += gateSpacing
        } 
        // Controlled gates
        else {
          gates.push({
            name: gate,
            position: [currentX, -targetQubit * 1.2, 0],
            color: '#ff6b6b'
          })
          controls.push({
            start: [currentX, -controlQubit * 1.2, 0],
            end: [currentX, -targetQubit * 1.2, 0]
          })
          currentX += gateSpacing
        }
      })
    }
    
    return { gates, controls, measurements }
  }, [circuit])
  
  return (
    <div style={{ width: '100%', height: `${height}px`, borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [5, 2, 10], fov: 50 }}>
        <color attach="background" args={['#0a0e17']} />
        <fog attach="fog" args={['#0a0e17', 10, 30]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />
        
        {/* Qubit lines */}
        {[0, 1, 2, 3].map(i => (
          <QubitLine3D
            key={`qubit-${i}`}
            position={[0, -i * 1.2, 0]}
            label={i}
          />
        ))}
        
        {/* Gates */}
        {gates.map((gate, index) => (
          <Gate3D
            key={`gate-${index}`}
            gate={gate}
            position={gate.position}
            color={gate.color}
          />
        ))}
        
        {/* Control lines */}
        {controls.map((control, index) => (
          <ControlLine3D
            key={`control-${index}`}
            start={control.start}
            end={control.end}
          />
        ))}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  )
}

/**
 * Helper function to get gate colors
 */
function getGateColor(gateName) {
  const colors = {
    'H': '#8b5cf6',
    'X': '#ef4444',
    'Y': '#22c55e',
    'Z': '#f59e0b',
    'S': '#06b6d4',
    'T': '#ec4899',
    'Rx': '#3b82f6',
    'Ry': '#10b981',
    'Rz': '#f97316',
    'CNOT': '#ff6b6b',
    'CX': '#ff6b6b',
    'CY': '#ff6b6b',
    'CZ': '#ff6b6b',
    'SWAP': '#a855f7',
    'I': '#6b7280'
  }
  return colors[gateName] || '#00d4ff'
}

/**
 * Simple3DCircuit - Basic 3D circuit display for embedding
 */
export const Simple3DCircuit = ({ gates = [], numQubits = 2 }) => {
  // Transform circuit format if needed - handle both string and object formats
  const gateElements = useMemo(() => {
    return gates.map((gate, index) => {
      // Handle both object format {gate, target, control} and string format 'H'
      const gateName = typeof gate === 'string' ? gate : (gate.gate || gate.name || 'H')
      const targetQubit = typeof gate === 'object' ? (gate.target || 0) : 0
      const controlQubit = typeof gate === 'object' ? gate.control : undefined
      
      return {
        gate: gateName,
        target: targetQubit,
        control: controlQubit,
        position: [index * 1.5, -targetQubit * 1.2, 0],
        color: getGateColor(gateName)
      }
    })
  }, [gates])
  
  return (
    <div style={{ width: '100%', height: '200px' }}>
      <Canvas camera={{ position: [3, 1, 8], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#8b5cf6" />
        
        {/* Qubit wires */}
        {Array.from({ length: numQubits }).map((_, i) => (
          <QubitLine3D
            key={`wire-${i}`}
            position={[0, -i * 1.2, 0]}
            label={i}
            length={gates.length * 1.5 + 2}
          />
        ))}
        
        {/* Gates */}
        {gateElements.map((gate, index) => (
          <Gate3D
            key={`gate-${index}`}
            gate={{ name: gate.gate }}
            position={gate.position}
            color={gate.color}
          />
        ))}
        
        {/* Control lines */}
        {gates.filter(g => g.control !== undefined).map((gate, index) => (
          <ControlLine3D
            key={`ctrl-${index}`}
            start={[
              index * 1.5,
              -(gate.control) * 1.2,
              0
            ]}
            end={[
              index * 1.5,
              -(gate.target || 0) * 1.2,
              0
            ]}
          />
        ))}
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

export default Circuit3DCanvas