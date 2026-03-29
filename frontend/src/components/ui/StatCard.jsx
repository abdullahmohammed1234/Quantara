import { forwardRef } from "react"
import { cn } from "../../lib/utils"

/**
 * StatCard Component - Reusable stats display card
 * Used in HomePage for displaying system metrics
 * 
 * @param {string} label - The label for the stat
 * @param {string|number} value - The value to display
 * @param {string} color - The accent color for the value (hex)
 * @param {string} variant - The stat variant: 'blue', 'purple', 'orange', 'green'
 * @param {string} icon - Optional icon to display
 * @param {string} className - Additional CSS classes
 */

// Gradient and glow configurations per variant
const VARIANT_STYLES = {
  blue: {
    gradient: 'linear-gradient(135deg, rgba(0, 180, 255, 0.15) 0%, rgba(0, 60, 180, 0.1) 100%)',
    border: 'rgba(0, 180, 255, 0.25)',
    glow: '0 0 20px rgba(0, 180, 255, 0.15), 0 4px 40px rgba(0, 180, 255, 0.05)',
    accent: '#00b4ff',
  },
  purple: {
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(90, 40, 180, 0.1) 100%)',
    border: 'rgba(139, 92, 246, 0.25)',
    glow: '0 0 20px rgba(139, 92, 246, 0.15), 0 4px 40px rgba(139, 92, 246, 0.05)',
    accent: '#8b5cf6',
  },
  orange: {
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 100, 20, 0.1) 100%)',
    border: 'rgba(245, 158, 11, 0.25)',
    glow: '0 0 20px rgba(245, 158, 11, 0.15), 0 4px 40px rgba(245, 158, 11, 0.05)',
    accent: '#f59e0b',
  },
  green: {
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(40, 120, 80, 0.1) 100%)',
    border: 'rgba(16, 185, 129, 0.25)',
    glow: '0 0 20px rgba(16, 185, 129, 0.15), 0 4px 40px rgba(16, 185, 129, 0.05)',
    accent: '#10b981',
  },
  default: {
    gradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 180, 0.08) 100%)',
    border: 'rgba(0, 212, 255, 0.2)',
    glow: '0 0 15px rgba(0, 212, 255, 0.1)',
    accent: '#00d4ff',
  },
}

const StatCard = forwardRef(({ 
  label, 
  value, 
  color = '#00d4ff',
  variant = 'default',
  icon,
  className,
  ...props 
}, ref) => {
  // Get variant styles or fall back to default
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default
  const displayColor = color || variantStyle.accent
  
  return (
    <div
      ref={ref}
      className={cn(
        "stat-card",
        "rounded-2xl p-5 transition-all duration-200 backdrop-blur-sm",
        className
      )}
      style={{
        background: variantStyle.gradient,
        border: `1px solid ${variantStyle.border}`,
        boxShadow: variantStyle.glow,
      }}
      {...props}
    >
      {/* Label */}
      <div className={cn(
        "text-xs tracking-wider text-slate-400 uppercase mb-2",
        "font-medium"
      )}>
        {label}
      </div>
      
      {/* Value */}
      <div 
        className="font-orbitron text-3xl font-bold"
        style={{ 
          color: displayColor,
          textShadow: `0 0 20px ${displayColor}50`,
        }}
      >
        {icon && (
          <span 
            className="inline-block mr-2"
            style={{ color: displayColor }}
          >
            {icon}
          </span>
        )}
        {value}
      </div>
    </div>
  )
})

StatCard.displayName = "StatCard"

/**
 * StatsGrid Component - Container for multiple stat cards
 * Provides responsive grid layout
 */
const StatsGrid = forwardRef(({ 
  children, 
  className,
  columns = 4,
  gap = '16px',
  ...props 
}, ref) => {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }[columns] || 'grid-cols-4'
  
  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-4",
        gridClass,
        className
      )}
      style={{ gap, marginBottom: '40px' }}
      {...props}
    >
      {children}
    </div>
  )
})

StatsGrid.displayName = "StatsGrid"

export { StatCard, StatsGrid }