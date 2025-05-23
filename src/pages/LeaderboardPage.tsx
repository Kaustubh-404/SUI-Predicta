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

      const winEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::WinningsClaimed`,
        },
        limit: 1000,
        order: "descending",
      })

      const betEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::BetPlaced`,
        },
        limit: 1000,
        order: "descending",
      })

      const userStats = new Map<
        string,
        {
          winnings: number
          totalBets: number
          wins: number
        }
      >()

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

      const entries: LeaderboardEntry[] = Array.from(userStats.entries())
        .map(([address, stats]) => ({
          address,
          winnings: stats.winnings,
          totalBets: stats.totalBets,
          winRate: stats.totalBets > 0 ? Math.round((stats.wins / stats.totalBets) * 100) : 0,
          rank: 0,
        }))
        .sort((a, b) => b.winnings - a.winnings)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

      setLeaderboard(entries)

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
      case 1: return "👑"
      case 2: return "🥈"
      case 3: return "🥉"
      default: return "⭐"
    }
  }

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-[#d3aeff] to-[#b8a3ff]"
      case 2: return "bg-gradient-to-r from-[#99ff88] to-[#77dd66]"
      case 3: return "bg-gradient-to-r from-[#ff6961] to-[#dd4444]"
      default: return "bg-white"
    }
  }

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1: return "border-[#d3aeff]"
      case 2: return "border-[#99ff88]"
      case 3: return "border-[#ff6961]"
      default: return "border-black"
    }
  }

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#efe7f7]" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
          <div className="space-y-4">
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
        
        {/* Floating trophies and medals */}
        {["🏆", "🥇", "🥈", "🥉", "⭐", "💎"].map((emoji, i) => (
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
              Leaderboard
            </h1>
            <p className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Top predictors by winnings
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-[#d3aeff] mx-auto mb-1" />
              <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {leaderboard.length}
              </div>
              <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Total Players
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
              <Target className="w-5 h-5 text-[#99ff88] mx-auto mb-1" />
              <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, user) => sum + user.winRate, 0) / leaderboard.length) : 0}%
              </div>
              <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Avg Win Rate
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
              <Zap className="w-5 h-5 text-[#ff6961] mx-auto mb-1" />
              <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {leaderboard.length > 0 ? formatSUIAmount(Math.max(...leaderboard.map(u => u.winnings))) : '0'}
              </div>
              <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Top Winnings
              </div>
            </div>
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-[#d3aeff]/20 to-[#99ff88]/20 backdrop-blur-sm rounded-3xl p-6 border-4 border-black shadow-xl"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-black text-black flex items-center justify-center" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  <Trophy className="w-6 h-6 mr-2 text-[#d3aeff]" />
                  Hall of Fame
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((user) => (
                  <div key={user.address} className="text-center">
                    <div className="text-3xl mb-2">{getRankEmoji(user.rank)}</div>
                    <div className="text-sm font-black mb-1 text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                      {formatAddress(user.address)}
                    </div>
                    <div className="text-xs text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                      {formatSUIAmount(user.winnings)} SUI
                    </div>
                    <div className="text-xs text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                      {user.winRate}% wins
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white rounded-3xl border-4 border-black overflow-hidden shadow-xl">
            <div className="p-4 border-b-2 border-black bg-[#efe7f7]">
              <h3 className="font-black flex items-center text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                <Activity className="w-5 h-5 mr-2 text-[#d3aeff]" />
                Full Rankings
              </h3>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto text-black/30 mb-3" />
                <p className="text-black/80 mb-2 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  No leaderboard data yet
                </p>
                <p className="text-sm text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  Start betting to see rankings appear!
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-black">
                {leaderboard.slice(0, 10).map((user, index) => (
                  <motion.div
                    key={user.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 flex items-center justify-between ${
                      user.address === account?.address ? "bg-[#d3aeff]/20 border-l-4 border-[#d3aeff]" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${getRankBackground(user.rank)} rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-lg border-2 ${getRankBorder(user.rank)}`}
                        style={{ fontFamily: 'Brice Black, sans-serif' }}
                      >
                        {user.rank}
                      </div>
                      <div>
                        <div className="font-black flex items-center text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                          {formatAddress(user.address)}
                          {user.address === account?.address && (
                            <span className="ml-2 text-xs bg-[#d3aeff] text-black px-2 py-1 rounded-full border-2 border-black font-black">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-black/70 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                          {user.totalBets} bets • {user.winRate}% win rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[#99ff88]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                        {formatSUIAmount(user.winnings)} SUI
                      </div>
                      <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                        Total winnings
                      </div>
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
              className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-[#d3aeff]" />
                  <div>
                    <div className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                      Your Rank
                    </div>
                    <div className="text-sm text-black/70 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                      {userRank <= 10 ? "You're in the top 10!" : "Keep betting to climb higher!"}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#d3aeff]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  #{userRank}
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
          >
            <div className="text-center">
              <h4 className="font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                🚀 How to Climb the Leaderboard
              </h4>
              <p className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Win prediction markets to earn SUI rewards and climb the rankings. The more you win, the higher you'll rank!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}