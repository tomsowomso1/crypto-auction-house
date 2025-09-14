'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
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

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  createUser: (username?: string) => Promise<void>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function useUser(): UseUserReturn {
  const { publicKey, connected } = useWallet()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    if (!publicKey || !connected) {
      setUser(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_BASE_URL}/users/${publicKey.toString()}`)
      setUser(response.data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        // User doesn't exist yet
        setUser(null)
      } else {
        console.error('Error fetching user:', err)
        setError('Failed to fetch user data')
        toast.error('Failed to fetch user data')
      }
    } finally {
      setLoading(false)
    }
  }, [publicKey, connected])

  const createUser = useCallback(async (username?: string) => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, {
        walletAddress: publicKey.toString(),
        username: username || `User_${publicKey.toString().slice(0, 8)}`
      })
      
      setUser(response.data)
      toast.success('Account created successfully!')
    } catch (err: any) {
      console.error('Error creating user:', err)
      const errorMessage = err.response?.data?.error || 'Failed to create user account'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [publicKey, connected])

  useEffect(() => {
    if (connected && publicKey) {
      refreshUser()
    } else {
      setUser(null)
    }
  }, [connected, publicKey, refreshUser])

  // Auto-create user if wallet is connected but user doesn't exist
  useEffect(() => {
    if (connected && publicKey && !loading && !user && !error) {
      createUser()
    }
  }, [connected, publicKey, loading, user, error, createUser])

  return {
    user,
    loading,
    error,
    refreshUser,
    createUser,
  }
}
