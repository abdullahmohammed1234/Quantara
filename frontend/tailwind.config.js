/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          cyan: '#00d4ff',
          'cyan-light': '#38d9ff',
          'cyan-dark': '#00a8cc',
          purple: '#8b5cf6',
          'purple-light': '#a78bfa',
          'purple-dark': '#7c3aed',
          gold: '#f59e0b',
          emerald: '#10b981',
          navy: '#0a0e17',
          'navy-light': '#111827',
          'navy-lighter': '#1a2332',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-intense': '0 0 30px rgba(0, 212, 255, 0.7), 0 0 60px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.5)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.7), 0 0 60px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.9), 0 0 80px rgba(139, 92, 246, 0.5)' },
        },
        'fadeIn': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
}
