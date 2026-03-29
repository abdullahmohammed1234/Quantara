import React, { useState, useEffect, useRef } from 'react'

/**
 * ProgressDashboard Component
 * Shows learning progress with achievement badges and animations
 */

// Achievement badge definitions
const ACHIEVEMENTS = [
  { id: 'first-gate', name: 'First Gate', description: 'Use your first quantum gate', icon: '⚡', xp: 10, condition: 'gatesUsed >= 1' },
  { id: 'superposition', name: 'Superposition Master', description: 'Create a superposition state', icon: '🔄', xp: 25, condition: 'superpositionCreated' },
  { id: 'entanglement', name: 'Entanglement', description: 'Create an entangled pair', icon: '🔗', xp: 50, condition: 'entangledPairs >= 1' },
  { id: 'circuit-builder', name: 'Circuit Builder', description: 'Build a 5-gate circuit', icon: '🔧', xp: 30, condition: 'circuitLength >= 5' },
  { id: 'algorithm-run', name: 'Algorithm Runner', description: 'Run your first algorithm', icon: '🧠', xp: 20, condition: 'algorithmsRun >= 1' },
  { id: 'quantum-quest', name: 'Quantum Quest', description: 'Complete 3 challenges', icon: '🎯', xp: 75, condition: 'challengesCompleted >= 3' },
  { id: 'daily-streak', name: 'Daily Dedication', description: '7 day learning streak', icon: '🔥', xp: 100, condition: 'dailyStreak >= 7' },
  { id: 'explorer', name: 'Explorer', description: 'Visit 5 different pages', icon: '🗺️', xp: 15, condition: 'pagesVisited >= 5' },
]

// Badge component with animation
const AchievementBadge = ({ badge, unlocked, delay = 0 }) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (unlocked) {
      const timer = setTimeout(() => setShowAnimation(true), delay * 100)
      return () => clearTimeout(timer)
    }
  }, [unlocked, delay])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        background: unlocked ? 'linear-gradient(135deg, #1a1a2e, #12121a)' : '#0a0a0f',
        border: `1px solid ${unlocked ? 'rgba(0, 212, 255, 0.4)' : '#1a1a2e'}`,
        borderRadius: '12px',
        cursor: unlocked ? 'pointer' : 'not-allowed',
        opacity: unlocked ? 1 : 0.5,
        transition: 'all 0.3s ease',
        transform: showAnimation ? 'scale(1.05)' : 'scale(1)',
        boxShadow: showAnimation ? '0 0 30px rgba(0, 212, 255, 0.4)' : 'none',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          marginBottom: '8px',
          animation: showAnimation ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {badge.icon}
      </div>
      <div style={{ color: unlocked ? '#fff' : '#666', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
        {badge.name}
      </div>
      <div style={{ color: '#666', fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>
        {badge.description}
      </div>
      <div style={{
        marginTop: '8px',
        padding: '4px 8px',
        background: unlocked ? 'rgba(0, 212, 255, 0.2)' : '#1a1a2e',
        borderRadius: '12px',
        fontSize: '11px',
        color: unlocked ? '#00d4ff' : '#444',
      }}>
        +{badge.xp} XP
      </div>
    </div>
  )
}

// Progress bar component
const ProgressBar = ({ value, max, label, color = '#00d4ff' }) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: '#8a8a9a', fontSize: '13px' }}>{label}</span>
        <span style={{ color: color, fontSize: '13px', fontWeight: 600 }}>{value} / {max}</span>
      </div>
      <div style={{
        height: '8px',
        background: '#1a1a2e',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          borderRadius: '4px',
          transition: 'width 0.5s ease-out',
        }} />
      </div>
    </div>
  )
}

/**
 * Main ProgressDashboard Component
 */
const ProgressDashboard = ({ userProgress }) => {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [unlockedBadges, setUnlockedBadges] = useState([])
  const [streak, setStreak] = useState(0)

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const progress = JSON.parse(localStorage.getItem('quantara_progress') || '{}')
      setXp(progress.xp || 0)
      setLevel(Math.floor((progress.xp || 0) / 100) + 1)
      setStreak(progress.dailyStreak || 0)
      
      // Load unlocked achievements
      const achievements = JSON.parse(localStorage.getItem('quantara_achievements') || '[]')
      setUnlockedBadges(achievements.map(a => a.id))
    } catch (e) {
      // Use defaults
    }
  }, [])

  // Calculate XP needed for next level
  const xpForNextLevel = level * 100
  const xpProgress = xp % 100

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      borderRadius: '16px',
      border: '1px solid #1a1a2e',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#fff',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
        }}>
          {level}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>Level {level}</div>
          <div style={{ color: '#8a8a9a', fontSize: '14px' }}>{xp} XP total</div>
        </div>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>🔥</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>{streak}</span>
        </div>
      </div>

      {/* XP Progress */}
      <ProgressBar 
        value={xpProgress} 
        max={100} 
        label={`Level ${level} Progress`} 
        color="#8b5cf6" 
      />

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '16px',
          background: '#1a1a2e',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚡</div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{userProgress?.gatesUsed || 0}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Gates Used</div>
        </div>
        <div style={{
          padding: '16px',
          background: '#1a1a2e',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔬</div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{userProgress?.simulationsRun || 0}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Simulations</div>
        </div>
        <div style={{
          padding: '16px',
          background: '#1a1a2e',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎯</div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{userProgress?.challengesCompleted || 0}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Challenges</div>
        </div>
      </div>

      {/* Achievements Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Achievements</h3>
        <span style={{ color: '#8a8a9a', fontSize: '14px' }}>
          {unlockedBadges.length} / {ACHIEVEMENTS.length}
        </span>
      </div>

      {/* Achievement Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
      }}>
        {ACHIEVEMENTS.map((badge, index) => (
          <AchievementBadge
            key={badge.id}
            badge={badge}
            unlocked={unlockedBadges.includes(badge.id)}
            delay={index}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

export default ProgressDashboard