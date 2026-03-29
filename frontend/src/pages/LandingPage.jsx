import React, { useState, useCallback, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Globe, BookOpen, Zap, Sparkles, Mail, Lock, Loader2, ArrowRight, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BackgroundGrid, GradientBackground } from '../components/ui/BackgroundEffects'

// Lazy load heavy visualization components
const LandingCanvas = lazy(() => import('../components/LandingCanvas'))

/**
 * Loading skeleton for LandingCanvas
 */
const LandingCanvasLoader = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 50%, #0a0a0f 100%)',
  }}>
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '64px',
      height: '64px',
      border: '3px solid #1a1a2e',
      borderTopColor: '#00d4ff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  </div>
)

/**
 * Password strength checker utility
 */
const checkPasswordStrength = (password) => {
  let strength = 0
  let feedback = []
  
  if (password.length === 0) {
    return { strength: 0, level: 'none', feedback: [] }
  }
  
  if (password.length >= 8) {
    strength += 1
  } else {
    feedback.push('At least 8 characters')
  }
  
  if (/[a-z]/.test(password)) {
    strength += 1
  } else {
    feedback.push('Add lowercase letters')
  }
  
  if (/[A-Z]/.test(password)) {
    strength += 1
  } else {
    feedback.push('Add uppercase letters')
  }
  
  if (/[0-9]/.test(password)) {
    strength += 1
  } else {
    feedback.push('Add numbers')
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength += 1
  } else {
    feedback.push('Add special characters')
  }
  
  const levels = ['weak', 'weak', 'fair', 'good', 'strong', 'strong']
  const colors = ['#ef4444', '#ef4444', '#f59e0b', '#10b981', '#10b981', '#00d4ff']
  
  return {
    strength,
    level: levels[strength],
    color: colors[strength],
    feedback,
    percentage: (strength / 5) * 100
  }
}

/**
 * Enhanced form validation helper with robust validation
 */
const validateForm = (formData, mode) => {
  const errors = []
  
  // Email validation - more robust regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  // Username validation - alphanumeric and underscores only, 3-20 chars
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  
  // Password validation - must meet strong requirements
  const passwordRequirements = {
    minLength: 8,
    hasUppercase: /[A-Z]/.test(formData.password || ''),
    hasLowercase: /[a-z]/.test(formData.password || ''),
    hasNumber: /[0-9]/.test(formData.password || ''),
    hasSpecial: /[^a-zA-Z0-9]/.test(formData.password || ''),
  }
  
  if (mode === 'register') {
    // Username validation
    if (!formData.username || formData.username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' })
    } else if (formData.username.length > 20) {
      errors.push({ field: 'username', message: 'Username must be less than 20 characters' })
    } else if (!usernameRegex.test(formData.username)) {
      errors.push({ field: 'username', message: 'Username can only contain letters, numbers, and underscores' })
    }
    
    // Check for common usernames
    const commonUsernames = ['admin', 'root', 'user', 'test', 'guest', 'administrator']
    if (commonUsernames.includes(formData.username.toLowerCase())) {
      errors.push({ field: 'username', message: 'This username is not allowed' })
    }
  }
  
  // Email validation
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' })
  }
  
  if (mode === 'register') {
    // Password strength validation
    if (!formData.password || formData.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' })
    } else {
      const pwd = formData.password
      if (!passwordRequirements.hasUppercase) {
        errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' })
      }
      if (!passwordRequirements.hasLowercase) {
        errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' })
      }
      if (!passwordRequirements.hasNumber) {
        errors.push({ field: 'password', message: 'Password must contain at least one number' })
      }
      if (!passwordRequirements.hasSpecial) {
        errors.push({ field: 'password', message: 'Password must contain at least one special character' })
      }
    }
    
    // Check for common passwords
    const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'letmein']
    if (commonPasswords.includes(formData.password.toLowerCase())) {
      errors.push({ field: 'password', message: 'This password is too common. Please choose a stronger password' })
    }
  }
  
  if (!formData.password) {
    errors.push({ field: 'password', message: 'Password is required' })
  }
  
  return errors
}

/**
 * LandingPage - Welcome screen with register/login
 * Users can register or sign in to access the app
 */
