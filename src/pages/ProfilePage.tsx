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

      // Load user balance
      const coins = await suiClient.getCoins({
        owner: account.address,
        coinType: "0x2::sui::SUI",
      })

      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + Number.parseInt(coin.balance)
      }, 0)

      // Load user bet history from events
      let totalBets = 0
      let totalWinnings = 0
      let activeBets = 0
      let userWins: any[] = []

      try {
        if (PACKAGE_ID) {
          // Query SharesPurchased events for this user
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

          // Query WinningsClaimed events for this user
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

          // Count active bets (bets without corresponding claims)
          const claimedMarkets = new Set(userWins.map((event) => (event.parsedJson as any).market_id))

          activeBets = userBets.filter((event) => !claimedMarkets.has((event.parsedJson as any).market_id)).length
        }
      } catch (eventError) {
        console.log("Could not load event data:", eventError)
        // Continue with zero values if events can't be loaded
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/50 to-indigo-900" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-800/60 rounded-2xl h-20"></div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Enhanced Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/50 to-indigo-900" />
        
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 via-transparent to-indigo-500/20 animate-pulse" />
        </div>

        {/* Floating profile-related icons */}
        {["👤", "🏆", "💰", "📊", "⚡", "🎯"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              Profile
            </h1>
            <p className="text-slate-400">Your prediction journey</p>
          </div>

          {/* Wallet Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl p-6 text-white border border-violet-400 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Predictor</h3>
                  <p className="text-sm opacity-90">Since {userStats.joinedDate}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatSUIAmount(userStats.balance)}</div>
                <div className="text-sm opacity-90">SUI Balance</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <span className="font-mono text-sm">{formatAddress(account?.address || "")}</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyAddress}
                  className="text-white hover:bg-white/10 p-2 rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    account?.address && window.open(`https://testnet.suivision.xyz/account/${account.address}`, "_blank")
                  }
                  className="text-white hover:bg-white/10 p-2 rounded-xl"
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
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                <span className="text-sm text-slate-400">Total Bets</span>
              </div>
              <div className="text-2xl font-bold text-violet-400">{userStats.totalBets}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Winnings</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{formatSUIAmount(userStats.totalWinnings)}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-400">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-indigo-400">{userStats.winRate}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-400">Active Bets</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{userStats.activeBets}</div>
            </motion.div>
          </div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
          >
            <h3 className="font-semibold mb-4 flex items-center text-white">
              <TrendingUp className="w-5 h-5 mr-2 text-violet-400" />
              Performance Overview
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-violet-400">{userStats.totalBets > 0 ? "🔥" : "🌱"}</div>
                <div className="text-xs text-slate-400">
                  {userStats.totalBets > 10 ? "Veteran" : userStats.totalBets > 0 ? "Rising" : "Newcomer"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-400">
                  {userStats.winRate >= 70 ? "🏆" : userStats.winRate >= 50 ? "⭐" : "🎯"}
                </div>
                <div className="text-xs text-slate-400">
                  {userStats.winRate >= 70 ? "Expert" : userStats.winRate >= 50 ? "Good" : "Learning"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-400">
                  {userStats.totalWinnings > 10000000000 ? "💎" : userStats.totalWinnings > 1000000000 ? "💰" : "🪙"}
                </div>
                <div className="text-xs text-slate-400">
                  {userStats.totalWinnings > 10000000000 ? "Whale" : userStats.totalWinnings > 1000000000 ? "Earner" : "Starter"}
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Experience Level</span>
                  <span className="text-violet-400">{Math.min(userStats.totalBets * 10, 100)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(userStats.totalBets * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Prediction Accuracy</span>
                  <span className="text-emerald-400">{userStats.winRate}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-1000"
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
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
          >
            <h3 className="font-semibold mb-4 flex items-center text-white">
              <Award className="w-5 h-5 mr-2 text-violet-400" />
              Recent Activity
            </h3>

            {userStats.totalBets === 0 ? (
              <div className="text-center py-8">
                <Coins className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No betting activity yet</p>
                <p className="text-sm text-slate-500">Start swiping to place your first bet!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Predictions:</span>
                    <span className="text-white font-medium">{userStats.totalBets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Winnings:</span>
                    <span className="text-emerald-400 font-medium">{formatSUIAmount(userStats.totalWinnings)} SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className={`font-medium ${userStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {userStats.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Positions:</span>
                    <span className="text-indigo-400 font-medium">{userStats.activeBets}</span>
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
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
          >
            <h3 className="font-semibold mb-4 flex items-center text-white">
              <Zap className="w-5 h-5 mr-2 text-violet-400" />
              Achievements
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className={`text-center p-3 rounded-xl ${userStats.totalBets >= 1 ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-slate-700/30'}`}>
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs text-slate-400">First Bet</div>
              </div>
              <div className={`text-center p-3 rounded-xl ${userStats.totalBets >= 10 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-700/30'}`}>
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs text-slate-400">10 Bets</div>
              </div>
              <div className={`text-center p-3 rounded-xl ${userStats.winRate >= 60 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/30'}`}>
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs text-slate-400">60% Win Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Disconnect Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full border border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white flex items-center justify-center rounded-2xl py-4"
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