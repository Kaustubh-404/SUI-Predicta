// src/pages/MarketsPage.tsx
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Check, X, Clock, TrendingUp, Users, Bot, Sparkles, Filter, Search, Zap, Target, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import type { Market } from "@/types/market"
import { formatSUI, placeBetTx, parseSUI, suiClient, PACKAGE_ID } from "@/lib/suiClient"
import { formatTimeRemaining, formatPercentage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { BlockchainAIAgent } from "@/services/blockchainAIAgent"

interface MarketsPageProps {
  markets: Market[]
  loading: boolean
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ markets: propMarkets, loading: propLoading }) => {
  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [markets, setMarkets] = useState<Market[]>(propMarkets)
  const [loading, setLoading] = useState(propLoading)
  const [bettingMarketId, setBettingMarketId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "ending">("newest")

  const categories = ["All", "Crypto", "Sports", "Entertainment", "Technology", "Politics", "Memes"]
  const blockchainAgent = BlockchainAIAgent.getInstance()

  const deduplicateMarkets = useCallback((markets: Market[]): Market[] => {
    const seen = new Set<string>();
    return markets.filter(market => {
      if (seen.has(market.id)) {
        return false;
      }
      seen.add(market.id);
      return true;
    });
  }, []);

  useEffect(() => {
    setMarkets(deduplicateMarkets(propMarkets))
    setLoading(propLoading)
  }, [propMarkets, propLoading, deduplicateMarkets])

  useEffect(() => {
    if (account) {
      loadBlockchainMarkets()
    }
  }, [account])

  useEffect(() => {
    const handleBlockchainMarkets = (event: CustomEvent) => {
      const { markets: newMarkets } = event.detail
      console.log("📊 New blockchain markets received:", newMarkets)
      
      setMarkets((prev) => {
        const combined = [...newMarkets, ...prev];
        return deduplicateMarkets(combined);
      });

      toast({
        title: "🔗 New Blockchain Markets!",
        description: `${newMarkets.length} markets created on SUI blockchain`,
      })
    }

    window.addEventListener("blockchainMarketsGenerated", handleBlockchainMarkets as EventListener)
    return () => window.removeEventListener("blockchainMarketsGenerated", handleBlockchainMarkets as EventListener)
  }, [toast, deduplicateMarkets])

  const loadBlockchainMarkets = async () => {
    try {
      setLoading(true)

      if (!PACKAGE_ID) {
        console.log("Package ID not set, using demo markets")
        return
      }

      const marketEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::MarketCreated`,
        },
        limit: 50,
        order: "descending",
      })

      const blockchainMarkets: Market[] = []

      for (const event of marketEvents.data) {
        if (event.parsedJson) {
          const data = event.parsedJson as any

          try {
            const marketObject = await suiClient.getObject({
              id: data.market_id,
              options: {
                showContent: true,
                showType: true,
              },
            })

            if (marketObject.data?.content && "fields" in marketObject.data.content) {
              const fields = marketObject.data.content.fields as any

              blockchainMarkets.push({
                id: data.market_id,
                question: data.question,
                optionA: fields.option_a || "Option A",
                optionB: fields.option_b || "Option B",
                expiresAt: Number.parseInt(data.expires_at),
                status: Number.parseInt(fields.status || "0"),
                outcome: Number.parseInt(fields.outcome || "2"),
                totalPool: Number.parseInt(fields.total_pool || "0"),
                optionAPool: Number.parseInt(fields.option_a_pool || "0"),
                optionBPool: Number.parseInt(fields.option_b_pool || "0"),
                category: "Blockchain",
              })
            }
          } catch (error) {
            console.log("Error fetching market object:", error)
          }
        }
      }

      if (blockchainMarkets.length > 0) {
        setMarkets((prev) => {
          const combined = [...blockchainMarkets, ...prev];
          return deduplicateMarkets(combined);
        });
        
        toast({
          title: "🔗 Blockchain Markets Loaded",
          description: `Found ${blockchainMarkets.length} markets on SUI blockchain`,
        })
      }
    } catch (error) {
      console.error("Error loading blockchain markets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickBet = async (market: Market, option: number) => {
    if (!account) {
      toast({
        title: "Wallet Not Connected ❌",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      setBettingMarketId(market.id)
      const betAmount = "0.01"
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
            console.log("Bet placed successfully:", result)
            toast({
              title: "Bet Placed Successfully! ✅",
              description: `${betAmount} SUI bet on "${optionName}"`,
            })
            loadBlockchainMarkets()
          },
          onError: (error) => {
            console.error("Bet failed:", error)
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
    } finally {
      setBettingMarketId(null)
    }
  }

  const generateAIMarkets = async () => {
    try {
      toast({
        title: "🤖 Generating Blockchain Markets...",
        description: "AI agent is creating markets on SUI blockchain",
      })

      const createdMarkets = await blockchainAgent.generateMarketsNow()

      toast({
        title: "✅ Blockchain Markets Created!",
        description: `${createdMarkets.length} new markets created on SUI`,
      })
    } catch (error) {
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate markets",
        variant: "destructive",
      })
    }
  }

  const filteredMarkets = markets
    .filter((market) => {
      const matchesSearch =
        market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.optionB.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || market.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.totalPool - a.totalPool
        case "ending":
          return a.expiresAt - b.expiresAt
        case "newest":
        default:
          return b.expiresAt - a.expiresAt
      }
    })

  const getMarketStatus = (market: Market) => {
    if (market.status === 1) return { text: "Resolved", color: "text-[#99ff88]", bg: "bg-[#99ff88]" }
    if (market.status === 2) return { text: "Cancelled", color: "text-[#ff6961]", bg: "bg-[#ff6961]" }
    if (Date.now() > market.expiresAt) return { text: "Expired", color: "text-[#d3aeff]", bg: "bg-[#d3aeff]" }
    return { text: "Active", color: "text-[#99ff88]", bg: "bg-[#99ff88]" }
  }

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#efe7f7]" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-3xl h-40 mb-4 border-4 border-black"></div>
              </div>
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
        
        {/* Floating market-related icons */}
        {["📊", "📈", "💹", "🎯", "💰", "⚡"].map((emoji, i) => (
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header with Orbit styling */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-black mb-4"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
            >
              Prediction Markets
            </motion.h1>
            <p className="text-black text-lg mb-6 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Browse and bet on viral prediction markets powered by AI
            </p>

            {/* AI Generate Button */}
            <Button
              onClick={generateAIMarkets}
              className="bg-[#99ff88] hover:bg-[#77dd66] mb-8 text-black rounded-2xl border-4 border-black font-black transform hover:-translate-y-1 transition-all"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
            >
              <Bot className="w-4 h-4 mr-2" />
              Generate AI Markets on Blockchain
            </Button>
          </div>

          {/* Filters with Orbit design */}
          <div className="bg-white rounded-3xl p-6 border-4 border-black shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] text-black placeholder-black/60 font-medium"
                  style={{ fontFamily: 'Brice Regular, sans-serif' }}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] text-black appearance-none font-medium"
                  style={{ fontFamily: 'Brice Regular, sans-serif' }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] text-black appearance-none font-medium"
                  style={{ fontFamily: 'Brice Regular, sans-serif' }}
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="ending">Ending Soon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Markets Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border-4 border-black text-center shadow-lg">
              <Activity className="w-5 h-5 text-[#d3aeff] mx-auto mb-1" />
              <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {filteredMarkets.length}
              </div>
              <div className="text-sm text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Total Markets
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border-4 border-black text-center shadow-lg">
              <Zap className="w-5 h-5 text-[#99ff88] mx-auto mb-1" />
              <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {filteredMarkets.filter((m) => m.status === 0).length}
              </div>
              <div className="text-sm text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Active
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border-4 border-black text-center shadow-lg">
              <Target className="w-5 h-5 text-[#ff6961] mx-auto mb-1" />
              <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {formatSUI(filteredMarkets.reduce((sum, m) => sum + m.totalPool, 0))}
              </div>
              <div className="text-sm text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                Total Pool
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border-4 border-black text-center shadow-lg">
              <Sparkles className="w-5 h-5 text-[#d3aeff] mx-auto mb-1" />
              <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {filteredMarkets.filter((m) => m.id.startsWith("ai_")).length}
              </div>
              <div className="text-sm text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                AI Generated
              </div>
            </div>
          </div>

          {/* Markets Grid with Orbit design */}
          <AnimatePresence>
            {filteredMarkets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredMarkets.map((market, index) => {
                  const status = getMarketStatus(market)
                  const oddsA = formatPercentage(market.optionAPool, market.totalPool)
                  const oddsB = 100 - oddsA
                  const isActive = status.text === "Active"
                  const isBetting = bettingMarketId === market.id
                  const isAIGenerated = market.id.startsWith("ai_")

                  return (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-3xl p-8 border-4 border-black hover:border-[#d3aeff] transition-all duration-500 group hover:shadow-2xl hover:-translate-y-2"
                    >
                      <div className="space-y-6">
                        {/* Market Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              {isAIGenerated && (
                                <div className="bg-[#d3aeff] text-black px-3 py-1 rounded-2xl text-xs font-black flex items-center border-2 border-black">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Generated
                                </div>
                              )}
                              {market.category && (
                                <span className="bg-[#efe7f7] text-black px-3 py-1 rounded-2xl text-xs font-black border-2 border-black">
                                  {market.category}
                                </span>
                              )}
                              <div className={`${status.bg} text-black px-3 py-1 rounded-2xl text-xs font-black border-2 border-black`}>
                                {status.text}
                              </div>
                            </div>

                            <h3 className="font-black text-xl mb-3 text-black group-hover:text-[#d3aeff] transition-colors" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                              {market.question}
                            </h3>

                            {isActive && (
                              <div className="flex items-center gap-2 text-sm text-black/60">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                                  {formatTimeRemaining(market.expiresAt)} remaining
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Options with Orbit design */}
                        <div className="space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-[#99ff88] rounded-2xl border-4 border-black hover:border-[#77dd66] transition-all shadow-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                <Check className="w-6 h-6 text-[#99ff88]" />
                              </div>
                              <span className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                                {market.optionA}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-black font-black text-lg" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                                {oddsA}%
                              </span>
                              {isActive && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickBet(market, 0)}
                                  disabled={isBetting}
                                  className="bg-black hover:bg-black/80 text-[#99ff88] rounded-xl font-black border-2 border-black"
                                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                                >
                                  {isBetting ? "Betting..." : "Bet"}
                                </Button>
                              )}
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-[#ff6961] rounded-2xl border-4 border-black hover:border-[#dd4444] transition-all shadow-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                <X className="w-6 h-6 text-[#ff6961]" />
                              </div>
                              <span className="font-black text-white" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                                {market.optionB}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-black text-lg" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                                {oddsB}%
                              </span>
                              {isActive && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickBet(market, 1)}
                                  disabled={isBetting}
                                  className="bg-black hover:bg-black/80 text-[#ff6961] rounded-xl font-black border-2 border-black"
                                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                                >
                                  {isBetting ? "Betting..." : "Bet"}
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                          <Progress value={oddsA} className="h-3 bg-[#efe7f7] rounded-full overflow-hidden border-2 border-black">
                            <div
                              className="h-full bg-gradient-to-r from-[#99ff88] to-[#77dd66] transition-all duration-500"
                              style={{ width: `${oddsA}%` }}
                            />
                          </Progress>
                          <div className="flex justify-between text-sm font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            <span className="text-[#99ff88]">{formatSUI(market.optionAPool)} SUI</span>
                            <span className="text-black/60">{formatSUI(market.totalPool)} SUI total</span>
                            <span className="text-[#ff6961]">{formatSUI(market.optionBPool)} SUI</span>
                          </div>
                        </div>

                        {/* Market Stats */}
                        <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                          <div className="flex items-center gap-4 text-sm text-black/60">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                                Pool: {formatSUI(market.totalPool)} SUI
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span className="font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                                Active
                              </span>
                            </div>
                          </div>
                          {market.status === 1 && (
                            <div className="text-sm text-[#99ff88] font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                              Winner: {market.outcome === 0 ? market.optionA : market.optionB}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <div className="bg-white rounded-3xl border-4 border-black p-12 shadow-xl">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-black mb-4 text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    No Markets Found
                  </h3>
                  <p className="text-black/80 mb-8 text-lg font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    {searchQuery || selectedCategory !== "All"
                      ? "Try adjusting your filters to see more markets"
                      : "Be the first to create a prediction market!"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {(searchQuery || selectedCategory !== "All") && (
                      <Button
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedCategory("All")
                        }}
                        variant="outline"
                        className="rounded-2xl border-4 border-black bg-white hover:bg-[#efe7f7] text-black font-black"
                        style={{ fontFamily: 'Brice Black, sans-serif' }}
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate("/create")}
                      className="bg-[#99ff88] hover:bg-[#77dd66] rounded-2xl text-black border-4 border-black font-black transform hover:-translate-y-1 transition-all"
                      style={{ fontFamily: 'Brice Black, sans-serif' }}
                    >
                      Create Market
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}