const LandingPage = () => {
  const [mode, setMode] = useState('landing') // 'landing' | 'login' | 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(null)
  const [lastAttemptTime, setLastAttemptTime] = useState(0)
  
  // Rate limit configuration
  const MAX_LOGIN_ATTEMPTS = 5
  const LOCKOUT_DURATION = 60000 // 60 seconds in milliseconds
  const ATTEMPT_WINDOW = 300000 // 5 minutes in milliseconds
  
  const { register, login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Password strength (only in register mode)
  const passwordStrength = mode === 'register' ? checkPasswordStrength(formData.password) : null

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    
    // Check for rate limit lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000)
      setError(`Too many login attempts. Please try again in ${remainingSeconds} seconds.`)
      return
    }
    
    // Clear lockout if expired
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null)
      setLoginAttempts(0)
    }
    
    // Validate form
    const validationErrors = validateForm(formData, mode)
    if (validationErrors.length > 0) {
      const newErrors = {}
      validationErrors.forEach(err => {
        newErrors[err.field] = err.message
      })
      setErrors(newErrors)
      return
    }
    
    setIsLoading(true)

    let result
    if (mode === 'register') {
      result = await register(formData.username, formData.email, formData.password)
    } else {
      // Login mode - track attempts
      const now = Date.now()
      
      // Reset attempts if outside the attempt window
      if (now - lastAttemptTime > ATTEMPT_WINDOW) {
        setLoginAttempts(1)
        setLastAttemptTime(now)
      } else {
        setLoginAttempts(prev => prev + 1)
      }
      
      result = await login(formData.email, formData.password)
      
      // If login failed, check if we need to lockout
      if (!result.success) {
        const currentAttempts = mode === 'login' ? loginAttempts + 1 : 0
        
        if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_DURATION)
          setError(`Too many failed login attempts. Please try again in ${LOCKOUT_DURATION / 1000} seconds.`)
        } else {
          const attemptsRemaining = MAX_LOGIN_ATTEMPTS - currentAttempts
          setError(`Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`)
        }
      }
    }

    setIsLoading(false)

    if (result.success) {
      // Reset rate limiting on successful login
      setLoginAttempts(0)
      setLockoutUntil(null)
      navigate('/dashboard')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setError('')
  }

  // Landing view
  if (mode === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 50%, #0a0a0f 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Suspense fallback={<LandingCanvasLoader />}>
          <LandingCanvas />
        </Suspense>
        
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <header style={{
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #00d4ff20, #8b5cf620)',
              border: '1px solid #00d4ff30',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#00d4ff',
            }}>
              ψ
            </div>
            <div>
              <div style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                color: '#fff',
                letterSpacing: '3px',
                fontFamily: 'Orbitron, sans-serif',
              }}>
                QUANTARA
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#00d4ff80',
                letterSpacing: '2px',
              }}>
                QUANTUM COMPUTING
              </div>
            </div>
          </div>
        </header>

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '20px',
              marginBottom: '24px',
              color: '#00d4ff',
              fontSize: '14px',
            }}>
              <Sparkles size={16} aria-hidden="true" />
              <span>Learn Quantum Computing Interactively</span>
            </div>

            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '56px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '24px',
              lineHeight: 1.2,
            }}>
              Master the Future of
              <span style={{
                background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}> Computing</span>
            </h1>

            <p style={{
              fontSize: '20px',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}>
              Explore quantum mechanics through interactive simulations, 
              build quantum circuits, and unlock the power of superposition and entanglement.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '48px',
            }}>
              {[
                { icon: Cpu, text: 'Interactive Qubits', color: '#00d4ff' },
                { icon: Globe, text: 'Quantum Circuits', color: '#8b5cf6' },
                { icon: BookOpen, text: 'Algorithms', color: '#ec4899' },
                { icon: Zap, text: 'Hands-on Labs', color: '#f59e0b' },
              ].map((feature, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#f0f9ff',
                  fontSize: '14px',
                }}>
                  <feature.icon size={18} color={feature.color} />
                  {feature.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setMode('register')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: '1px solid #00d4ff',
                  background: 'linear-gradient(135deg, #00d4ff20, #8b5cf620)',
                  color: '#00d4ff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => setMode('login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: '1px solid #1a1a2e',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text-secondary)',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              display: 'flex',
              gap: '60px',
              marginTop: '60px',
              padding: '24px 40px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {[
              { value: '50+', label: 'Quantum Gates' },
              { value: '10+', label: 'Algorithms' },
              { value: '100+', label: 'Challenges' },
              { value: '∞', label: 'Possibilities' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#00d4ff',
                  fontFamily: 'Orbitron, sans-serif',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </main>

        <footer style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px',
          position: 'relative',
          zIndex: 1,
        }}>
          © 2026 Quantara. Exploring the quantum frontier.
        </footer>
      </div>
    )
  }

  // Login/Register form
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#111827',
        border: '1px solid #1a1a2e',
        borderRadius: '20px',
        padding: '48px',
        width: '440px',
        maxWidth: '90vw',
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={() => { setMode('landing'); setError(''); }}
          style={{
            position: 'absolute',
            top: '16px',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}>
            ψ
          </div>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#f0f9ff',
            marginBottom: '8px',
          }}>
            {mode === 'login' ? 'Welcome Back' : 'Join Quantara'}
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
          }}>
            {mode === 'login' 
              ? 'Sign in to continue your quantum journey' 
              : 'Create an account to start learning'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '20px',
              color: '#ef4444',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
            <XCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
              }}>
                Username
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.username ? '#ef4444' : '#64748b',
                  }}
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  minLength={3}
                  maxLength={20}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    borderRadius: '8px',
                    border: `1px solid ${errors.username ? '#ef4444' : '#1a1a2e'}`,
                    background: '#1a2332',
                    color: '#f0f9ff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                />
              </div>
              {/* Field error */}
              {errors.username && (
                <div style={{
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ef4444',
                  fontSize: '12px',
                }}>
                  <XCircle size={14} />
                  {errors.username}
                </div>
              )}
              {/* Validation success */}
              {mode === 'register' && formData.username.length >= 3 && formData.username.length <= 20 && (
                <div style={{
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10b981',
                  fontSize: '12px',
                }}>
                  <CheckCircle size={14} />
                  Username available
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.email ? '#ef4444' : '#64748b',
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.email ? '#ef4444' : '#1a1a2e'}`,
                  background: '#1a2332',
                  color: '#f0f9ff',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>
            {/* Field error */}
            {errors.email && (
              <div style={{
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ef4444',
                fontSize: '12px',
              }}>
                <XCircle size={14} />
                {errors.email}
              </div>
            )}
            {/* Validation success */}
            {formData.email && /\S+@\S+\.\S+/.test(formData.email) && (
              <div style={{
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#10b981',
                fontSize: '12px',
              }}>
                <CheckCircle size={14} />
                Valid email
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.password ? '#ef4444' : '#64748b',
                  zIndex: 2,
                  flexShrink: 0,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={mode === 'register' ? 'Create a password' : 'Enter password'}
                required
                minLength={8}
                aria-invalid={errors.password ? 'true' : 'false'}
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 40px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.password ? '#ef4444' : '#1a1a2e'}`,
                  background: '#1a2332',
                  color: '#f0f9ff',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setShowPassword(!showPassword)
                  }
                }}
                style={{
                  marginLeft: '-36px',
                  background: 'none',
                  border: 'none',
                  color: showPassword ? '#8b5cf6' : '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  borderRadius: '4px',
                  transition: 'color 0.2s ease, background-color 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password strength indicator - only in register mode */}
            {mode === 'register' && formData.password && (
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Password Strength</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: passwordStrength.color,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: '#1a1a2e',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${passwordStrength.percentage}%`,
                    height: '100%',
                    background: passwordStrength.color,
                    transition: 'all 0.3s ease',
                  }} />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul style={{
                    marginTop: '8px',
                    paddingLeft: '16px',
                    fontSize: '11px',
                    color: '#64748b',
                  }}>
                    {passwordStrength.feedback.map((item, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {/* Field-specific error message */}
            {errors.password && (
              <div style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ef4444',
                fontSize: '12px',
              }}>
                <XCircle size={14} />
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #00d4ff',
              background: 'linear-gradient(135deg, #00d4ff20, #8b5cf620)',
              color: '#00d4ff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
        }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4ff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
