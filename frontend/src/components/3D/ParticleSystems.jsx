import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * QuantumParticle - Individual quantum-inspired particle
 */
const QuantumParticle = ({ position, color, size = 0.05 }) => {
  const ref = useRef()
  const startPos = useMemo(() => [...position], [])
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      // Quantum-inspired movement - superposition-like oscillation
      ref.current.position.x = startPos[0] + Math.sin(t * 0.5 + startPos[1]) * 0.3
      ref.current.position.y = startPos[1] + Math.cos(t * 0.3 + startPos[0]) * 0.2
      ref.current.position.z = startPos[2] + Math.sin(t * 0.4 + startPos[2]) * 0.1
    }
  })
  
  return (
    <points ref={ref} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </points>
  )
}

/**
 * ParticleField3D - Enhanced 3D particle system with quantum themes
 */
export const ParticleField3D = ({ 
  count = 200,
  colors = ['#00d4ff', '#8b5cf6', '#ec4899', '#10b981'],
  radius = 10,
  speed = 1
}) => {
  const pointsRef = useRef()
  
  // Generate random particle positions
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.cbrt(Math.random())
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [count, radius])
  
  // Generate random colors for each particle
  const particleColors = useMemo(() => {
    const cols = new Float32Array(count * 3)
    const colorObjects = colors.map(c => new THREE.Color(c))
    
    for (let i = 0; i < count; i++) {
      const color = colorObjects[Math.floor(Math.random() * colorObjects.length)]
      cols[i * 3] = color.r
      cols[i * 3 + 1] = color.g
      cols[i * 3 + 2] = color.b
    }
    return cols
  }, [count, colors])
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05 * speed
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02 * speed
    }
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </points>
  )
}

/**
 * QuantumNebula - Volumetric quantum cloud effect
 */
export const QuantumNebula = ({ count = 500, colors = ['#8b5cf6', '#00d4ff'] }) => {
  const meshRef = useRef()
  
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 8
      const height = (Math.random() - 0.5) * 6
      
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * radius
      
      sz[i] = Math.random() * 0.3 + 0.1
    }
    
    return [pos, sz]
  }, [count])
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        color={colors[0]}
        transparent
        opacity={0.6}
        size={0.2}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * FloatingQuantumBits - Animated quantum bit particles
 */
export const FloatingQuantumBits = ({ count = 20 }) => {
  const bits = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 15
      ],
      rotation: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.5,
      scale: Math.random() * 0.3 + 0.2,
      label: Math.random() > 0.5 ? '|0⟩' : '|1⟩'
    }))
  }, [count])
  
  return (
    <group>
      {bits.map((bit, i) => (
        <Float key={i} speed={bit.speed} rotationIntensity={0.5} floatIntensity={1}>
          <group position={bit.position} rotation={[0, bit.rotation, 0]}>
            {/* Qubit representation as 3D cube */}
            <mesh>
              <boxGeometry args={[bit.scale, bit.scale, bit.scale]} />
              <meshStandardMaterial
                color={bit.label === '|0⟩' ? '#00d4ff' : '#ec4899'}
                emissive={bit.label === '|0⟩' ? '#00d4ff' : '#ec4899'}
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </mesh>
            {/* Label */}
            <Text
              position={[0, bit.scale + 0.2, 0]}
              fontSize={0.2}
              color={bit.label === '|0⟩' ? '#00d4ff' : '#ec4899'}
              anchorX="center"
            >
              {bit.label}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  )
}

/**
 * QuantumCircuitLines - Animated connection lines
 */
export const QuantumCircuitLines = () => {
  const lines = useMemo(() => {
    const lineData = []
    const numLines = 8
    
    for (let i = 0; i < numLines; i++) {
      const startX = -8 + (i * 2)
      const points = []
      
      for (let j = 0; j < 20; j++) {
        points.push([
          startX + j * 0.8,
          Math.sin(j * 0.5 + i) * 2,
          Math.cos(j * 0.3 + i) * 1.5
        ])
      }
      
      lineData.push({
        points,
        color: i % 2 === 0 ? '#00d4ff' : '#8b5cf6'
      })
    }
    
    return lineData
  }, [])
  
  return (
    <group>
      {lines.map((line, i) => (
        <Line3D key={i} points={line.points} color={line.color} />
      ))}
    </group>
  )
}

/**
 * Line3D - Simple 3D line component
 */
const Line3D = ({ points, color }) => {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.4} />
    </line>
  )
}

/**
 * ParticleBackground - Full-screen particle background
 */
export const ParticleBackground = ({ 
  height = '100vh',
  particleType = 'default'
}) => {
  const particleSystems = {
    default: <ParticleField3D count={300} radius={15} speed={0.5} />,
    nebula: <QuantumNebula count={400} />,
    bits: <FloatingQuantumBits count={30} />,
    circuit: <QuantumCircuitLines />
  }
  
  return (
    <div style={{ width: '100%', height, position: 'absolute', top: 0, left: 0 }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <color attach="background" args={['#0a0e17']} />
        <fog attach="fog" args={['#0a0e17', 15, 40]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00d4ff" />
        
        {particleSystems[particleType] || particleSystems.default}
      </Canvas>
    </div>
  )
}

/**
 * InteractiveParticleCloud - Click-reactive particles
 */
export const InteractiveParticleCloud = ({ count = 100 }) => {
  const [hoveredParticle, setHoveredParticle] = useState(null)
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 10
      ],
      size: Math.random() * 0.2 + 0.1,
      color: ['#00d4ff', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]
    }))
  }, [count])
  
  return (
    <group>
      {particles.map((particle, i) => (
        <mesh
          key={i}
          position={particle.position}
          onPointerOver={() => setHoveredParticle(i)}
          onPointerOut={() => setHoveredParticle(null)}
        >
          <sphereGeometry args={[hoveredParticle === i ? particle.size * 1.5 : particle.size, 16, 16]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={hoveredParticle === i ? 1 : 0.3}
            transparent
            opacity={hoveredParticle === i ? 1 : 0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

export default {
  ParticleField3D,
  QuantumNebula,
  FloatingQuantumBits,
  QuantumCircuitLines,
  ParticleBackground,
  InteractiveParticleCloud
}