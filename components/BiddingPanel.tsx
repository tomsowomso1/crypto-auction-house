'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, Wallet, AlertCircle } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useSocket } from '@/hooks/useSocket'
import toast from 'react-hot-toast'

interface Auction {
  id: number
  title: string
  description: string
  starting_bid: string
  current_bid: string
  min_increment: string
  currency: string
  status: string
  creator_username: string
  creator_wallet: string
  winner_username?: string
  winner_wallet?: string
  image_url?: string
  timer_seconds: number
  extension_seconds: number
  created_at: string
  end_time?: string
}

interface BiddingPanelProps {
  auction: Auction
  onBidPlaced: () => void
}

export default function BiddingPanel({ auction, onBidPlaced }: BiddingPanelProps) {
  const { connected, publicKey } = useWallet()
  const { user } = useUser()
  const { socket } = useSocket()
  const [bidAmount, setBidAmount] = useState('')
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [bidError, setBidError] = useState('')

  const currentBid = parseFloat(auction.current_bid || '0')
  const startingBid = parseFloat(auction.starting_bid)
  const displayBid = currentBid > 0 ? currentBid : startingBid
  const minIncrement = parseFloat(auction.min_increment)
  const minBidAmount = displayBid + minIncrement

  useEffect(() => {
    if (!socket) return

    socket.on('bid-success', (data) => {
      setBidAmount('')
      setIsPlacingBid(false)
      setBidError('')
      toast.success('Bid placed successfully!')
      onBidPlaced()
    })

    socket.on('bid-error', (data) => {
      setIsPlacingBid(false)
      setBidError(data.message)
      toast.error(data.message)
    })

    return () => {
      socket.off('bid-success')
      socket.off('bid-error')
    }
  }, [socket, onBidPlaced])

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey || !user || !socket) {
      toast.error('Please connect your wallet first')
      return
    }

    if (auction.status !== 'active') {
      toast.error('This auction is not active')
      return
    }

    const bidValue = parseFloat(bidAmount)
    
    if (isNaN(bidValue) || bidValue <= 0) {
      setBidError('Please enter a valid bid amount')
      return
    }

    if (bidValue < minBidAmount) {
      setBidError(`Minimum bid is ${minBidAmount.toFixed(auction.currency === 'SOL' ? 4 : 2)} ${auction.currency}`)
      return
    }

    // Check user balance
    const balanceField = auction.currency.toLowerCase() + '_balance'
    const userBalance = parseFloat(user[balanceField as keyof typeof user] as string || '0')
    
    if (bidValue > userBalance) {
      setBidError('Insufficient balance')
      return
    }

    setBidError('')
    setIsPlacingBid(true)

    // Emit bid to server
    socket.emit('place-bid', {
      auctionId: auction.id,
      userId: user.id,
      amount: bidValue.toString(),
      walletAddress: publicKey.toString()
    })
  }

  const handleQuickBid = (multiplier: number) => {
    const quickBidAmount = minBidAmount * multiplier
    setBidAmount(quickBidAmount.toFixed(auction.currency === 'SOL' ? 4 : 2))
  }

  if (!connected) {
    return (
      <div className="card p-6 text-center">
        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 mb-4">
          Connect your Solana wallet to participate in this auction
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <div className="animate-spin">
          <TrendingUp className="h-8 w-8 text-primary-600 mx-auto" />
        </div>
        <p className="text-gray-600 mt-2">Setting up your account...</p>
      </div>
    )
  }

  if (auction.status === 'ended') {
    return (
      <div className="card p-6 text-center">
        <div className="text-gray-500 mb-4">
          <TrendingUp className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Auction Ended
        </h3>
        <p className="text-gray-600">
          This auction has concluded. Thank you for participating!
        </p>
      </div>
    )
  }

  if (auction.status === 'pending') {
    return (
      <div className="card p-6 text-center">
        <div className="text-warning-500 mb-4">
          <TrendingUp className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Auction Starting Soon
        </h3>
        <p className="text-gray-600">
          This auction hasn't started yet. Check back soon!
        </p>
      </div>
    )
  }

  const balanceField = auction.currency.toLowerCase() + '_balance'
  const userBalance = parseFloat(user[balanceField as keyof typeof user] as string || '0')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <span>Place Your Bid</span>
        </h3>
        
        <div className="text-sm text-gray-600 mb-4">
          Your balance: {userBalance.toFixed(auction.currency === 'SOL' ? 4 : 2)} {auction.currency}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-600 mb-1">Minimum bid</div>
          <div className="text-xl font-bold text-gray-900">
            {minBidAmount.toFixed(auction.currency === 'SOL' ? 4 : 2)} {auction.currency}
          </div>
        </div>
      </div>

      {/* Quick Bid Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleQuickBid(1)}
          className="btn btn-secondary text-xs py-2"
          disabled={isPlacingBid}
        >
          Min Bid
        </button>
        <button
          type="button"
          onClick={() => handleQuickBid(1.1)}
          className="btn btn-secondary text-xs py-2"
          disabled={isPlacingBid}
        >
          +10%
        </button>
        <button
          type="button"
          onClick={() => handleQuickBid(1.25)}
          className="btn btn-secondary text-xs py-2"
          disabled={isPlacingBid}
        >
          +25%
        </button>
      </div>

      {/* Bid Form */}
      <form onSubmit={handleBidSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Enter bid amount (${auction.currency})`}
              className={`input pr-16 ${bidError ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              step={auction.currency === 'SOL' ? '0.0001' : '0.01'}
              min={minBidAmount}
              disabled={isPlacingBid}
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm">{auction.currency}</span>
            </div>
          </div>
          
          {bidError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-danger-600 text-sm mt-2"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{bidError}</span>
            </motion.div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isPlacingBid || !bidAmount || parseFloat(bidAmount) < minBidAmount}
          className={`w-full btn ${
            isPlacingBid 
              ? 'btn-disabled' 
              : 'btn-primary hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
          } transition-all duration-200`}
          whileTap={{ scale: 0.98 }}
        >
          {isPlacingBid ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Placing Bid...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Place Bid</span>
            </div>
          )}
        </motion.button>
      </form>

      {/* Bidding Tips */}
      <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">
          💡 Bidding Tips
        </h4>
        <ul className="text-xs text-primary-700 space-y-1">
          <li>• Timer extends by {auction.extension_seconds}s on each new bid</li>
          <li>• Your funds are held instantly when bidding</li>
          <li>• Only the winning bid is charged at auction end</li>
        </ul>
      </div>
    </motion.div>
  )
}
