'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Loader2, CheckCircle, AlertTriangle, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: number
  wallet_address: string
  username?: string
  sol_balance: string
  usdt_balance: string
  total_bids: number
  total_won: number
  created_at: string
  updated_at: string
}

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User
}

export default function WithdrawModal({ isOpen, onClose, onSuccess, user }: WithdrawModalProps) {
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('SOL')
  const [amount, setAmount] = useState('')
  const [toAddress, setToAddress] = useState(user.wallet_address)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

  const getBalance = (currency: 'SOL' | 'USDT') => {
    const balanceField = currency.toLowerCase() + '_balance'
    return parseFloat(user[balanceField as keyof User] as string || '0')
  }

  const handleWithdraw = async () => {
    if (!amount || !toAddress) {
      toast.error('Please fill in all fields')
      return
    }

    const withdrawAmount = parseFloat(amount)
    const balance = getBalance(currency)

    if (withdrawAmount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (withdrawAmount > balance) {
      toast.error('Insufficient balance')
      return
    }

    if (currency === 'SOL' && withdrawAmount < 0.001) {
      toast.error('Minimum withdrawal is 0.001 SOL')
      return
    }

    // Validate Solana address
    if (toAddress.length < 32 || toAddress.length > 44) {
      toast.error('Invalid Solana address')
      return
    }

    setIsWithdrawing(true)
    setWithdrawStatus('pending')

    try {
      // In a real implementation, this would call your backend API
      // to process the withdrawal
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: withdrawAmount,
          currency,
          toAddress,
        }),
      })

      if (!response.ok) {
        throw new Error('Withdrawal request failed')
      }

      setWithdrawStatus('success')
      toast.success('Withdrawal request submitted successfully!')
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error('Withdrawal error:', error)
      setWithdrawStatus('error')
      toast.error(error.message || 'Failed to process withdrawal')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleMaxAmount = () => {
    const balance = getBalance(currency)
    // Leave a small buffer for fees if SOL
    const maxAmount = currency === 'SOL' ? Math.max(0, balance - 0.001) : balance
    setAmount(maxAmount.toFixed(currency === 'SOL' ? 4 : 2))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Minus className="h-5 w-5 text-warning-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Withdraw Funds
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {withdrawStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-success-600 mb-4">
                  <CheckCircle className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Withdrawal Requested!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your withdrawal of {amount} {currency} is being processed.
                </p>
                <p className="text-xs text-gray-500">
                  Processing typically takes 5-10 minutes.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Currency Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Currency
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCurrency('SOL')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currency === 'SOL'
                          ? 'border-primary-500 bg-primary-50 text-primary-900'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">SOL</div>
                      <div className="text-sm opacity-75">
                        Balance: {getBalance('SOL').toFixed(4)}
                      </div>
                    </button>
                    <button
                      onClick={() => setCurrency('USDT')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currency === 'USDT'
                          ? 'border-primary-500 bg-primary-50 text-primary-900'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">USDT</div>
                      <div className="text-sm opacity-75">
                        Balance: {getBalance('USDT').toFixed(2)}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Amount to Withdraw
                    </label>
                    <button
                      onClick={handleMaxAmount}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Max
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter ${currency} amount`}
                      className="input pr-16"
                      step={currency === 'SOL' ? '0.001' : '0.01'}
                      min="0"
                      max={getBalance(currency)}
                      disabled={isWithdrawing}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm font-medium">
                        {currency}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    Available: {getBalance(currency).toFixed(currency === 'SOL' ? 4 : 2)} {currency}
                    {currency === 'SOL' && ' (min: 0.001 SOL)'}
                  </div>
                </div>

                {/* To Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdraw to Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      placeholder="Solana wallet address"
                      className="input pr-10"
                      disabled={isWithdrawing}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Wallet className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Defaults to your connected wallet address
                  </div>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 bg-warning-50 rounded-lg border border-warning-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-warning-800">
                      <div className="font-medium mb-1">Important</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Double-check the recipient address</li>
                        <li>• Withdrawals cannot be reversed</li>
                        <li>• Processing takes 5-10 minutes</li>
                        {currency === 'SOL' && <li>• Small network fee will be deducted</li>}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={
                    isWithdrawing || 
                    !amount || 
                    !toAddress || 
                    parseFloat(amount) <= 0 || 
                    parseFloat(amount) > getBalance(currency)
                  }
                  className={`w-full btn ${
                    isWithdrawing || 
                    !amount || 
                    !toAddress || 
                    parseFloat(amount) <= 0 || 
                    parseFloat(amount) > getBalance(currency)
                      ? 'btn-disabled'
                      : 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500'
                  } py-3`}
                >
                  {isWithdrawing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Withdrawal...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Minus className="h-4 w-4" />
                      <span>Withdraw {currency}</span>
                    </div>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
