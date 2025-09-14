'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import toast from 'react-hot-toast'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('SOL')
  const [amount, setAmount] = useState('')
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositStatus, setDepositStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [txSignature, setTxSignature] = useState('')

  // Platform wallet address (in production, this would be your platform's treasury wallet)
  const PLATFORM_WALLET = 'YourPlatformWalletAddressHere' // Replace with actual wallet

  const handleDeposit = async () => {
    if (!publicKey || !amount) {
      toast.error('Please enter a valid amount')
      return
    }

    const depositAmount = parseFloat(amount)
    if (depositAmount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (currency === 'SOL' && depositAmount < 0.001) {
      toast.error('Minimum deposit is 0.001 SOL')
      return
    }

    setIsDepositing(true)
    setDepositStatus('pending')

    try {
      if (currency === 'SOL') {
        await handleSolDeposit(depositAmount)
      } else {
        await handleUsdtDeposit(depositAmount)
      }
    } catch (error: any) {
      console.error('Deposit error:', error)
      setDepositStatus('error')
      toast.error(error.message || 'Failed to process deposit')
    } finally {
      setIsDepositing(false)
    }
  }

  const handleSolDeposit = async (amount: number) => {
    if (!publicKey) throw new Error('Wallet not connected')

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(PLATFORM_WALLET),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    )

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey

    // Send transaction
    const signature = await sendTransaction(transaction, connection)
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'processed')
    
    setTxSignature(signature)
    setDepositStatus('success')
    
    // In a real implementation, you would:
    // 1. Send the transaction signature to your backend
    // 2. Backend would verify the transaction on-chain
    // 3. Credit the user's account balance
    // 4. Update the UI
    
    toast.success('Deposit successful! Your balance will be updated shortly.')
    
    setTimeout(() => {
      onSuccess()
      onClose()
    }, 2000)
  }

  const handleUsdtDeposit = async (amount: number) => {
    // USDT deposit would require SPL token transfer
    // This is a placeholder - implement SPL token transfer logic
    throw new Error('USDT deposits not yet implemented')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const formatTxSignature = (sig: string) => {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`
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
              <div className="p-2 bg-success-100 rounded-lg">
                <Plus className="h-5 w-5 text-success-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Deposit Funds
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
            {depositStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-success-600 mb-4">
                  <CheckCircle className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Deposit Successful!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your {amount} {currency} deposit is being processed.
                </p>
                
                {txSignature && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Transaction ID</div>
                    <div className="flex items-center justify-between bg-white rounded border p-2">
                      <span className="text-sm font-mono text-gray-900">
                        {formatTxSignature(txSignature)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(txSignature)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Your balance will be updated within a few seconds.
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
                      <div className="text-sm opacity-75">Solana</div>
                    </button>
                    <button
                      onClick={() => setCurrency('USDT')}
                      disabled
                      className="p-4 rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                      <div className="font-semibold">USDT</div>
                      <div className="text-sm opacity-75">Coming Soon</div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter ${currency} amount`}
                      className="input pr-16"
                      step={currency === 'SOL' ? '0.001' : '0.01'}
                      min="0"
                      disabled={isDepositing}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm font-medium">
                        {currency}
                      </span>
                    </div>
                  </div>
                  
                  {currency === 'SOL' && (
                    <div className="mt-2 text-sm text-gray-600">
                      Minimum deposit: 0.001 SOL
                    </div>
                  )}
                </div>

                {/* Deposit Button */}
                <button
                  onClick={handleDeposit}
                  disabled={isDepositing || !amount || parseFloat(amount) <= 0}
                  className={`w-full btn ${
                    isDepositing || !amount || parseFloat(amount) <= 0
                      ? 'btn-disabled'
                      : 'btn-success'
                  } py-3`}
                >
                  {isDepositing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Deposit...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Deposit {currency}</span>
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-primary-800">
                      <div className="font-medium mb-1">Instant Credit System</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Funds are credited instantly for bidding</li>
                        <li>• No waiting for blockchain confirmations</li>
                        <li>• Only winning bids are actually charged</li>
                        <li>• Unused funds can be withdrawn anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
