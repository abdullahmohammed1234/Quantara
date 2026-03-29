import { forwardRef, useState } from "react"
import { cn } from "../../lib/utils"

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  loading = false,
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-quantum-cyan/20 border border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/30 hover:shadow-glow-cyan",
    secondary: "bg-quantum-purple/20 border border-quantum-purple/30 text-quantum-purple-light hover:bg-quantum-purple/30 hover:shadow-glow-purple",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    gold: "bg-quantum-gold/20 border border-quantum-gold/30 text-quantum-gold hover:bg-quantum-gold/30 hover:shadow-glow-gold",
    emerald: "bg-quantum-emerald/20 border border-quantum-emerald/30 text-quantum-emerald hover:bg-quantum-emerald/30",
    danger: "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:shadow-glow-red",
  }

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  }

  const isDisabled = disabled || loading

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quantum-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button }
