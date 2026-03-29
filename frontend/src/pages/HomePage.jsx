import React, { useState, Suspense, lazy, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StatCard, StatsGrid } from '../components/ui/StatCard'
import { FeatureCard, FeatureCardsGrid } from '../components/ui/FeatureCard'

// Lazy load heavy 3D visualization components for better performance
// These components use Three.js and are heavy, so we defer their loading
const QuantumVisualization = lazy(() => import('../components/QuantumVisualization'))
const Simple3DCircuit = lazy(() => import('../components/3D/Circuit3D').then(module => ({ default: module.Simple3DCircuit })))
const ParticleBackground = lazy(() => import('../components/3D/ParticleSystems').then(module => ({ default: module.ParticleBackground })))
const HolographicStatDisplay = lazy(() => import('../components/3D/HolographicUI').then(module => ({ default: module.HolographicStatDisplay })))

/**
 * Loading fallback for lazy components
 */
const VisualizationLoader = () => (
  <div className="visualization-loader">
    <div className="visualization-loader-icon">⚛</div>
    <div className="visualization-loader-text">
      Loading quantum visualization...
    </div>
  </div>
)

/**
 * Skeleton loader for stats cards
 */
const StatsSkeleton = () => (
  <div className="stats-grid">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="stat-card skeleton"
      >
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
      </div>
    ))}
  </div>
)

/**
 * Skeleton loader for feature cards
 */
const FeatureCardsSkeleton = () => (
  <div className="feature-cards">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="feature-card skeleton"
      >
        <div className="skeleton-square" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line long" />
      </div>
    ))}
  </div>
)

/**
 * HomePage Component - Dark Sci-Fi Design
 * Command center aesthetic with neon accents
 * Uses reusable components and CSS classes
 */
const HomePage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate loading for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: '◈',
      title: 'Interactive Qubits',
      description: 'Visualize and manipulate quantum states in real-time',
      path: '/qubits',
      color: '#00d4ff'
    },
    {
      icon: '⊞',
      title: 'Quantum Circuits',
      description: 'Build and simulate quantum gate sequences',
      path: '/circuits',
      color: '#8b5cf6'
    },
    {
      icon: '⚡',
      title: 'Error Lab',
      description: 'Study quantum errors and decoherence effects',
      path: '/error-playground',
      color: '#f59e0b'
    },
    {
      icon: '⚗',
      title: 'Quantum Lab',
      description: 'Run quantum experiments and algorithms',
      path: '/quantum-lab',
      color: '#10b981'
    }
  ]

  const stats = [
    { label: 'Active Qubits', value: '5', color: '#00d4ff', variant: 'blue' },
    { label: 'System Coherence', value: '99.7%', color: '#8b5cf6', variant: 'purple' },
    { label: 'Entangled Pairs', value: '8', color: '#f59e0b', variant: 'orange' },
    { label: 'Gate Fidelity', value: '99.2%', color: '#10b981', variant: 'green' },
  ]

  return (
    <div className="home-page">
      {/* Centralized container for better layout control */}
      <div className="dashboard-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-accent">◆</span> COMMAND CENTER
        </h1>
        <p className="page-subtitle">
          Monitor and control your quantum computing systems
        </p>
      </div>

      {/* Stats Row - Using reusable StatCard component */}
      {isLoading ? <StatsSkeleton /> : (
        <StatsGrid columns={4}>
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              variant={stat.variant}
            />
          ))}
        </StatsGrid>
      )}

      {/* Welcome Banner - No corner decorations */}
      <div className="welcome-banner">
        
        <div className="welcome-banner-content">
          <div className="welcome-banner-left">
            <div className="welcome-banner-icon">
              ψ
            </div>
            <div className="welcome-banner-text">
              <h2>SYSTEM READY</h2>
              <p>All quantum subsystems operational</p>
            </div>
          </div>
          <div className="welcome-banner-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/qubits')}
            >
              VIEW QUBITS
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/circuits')}
            >
              BUILD CIRCUIT
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards - Using reusable FeatureCard component */}
      {isLoading ? <FeatureCardsSkeleton /> : (
        <FeatureCardsGrid columns={4}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              path={feature.path}
            />
          ))}
        </FeatureCardsGrid>
      )}

      {/* Quantum Visualization Section - Lazy loaded */}
      <div className="visualization-section">
        <Suspense fallback={<VisualizationLoader />}>
          <QuantumVisualization 
            numQubits={2} 
            gateOperations={[
              { type: 'H', target: 0 },
              { type: 'H', target: 1 },
              { type: 'CNOT', control: 0, target: 1 },
            ]}
            isPlaying={true}
          />
        </Suspense>
      </div>

      {/* 3D Circuit Visualization - Lazy loaded */}
      <div className="visualization-section">
        <h3 className="visualization-title">
          <span className="visualization-title-accent">◆</span> 3D CIRCUIT VIEW
        </h3>
        <Suspense fallback={<VisualizationLoader />}>
          <Simple3DCircuit 
            gates={[
              { gate: 'H', target: 0 },
              { gate: 'H', target: 1 },
              { gate: 'CNOT', control: 0, target: 1 },
              { gate: 'H', target: 0 },
            ]}
            numQubits={2}
          />
        </Suspense>
        </div>
      </div>
      {/* Centralized container end */}
    </div>
  )
}

export default HomePage
