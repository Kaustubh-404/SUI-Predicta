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
    duration: "24",
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

      const durationMs = Number.parseInt(formData.duration) * 60 * 60 * 1000
      const tx = createMarketTx(formData.question, formData.optionA, formData.optionB, durationMs)

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Market creation successful:", result)

            const newMarket: Market = {
              id: result.digest,
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
      {/* Orbit-style Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#efe7f7]" />
        
        {/* Floating decorative elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            style={{
              background: `linear-gradient(45deg, ${
                i % 4 === 0 ? "#d3aeff, #99ff88" : 
                i % 4 === 1 ? "#99ff88, #ff6961" : 
                i % 4 === 2 ? "#ff6961, #d3aeff" :
                "#d3aeff, #99ff88"
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

        {/* Floating icons */}
        {["💡", "🚀", "⭐", "🔥", "💰", "🎯"].map((emoji, i) => (
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
              Create Market
            </h1>
            <p className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              Create your own prediction market
            </p>
          </div>

          {/* AI Generate Button */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Button
              onClick={generateAIQuestion}
              disabled={isGeneratingAI}
              variant="outline"
              className="w-full border-4 border-black bg-[#d3aeff] hover:bg-[#b8a3ff] text-black rounded-2xl py-4 font-black transform hover:-translate-y-1 transition-all shadow-lg"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
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
            className="space-y-6 bg-white rounded-3xl p-6 border-4 border-black shadow-xl"
          >
            {/* Question */}
            <div className="space-y-2">
              <label className="text-sm font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                Question *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => handleInputChange("question", e.target.value)}
                placeholder="Will Bitcoin reach $100k before 2025 ends?"
                className="w-full p-4 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] resize-none h-20 text-black placeholder-black/60 font-medium"
                style={{ fontFamily: 'Brice Regular, sans-serif' }}
                required
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Option A *
                </label>
                <input
                  type="text"
                  value={formData.optionA}
                  onChange={(e) => handleInputChange("optionA", e.target.value)}
                  placeholder="Yes, to the moon! 🚀"
                  className="w-full p-3 bg-[#99ff88] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#77dd66] focus:border-[#77dd66] text-black placeholder-black/60 font-medium"
                  style={{ fontFamily: 'Brice Regular, sans-serif' }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Option B *
                </label>
                <input
                  type="text"
                  value={formData.optionB}
                  onChange={(e) => handleInputChange("optionB", e.target.value)}
                  placeholder="No, bear market 📉"
                  className="w-full p-3 bg-[#ff6961] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#dd4444] focus:border-[#dd4444] text-white placeholder-white/70 font-medium"
                  style={{ fontFamily: 'Brice Regular, sans-serif' }}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-3 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] text-black font-medium"
                style={{ fontFamily: 'Brice Regular, sans-serif' }}
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
              <label className="text-sm font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                Duration
              </label>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-black/60" />
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  className="flex-1 p-3 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] text-black font-medium"
                  style={{ fontFamily: 'Brice Regular, sans-serif' }}
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
              className="w-full bg-[#99ff88] hover:bg-[#77dd66] py-4 text-black rounded-2xl border-4 border-black font-black transform hover:-translate-y-1 transition-all shadow-lg"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
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
            className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
          >
            <p className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              💡 <span className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>Tip:</span> Make your questions engaging and time-sensitive for maximum participation!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-[#d3aeff] mx-auto mb-1" />
              <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>50+</div>
              <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>Markets Created</div>
            </div>
            <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
              <Target className="w-5 h-5 text-[#99ff88] mx-auto mb-1" />
              <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>85%</div>
              <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>Success Rate</div>
            </div>
            <div className="bg-white rounded-2xl p-3 border-4 border-black text-center shadow-lg">
              <Zap className="w-5 h-5 text-[#ff6961] mx-auto mb-1" />
              <div className="text-lg font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>24h</div>
              <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>Avg Duration</div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
 