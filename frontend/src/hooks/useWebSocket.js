/**
 * WebSocket hook for real-time quantum simulation
 * and collaborative circuit building
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { toastManager } from '../lib/api'

const WS_MESSAGE_TYPES = {
  SIMULATION_START: 'simulation_start',
  SIMULATION_PROGRESS: 'simulation_progress',
  SIMULATION_RESULT: 'simulation_result',
  SIMULATION_ERROR: 'simulation_error',
  COLLABORATION_JOIN: 'collaboration_join',
  COLLABORATION_LEAVE: 'collaboration_leave',
  COLLABORATION_UPDATE: 'collaboration_update',
  COLLABORATION_SYNC: 'collaboration_sync',
  PING: 'ping',
  PONG: 'pong'
}

/**
 * useWebSocket hook for connecting to backend WebSocket
 */
export function useWebSocket(room = 'default') {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [users, setUsers] = useState([])
  const [simulationProgress, setSimulationProgress] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const pingIntervalRef = useRef(null)
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    setIsConnecting(true)
    
    const wsUrl = `ws://${window.location.host}/api/ws/simulation/${room}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      setIsConnecting(false)
      
      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        ws.send(JSON.stringify({ type: WS_MESSAGE_TYPES.PING }))
      }, 30000)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
        
        switch (data.type) {
          case WS_MESSAGE_TYPES.SIMULATION_PROGRESS:
            setSimulationProgress(data.progress)
            break
            
          case WS_MESSAGE_TYPES.SIMULATION_RESULT:
            setSimulationProgress(null)
            break
            
          case WS_MESSAGE_TYPES.SIMULATION_ERROR:
            toastManager.error(data.error || 'Simulation error')
            setSimulationProgress(null)
            break
            
          case WS_MESSAGE_TYPES.COLLABORATION_JOIN:
          case WS_MESSAGE_TYPES.COLLABORATION_LEAVE:
            setUsers(data.users || [])
            break
            
          case WS_MESSAGE_TYPES.COLLABORATION_UPDATE:
            // Handle collaborative update
            break
            
          default:
            break
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnecting(false)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
      setIsConnecting(false)
      setSimulationProgress(null)
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      
      // Attempt reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connect()
        }
      }, 5000)
    }
    
    wsRef.current = ws
  }, [room])
  
  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])
  
  // Send message
  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])
  
  // Start simulation
  const startSimulation = useCallback((circuit) => {
    send({
      type: WS_MESSAGE_TYPES.SIMULATION_START,
      circuit
    })
  }, [send])
  
  // Send result
  const sendResult = useCallback((result) => {
    send({
      type: WS_MESSAGE_TYPES.SIMULATION_RESULT,
      result
    })
  }, [send])
  
  // Send circuit update for collaboration
  const sendCircuitUpdate = useCallback((circuit) => {
    send({
      type: WS_MESSAGE_TYPES.COLLABORATION_UPDATE,
      circuit
    })
  }, [send])
  
  // Request sync from others
  const requestSync = useCallback(() => {
    send({
      type: WS_MESSAGE_TYPES.COLLABORATION_SYNC
    })
  }, [send])
  
  // Auto-connect on mount
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])
  
  return {
    isConnected,
    isConnecting,
    lastMessage,
    users,
    simulationProgress,
    connect,
    disconnect,
    send,
    startSimulation,
    sendResult,
    sendCircuitUpdate,
    requestSync
  }
}

export default useWebSocket