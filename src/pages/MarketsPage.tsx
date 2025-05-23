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

  // Deduplication function
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
    // Deduplicate incoming markets from props
    setMarkets(deduplicateMarkets(propMarkets))
    setLoading(propLoading)
  }, [propMarkets, propLoading, deduplicateMarkets])

  useEffect(() => {
    if (account) {
      loadBlockchainMarkets()
    }
  }, [account])

  // Listen for blockchain markets
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

      // Load markets from blockchain events
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
      const betAmount = "0.01" // Default bet amount
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
    if (market.status === 1) return { text: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/10" }
    if (market.status === 2) return { text: "Cancelled", color: "text-rose-400", bg: "bg-rose-500/10" }
    if (Date.now() > market.expiresAt) return { text: "Expired", color: "text-amber-400", bg: "bg-amber-500/10" }
    return { text: "Active", color: "text-indigo-400", bg: "bg-indigo-500/10" }
  }

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/50 to-indigo-900" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/60 rounded-3xl h-40 mb-4"></div>
              </div>
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
          {/* Enhanced Header */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4"
            >
              Prediction Markets
            </motion.h1>
            <p className="text-slate-400 text-lg mb-6">Browse and bet on viral prediction markets powered by AI</p>

            {/* AI Generate Button */}
            <Button
              onClick={generateAIMarkets}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 mb-8 text-white rounded-2xl border border-violet-400"
            >
              <Bot className="w-4 h-4 mr-2" />
              Generate AI Markets on Blockchain
            </Button>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-400"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white appearance-none"
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
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white appearance-none"
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
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 text-center">
              <Activity className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-indigo-400">{filteredMarkets.length}</div>
              <div className="text-sm text-slate-400">Total Markets</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 text-center">
              <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-emerald-400">
                {filteredMarkets.filter((m) => m.status === 0).length}
              </div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 text-center">
              <Target className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-violet-400">
                {formatSUI(filteredMarkets.reduce((sum, m) => sum + m.totalPool, 0))}
              </div>
              <div className="text-sm text-slate-400">Total Pool</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 text-center">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-amber-400">
                {filteredMarkets.filter((m) => m.id.startsWith("ai_")).length}
              </div>
              <div className="text-sm text-slate-400">AI Generated</div>
            </div>
          </div>

          {/* Enhanced Markets Grid */}
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
                      className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 hover:border-violet-500/50 transition-all duration-500 group hover:shadow-2xl hover:shadow-violet-500/10"
                    >
                      <div className="space-y-6">
                        {/* Market Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              {isAIGenerated && (
                                <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Generated
                                </div>
                              )}
                              {market.category && (
                                <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-600">
                                  {market.category}
                                </span>
                              )}
                              <div className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-xs font-medium border border-current/30`}>
                                {status.text}
                              </div>
                            </div>

                            <h3 className="font-bold text-xl mb-3 text-white group-hover:text-violet-300 transition-colors">
                              {market.question}
                            </h3>

                            {isActive && (
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeRemaining(market.expiresAt)} remaining</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Options */}
                        <div className="space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-semibold text-emerald-300">{market.optionA}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-400 font-bold text-lg">{oddsA}%</span>
                              {isActive && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickBet(market, 0)}
                                  disabled={isBetting}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                >
                                  {isBetting ? "Betting..." : "Bet"}
                                </Button>
                              )}
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 hover:border-rose-400/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
                                <X className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-semibold text-rose-300">{market.optionB}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-rose-400 font-bold text-lg">{oddsB}%</span>
                              {isActive && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickBet(market, 1)}
                                  disabled={isBetting}
                                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                                >
                                  {isBetting ? "Betting..." : "Bet"}
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-3">
                          <Progress value={oddsA} className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
                              style={{ width: `${oddsA}%` }}
                            />
                          </Progress>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-emerald-400">{formatSUI(market.optionAPool)} SUI</span>
                            <span className="text-slate-400">{formatSUI(market.totalPool)} SUI total</span>
                            <span className="text-rose-400">{formatSUI(market.optionBPool)} SUI</span>
                          </div>
                        </div>

                        {/* Market Stats */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>Pool: {formatSUI(market.totalPool)} SUI</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>Active</span>
                            </div>
                          </div>
                          {market.status === 1 && (
                            <div className="text-sm text-emerald-400 font-medium">
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
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold mb-4 text-white">No Markets Found</h3>
                <p className="text-slate-400 mb-8 text-lg">
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
                      className="rounded-2xl border border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate("/create")}
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 rounded-2xl text-white border border-violet-400"
                  >
                    Create Market
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}