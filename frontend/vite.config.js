import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunk configuration for code splitting
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
        }
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate source maps for production debugging
    sourcemap: false,
    // Minification options
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
