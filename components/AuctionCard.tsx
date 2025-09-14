'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, TrendingUp, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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

interface AuctionCardProps {
  auction: Auction
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [imageError, setImageError] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800'
      case 'pending':
        return 'bg-warning-100 text-warning-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live Now'
      case 'pending':
        return 'Starting Soon'
      case 'ended':
        return 'Ended'
      default:
        return status
    }
  }

  const currentBid = parseFloat(auction.current_bid || '0')
  const startingBid = parseFloat(auction.starting_bid)
  const displayBid = currentBid > 0 ? currentBid : startingBid

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden group cursor-pointer"
    >
      <Link href={`/auction/${auction.id}`}>
        <div className="relative">
          {/* Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            {auction.image_url && !imageError ? (
              <Image
                src={auction.image_url}
                alt={auction.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-100 to-primary-200">
                <TrendingUp className="h-12 w-12 text-primary-400" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(auction.status)}`}>
                {getStatusText(auction.status)}
              </span>
            </div>

            {/* Live indicator for active auctions */}
            {auction.status === 'active' && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {auction.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {auction.description}
            </p>

            {/* Current Bid */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">
                {currentBid > 0 ? 'Current Bid' : 'Starting Bid'}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {displayBid.toFixed(auction.currency === 'SOL' ? 4 : 2)}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {auction.currency}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{auction.creator_username || 'Anonymous'}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{auction.bid_count || 0} bids</span>
                </div>
                
                <div className="flex items-center space-x-1 text-primary-600">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
