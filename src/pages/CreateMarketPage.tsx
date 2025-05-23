// src/pages/CreateMarketPage.tsx
import type React from "react"
import { useState } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { motion } from "framer-motion"
import { Calendar, Clock, Sparkles, ArrowRight, Zap, TrendingUp, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createMarketTx } from "@/lib/suiClient"
import { type Market, MARKET_CATEGORIES } from "@/types/market"
import { AIMarketGenerator } from "@/lib/aiMarketGenerator"

interface CreateMarketPageProps {
  onMarketCreated: (market: Market) => void
}

export const CreateMarketPage: React.FC<CreateMarketPageProps> = ({ onMarketCreated }) => {
  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    duration: "24", // hours
    category: "General",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateAIQuestion = async () => {
    try {
      setIsGeneratingAI(true)
      toast({
        title: "Generating Question... 🤖",
        description: "AI is creating a viral prediction market",
      })

      const aiGenerator = AIMarketGenerator.getInstance()
      const markets = await aiGenerator.generateTrendingMarkets(1)

      if (markets.length > 0) {
        const market = markets[0]
        setFormData({
          question: market.question,
          optionA: market.optionA,
          optionB: market.optionB,
          duration: "24",
          category: market.category,
        })

        toast({
          title: "AI Question Generated! ✨",
          description: "Feel free to edit and customize",
        })
      }
    } catch (error) {
      console.error("Error generating AI question:", error)
      toast({
        title: "Generation Failed ❌",
        description: "Failed to generate AI question",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      toast({
        title: "Wallet Not Connected ❌",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!formData.question || !formData.optionA || !formData.optionB) {
      toast({
        title: "Missing Fields ⚠️",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)
      toast({
        title: "Creating Market... 🚀",
        description: "Submitting to SUI blockchain",
      })

      const durationMs = Number.parseInt(formData.duration) * 60 * 60 * 1000 // Convert hours to ms
      const tx = createMarketTx(formData.question, formData.optionA, formData.optionB, durationMs)

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Market creation successful:", result)

            const newMarket: Market = {
              id: result.digest, // Use transaction digest as temporary ID
              question: formData.question,
              optionA: formData.optionA,
              optionB: formData.optionB,
              expiresAt: Date.now() + durationMs,
              status: 0,
              outcome: 2,
              totalPool: 0,
              optionAPool: 0,
              optionBPool: 0,
              category: formData.category,
            }

            onMarketCreated(newMarket)

            toast({
              title: "Market Created! 🎉",
              description: "Your prediction market is now live",
            })

            // Reset form
            setFormData({
              question: "",
              optionA: "",
              optionB: "",
              duration: "24",
              category: "General",
            })
          },
          onError: (error) => {
            console.error("Market creation failed:", error)
            toast({
              title: "Creation Failed ❌",
              description: "Failed to create market. Please try again.",
              variant: "destructive",
            })
          },
        },
      )
    } catch (error) {
      console.error("Error creating market:", error)
      toast({
        title: "Creation Failed ❌",
        description: "Failed to create market. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {/* Enhanced Background with Modern Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/50 to-indigo-900" />
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 via-transparent to-indigo-500/20 animate-pulse" />
        </div>

        {/* Floating geometric elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              background: `linear-gradient(45deg, ${
                i % 4 === 0 ? "#8b5cf6, #3b82f6" : 
                i % 4 === 1 ? "#06b6d4, #10b981" : 
                i % 4 === 2 ? "#f59e0b, #ef4444" :
                "#ec4899, #8b5cf6"
              })`,
              width: Math.random() * 120 + 60,
              height: Math.random() * 120 + 60,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: i % 2 === 0 ? '50%' : '25%',
            }}
            animate={{
              x: [0, Math.random() * 60 - 30],
              y: [0, Math.random() * 60 - 30],
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating icons */}
        {["💡", "🚀", "⭐", "🔥", "💰", "🎯"].map((emoji, i) => (
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
              Create Market
            </h1>
            <p className="text-slate-400">Create your own prediction market</p>
          </div>

          {/* AI Generate Button */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Button
              onClick={generateAIQuestion}
              disabled={isGeneratingAI}
              variant="outline"
              className="w-full border border-violet-700/30 bg-violet-500/50 hover:bg-violet-500/20 text-violet-300 hover:text-white rounded-2xl py-4"
            >
              {isGeneratingAI ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Question
                </>
              )}
            </Button>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700"
          >
            {/* Question */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Question *</label>
              <textarea
                value={formData.question}
                onChange={(e) => handleInputChange("question", e.target.value)}
                placeholder="Will Bitcoin reach $100k before 2025 ends?"
                className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none h-20 text-white placeholder-slate-400"
                required
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Option A *</label>
                <input
                  type="text"
                  value={formData.optionA}
                  onChange={(e) => handleInputChange("optionA", e.target.value)}
                  placeholder="Yes, to the moon! 🚀"
                  className="w-full p-3 bg-slate-900/50 border border-emerald-500/30 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Option B *</label>
                <input
                  type="text"
                  value={formData.optionB}
                  onChange={(e) => handleInputChange("optionB", e.target.value)}
                  placeholder="No, bear market 📉"
                  className="w-full p-3 bg-slate-900/50 border border-rose-500/30 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-white placeholder-slate-400"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
              >
                <option value="General">General</option>
                {MARKET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Duration</label>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className="flex-1 p-3 bg-slate-900/50 border border-slate-600 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                  <option value="72">3 days</option>
                  <option value="168">1 week</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 py-4 text-white rounded-2xl border border-violet-400"
            >
              {isCreating ? (
                <>
                  <Calendar className="w-4 h-4 mr-2 animate-pulse" />
                  Creating...
                </>
              ) : (
                <>
                  Create Market
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700"
          >
            <p className="text-sm text-slate-400">
              💡 <span className="font-semibold text-slate-300">Tip:</span> Make your questions engaging and time-sensitive for maximum participation!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-700 text-center">
              <TrendingUp className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">50+</div>
              <div className="text-xs text-slate-400">Markets Created</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-700 text-center">
              <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">85%</div>
              <div className="text-xs text-slate-400">Success Rate</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-700 text-center">
              <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">24h</div>
              <div className="text-xs text-slate-400">Avg Duration</div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}