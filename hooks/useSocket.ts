'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Socket | null
  connected: boolean
  connecting: boolean
  connect: () => void
  disconnect: () => void
}

export function useSocket(): UseSocketReturn {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const connect = () => {
    if (socketRef.current?.connected) return

    setConnecting(true)
    
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      upgrade: true,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setConnected(true)
      setConnecting(false)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)
      setConnecting(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
      setConnecting(false)
    })

    socketRef.current = socket
  }

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setConnected(false)
      setConnecting(false)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  return {
    socket: socketRef.current,
    connected,
    connecting,
    connect,
    disconnect,
  }
}
