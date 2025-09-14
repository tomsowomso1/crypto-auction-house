'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, TrendingUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import AuctionCard from './AuctionCard'

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
  bid_count: number
  image_url?: string
  created_at: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AuctionGrid() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/auctions`)
      setAuctions(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching auctions:', err)
      setError('Failed to fetch auctions')
      toast.error('Failed to fetch auctions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              <div className="bg-gray-200 h-8 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-danger-600 mb-4">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Auctions
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAuctions}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <Clock className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Auctions
          </h3>
          <p className="text-gray-600">
            Check back soon for new exciting auctions!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {auctions.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Auctions</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <Users className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {auctions.reduce((sum, a) => sum + (a.bid_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {auctions.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Starting Soon</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction, index) => (
          <motion.div
            key={auction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AuctionCard auction={auction} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
