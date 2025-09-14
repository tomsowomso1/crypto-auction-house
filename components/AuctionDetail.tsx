'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Calendar, Tag, TrendingUp } from 'lucide-react'
import Image from 'next/image'

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

interface AuctionDetailProps {
  auction: Auction
}

export default function AuctionDetail({ auction }: AuctionDetailProps) {
  const [imageError, setImageError] = useState(false)

  const currentBid = parseFloat(auction.current_bid || '0')
  const startingBid = parseFloat(auction.starting_bid)
  const displayBid = currentBid > 0 ? currentBid : startingBid
  const minIncrement = parseFloat(auction.min_increment)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card overflow-hidden">
      {/* Image */}
      <div className="relative h-96 bg-gray-100">
        {auction.image_url && !imageError ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-100 to-primary-200">
            <TrendingUp className="h-24 w-24 text-primary-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            auction.status === 'active' ? 'bg-success-100 text-success-800' :
            auction.status === 'pending' ? 'bg-warning-100 text-warning-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {auction.status === 'active' ? 'Live Now' : 
             auction.status === 'pending' ? 'Starting Soon' : 
             'Ended'}
          </span>
        </div>

        {/* Live indicator */}
        {auction.status === 'active' && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {auction.title}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {auction.description}
          </p>
        </div>

        {/* Current Bid */}
        <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
          <div className="text-sm text-primary-600 font-medium mb-1">
            {currentBid > 0 ? 'Current Bid' : 'Starting Bid'}
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-4xl font-bold text-primary-900">
              {displayBid.toFixed(auction.currency === 'SOL' ? 4 : 2)}
            </span>
            <span className="text-lg font-semibold text-primary-700">
              {auction.currency}
            </span>
          </div>
          
          {auction.status === 'active' && (
            <div className="mt-2 text-sm text-primary-600">
              Minimum next bid: {(displayBid + minIncrement).toFixed(auction.currency === 'SOL' ? 4 : 2)} {auction.currency}
            </div>
          )}
        </div>

        {/* Winner Info */}
        {auction.status === 'ended' && auction.winner_username && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-success-50 rounded-xl border border-success-100"
          >
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-success-600" />
              <span className="text-success-800 font-semibold">Auction Winner</span>
            </div>
            <div className="text-success-700">
              <span className="font-medium">{auction.winner_username}</span>
              <span className="text-sm ml-2">
                ({auction.winner_wallet?.slice(0, 8)}...{auction.winner_wallet?.slice(-4)})
              </span>
            </div>
          </motion.div>
        )}

        {/* Auction Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Creator</div>
                <div className="font-medium text-gray-900">
                  {auction.creator_username}
                </div>
                <div className="text-xs text-gray-500">
                  {auction.creator_wallet.slice(0, 8)}...{auction.creator_wallet.slice(-4)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium text-gray-900">
                  {formatDate(auction.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Minimum Increment</div>
                <div className="font-medium text-gray-900">
                  {minIncrement.toFixed(auction.currency === 'SOL' ? 4 : 2)} {auction.currency}
                </div>
              </div>
            </div>

            {auction.end_time && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Ended</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(auction.end_time)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
