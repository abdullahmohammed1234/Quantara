import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * QubitSphere - A quantum-inspired 3D sphere representation
 */
function QubitSphere({ position, color, scale = 1, speed = 1 }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  )
}

/**
 * QubitCrystal - Angular crystal-like quantum shape
 */
function QubitCrystal({ position, color, scale = 1, rotationSpeed = 1 }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15 * rotationSpeed
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1 * rotationSpeed
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>
    </Float>
  )
}

/**
 * QubitRing - Ring representation for superposition states
 */
function QubitRing({ position, color, scale = 1 }) {
  const meshRef = useRef()
  const ringRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={meshRef} position={position} scale={scale}>
        {/* Core sphere */}
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Rotating ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.5, 0.08, 16, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </Float>
  )
}

/**
 * QuantumField - Container for all 3D qubit elements at edges
 */
function QuantumField() {
  // Define qubit representations at the edges/corners of the page
  const qubits = useMemo(() => [
    // Top corners
    { type: 'sphere', position: [-5, 3.5, -3], color: '#00d4ff', scale: 0.6, speed: 0.8 },
    { type: 'crystal', position: [5, 3, -3], color: '#8b5cf6', scale: 0.5, rotationSpeed: 1 },
    { type: 'ring', position: [-4, 4, -4], color: '#06b6d4', scale: 0.4 },
    { type: 'crystal', position: [4.5, 4, -4], color: '#a855f7', scale: 0.35, rotationSpeed: 1.5 },
    
    // Bottom corners
    { type: 'sphere', position: [-5, -3.5, -3], color: '#ec4899', scale: 0.55, speed: 1 },
    { type: 'crystal', position: [5, -3, -3], color: '#f59e0b', scale: 0.5, rotationSpeed: 0.9 },
    { type: 'ring', position: [-4, -4, -4], color: '#00d4ff', scale: 0.45 },
    { type: 'sphere', position: [4.5, -4, -4], color: '#8b5cf6', scale: 0.4, speed: 1.2 },
    
    // Left edge middle
    { type: 'crystal', position: [-5.5, 0, -2.5], color: '#ec4899', scale: 0.45, rotationSpeed: 1.1 },
    { type: 'ring', position: [-5, 1.5, -3], color: '#f59e0b', scale: 0.35 },
    
    // Right edge middle
    { type: 'sphere', position: [5.5, 0, -2.5], color: '#06b6d4', scale: 0.5, speed: 0.9 },
    { type: 'crystal', position: [5, -1.5, -3], color: '#a855f7', scale: 0.4, rotationSpeed: 1.3 },
    
    // Scattered at bottom edges only (behind footer area)
    { type: 'sphere', position: [-2, -4.5, -5], color: '#00d4ff', scale: 0.3, speed: 1.5 },
    { type: 'ring', position: [2, -4.5, -5], color: '#8b5cf6', scale: 0.3 },
    { type: 'crystal', position: [0, -4, -6], color: '#ec4899', scale: 0.25, rotationSpeed: 2 },
  ], [])

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Point lights for quantum glow effect */}
      <pointLight position={[-6, 4, 1]} color="#00d4ff" intensity={0.6} />
      <pointLight position={[6, -4, 1]} color="#8b5cf6" intensity={0.5} />
      <pointLight position={[0, 0, 5]} color="#ffffff" intensity={0.2} />
      
      {/* Render all qubit elements */}
      {qubits.map((qubit, index) => {
        if (qubit.type === 'sphere') {
          return (
            <QubitSphere
              key={index}
              position={qubit.position}
              color={qubit.color}
              scale={qubit.scale}
              speed={qubit.speed}
            />
          )
        } else if (qubit.type === 'crystal') {
          return (
            <QubitCrystal
              key={index}
              position={qubit.position}
              color={qubit.color}
              scale={qubit.scale}
              rotationSpeed={qubit.rotationSpeed}
            />
          )
        } else {
          return (
            <QubitRing
              key={index}
              position={qubit.position}
              color={qubit.color}
              scale={qubit.scale}
            />
          )
        }
      })}
    </>
  )
}

/**
 * LandingCanvas - 3D canvas for the landing page background
 */
const LandingCanvas = () => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <QuantumField />
      </Canvas>
    </div>
  )
}

export default LandingCanvas