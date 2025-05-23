// src/pages/LeaderboardPage.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { motion } from "framer-motion"
import { Trophy, TrendingUp, User, Zap, Target, Activity } from "lucide-react"
import { formatAddress, formatSUIAmount } from "@/lib/utils"
import { suiClient, PACKAGE_ID } from "@/lib/suiClient"

interface LeaderboardEntry {
  address: string
  winnings: number
  totalBets: number
  winRate: number
  rank: number
}

export const LeaderboardPage: React.FC = () => {
  const account = useCurrentAccount()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)

      if (!PACKAGE_ID) {
        console.log("Package ID not set, showing empty leaderboard")
        setLoading(false)
        return
      }

      // Get all WinningsClaimed events to calculate leaderboard
      const winEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::WinningsClaimed`,
        },
        limit: 1000,
        order: "descending",
      })

      // Get all SharesPurchased events to calculate total bets
      const betEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::BetPlaced`,
        },
        limit: 1000,
        order: "descending",
      })

      // Aggregate data by address
      const userStats = new Map<
        string,
        {
          winnings: number
          totalBets: number
          wins: number
        }
      >()

      // Process winning events
      winEvents.data.forEach((event) => {
        if (event.parsedJson) {
          const data = event.parsedJson as any
          const address = data.winner
          const amount = Number.parseInt(data.amount || "0")

          if (!userStats.has(address)) {
            userStats.set(address, { winnings: 0, totalBets: 0, wins: 0 })
          }

          const stats = userStats.get(address)!
          stats.winnings += amount
          stats.wins += 1
        }
      })

      // Process betting events
      betEvents.data.forEach((event) => {
        if (event.parsedJson) {
          const data = event.parsedJson as any
          const address = data.bettor

          if (!userStats.has(address)) {
            userStats.set(address, { winnings: 0, totalBets: 0, wins: 0 })
          }

          const stats = userStats.get(address)!
          stats.totalBets += 1
        }
      })

      // Convert to leaderboard entries and sort by winnings
      const entries: LeaderboardEntry[] = Array.from(userStats.entries())
        .map(([address, stats]) => ({
          address,
          winnings: stats.winnings,
          totalBets: stats.totalBets,
          winRate: stats.totalBets > 0 ? Math.round((stats.wins / stats.totalBets) * 100) : 0,
          rank: 0, // Will be set after sorting
        }))
        .sort((a, b) => b.winnings - a.winnings)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

      setLeaderboard(entries)

      // Find current user's rank
      if (account?.address) {
        const userEntry = entries.find((entry) => entry.address === account.address)
        setUserRank(userEntry ? userEntry.rank : null)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }


  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "👑"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return "⭐"
    }
  }

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-amber-400 via-amber-500 to-amber-600"
      case 2:
        return "from-slate-400 via-slate-500 to-slate-600"
      case 3:
        return "from-amber-400 via-amber-500 to-amber-600"
      default:
        return "from-indigo-400 via-indigo-500 to-indigo-600"
    }
  }

  if (loading) {
    return (
      <>
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/50 to-indigo-900" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          <div className="space-y-4">
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

        {/* Floating trophies and medals */}
        {["🏆", "🥇", "🥈", "🥉", "⭐", "💎"].map((emoji, i) => (
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
              Leaderboard
            </h1>
            <p className="text-slate-400">Top predictors by winnings</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-700 text-center">
              <TrendingUp className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{leaderboard.length}</div>
              <div className="text-xs text-slate-400">Total Players</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-700 text-center">
              <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">
                {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, user) => sum + user.winRate, 0) / leaderboard.length) : 0}%
              </div>
              <div className="text-xs text-slate-400">Avg Win Rate</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-700 text-center">
              <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">
                {leaderboard.length > 0 ? formatSUIAmount(Math.max(...leaderboard.map(u => u.winnings))) : '0'}
              </div>
              <div className="text-xs text-slate-400">Top Winnings</div>
            </div>
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-sm rounded-3xl p-6 border border-amber-400/30"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center justify-center">
                  <Trophy className="w-6 h-6 mr-2 text-amber-400" />
                  Hall of Fame
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((user) => (
                  <div key={user.address} className="text-center">
                    <div className="text-3xl mb-2">{getRankEmoji(user.rank)}</div>
                    <div className="text-sm font-medium mb-1 text-white">{formatAddress(user.address)}</div>
                    <div className="text-xs text-amber-300">{formatSUIAmount(user.winnings)} SUI</div>
                    <div className="text-xs text-amber-400">{user.winRate}% wins</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-600">
              <h3 className="font-semibold flex items-center text-white">
                <Activity className="w-5 h-5 mr-2 text-violet-400" />
                Full Rankings
              </h3>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 mb-2">No leaderboard data yet</p>
                <p className="text-sm text-slate-500">Start betting to see rankings appear!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {leaderboard.slice(0, 10).map((user, index) => (
                  <motion.div
                    key={user.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 flex items-center justify-between ${
                      user.address === account?.address ? "bg-violet-500/10 border-l-4 border-violet-400" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${getRankBackground(user.rank)} rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                      >
                        {user.rank}
                      </div>
                      <div>
                        <div className="font-medium flex items-center text-white">
                          {formatAddress(user.address)}
                          {user.address === account?.address && (
                            <span className="ml-2 text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full border border-violet-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400">
                          {user.totalBets} bets • {user.winRate}% win rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-400">{formatSUIAmount(user.winnings)} SUI</div>
                      <div className="text-xs text-slate-500">Total winnings</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Your Rank Card */}
          {account?.address && userRank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-white">Your Rank</div>
                    <div className="text-sm text-slate-400">
                      {userRank <= 10 ? "You're in the top 10!" : "Keep betting to climb higher!"}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-indigo-400">#{userRank}</div>
              </div>
            </motion.div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700"
          >
            <div className="text-center">
              <h4 className="font-semibold text-white mb-2">🚀 How to Climb the Leaderboard</h4>
              <p className="text-sm text-slate-400">
                Win prediction markets to earn SUI rewards and climb the rankings. The more you win, the higher you'll rank!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}