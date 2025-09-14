'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, User, Clock, Crown } from 'lucide-react'

interface Bid {
  id: number
  amount: string
  username: string
  wallet_address: string
  bid_time: string
  is_winning: boolean
}

interface BidHistoryProps {
  bids: Bid[]
}

export default function BidHistory({ bids }: BidHistoryProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  if (bids.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <span>Bid History</span>
        </h3>
        
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Clock className="h-12 w-12 mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Bids Yet
          </h4>
          <p className="text-gray-600">
            Be the first to place a bid on this auction!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-primary-600" />
        <span>Bid History</span>
        <span className="text-sm font-normal text-gray-500">
          ({bids.length} {bids.length === 1 ? 'bid' : 'bids'})
        </span>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence initial={false}>
          {bids.map((bid, index) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                bid.is_winning 
                  ? 'bg-success-50 border-success-400 shadow-sm' 
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    bid.is_winning ? 'bg-success-100' : 'bg-gray-200'
                  }`}>
                    {bid.is_winning ? (
                      <Crown className="h-4 w-4 text-success-600" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {bid.username}
                      </span>
                      {bid.is_winning && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                          Winning
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatWallet(bid.wallet_address)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    bid.is_winning ? 'text-success-700' : 'text-gray-900'
                  }`}>
                    {parseFloat(bid.amount).toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(bid.bid_time)}
                  </div>
                </div>
              </div>

              {index === 0 && bid.is_winning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 pt-3 border-t border-success-200"
                >
                  <div className="flex items-center space-x-2 text-success-700 text-sm">
                    <Crown className="h-4 w-4" />
                    <span className="font-medium">Current highest bid</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {bids.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Showing latest 10 bids • {bids.length - 10} more bids
          </p>
        </div>
      )}
    </div>
  )
}
