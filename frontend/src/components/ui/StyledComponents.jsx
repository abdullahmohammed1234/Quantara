/**
 * Reusable Styled Components
 * Encapsulates common pattern duplicates (gradient backgrounds, borders, border-radius)
 */

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn, gradientBg, glassEffect, quantumBorder, quantumGlow, borderRadius, textColor } from "../../lib/utils"

// ============================================
// Container Components
// ============================================

/**
 * QuantumContainer - Base container with gradient background
 */
export const QuantumContainer = forwardRef(({ 
  className, 
  gradient = 'cyan-purple',
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(gradientBg('vertical', gradient), 'p-6', className)}
    {...props}
  >
    {children}
  </div>
))

QuantumContainer.displayName = "QuantumContainer"

/**
 * SectionContainer - Page section with consistent spacing
 */
export const SectionContainer = forwardRef(({ 
  className, 
  title,
  subtitle,
  children,
  action,
  ...props 
}, ref) => (
  <section ref={ref} className={cn('mb-8', className)} {...props}>
    {(title || action) && (
      <div className="flex items-start justify-between mb-6">
        <div>
          {title && (
            <h2 className="text-xl font-orbitron font-semibold text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
))

SectionContainer.displayName = "SectionContainer"

/**
 * GlassPanel - Glassmorphism panel
 */
export const GlassPanel = forwardRef(({ 
  className, 
  intensity = 'medium',
  borderColor = 'cyan',
  children, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      glassEffect(intensity),
      quantumBorder(borderColor),
      'p-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
))

GlassPanel.displayName = "GlassPanel"

// ============================================
// Display Components
// ============================================

/**
 * PageHeader - Standard page header
 */
export const PageHeader = forwardRef(({ 
  className, 
  title,
  subtitle,
  icon,
  children,
  ...props
}, ref) => (
  <div ref={ref} className={cn('mb-8', className)} {...props}>
    <h1 className={cn(
      'text-3xl font-orbitron font-bold text-white',
      'flex items-center gap-3',
      'mb-2'
    )}>
      {icon && <span>{icon}</span>}
      {title}
    </h1>
    {subtitle && (
      <p className="text-slate-400 text-sm">{subtitle}</p>
    )}
    {children}
  </div>
))

PageHeader.displayName = "PageHeader"

/**
 * StatCard - Display statistics with label, value, unit
 */
export const StatCard = forwardRef(({ 
  className,
  label,
  value,
  unit,
  trend,
  icon: Icon,
  color = 'cyan',
  ...props
}, ref) => {
  const colorClasses = {
    cyan: 'text-quantum-cyan',
    purple: 'text-quantum-purple',
    gold: 'text-quantum-gold',
    emerald: 'text-quantum-emerald',
  }

  return (
    <GlassPanel className={cn('p-4', className)} borderColor={color} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
            {label}
          </p>
          <p className={cn('text-2xl font-orbitron font-bold', colorClasses[color])}>
            {value}
            {unit && <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={cn('p-2 rounded-lg bg-quantum-navy/50', colorClasses[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-2 text-xs">
          <span className={trend >= 0 ? 'text-quantum-emerald' : 'text-red-400'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500 ml-1">vs last run</span>
        </div>
      )}
    </GlassPanel>
  )
})

StatCard.displayName = "StatCard"

/**
 * FeatureCard - Card for displaying features
 */
export const FeatureCard = forwardRef(({ 
  className,
  icon,
  title,
  description,
  color = '#00d4ff',
  onClick,
  ...props
}, ref) => (
  <motion.div
    ref={ref}
    className={cn(
      'relative p-6 rounded-2xl cursor-pointer',
      'bg-quantum-navy-light/50 border border-quantum-cyan/20',
      'backdrop-blur-glass transition-all duration-300',
      'hover:bg-quantum-navy-light/70 hover:border-quantum-cyan/40 hover:shadow-glow-cyan',
      'hover:-translate-y-1',
      className
    )}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    {...props}
  >
    <div className="flex items-start gap-4">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ 
          backgroundColor: `${color}20`,
          border: `1px solid ${color}40`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
  </motion.div>
))

FeatureCard.displayName = "FeatureCard"

// ============================================
// Grid Components
// ============================================

/**
 * StatsGrid - 4-column grid for stats
 */
export const StatsGrid = ({ className, children }) => (
  <div className={cn(
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    className
  )}>
    {children}
  </div>
)

/**
 * FeaturesGrid - Responsive grid for feature cards
 */
export const FeaturesGrid = ({ className, children }) => (
  <div className={cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    className
  )}>
    {children}
  </div>
)

// ============================================
// Animated Components
// ============================================

/**
 * AnimatedCard - Card with hover animations
 */
export const AnimatedCard = forwardRef(({ 
  className,
  hoverFloat = true,
  glowColor = 'cyan',
  children,
  ...props
}, ref) => (
  <motion.div
    ref={ref}
    className={cn(
      'relative rounded-2xl border backdrop-blur-xl overflow-hidden',
      quantumBorder(glowColor, 'medium', false),
      quantumGlow(glowColor, 'subtle'),
      hoverFloat && 'hover:-translate-y-1 transition-transform duration-300',
      'p-6',
      className
    )}
    whileHover={{ scale: 1.01 }}
    {...props}
  >
    {children}
  </motion.div>
))

AnimatedCard.displayName = "AnimatedCard"

/**
 * FadeIn - Fade in animation wrapper
 */
export const FadeIn = ({ children, delay = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
)

// ============================================
// Utility Components
// ============================================

/**
 * Divider - Horizontal divider with optional text
 */
export const Divider = ({ text, className }) => (
  <div className={cn('flex items-center gap-4 my-6', className)}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-quantum-cyan/30 to-transparent" />
    {text && (
      <span className="text-xs text-slate-500 uppercase tracking-wider">{text}</span>
    )}
    {text && (
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-quantum-cyan/30 to-transparent" />
    )}
  </div>
)

/**
 * Badge - Status/badge component
 */
export const Badge = forwardRef(({ 
  className,
  variant = 'default',
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan/30',
    purple: 'bg-quantum-purple/20 text-quantum-purple-light border-quantum-purple/30',
    gold: 'bg-quantum-gold/20 text-quantum-gold border-quantum-gold/30',
    emerald: 'bg-quantum-emerald/20 text-quantum-emerald border-quantum-emerald/30',
    subtle: 'bg-slate-800/50 text-slate-400 border-slate-700/50',
  }

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = "Badge"

/**
 * Label - Form label component
 */
export const Label = ({ className, children, ...props }) => (
  <label
    className={cn(
      'text-xs uppercase tracking-wider text-slate-400 font-medium',
      className
    )}
    {...props}
  >
    {children}
  </label>
)

/**
 * Value - Display value component
 */
export const Value = ({ className, children, color = 'cyan', ...props }) => {
  const colors = {
    cyan: 'text-quantum-cyan',
    purple: 'text-quantum-purple',
    gold: 'text-quantum-gold',
    emerald: 'text-quantum-emerald',
    white: 'text-white',
  }

  return (
    <span className={cn('font-orbitron text-sm', colors[color], className)} {...props}>
      {children}
    </span>
  )
}

// ============================================
// Export all
// ============================================

export default {
  QuantumContainer,
  SectionContainer,
  GlassPanel,
  PageHeader,
  StatCard,
  FeatureCard,
  StatsGrid,
  FeaturesGrid,
  AnimatedCard,
  FadeIn,
  Divider,
  Badge,
  Label,
  Value,
}