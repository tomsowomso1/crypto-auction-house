'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Clock, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import components to avoid SSR issues
const AuctionDetail = dynamic(() => import('@/components/AuctionDetail'), { ssr: false })
const BiddingPanel = dynamic(() => import('@/components/BiddingPanel'), { ssr: false })
const BidHistory = dynamic(() => import('@/components/BidHistory'), { ssr: false })
const AuctionTimer = dynamic(() => import('@/components/AuctionTimer'), { ssr: false })
import { useSocket } from '@/hooks/useSocket'
import axios from 'axios'
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

interface Bid {
  id: number
  amount: string
  username: string
  wallet_address: string
  bid_time: string
  is_winning: boolean
}

interface AuctionState {
  auction: Auction
  bids: Bid[]
  participantCount: number
  remainingTime: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AuctionPage() {
  const params = useParams()
  const router = useRouter()
  const { socket } = useSocket()
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const auctionId = params.id as string

  useEffect(() => {
    if (!auctionId) return

    fetchAuction()
  }, [auctionId])

  useEffect(() => {
    if (!socket || !auctionId) return

    // Join auction room
    socket.emit('join-auction', auctionId)

    // Listen for auction state updates
    socket.on('auction-state', (state: AuctionState) => {
      setAuctionState(state)
      setLoading(false)
    })

    // Listen for new bids
    socket.on('new-bid', (bidData) => {
      toast.success(`New bid: ${bidData.amount} ${auctionState?.auction.currency} by ${bidData.username}`)
    })

    // Listen for auction end
    socket.on('auction-ended', () => {
      toast.success('Auction has ended!')
    })

    return () => {
      socket.emit('leave-auction', auctionId)
      socket.off('auction-state')
      socket.off('new-bid')
      socket.off('auction-ended')
    }
  }, [socket, auctionId, auctionState?.auction.currency])

  const fetchAuction = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/auctions/${auctionId}`)
      
      // Initial auction data without real-time info
      setAuctionState({
        auction: response.data,
        bids: [],
        participantCount: 0,
        remainingTime: 0
      })
      
      setError(null)
    } catch (err: any) {
      console.error('Error fetching auction:', err)
      if (err.response?.status === 404) {
        setError('Auction not found')
      } else {
        setError('Failed to load auction')
      }
      toast.error('Failed to load auction')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-48 rounded mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-200 h-96 rounded-xl"></div>
                <div className="bg-gray-200 h-32 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-200 h-48 rounded-xl"></div>
                <div className="bg-gray-200 h-64 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !auctionState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="card p-8 max-w-md mx-auto">
              <div className="text-danger-600 mb-4">
                <TrendingUp className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error || 'Unable to Load Auction'}
              </h3>
              <p className="text-gray-600 mb-4">
                The auction you're looking for might have been removed or doesn't exist.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Auctions
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { auction, bids, participantCount, remainingTime } = auctionState

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Auctions</span>
        </motion.button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Auction Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AuctionDetail auction={auction} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BidHistory bids={bids} />
            </motion.div>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AuctionTimer 
                remainingTime={remainingTime}
                status={auction.status}
                extensionSeconds={auction.extension_seconds}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BiddingPanel 
                auction={auction}
                onBidPlaced={() => {
                  // Bid success is handled by socket events
                }}
              />
            </motion.div>

            {/* Auction Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Auction Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="font-medium">{participantCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Bids</span>
                  </div>
                  <span className="font-medium">{bids.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    auction.status === 'active' ? 'bg-success-100 text-success-800' :
                    auction.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {auction.status === 'active' ? 'Live' : 
                     auction.status === 'pending' ? 'Starting Soon' : 
                     'Ended'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
