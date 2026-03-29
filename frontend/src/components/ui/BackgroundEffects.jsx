import { motion } from "framer-motion"

/**
 * BackgroundGrid - Reusable grid overlay component
 * Replaces inline grid backgrounds in multiple places
 * 
 * @param {string} intensity - 'subtle' | 'default' | 'medium'
 * @param {string} className - Additional CSS classes
 * @param {boolean} animated - Whether to add subtle animation
 */
const BackgroundGrid = ({ 
  intensity = 'default',
  className = '',
  animated = false 
}) => {
  const gridClass = {
    subtle: 'grid-overlay-subtle',
    default: 'grid-overlay',
    medium: 'grid-overlay-medium',
  }[intensity]

  if (animated) {
    return (
      <motion.div 
        className={`${gridClass} ${className}`}
        style={{ 
          position: 'absolute', 
          inset: 0,
          zIndex: 0 
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    )
  }

  return (
    <div 
      className={`${gridClass} ${className}`}
      style={{ 
        position: 'absolute', 
        inset: 0,
        zIndex: 0 
      }}
    />
  )
}

/**
 * GradientBackground - Reusable gradient background component
 * Replaces inline gradient backgrounds
 * 
 * @param {string} type - 'quantum' | 'radial-cyan' | 'radial-purple'
 * @param {string} intensity - 'subtle' | 'medium' | 'strong'
 * @param {string} className - Additional CSS classes
 */
const GradientBackground = ({ 
  type = 'quantum',
  intensity = 'subtle',
  className = ''
}) => {
  const getGradientClass = () => {
    if (type === 'radial-cyan') {
      return 'bg-gradient-radial-cyan'
    }
    if (type === 'radial-purple') {
      return 'bg-gradient-radial-purple'
    }
    // quantum type
    const intensityMap = {
      subtle: 'bg-gradient-quantum',
      medium: 'bg-gradient-quantum-medium',
      strong: 'bg-gradient-quantum-strong',
    }
    return intensityMap[intensity] || 'bg-gradient-quantum'
  }

  return (
    <div 
      className={`${getGradientClass()} ${className}`}
      style={{ 
        position: 'absolute', 
        inset: 0,
        zIndex: 0 
      }}
    />
  )
}

/**
 * GlassContainer - Reusable glassmorphism container
 * 
 * @param {React.ReactNode} children - Child elements
 * @param {string} intensity - 'subtle' | 'default' | 'strong'
 * @param {string} className - Additional CSS classes
 */
const GlassContainer = ({ 
  children,
  intensity = 'default',
  className = '' 
}) => {
  const glassClass = {
    subtle: 'glass-subtle',
    default: 'glass',
    strong: 'glass-strong',
  }[intensity]

  return (
    <div className={`${glassClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * ParticleLayer - Optimized particle effect wrapper
 * Uses CSS animations instead of heavy JS particles for better performance
 * 
 * @param {string} density - 'low' | 'medium' | 'high'
 * @param {string} className - Additional CSS classes
 */
const ParticleLayer = ({ 
  density = 'medium',
  className = '' 
}) => {
  const particleCount = {
    low: 10,
    medium: 20,
    high: 40,
  }[density]

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    >
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

// Add floating animation for particles
const particleStyles = `
  @keyframes float {
    0%, 100% { 
      transform: translateY(0) translateX(0); 
      opacity: 0;
    }
    25% { opacity: 0.8; }
    50% { 
      transform: translateY(-30px) translateX(20px); 
      opacity: 0.6;
    }
    75% { opacity: 0.4; }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = particleStyles
  document.head.appendChild(styleSheet)
}

export { BackgroundGrid, GradientBackground, GlassContainer, ParticleLayer }