import { forwardRef } from "react"
import { cn } from "../../lib/utils"

/**
 * FeatureCard Component - Reusable feature display card
 * Used in HomePage for displaying navigation features
 * 
 * @param {string} icon - The icon to display (emoji or text)
 * @param {string} title - The title of the feature
 * @param {string} description - The description of the feature
 * @param {string} color - The accent color for the feature (hex)
 * @param {string} path - The navigation path (optional - makes card clickable)
 * @param {function} onClick - Click handler (optional)
 * @param {string} className - Additional CSS classes
 */
const FeatureCard = forwardRef(({ 
  icon,
  title,
  description,
  color = '#00d4ff',
  path,
  onClick,
  className,
  ...props 
}, ref) => {
  const isClickable = !!(path || onClick)
  
  const cardContent = (
    <>
      {/* Corner accent */}
      <div 
        className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2"
        style={{ 
          borderColor: color,
          opacity: 0.5,
        }}
      />
      
      {/* Icon */}
      <div 
        className="text-3xl mb-4"
        style={{ 
          color,
          filter: `drop-shadow(0 0 10px ${color})`,
        }}
      >
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="font-orbitron text-base text-white font-semibold mb-2">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {description}
      </p>
    </>
  )
  
  if (path) {
    return (
      <a
        href={path}
        ref={ref}
        className={cn(
          "feature-card",
          "block bg-quantum-navy-light/70 border border-quantum-cyan/10 rounded-xl p-6",
          "cursor-pointer transition-all duration-200",
          "relative overflow-hidden",
          className
        )}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = `${color}50`
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.1)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
        {...props}
      >
        {cardContent}
      </a>
    )
  }
  
  if (onClick) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "feature-card",
          "w-full text-left bg-quantum-navy-light/70 border border-quantum-cyan/10 rounded-xl p-6",
          "cursor-pointer transition-all duration-200",
          "relative overflow-hidden",
          className
        )}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = `${color}50`
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.1)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
        {...props}
      >
        {cardContent}
      </button>
    )
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "feature-card",
        "bg-quantum-navy-light/70 border border-quantum-cyan/10 rounded-xl p-6",
        "transition-all duration-200",
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      {cardContent}
    </div>
  )
})

FeatureCard.displayName = "FeatureCard"

/**
 * FeatureCardsGrid Component - Container for multiple feature cards
 * Provides responsive grid layout
 */
const FeatureCardsGrid = forwardRef(({ 
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
  }[columns] || 'grid-cols-4'
  
  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-4",
        gridClass,
        className
      )}
      style={{ gap }}
      {...props}
    >
      {children}
    </div>
  )
})

FeatureCardsGrid.displayName = "FeatureCardsGrid"

export { FeatureCard, FeatureCardsGrid }