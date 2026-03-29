import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

const Particle = ({ delay, duration, size, initialX, initialY }) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, rgba(139, 92, 246, 0.3) 50%, transparent 70%)`,
        boxShadow: `0 0 ${size} rgba(0, 212, 255, 0.4), 0 0 ${size * 2} rgba(139, 92, 246, 0.2)`,
      }}
      initial={{ x: initialX, y: initialY, opacity: 0 }}
      animate={{
        x: [initialX, initialX + Math.random() * 100 - 50, initialX],
        y: [initialY, initialY + Math.random() * 100 - 50, initialY],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

const QuantumParticles = ({ 
  count = 30, 
  className = "",
  colors = ["cyan", "purple", "gold"]
}) => {
  const containerRef = useRef(null)
  const particles = []

  for (let i = 0; i < count; i++) {
    const size = Math.random() * 4 + 2
    const initialX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
    const initialY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
    const duration = Math.random() * 10 + 8
    const delay = Math.random() * 5
    
    particles.push(
      <Particle
        key={i}
        size={size}
        initialX={initialX}
        initialY={initialY}
        duration={duration}
        delay={delay}
      />
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {particles}
    </div>
  )
}

// Glowing orb effect for quantum states
const QuantumOrb = ({ 
  color = "cyan", 
  size = 100, 
  position = "center",
  className = "",
  animate = true 
}) => {
  const colorMap = {
    cyan: "from-quantum-cyan/30 via-quantum-cyan/10 to-transparent",
    purple: "from-quantum-purple/30 via-quantum-purple/10 to-transparent",
    gold: "from-quantum-gold/30 via-quantum-gold/10 to-transparent",
    emerald: "from-quantum-emerald/30 via-quantum-emerald/10 to-transparent",
  }

  const glowMap = {
    cyan: "shadow-glow-cyan",
    purple: "shadow-glow-purple",
    gold: "shadow-glow-gold",
    emerald: "shadow-quantum-emerald/50",
  }

  return (
    <div 
      className={`absolute ${position} ${className}`}
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div 
        className={`rounded-full bg-gradient-to-br ${colorMap[color]} ${glowMap[color]}`}
        style={{
          width: size,
          height: size,
          filter: "blur(20px)",
        }}
      >
        {animate && (
          <motion.div
            className="w-full h-full rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </div>
  )
}

// Grid lines effect
const QuantumGrid = ({ className = "" }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  )
}

export { QuantumParticles, QuantumOrb, QuantumGrid }
