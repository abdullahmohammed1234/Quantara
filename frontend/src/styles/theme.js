/**
 * Quantara Theme Constants
 * Centralized theme values for colors, spacing, sizes, and other design tokens
 * Used throughout the application instead of hardcoded values
 */

// ============== COLORS ==============

// Primary Colors
export const Colors = {
  // Background colors
  bgPrimary: '#0a0e17',
  bgSecondary: '#111827',
  bgTertiary: '#1a2332',
  bgDark: '#0d0d14',
  bgDarker: '#12121a',
  
  // Accent colors - Quantum theme
  accentPrimary: '#00d4ff',    // Cyan
  accentSecondary: '#8b5cf6', // Purple
  accentTertiary: '#06b6d4',  // Teal
  
  // Semantic colors
  success: '#10b981',         // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
  info: '#3b82f6',           // Blue
  
  // Text colors
  textPrimary: '#f0f9ff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Border colors
  borderDefault: '#1a1a2e',
  borderLight: '#2a2a3e',
  borderAccent: 'rgba(0, 212, 255, 0.3)',
}

// Brand Colors (for specific components)
export const BrandColors = {
  quantum: {
    cyan: '#00d4ff',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#06b6d4',
    amber: '#f59e0b',
    green: '#10b981',
  }
}

// ============== SPACING ==============

export const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '60px',
}

// ============== SIZES ==============

export const Sizes = {
  // Sidebar
  sidebarWidth: '260px',
  sidebarMobileWidth: '280px',
  
  // Border radius
  radiusSm: '4px',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusXl: '16px',
  radiusFull: '20px',
  radiusFuller: '24px',
  
  // Container sizes
  maxWidth: '1200px',
  tutorPanelWidth: '380px',
}

// ============== TYPOGRAPHY ==============

export const Typography = {
  // Font families
  fontDisplay: "'Orbitron', sans-serif",
  fontBody: "'Rajdhani', sans-serif",
  
  // Font sizes (for reference - use CSS variables in components)
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '36px',
    '6xl': '42px',
    '7xl': '56px',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '0.1em',
    widest: '0.2em',
  }
}

// ============== LAYOUT ==============

export const Layout = {
  headerHeight: '64px',
  sidebarWidth: '260px',
  contentPadding: '32px',
  
  // Breakpoints (matching Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
}

// ============== EFFECTS ==============

export const Effects = {
  // Shadows/Glows
  glow: {
    subtle: '0 0 8px rgba(0, 212, 255, 0.3)',
    default: '0 0 15px rgba(0, 212, 255, 0.4)',
    medium: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)',
    intense: '0 0 30px rgba(0, 212, 255, 0.7), 0 0 60px rgba(139, 92, 246, 0.3)',
    extreme: '0 0 50px rgba(0, 212, 255, 0.9), 0 0 100px rgba(139, 92, 246, 0.5)',
  },
  
  // Status indicator glows
  statusGlow: {
    green: '0 0 10px #10b981',
    cyan: '0 0 10px #00d4ff',
    purple: '0 0 10px #8b5cf6',
  },
  
  // Gradients
  gradient: {
    sidebar: 'linear-gradient(180deg, #0d0d14 0%, #12121a 100%)',
    card: 'linear-gradient(135deg, #12121a, #0d0d14)',
    accent: 'linear-gradient(90deg, #00d4ff, #8b5cf6)',
    hero: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 50%, #0a0a0f 100%)',
    shimmer: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
  },
  
  // Transitions
  transition: {
    fast: '0.15s ease',
    default: '0.2s ease',
    slow: '0.3s ease',
  }
}

// ============== Z-INDEX ==============

export const ZIndex = {
  base: '0',
  dropdown: '100',
  sticky: '200',
  modal: '300',
  popover: '400',
  tooltip: '500',
  overlay: '999',
  mobileMenu: '1000',
  sidebar: '1000',
  hamburger: '1001',
}

// ============== ANIMATION ==============

export const Animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  keyframes: {
    spin: 'spin 1s linear infinite',
    pulse: 'pulse 2s ease-in-out infinite',
    shimmer: 'shimmer 1.5s infinite',
  }
}

// ============== UTILITY HELPERS ==============

/**
 * Creates a colored glow effect for status indicators
 */
export const getStatusGlow = (color) => `0 0 10px ${color}`

/**
 * Creates a gradient background with specified colors
 */
export const createGradient = (colors, direction = '135deg') => 
  `linear-gradient(${direction}, ${colors.join(', ')})`

/**
 * Creates a glassmorphism style object
 */
export const glassStyle = {
  background: 'rgba(17, 24, 39, 0.7)',
  border: '1px solid rgba(0, 212, 255, 0.2)',
  backdropFilter: 'blur(12px)',
}

/**
 * Default export for easy importing
 */
const Theme = {
  Colors,
  BrandColors,
  Spacing,
  Sizes,
  Typography,
  Layout,
  Effects,
  ZIndex,
  Animation,
  getStatusGlow,
  createGradient,
  glassStyle,
}

export default Theme