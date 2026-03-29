// 3D Components Index - Export all 3D components for easy import
export { Circuit3DCanvas, Simple3DCircuit } from './Circuit3D'
export { 
  HolographicPanel, 
  HolographicButton, 
  HolographicRing, 
  HolographicStatDisplay, 
  HolographicContainer,
  HolographicCanvas,
  AnimatedHolographicBadge
} from './HolographicUI'
export { 
  ParticleField3D, 
  QuantumNebula, 
  FloatingQuantumBits, 
  QuantumCircuitLines, 
  ParticleBackground,
  InteractiveParticleCloud
} from './ParticleSystems'
export { 
  QuantumMazeGame, 
  SuperpositionChallenge, 
  EntanglementGame, 
  QuantumTrivia3D
} from './QuantumGames'

// Re-export common Three.js utilities
export { Canvas, useFrame } from '@react-three/fiber'
export { OrbitControls, Float, Text, RoundedBox, Sphere, Ring, Line } from '@react-three/drei'
import * as THREE from 'three'
export { THREE }