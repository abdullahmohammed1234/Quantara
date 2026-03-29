import { forwardRef } from "react"
import { cn } from "../../lib/utils"

const Input = forwardRef(({ 
  className, 
  variant = "default",
  status = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-black/30 border border-quantum-cyan/20 text-white placeholder:text-slate-500 focus:border-quantum-cyan/50 focus:shadow-glow-cyan",
    glass: "bg-quantum-navy/50/50 border border-white/10 text-white placeholder:text-slate-400 focus:border-quantum-cyan/40 focus:bg-quantum-navy/70",
  }

  const statusStyles = {
    default: "",
    error: "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30 focus:shadow-glow-red",
    success: "border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/30 focus:shadow-glow-emerald",
    warning: "border-yellow-500/50 focus:border-yellow-500/50 focus:ring-yellow-500/30",
  }

  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border px-4 py-2 text-sm font-normal transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        statusStyles[status],
        className
      )}
      ref={ref}
      aria-invalid={status === "error"}
      aria-describedby={props.id ? `${props.id}-description` : undefined}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
