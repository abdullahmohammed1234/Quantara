import { forwardRef } from "react"
import { cn } from "../../lib/utils"

const Card = forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-quantum-navy-light/70 border border-quantum-cyan/20 backdrop-blur-glass",
    glass: "bg-glass border border-quantum-cyan/15 backdrop-blur-xl",
    glow: "bg-quantum-navy-light/80 border border-quantum-cyan/30 shadow-glow-cyan backdrop-blur-glass",
    purple: "bg-quantum-purple/10 border border-quantum-purple/30 backdrop-blur-glass",
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  >
    {children}
  </div>
))

CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-orbitron text-lg font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  >
    {children}
  </h3>
))

CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-400", className)}
    {...props}
  >
    {children}
  </p>
))

CardDescription.displayName = "CardDescription"

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
))

CardContent.displayName = "CardContent"

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  >
    {children}
  </div>
))

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
