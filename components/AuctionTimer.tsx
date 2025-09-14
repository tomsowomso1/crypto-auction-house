'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'

interface AuctionTimerProps {
  remainingTime: number
  status: string
  extensionSeconds: number
}

export default function AuctionTimer({ remainingTime, status, extensionSeconds }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(remainingTime)

  useEffect(() => {
    setTimeLeft(remainingTime)
  }, [remainingTime])

  useEffect(() => {
    if (status !== 'active' || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerClass = () => {
    if (status !== 'active') return 'auction-timer normal'
    if (timeLeft <= 5) return 'auction-timer critical'
    if (timeLeft <= 10) return 'auction-timer warning'
    return 'auction-timer normal'
  }

  const getTimerIcon = () => {
    if (timeLeft <= 5 && status === 'active') {
      return <Zap className="h-6 w-6" />
    }
    return <Clock className="h-6 w-6" />
  }

  if (status === 'ended') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 text-center"
      >
        <div className="text-gray-500 mb-2">
          <Clock className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Auction Ended
        </h3>
        <p className="text-sm text-gray-600">
          This auction has concluded
        </p>
      </motion.div>
    )
  }

  if (status === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 text-center"
      >
        <div className="text-warning-500 mb-2">
          <Clock className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Starting Soon
        </h3>
        <p className="text-sm text-gray-600">
          This auction hasn't started yet
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {getTimerIcon()}
          <h3 className="text-lg font-semibold text-gray-900">
            Time Remaining
          </h3>
        </div>

        <motion.div
          key={timeLeft}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={getTimerClass()}
        >
          {formatTime(timeLeft)}
        </motion.div>

        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600 mb-2">
            Timer extends by {extensionSeconds}s on new bids
          </div>
          
          {timeLeft <= 10 && timeLeft > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center space-x-1 text-danger-600 text-sm font-medium"
            >
              <Zap className="h-4 w-4" />
              <span>Ending Soon!</span>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-danger-500' :
                timeLeft <= 10 ? 'bg-warning-500' :
                'bg-primary-500'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, (timeLeft / 20) * 100))}%`
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
