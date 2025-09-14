'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Plus, Minus, RefreshCw } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

export default function UserBalance() {
  const { publicKey } = useWallet()
  const { user, loading, refreshUser } = useUser()
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUser()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (!publicKey || loading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
        <Wallet className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-3 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm"
      >
        <Wallet className="h-4 w-4 text-primary-600" />
        
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-900">
                {parseFloat(user.sol_balance || '0').toFixed(4)}
              </span>
              <span className="text-gray-500">SOL</span>
            </div>
          </div>
          
          <div className="text-sm">
            <div className="flex items-center space-x-1">
              <span className="font-medium text-gray-900">
                {parseFloat(user.usdt_balance || '0').toFixed(2)}
              </span>
              <span className="text-gray-500">USDT</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowDeposit(true)}
            className="p-1.5 text-success-600 hover:text-success-700 transition-colors"
            title="Deposit"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowWithdraw(true)}
            className="p-1.5 text-danger-600 hover:text-danger-700 transition-colors"
            title="Withdraw"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeposit && (
          <DepositModal
            isOpen={showDeposit}
            onClose={() => setShowDeposit(false)}
            onSuccess={refreshUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWithdraw && (
          <WithdrawModal
            isOpen={showWithdraw}
            onClose={() => setShowWithdraw(false)}
            onSuccess={refreshUser}
            user={user}
          />
        )}
      </AnimatePresence>
    </>
  )
}
