import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Boot sequence messages for "Quantum OS" feel
const bootMessages = [
  { text: "Initializing Quantum Core...", delay: 0 },
  { text: "Loading neural pathways...", delay: 800 },
  { text: "Calibrating qubits...", delay: 1600 },
  { text: "Establishing entanglement...", delay: 2400 },
  { text: "Quantum OS v1.0 ready", delay: 3200 },
]

const PortalBoot = ({ onComplete, enabled = true }) => {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [showPortal, setShowPortal] = useState(false)
  // Initialize isComplete to true if not enabled, avoiding any flash
  const [isComplete, setIsComplete] = useState(!enabled)

  useEffect(() => {
    // Skip boot animation if disabled
    if (!enabled) {
      setIsComplete(true)
      return
    }
    
    // Always show full boot when enabled (session-based in App.jsx)
    if (enabled) {
      // First time ever - show full boot animation
      // sessionStorage handles show-once in App.jsx
      
      // Start portal animation after a brief delay
      const portalTimer = setTimeout(() => setShowPortal(true), 300)
      
      // Cycle through messages
      const messageInterval = setInterval(() => {
        setCurrentMessage(prev => {
          if (prev < bootMessages.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 800)

      // Complete boot sequence
      const completeTimer = setTimeout(() => {
        setIsComplete(true)
        setTimeout(onComplete, 1000)
      }, 4000)

      return () => {
        clearTimeout(portalTimer)
        clearInterval(messageInterval)
        clearTimeout(completeTimer)
      }
    } else {
      // Subsequent visits - show brief version and close quickly
      setCurrentMessage(0) // Only show first message
      const portalTimer = setTimeout(() => setShowPortal(true), 200)
      
      // Show only first message briefly
      const briefTimer = setTimeout(() => {
        setIsComplete(true)
        setTimeout(onComplete, 800)
      }, 1000)

      return () => {
        clearTimeout(portalTimer)
        clearTimeout(briefTimer)
      }
    }
  }, [onComplete, enabled])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0e17',
            overflow: 'hidden'
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Grid pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3
          }} />

          {/* Central Portal - raised up */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            transform: 'translateY(-8%)'
          }}>
            {/* Outer ring */}
            <motion.div
              style={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                border: '2px solid rgba(0, 212, 255, 0.3)',
                boxShadow: '0 0 60px rgba(0, 212, 255, 0.3), inset 0 0 60px rgba(0, 212, 255, 0.1)'
              }}
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            
            {/* Middle ring */}
            <motion.div
              style={{
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: '50%',
                border: '2px solid rgba(139, 92, 246, 0.4)'
              }}
              animate={{ 
                rotate: -360,
                scale: [1.1, 1, 1.1]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            
            {/* Inner ring */}
            <motion.div
              style={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '2px solid rgba(0, 212, 255, 0.5)'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Core glow */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              width: showPortal ? 120 : 40,
              height: showPortal ? 120 : 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)',
              filter: 'blur(15px)',
              transition: 'all 1s ease-out'
            }}>
              <motion.div
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            
            {/* Portal expand effect */}
            <motion.div
              style={{
                position: 'absolute',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.5), rgba(139, 92, 246, 0.5))',
                filter: 'blur(20px)',
                zIndex: 5
              }}
              animate={{ 
                scale: showPortal ? 25 : 1,
                opacity: showPortal ? 0 : 1
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          {/* Boot messages - moved lower */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '18%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '0 16px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {bootMessages.slice(0, currentMessage + 1).map((msg, index) => (
              <motion.span
                key={index}
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '18px',
                  color: '#00d4ff',
                  letterSpacing: '2px',
                  textAlign: 'center'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {index === currentMessage && currentMessage < bootMessages.length - 1 ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {msg.text}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: '#00d4ff',
                        borderRadius: '50%'
                      }}
                    />
                  </span>
                ) : (
                  msg.text
                )}
              </motion.span>
            ))}
          </motion.div>

          {/* Version text */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 32,
              fontSize: '12px',
              color: '#64748b',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '4px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            QUANTUM OS v1.0 // QUANTARA
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PortalBoot
