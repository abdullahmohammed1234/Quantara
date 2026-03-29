// usePinchToZoom - Custom hook for pinch-to-zoom touch gestures
import { useState, useCallback, useRef } from 'react'

/**
 * usePinchToZoom Hook
 * Provides pinch-to-zoom functionality for 3D visualizations
 * @param {Object} options - Configuration options
 * @param {number} options.minScale - Minimum zoom scale (default: 0.5)
 * @param {number} options.maxScale - Maximum zoom scale (default: 3)
 * @param {number} options.zoomSpeed - Zoom speed multiplier (default: 1)
 * @param {Function} options.onZoomChange - Callback when zoom changes
 */
export const usePinchToZoom = ({ 
  minScale = 0.5, 
  maxScale = 3, 
  zoomSpeed = 1,
  onZoomChange 
} = {}) => {
  const [scale, setScale] = useState(1)
  const [isPinching, setIsPinching] = useState(false)
  
  const initialDistance = useRef(0)
  const initialScale = useRef(1)
  
  // Calculate distance between two touch points
  const getDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])
  
  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      setIsPinching(true)
      initialDistance.current = getDistance(e.touches[0], e.touches[1])
      initialScale.current = scale
    }
  }, [getDistance, scale])
  
  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault() // Prevent default browser zoom
      
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const distanceRatio = currentDistance / initialDistance.current
      const newScale = Math.min(
        Math.max(initialScale.current * distanceRatio * zoomSpeed, minScale),
        maxScale
      )
      
      setScale(newScale)
      onZoomChange?.(newScale)
    }
  }, [getDistance, isPinching, maxScale, minScale, onZoomChange, zoomSpeed])
  
  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsPinching(false)
  }, [])
  
  // Reset zoom to default
  const resetZoom = useCallback(() => {
    setScale(1)
    onZoomChange?.(1)
  }, [onZoomChange])
  
  // Zoom in
  const zoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.2, maxScale)
    setScale(newScale)
    onZoomChange?.(newScale)
  }, [maxScale, onZoomChange, scale])
  
  // Zoom out
  const zoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.2, minScale)
    setScale(newScale)
    onZoomChange?.(newScale)
  }, [minScale, onZoomChange, scale])
  
  return {
    scale,
    isPinching,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetZoom,
    zoomIn,
    zoomOut,
  }
}

export default usePinchToZoom