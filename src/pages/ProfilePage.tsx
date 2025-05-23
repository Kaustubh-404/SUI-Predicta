// src/pages/ProfilePage.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { motion } from "framer-motion"
import { User, Trophy, Target, Clock, ExternalLink, Copy, LogOut, Coins, BarChart3, Award, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatAddress, formatSUIAmount, copyToClipboard } from "@/lib/utils"
import { suiClient, PACKAGE_ID } from "@/lib/suiClient"

interface UserStats {
  totalBets: number
  totalWinnings: number
  winRate: number
  activeBets: number
  balance: number
  joinedDate: string
}

export const ProfilePage: React.FC = () => {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const { toast } = useToast()
  const [userStats, setUserStats] = useState<UserStats>({
    totalBets: 0,
    totalWinnings: 0,
    winRate: 0,
    activeBets: 0,
    balance: 0,
    joinedDate: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (account?.address) {
      loadUserData()
    }
  }, [account?.address])

  const loadUserData = async () => {
    try {
      setLoading(true)

      if (!account?.address) return

      const coins = await suiClient.getCoins({
        owner: account.address,
        coinType: "0x2::sui::SUI",
      })

      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + Number.parseInt(coin.balance)
      }, 0)

      let totalBets = 0
      let totalWinnings = 0
      let activeBets = 0
      let userWins: any[] = []

      try {
        if (PACKAGE_ID) {
          const betEvents = await suiClient.queryEvents({
            query: {
              MoveEventType: `${PACKAGE_ID}::market::BetPlaced`,
            },
            limit: 100,
            order: "descending",
          })

          const userBets = betEvents.data.filter(
            (event) => event.parsedJson && (event.parsedJson as any).bettor === account.address,
          )

          totalBets = userBets.length

          const winEvents = await suiClient.queryEvents({
            query: {
              MoveEventType: `${PACKAGE_ID}::market::WinningsClaimed`,
            },
            limit: 100,
            order: "descending",
          })

          userWins = winEvents.data.filter(
            (event) => event.parsedJson && (event.parsedJson as any).winner === account.address,
          )

          totalWinnings = userWins.reduce((sum, event) => {
            const amount = (event.parsedJson as any).amount
            return sum + (amount ? Number.parseInt(amount) : 0)
          }, 0)

          const claimedMarkets = new Set(userWins.map((event) => (event.parsedJson as any).market_id))
          activeBets = userBets.filter((event) => !claimedMarkets.has((event.parsedJson as any).market_id)).length
        }
      } catch (eventError) {
        console.log("Could not load event data:", eventError)
      }

      const winRate = totalBets > 0 ? Math.round((userWins.length / totalBets) * 100) : 0

      setUserStats({
        totalBets,
        totalWinnings,
        winRate,
        activeBets,
        balance: totalBalance,
        joinedDate: new Date().toISOString().split("T")[0],
      })
    } catch (error) {
      console.error("Error loading user data:", error)
      toast({
        title: "Error Loading Profile",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    if (account?.address) {
      const success = await copyToClipboard(account.address)
      if (success) {
        toast({
          title: "Address Copied! 📋",
          description: "Wallet address copied to clipboard",
        })
      }
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected 👋",
      description: "Successfully disconnected from wallet",
    })
  }

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#efe7f7]" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-20 border-4 border-black"></div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Orbit-style Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#efe7f7]" />
        
        {/* Floating profile-related icons */}
        {["👤", "🏆", "💰", "📊", "⚡", "🎯"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              Profile
            </h1>
            <p className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Your prediction journey
            </p>
          </div>

          {/* Wallet Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-[#d3aeff] to-[#b8a3ff] rounded-3xl p-6 text-black border-4 border-black shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-black">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Predictor
                  </h3>
                  <p className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Since {userStats.joinedDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  {formatSUIAmount(userStats.balance)}
                </div>
                <div className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  SUI Balance
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/20 rounded-2xl p-3 backdrop-blur-sm border-2 border-black">
              <span className="font-black text-sm text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {formatAddress(account?.address || "")}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyAddress}
                  className="text-black hover:bg-white/10 p-2 rounded-xl border-2 border-black bg-white/20"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    account?.address && window.open(`https://testnet.suivision.xyz/account/${account.address}`, "_blank")
                  }
                  className="text-black hover:bg-white/10 p-2 rounded-xl border-2 border-black bg-white/20"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-2">
                <BarChart3 className="w-5 h-5 text-[#d3aeff]" />
                <span className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  Total Bets
                </span>
              </div>
              <div className="text-2xl font-black text-[#d3aeff]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {userStats.totalBets}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="w-5 h-5 text-[#99ff88]" />
                <span className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  Winnings
                </span>
              </div>
              <div className="text-2xl font-black text-[#99ff88]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {formatSUIAmount(userStats.totalWinnings)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Target className="w-5 h-5 text-[#ff6b6b]" />
                <span className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  Win Rate
                </span>
              </div>
              <div className="text-2xl font-black text-[#ff6b6b]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {userStats.winRate}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-5 h-5 text-[#ffb347]" />
                <span className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  Active Bets
                </span>
              </div>
              <div className="text-2xl font-black text-[#ffb347]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {userStats.activeBets}
              </div>
            </motion.div>
          </div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
          >
            <h3 className="font-black mb-4 flex items-center text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              <TrendingUp className="w-5 h-5 mr-2 text-[#d3aeff]" />
              Performance Overview
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[#d3aeff]">{userStats.totalBets > 0 ? "🔥" : "🌱"}</div>
                <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  {userStats.totalBets > 10 ? "Veteran" : userStats.totalBets > 0 ? "Rising" : "Newcomer"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#99ff88]">
                  {userStats.winRate >= 70 ? "🏆" : userStats.winRate >= 50 ? "⭐" : "🎯"}
                </div>
                <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  {userStats.winRate >= 70 ? "Expert" : userStats.winRate >= 50 ? "Good" : "Learning"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#ffb347]">
                  {userStats.totalWinnings > 10000000000 ? "💎" : userStats.totalWinnings > 1000000000 ? "💰" : "🪙"}
                </div>
                <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  {userStats.totalWinnings > 10000000000 ? "Whale" : userStats.totalWinnings > 1000000000 ? "Earner" : "Starter"}
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>Experience Level</span>
                  <span className="text-[#d3aeff] font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>{Math.min(userStats.totalBets * 10, 100)}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3 border-2 border-black">
                  <div 
                    className="bg-gradient-to-r from-[#d3aeff] to-[#b8a3ff] h-full rounded-full transition-all duration-1000 border border-black"
                    style={{ width: `${Math.min(userStats.totalBets * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>Prediction Accuracy</span>
                  <span className="text-[#99ff88] font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>{userStats.winRate}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3 border-2 border-black">
                  <div 
                    className="bg-gradient-to-r from-[#99ff88] to-[#66cc55] h-full rounded-full transition-all duration-1000 border border-black"
                    style={{ width: `${userStats.winRate}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
          >
            <h3 className="font-black mb-4 flex items-center text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              <Award className="w-5 h-5 mr-2 text-[#d3aeff]" />
              Recent Activity
            </h3>

            {userStats.totalBets === 0 ? (
              <div className="text-center py-8">
                <Coins className="w-12 h-12 mx-auto text-black/40 mb-3" />
                <p className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>No betting activity yet</p>
                <p className="text-sm text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>Start swiping to place your first bet!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-black/80 space-y-2" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  <div className="flex justify-between">
                    <span>Total Predictions:</span>
                    <span className="text-black font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>{userStats.totalBets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Winnings:</span>
                    <span className="text-[#99ff88] font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>{formatSUIAmount(userStats.totalWinnings)} SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className={`font-black ${userStats.winRate >= 50 ? 'text-[#99ff88]' : 'text-[#ffb347]'}`} style={{ fontFamily: 'Brice Black, sans-serif' }}>
                      {userStats.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Positions:</span>
                    <span className="text-[#ff6b6b] font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>{userStats.activeBets}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
          >
            <h3 className="font-black mb-4 flex items-center text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              <Zap className="w-5 h-5 mr-2 text-[#d3aeff]" />
              Achievements
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className={`text-center p-3 rounded-xl border-2 border-black ${userStats.totalBets >= 1 ? 'bg-[#d3aeff]/20' : 'bg-black/10'}`}>
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>First Bet</div>
              </div>
              <div className={`text-center p-3 rounded-xl border-2 border-black ${userStats.totalBets >= 10 ? 'bg-[#99ff88]/20' : 'bg-black/10'}`}>
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>10 Bets</div>
              </div>
              <div className={`text-center p-3 rounded-xl border-2 border-black ${userStats.winRate >= 60 ? 'bg-[#ffb347]/20' : 'bg-black/10'}`}>
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>60% Win Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Disconnect Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full border-4 border-black bg-white text-black hover:bg-black hover:text-white flex items-center justify-center rounded-2xl py-6 font-black shadow-lg transition-all duration-200"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}