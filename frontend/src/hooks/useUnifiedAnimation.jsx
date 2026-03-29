import { useAnimation } from 'framer-motion'

/**
 * Unified Animation Hook
 * Provides standardized animation configurations for Framer Motion
 * Use this instead of inline animation configs to ensure consistency
 */

// Animation presets matching the visualEffects.css tokens
export const animationPresets = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInFast: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },
  fadeInSlow: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  scaleInBounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { 
      duration: 0.5, 
      ease: [0.68, -0.55, 0.265, 1.55] // bounce easing
    },
  },

  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Stagger container for lists
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  staggerContainerFast: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  },
  staggerContainerSlow: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  },

  // Stagger items
  staggerItem: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  },
}

/**
 * Hook to use unified animations
 * @param {keyof animationPresets} preset - The animation preset to use
 * @param {object} customOptions - Override any preset values
 * @returns {object} Animation config for Framer Motion
 */
export const useUnifiedAnimation = (preset, customOptions = {}) => {
  const basePreset = animationPresets[preset] || animationPresets.fadeIn
  return { ...basePreset, ...customOptions }
}

/**
 * Transition presets for consistent timing
 */
export const transitionPresets = {
  instant: { duration: 0.1 },
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  slower: { duration: 0.8 },
  
  smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  bounce: { duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] },
  
  // Spring-based transitions for physics-like feel
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
}

/**
 * Stagger delays for list animations
 */
export const staggerDelays = {
  none: 0,
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  slower: 0.2,
}

export default animationPresets