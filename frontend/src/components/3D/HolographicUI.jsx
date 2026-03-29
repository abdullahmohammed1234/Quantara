import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, RoundedBox, Ring, Line } from '@react-three/drei'
import * as THREE from 'three'

/**
 * HolographicPanel - A floating holographic display panel
 * Creates sci-fi style holographic containers with scanning effects
 */
export const HolographicPanel = ({ 
  children, 
  width = 4, 
  height = 3, 
  title = '',
  position = [0, 0, 0],
  color = '#00d4ff' 
}) => {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main panel background */}
      <RoundedBox args={[width, height, 0.05]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </RoundedBox>
      
      {/* Panel border - glowing edges */}
      <HolographicFrame width={width} height={height} color={color} />
      
      {/* Scan line effect */}
      <ScanLineEffect width={width} height={height} color={color} />
      
      {/* Title */}
      {title && (
        <Text
          position={[0, height / 2 - 0.3, 0.1]}
          fontSize={0.2}
          color={color}
          anchorX="center"
        >
          {title}
        </Text>
      )}
      
      {/* Content area - transparent for children */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width - 0.2, height - 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

/**
 * HolographicFrame - Glowing border for holographic panels
 */
const HolographicFrame = ({ width, height, color }) => {
  const points = useRef([])
  
  // Create frame points
  const framePoints = [
    [-width / 2, height / 2, 0],
    [width / 2, height / 2, 0],
    [width / 2, -height / 2, 0],
    [-width / 2, -height / 2, 0],
    [-width / 2, height / 2, 0]
  ]
  
  return (
    <group>
      <Line
        points={framePoints}
        color={color}
        lineWidth={2}
      />
      {/* Corner markers */}
      {[[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([x, y], i) => (
        <group key={i} position={[x * width / 2, y * height / 2, 0]}>
          <Line
            points={[
              [x * 0.2, 0, 0],
              [x * 0.4, 0, 0]
            ]}
            color={color}
            lineWidth={3}
          />
          <Line
            points={[
              [0, y * 0.2, 0],
              [0, y * 0.4, 0]
            ]}
            color={color}
            lineWidth={3}
          />
        </group>
      ))}
    </group>
  )
}

/**
 * ScanLineEffect - Animated horizontal scan line
 */
const ScanLineEffect = ({ width, height, color }) => {
  const lineRef = useRef()
  
  useFrame((state) => {
    if (lineRef.current) {
      const y = ((state.clock.elapsedTime * 0.5) % 1) * height - height / 2
      lineRef.current.position.y = y
    }
  })
  
  return (
    <mesh ref={lineRef} position={[0, 0, 0.02]}>
      <planeGeometry args={[width - 0.1, 0.02]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  )
}

/**
 * HolographicButton - Interactive 3D holographic button
 */
export const HolographicButton = ({ 
  label, 
  onClick, 
  position = [0, 0, 0],
  color = '#00d4ff',
  size = [1.5, 0.5] 
}) => {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  
  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => {
        setPressed(false)
        onClick?.()
      }}
    >
      {/* Button base */}
      <RoundedBox 
        args={[size[0], size[1], 0.1]} 
        radius={0.05} 
        smoothness={4}
      >
        <meshStandardMaterial
          color={hovered ? color : '#1e293b'}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.1}
          transparent
          opacity={0.8}
        />
      </RoundedBox>
      
      {/* Border glow */}
      {hovered && (
        <RoundedBox args={[size[0] + 0.1, size[1] + 0.1, 0.05]} radius={0.08} smoothness={4}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </RoundedBox>
      )}
      
      {/* Label */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.15}
        color={hovered ? '#ffffff' : color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

/**
 * HolographicRing - Rotating holographic ring
 */
export const HolographicRing = ({ 
  radius = 1, 
  color = '#00d4ff', 
  position = [0, 0, 0],
  speed = 1 
}) => {
  const ringRef = useRef()
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * speed
    }
  })
  
  return (
    <group position={position}>
      <Ring ref={ringRef} args={[radius - 0.05, radius, 64]} rotation={[0, 0, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {/* Inner ring */}
      <Ring args={[radius * 0.7 - 0.02, radius * 0.7, 64]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Ring>
    </group>
  )
}

/**
 * HolographicStatDisplay - Display stats with holographic style
 */
export const HolographicStatDisplay = ({ 
  label, 
  value, 
  unit = '',
  color = '#00d4ff',
  position = [0, 0, 0] 
}) => {
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.1}>
        {/* Value */}
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
        >
          {value}
        </Text>
        
        {/* Unit */}
        {unit && (
          <Text
            position={[0, -0.05, 0]}
            fontSize={0.15}
            color={color}
            anchorX="center"
            opacity={0.7}
          >
            {unit}
          </Text>
        )}
        
        {/* Label */}
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.12}
          color="#94a3b8"
          anchorX="center"
        >
          {label}
        </Text>
        
        {/* Decorative line */}
        <Line
          points={[[-0.5, -0.45, 0], [0.5, -0.45, 0]]}
          color={color}
          lineWidth={1}
        />
      </Float>
    </group>
  )
}

/**
 * HolographicContainer - Full holographic card container
 */
export const HolographicContainer = ({ 
  children, 
  title,
  color = '#00d4ff',
  width = 3,
  height = 2
}) => {
  return (
    <group>
      <HolographicPanel width={width} height={height} title={title} color={color}>
        {/* Content would be rendered here */}
      </HolographicPanel>
    </group>
  )
}

/**
 * HolographicCanvas - Canvas wrapper for holographic 3D elements
 */
export const HolographicCanvas = ({ children, height = 400 }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: `${height}px`, 
      borderRadius: '12px', 
      overflow: 'hidden',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)'
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={['#0a0e17']} />
        <fog attach="fog" args={['#0a0e17', 5, 15]} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00d4ff" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />
        
        {children}
      </Canvas>
    </div>
  )
}

/**
 * AnimatedHolographicBadge - Glowing badge with animation
 */
export const AnimatedHolographicBadge = ({ 
  label,
  icon,
  color = '#00d4ff',
  position = [0, 0, 0]
}) => {
  const badgeRef = useRef()
  
  useFrame((state) => {
    if (badgeRef.current) {
      badgeRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  return (
    <group ref={badgeRef} position={position}>
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Outer ring */}
        <Ring args={[0.4, 0.45, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </Ring>
        
        {/* Inner circle */}
        <Ring args={[0.25, 0.3, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </Ring>
        
        {/* Label */}
        <Text
          position={[0, -0.55, 0]}
          fontSize={0.1}
          color={color}
          anchorX="center"
        >
          {label}
        </Text>
      </Float>
    </group>
  )
}

export default {
  HolographicPanel,
  HolographicButton,
  HolographicRing,
  HolographicStatDisplay,
  HolographicContainer,
  HolographicCanvas,
  AnimatedHolographicBadge
}