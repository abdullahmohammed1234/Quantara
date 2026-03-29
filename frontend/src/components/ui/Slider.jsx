import { forwardRef } from "react"
import { cn } from "../../lib/utils"

const Slider = forwardRef(({ 
  className, 
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "[&::-webkit-slider-thumb]:bg-quantum-cyan [&::-webkit-slider-thumb]:shadow-glow-cyan [&::-webkit-slider-runnable-track]:bg-quantum-navy-lighter",
    purple: "[&::-webkit-slider-thumb]:bg-quantum-purple [&::-webkit-slider-thumb]:shadow-glow-purple [&::-webkit-slider-runnable-track]:bg-quantum-navy-lighter",
    gold: "[&::-webkit-slider-thumb]:bg-quantum-gold [&::-webkit-slider-thumb]:shadow-glow-gold [&::-webkit-slider-runnable-track]:bg-quantum-navy-lighter",
  }

  return (
    <div className="relative w-full">
      <input
        type="range"
        className={cn(
          "flex h-2 w-full cursor-pointer appearance-none rounded-full bg-quantum-navy-lighter accent-quantum-cyan transition-all",
          "hover:accent-quantum-cyan/80",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/50",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
})

Slider.displayName = "Slider"

// Quantum-specific theta/phi slider with label
const QuantumSlider = forwardRef(({ 
  label, 
  value, 
  min = 0, 
  max = 360,
  unit = "°",
  variant = "default",
  onChange,
  className,
  ...props 
}, ref) => {
  const percentage = ((value - min) / (max - min)) * 100
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          {label}
        </label>
        <span className="font-orbitron text-sm text-quantum-cyan">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-2 w-full cursor-pointer appearance-none rounded-full bg-quantum-navy-lighter accent-quantum-cyan transition-all",
            "hover:accent-quantum-cyan/80",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/50",
            variant === "purple" && "[&::-webkit-slider-thumb]:bg-quantum-purple [&::-webkit-slider-thumb]:shadow-glow-purple",
            variant === "gold" && "[&::-webkit-slider-thumb]:bg-quantum-gold [&::-webkit-slider-thumb]:shadow-glow-gold"
          )}
          ref={ref}
          {...props}
        />
        {/* Progress fill */}
        <div 
          className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-quantum-cyan/50 to-quantum-purple/50"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
})

QuantumSlider.displayName = "QuantumSlider"

export { Slider, QuantumSlider }
