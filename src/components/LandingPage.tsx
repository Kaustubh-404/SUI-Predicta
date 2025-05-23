// src/components/LandingPage.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Zap,
  TrendingUp,
  Users,
  Brain,
  ArrowRight,
  Coins,
  Trophy,
  Activity,
  Rocket,
  Sparkles,
  Star,
  ChevronDown,
  Gamepad2,
  Target,
  Crown,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingPageProps {
  onGetStarted: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [_isVisible, setIsVisible] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Markets",
      description: "Our AI generates viral prediction markets daily based on trending topics",
      color: "from-purple-500 to-pink-500",
      accent: "purple",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant bets on SUI blockchain with minimal fees and maximum speed",
      color: "from-blue-500 to-cyan-500",
      accent: "blue",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Trading",
      description: "Watch odds change in real-time as the crowd makes predictions",
      color: "from-emerald-500 to-teal-500",
      accent: "emerald",
    },
  ]

  const stats = [
    { icon: Users, label: "Active Users", value: "50K+", color: "text-blue-400", bg: "bg-blue-500/20" },
    { icon: Coins, label: "Total Volume", value: "5M+ SUI", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { icon: Trophy, label: "Markets Created", value: "2K+", color: "text-purple-400", bg: "bg-purple-500/20" },
    { icon: Activity, label: "Daily Predictions", value: "200+", color: "text-pink-400", bg: "bg-pink-500/20" },
  ]

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Ultra-Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Dynamic Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-blue-500/20" />
        
        {/* Animated Orbs */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                background: `linear-gradient(45deg, ${
                  i % 3 === 0 ? "#8b5cf6, #06b6d4" : 
                  i % 3 === 1 ? "#06b6d4, #10b981" : 
                  "#ec4899, #8b5cf6"
                })`,
                width: Math.random() * 600 + 300,
                height: Math.random() * 600 + 300,
                left: `${Math.random() * 120 - 10}%`,
                top: `${Math.random() * 120 - 10}%`,
              }}
              animate={{
                x: [0, Math.random() * 400 - 200],
                y: [0, Math.random() * 400 - 200],
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: Math.random() * 30 + 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Matrix-style Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 grid-rows-30 h-full w-full">
            {[...Array(600)].map((_, i) => (
              <motion.div
                key={i}
                className="border border-purple-500/20"
                animate={{
                  opacity: [0.1, 0.5, 0.1],
                  borderColor: [
                    "rgba(139, 92, 246, 0.2)",
                    "rgba(6, 182, 212, 0.2)",
                    "rgba(16, 185, 129, 0.2)",
                    "rgba(139, 92, 246, 0.2)",
                  ],
                }}
                transition={{
                  duration: 5,
                  delay: i * 0.01,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
        </div>

        {/* Interactive Mouse Trail */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />

        {/* Floating Gaming Elements */}
        {["🎮", "🕹️", "🎯", "🚀", "💎", "⚡", "🔥", "💰", "🏆", "⭐", "💫", "🎊"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 20, -20, 0],
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.8,
            }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Pulsing Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 border border-purple-500/20 rounded-full"
            style={{
              width: (i + 1) * 400,
              height: (i + 1) * 400,
              marginLeft: -((i + 1) * 200),
              marginTop: -((i + 1) * 200),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              delay: i * 1.3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-full px-8 py-4 mb-8 border-2 border-white/20">
            <Sparkles className="w-6 h-6 text-purple-300 mr-3 animate-pulse" />
            <span className="text-purple-200 font-bold text-lg">Powered by AI & SUI Blockchain</span>
            <motion.div
              className="ml-3 w-3 h-3 bg-emerald-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-white mb-8 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.span
            className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            Swipe. Predict.
          </motion.span>
          <br />
          <motion.span
            className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
          >
            Win. Repeat.
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          The most addictive way to predict viral trends and earn SUI.
          <br />
          <span className="text-purple-300 font-bold text-3xl">Join the Gen Z revolution.</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-2xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 border-4 border-white"
            >
              <Gamepad2 className="mr-3 w-8 h-8" />
              Start Playing
              <ArrowRight className="ml-3 w-8 h-8" />
            </Button>
          </motion.div>

          <motion.div
            className="text-white/80 text-lg font-medium"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            No signup • Just vibes 🔥
          </motion.div>
        </motion.div>

        {/* Floating Action Indicators */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <motion.div
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <span className="text-2xl">👈</span>
            <span className="text-white text-sm">Swipe Left = Skip</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
          >
            <span className="text-2xl">👉</span>
            <span className="text-white text-sm">Swipe Right = Bet</span>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center text-white/60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="text-sm mb-2">Scroll for more</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 mt-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Why It's Addictive AF</h2>
          <p className="text-gray-300 text-2xl max-w-3xl mx-auto">Built different for the TikTok generation</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className={`relative p-10 rounded-3xl text-white shadow-2xl bg-gradient-to-br ${feature.color} border-2 border-white/20 overflow-hidden group cursor-pointer backdrop-blur-sm`}
                animate={{
                  scale: currentFeature === index ? 1.05 : 1,
                  y: currentFeature === index ? -10 : 0,
                }}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {/* Enhanced Background Pattern */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />

                {/* Floating Icons */}
                <div className="absolute top-6 right-6 opacity-20">
                  <Icon className="w-20 h-20" />
                </div>

                {/* Animated Particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-white/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                ))}

                <div className="relative z-10">
                  <motion.div
                    animate={currentFeature === index ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-20 h-20 mb-8 mx-auto drop-shadow-lg" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-6 text-center">{feature.title}</h3>
                  <p className="text-center text-white/90 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Gaming-Style Stats Section */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Real Players, Real Wins</h2>
          <p className="text-gray-300 text-2xl">Join the hottest prediction game on SUI</p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className={`text-center ${stat.bg} backdrop-blur-lg p-10 rounded-3xl border-2 border-white/20 hover:scale-105 transition-transform duration-300 shadow-2xl relative overflow-hidden group`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:from-white/10 transition-all duration-300" />
                
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                >
                  <Icon className={`w-16 h-16 mb-6 mx-auto ${stat.color}`} />
                </motion.div>
                <h4 className="text-4xl md:text-5xl font-bold text-white mb-3">{stat.value}</h4>
                <p className="text-gray-300 font-medium text-lg">{stat.label}</p>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                  animate={{ translateX: ['100%', '300%'] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 2 }}
                />
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">What Players Are Saying</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Literally can't stop swiping 😭", author: "@cryptoqueen_", emoji: "🔥" },
              { text: "Made 50 SUI in my first week no cap", author: "@sui_whale", emoji: "💎" },
              { text: "Better than any casino fr", author: "@degen_god", emoji: "🚀" }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl mb-4">{testimonial.emoji}</div>
                <p className="text-white text-lg mb-4">"{testimonial.text}"</p>
                <p className="text-purple-300 font-medium">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Enhanced CTA Section */}
      <div className="relative z-10 text-center py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-3xl p-16 max-w-5xl mx-auto border-2 border-white/20 shadow-2xl relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4,
                delay: i * 0.7,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}

          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Crown className="w-24 h-24 text-purple-400 mx-auto mb-8" />
          </motion.div>
          <h2 className="text-5xl md:text-6xl text-white font-bold mb-8 leading-tight relative z-10">Ready to Get Rich?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto relative z-10">
            Join thousands of Gen Z making bank on viral predictions.
            <span className="text-purple-300 font-bold block mt-2">Your swipes = Your bag 💰</span>
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-16 py-8 text-2xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 border-4 border-white relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                transition={{ duration: 0.6 }}
              />
              <Flame className="mr-4 w-8 h-8 relative z-10" />
              <span className="relative z-10">Let's Go Viral</span>
              <Rocket className="ml-4 w-8 h-8 relative z-10" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t-2 border-white/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Target className="w-10 h-10 text-purple-400 mr-4" />
            </motion.div>
            <span className="text-3xl font-bold text-white">SUI Predictions</span>
          </div>
          <div className="text-gray-400 flex items-center text-lg">
            <Star className="w-5 h-5 mr-2" />© 2025 SUI Predictions. Built for Gen Z.
          </div>
        </div>
      </footer>
    </div>
  )
} 