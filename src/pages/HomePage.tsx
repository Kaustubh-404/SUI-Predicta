// src/pages/HomePage.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { EnhancedTinderSwipe } from "@/components/TinderSwipe"
import { AIAgentDashboard } from "@/components/AIAgentDashboard"
import type { Market } from "@/types/market"
import { placeBetTx, parseSUI } from "@/lib/suiClient"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles, TrendingUp, Target, Zap, Settings } from "lucide-react"
import { ProductionAIAgent } from "@/services/productionAIAgent"
import { motion, AnimatePresence } from "framer-motion"

interface HomePageProps {
  markets: Market[]
  loading: boolean
  onMarketsUpdate: () => void
}

export const HomePage: React.FC<HomePageProps> = ({ markets, loading, onMarketsUpdate }) => {
  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const { toast } = useToast()
  const [currentIndex, setCurrentIndex] = useState(markets.length - 1)
  const [isGeneratingMarkets, setIsGeneratingMarkets] = useState(false)
  const [showAgentDashboard, setShowAgentDashboard] = useState(false)
  const [agentStatus, setAgentStatus] = useState<any>(null)
  const [stats, setStats] = useState({
    totalBets: 0,
    totalVolume: 0,
    winRate: 0,
  })

  const aiAgent = ProductionAIAgent.getInstance()

  useEffect(() => {
    setCurrentIndex(markets.length - 1)
  }, [markets.length])

  useEffect(() => {
    aiAgent.start()
    updateAgentStatus()
    const statusInterval = setInterval(updateAgentStatus, 30000)
    return () => clearInterval(statusInterval)
  }, [])

  useEffect(() => {
    const totalVolume = markets.reduce((sum, market) => sum + market.totalPool, 0)
    const activeBets = markets.filter((market) => market.status === 0).length
    const mockWinRate = Math.min(Math.max(45 + Math.random() * 20, 45), 85)

    setStats({
      totalBets: activeBets,
      totalVolume,
      winRate: Math.round(mockWinRate),
    })
  }, [markets])

  const updateAgentStatus = () => {
    const status = aiAgent.getStatus()
    setAgentStatus(status)
  }

  const handleSwipeLeft = (market: Market) => {
    console.log("Skipped market:", market.question)
    toast({
      title: "Market Skipped 👋",
      description: "Swiped left to skip this prediction",
    })
  }

  const handleSwipeRight = async (market: Market, betAmount: string) => {
    try {
      if (!account) {
        toast({
          title: "Wallet Not Connected ❌",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return
      }

      const option = Math.random() > 0.5 ? 0 : 1
      const optionName = option === 0 ? market.optionA : market.optionB

      toast({
        title: "Placing Bet... 🚀",
        description: `Betting ${betAmount} SUI on "${optionName}"`,
      })

      const tx = placeBetTx(market.id, option, parseSUI(betAmount))

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result)
            toast({
              title: "Bet Placed Successfully! ✅",
              description: `${betAmount} SUI bet on "${optionName}"`,
            })
            onMarketsUpdate()
          },
          onError: (error) => {
            console.error("Transaction failed:", error)
            toast({
              title: "Bet Failed ❌",
              description: "Failed to place bet. Please try again.",
              variant: "destructive",
            })
          },
        },
      )
    } catch (error) {
      console.error("Error placing bet:", error)
      toast({
        title: "Bet Failed ❌",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generateAIMarkets = async () => {
    try {
      setIsGeneratingMarkets(true)
      toast({
        title: "Generating Markets... 🤖",
        description: "AI is creating viral prediction markets",
      })

      const generatedMarkets = await aiAgent.generateMarketsNow()

      toast({
        title: "Markets Generated! ✨",
        description: `${generatedMarkets.length} new viral markets created`,
      })

      updateAgentStatus()
    } catch (error) {
      console.error("Error generating AI markets:", error)
      toast({
        title: "Generation Failed ❌",
        description: error instanceof Error ? error.message : "Failed to generate AI markets",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingMarkets(false)
    }
  }

  const hasMoreMarkets = currentIndex >= 0

  return (
    <>
      {/* Orbit-style Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#efe7f7]" />
        
        {/* Decorative floating elements */}
        {["💎", "🚀", "⭐", "🔥", "💰", "🎯"].map((emoji, i) => (
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

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-lg min-h-screen">
        {/* Header with Orbit styling */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
            ORBIT
          </h1>
          <p className="text-black/80 mb-4 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            Swipe right to bet, left to skip
          </p>

          {/* AI Agent Status with Orbit design */}
          <div
            className={`${
              agentStatus?.isRunning 
                ? "bg-[#99ff88] border-black" 
                : "bg-[#d3aeff] border-black"
            } rounded-2xl p-3 mb-4 border-4 backdrop-blur-sm shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    agentStatus?.isRunning 
                      ? "bg-black animate-pulse" 
                      : "bg-black"
                  }`}
                ></div>
                <span
                  className="text-sm font-black text-black"
                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                >
                  AI Agent {agentStatus?.isRunning ? "Active" : "Inactive"}
                </span>
              </div>
              <Button 
                onClick={() => setShowAgentDashboard(true)} 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-black/10 rounded-xl"
              >
                <Settings className="w-4 h-4 text-black" />
              </Button>
            </div>
            {agentStatus?.isRunning && (
              <div className="text-xs text-black/80 mt-1 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Generated {agentStatus.metrics?.totalMarketsGenerated || 0} markets • Next: {agentStatus.nextExecution}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards with Orbit design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-[#d3aeff] mx-auto mb-1" />
            <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              {stats.totalBets}
            </div>
            <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Active Markets
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
            <Target className="w-5 h-5 text-[#99ff88] mx-auto mb-1" />
            <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              {stats.winRate}%
            </div>
            <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Success Rate
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
            <Zap className="w-5 h-5 text-[#ff6961] mx-auto mb-1" />
            <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              {markets.length}
            </div>
            <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Available
            </div>
          </div>
        </motion.div>

        {/* Swipe Interface */}
        <div className="mb-15">
          <AnimatePresence mode="wait">
            {hasMoreMarkets ? (
              <motion.div
                key="swipe-interface"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedTinderSwipe
                  markets={markets}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  currentIndex={currentIndex}
                  isLoading={loading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="no-markets"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-16"
              >
                <div className="bg-white rounded-3xl border-4 border-black p-8 shadow-xl">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-black mb-4 text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    All Markets Swiped!
                  </h2>
                  <p className="text-black/80 mb-8 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    You've seen all available markets. Generate new ones or check back later!
                  </p>

                  <div className="space-y-4">
                    <Button
                      onClick={generateAIMarkets}
                      disabled={isGeneratingMarkets || agentStatus?.isGenerating}
                      className="w-full bg-[#99ff88] hover:bg-[#77dd66] py-4 text-black shadow-lg rounded-2xl border-4 border-black font-black transform hover:-translate-y-1 transition-all"
                      style={{ fontFamily: 'Brice Black, sans-serif' }}
                    >
                      {isGeneratingMarkets || agentStatus?.isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          AI Agent Working...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate AI Markets Now
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={onMarketsUpdate}
                      variant="outline"
                      className="w-full py-4 border-4 border-black bg-white shadow-lg rounded-2xl text-black hover:bg-[#efe7f7] font-black transform hover:-translate-y-1 transition-all"
                      disabled={isGeneratingMarkets}
                      style={{ fontFamily: 'Brice Black, sans-serif' }}
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Refresh Markets
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Agent Info with Orbit styling */}
        {agentStatus?.metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg mb-6"
          >
            <h4 className="font-black text-black mb-3 flex items-center" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              <span className="text-2xl mr-2">🤖</span>
              AI Agent Performance
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-black font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Total Generated: {agentStatus.metrics.totalMarketsGenerated}
                </div>
                <div className="text-black font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Success Rate:{" "}
                  {agentStatus.metrics.successfulGenerations > 0
                    ? Math.round(
                        (agentStatus.metrics.successfulGenerations /
                          (agentStatus.metrics.successfulGenerations + agentStatus.metrics.failedGenerations)) *
                          100,
                      )
                    : 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-black font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Daily Streak: {agentStatus.metrics.dailyGenerationStreak}
                </div>
                <div className="text-black font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Avg Speed:{" "}
                  {agentStatus.metrics.averageGenerationTime > 0
                    ? Math.round(agentStatus.metrics.averageGenerationTime / 1000) + "s"
                    : "N/A"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips Section with Orbit design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 pt-5"
        >
          <div className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg">
            <h4 className="font-black text-black mb-2 flex items-center" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              <span className="text-2xl mr-2">💡</span>
              Pro Tips
            </h4>
            <ul className="text-sm text-black/80 space-y-1 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              <li>• Swipe right to customize your bet amount (0.01 - 100 SUI)</li>
              <li>• Higher odds = higher potential winnings</li>
              <li>• AI generates fresh markets daily based on trending topics</li>
              <li>• Check the dashboard to monitor AI agent performance</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* AI Agent Dashboard Modal */}
      <AIAgentDashboard
        isOpen={showAgentDashboard}
        onClose={() => {
          setShowAgentDashboard(false)
          updateAgentStatus()
        }}
      />
    </>
  )
}

