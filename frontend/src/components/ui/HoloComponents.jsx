// Holographic UI Components - Enhanced Quantum Design System

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

// Holographic Card - Floating, glassmorphic cards with glow effects
const HoloCard = forwardRef(({ 
  className, 
  variant = "default",
  children, 
  glowColor = "cyan",
  hoverFloat = true,
  ...props 
}, ref) => {
  const glowColors = {
    cyan: {
      border: "border-quantum-cyan/30",
      bg: "bg-quantum-cyan/5",
      glow: "hover:shadow-glow-cyan",
      shine: "before:bg-gradient-to-r before:from-transparent before:via-quantum-cyan/10 before:to-transparent"
    },
    purple: {
      border: "border-quantum-purple/30",
      bg: "bg-quantum-purple/5",
      glow: "hover:shadow-glow-purple",
      shine: "before:bg-gradient-to-r before:from-transparent before:via-quantum-purple/10 before:to-transparent"
    },
    gold: {
      border: "border-quantum-gold/30",
      bg: "bg-quantum-gold/5",
      glow: "hover:shadow-glow-gold",
      shine: "before:bg-gradient-to-r before:from-transparent before:via-quantum-gold/10 before:to-transparent"
    }
  }

  const style = glowColors[glowColor] || glowColors.cyan

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative rounded-2xl border backdrop-blur-xl overflow-hidden",
        "before:absolute before:inset-0 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        style.border, style.bg, style.glow, style.shine,
        hoverFloat && "hover:-translate-y-1 transition-transform duration-300",
        className
      )}
      whileHover={{ scale: 1.01 }}
      {...props}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-quantum-cyan/30 to-transparent animate-scan-line opacity-50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  )
})

HoloCard.displayName = "HoloCard"

// Holographic Button - Glowing buttons with ripple effect
const HoloButton = forwardRef(({ 
  className, 
  variant = "primary",
  size = "default",
  children, 
  glowColor = "cyan",
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-quantum-cyan/20 border border-quantum-cyan/40 text-quantum-cyan hover:bg-quantum-cyan/30 hover:shadow-glow-cyan",
    secondary: "bg-quantum-purple/20 border border-quantum-purple/40 text-quantum-purple-light hover:bg-quantum-purple/30 hover:shadow-glow-purple",
    ghost: "border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20",
    gold: "bg-quantum-gold/20 border border-quantum-gold/40 text-quantum-gold hover:bg-quantum-gold/30 hover:shadow-glow-gold",
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  }

  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl font-medium transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
})

HoloButton.displayName = "HoloButton"

// Holographic Input - Glowing input fields
const HoloInput = forwardRef(({ 
  className, 
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-black/40 border border-quantum-cyan/20 text-white placeholder:text-slate-500 focus:border-quantum-cyan/50 focus:shadow-glow-cyan",
    glass: "bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:border-quantum-purple/50",
  }

  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border px-4 py-2 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/30",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})

HoloInput.displayName = "HoloInput"

// Holographic Slider - Quantum sliders with glow
const HoloSlider = forwardRef(({ 
  className,
  glowColor = "cyan",
  ...props 
}, ref) => {
  return (
    <div className="relative w-full">
      <input
        type="range"
        ref={ref}
        className={cn(
          "w-full h-2 rounded-full appearance-none cursor-pointer",
          "bg-quantum-navy-lighter",
          glowColor === "cyan" && "[&::-webkit-slider-thumb]:bg-quantum-cyan [&::-webkit-slider-thumb]:shadow-glow-cyan [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full",
          glowColor === "purple" && "[&::-webkit-slider-thumb]:bg-quantum-purple [&::-webkit-slider-thumb]:shadow-glow-purple [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full",
          glowColor === "gold" && "[&::-webkit-slider-thumb]:bg-quantum-gold [&::-webkit-slider-thumb]:shadow-glow-gold [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full",
          className
        )}
        {...props}
      />
    </div>
  )
})

HoloSlider.displayName = "HoloSlider"

// Stat Card - For displaying quantum statistics
const StatCard = ({ label, value, unit, trend, icon: Icon, color = "cyan" }) => {
  const colors = {
    cyan: "text-quantum-cyan",
    purple: "text-quantum-purple",
    gold: "text-quantum-gold",
    emerald: "text-quantum-emerald",
  }

  return (
    <HoloCard glowColor={color} className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          <p className={cn("text-2xl font-orbitron font-bold", colors[color])}>
            {value}
            {unit && <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-quantum-navy/50", colors[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-2 text-xs">
          <span className={trend >= 0 ? "text-quantum-emerald" : "text-red-400"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500 ml-1">vs last run</span>
        </div>
      )}
    </HoloCard>
  )
}

// Section Header with holographic styling
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-xl font-orbitron font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
)

export { HoloCard, HoloButton, HoloInput, HoloSlider, StatCard, SectionHeader }
