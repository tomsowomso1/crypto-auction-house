'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion } from 'framer-motion'
import { Gavel, Zap, Shield, TrendingUp } from 'lucide-react'
import AuctionGrid from '@/components/AuctionGrid'
import UserBalance from '@/components/UserBalance'
import ConnectionStatus from '@/components/ConnectionStatus'

export default function Home() {
  const { connected, publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <Gavel className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gradient">
                  Crypto Auction House
                </h1>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              {connected && <UserBalance />}
              <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !rounded-lg !font-medium !transition-all" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!connected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="mb-8"
              >
                <Gavel className="h-24 w-24 text-primary-600 mx-auto mb-6" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to the Future of Auctions
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience lightning-fast cryptocurrency auctions with real-time bidding,
                instant credits, and secure Solana integration.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card p-6 text-center"
                >
                  <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-gray-600">
                    Sub-100ms bid updates with real-time WebSocket connections
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card p-6 text-center"
                >
                  <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Secure & Trusted</h3>
                  <p className="text-gray-600">
                    Built on Solana with wallet signature verification
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card p-6 text-center"
                >
                  <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Instant Credits</h3>
                  <p className="text-gray-600">
                    Deposit SOL/USDT and bid immediately without waiting
                  </p>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-primary-50 border border-primary-200 rounded-xl p-8"
              >
                <h3 className="text-2xl font-semibold text-primary-900 mb-4">
                  Ready to Start Bidding?
                </h3>
                <p className="text-primary-700 mb-6">
                  Connect your Solana wallet to access live auctions and start bidding on exclusive items.
                </p>
                <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !rounded-lg !font-medium !px-8 !py-3 !text-lg" />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Live Auctions
              </h2>
              <p className="text-gray-600">
                Participate in real-time auctions with instant bidding and automatic timer extensions.
              </p>
            </div>
            
            <AuctionGrid />
          </motion.div>
        )}
      </main>
    </div>
  )
}
