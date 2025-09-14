'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'

export default function ConnectionStatus() {
  const { connected, connecting } = useSocket()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const getStatusConfig = () => {
    if (connecting) {
      return {
        icon: Loader2,
        text: 'Connecting...',
        className: 'connection-indicator connecting'
      }
    }
    
    if (connected) {
      return {
        icon: Wifi,
        text: 'Connected',
        className: 'connection-indicator connected'
      }
    }
    
    return {
      icon: WifiOff,
      text: 'Disconnected',
      className: 'connection-indicator disconnected'
    }
  }

  const { icon: Icon, text, className } = getStatusConfig()

  return (
    <div className={className}>
      <Icon className={`h-4 w-4 ${connecting ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{text}</span>
    </div>
  )
}
