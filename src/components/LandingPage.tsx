
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
    <div className="min-h-screen bg-[#efe7f7] overflow-hidden relative">
      {/* Animated Background with Orbit-style elements */}
      <div className="absolute inset-0">
        {/* Main gradient similar to Orbit */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d3aeff] via-[#efe7f7] to-[#99ff88]" />
        
        {/* Floating decorative elements inspired by Orbit */}
        <motion.img
          src="/starsquare.png"
          className="absolute w-[15vw] h-[20vh] top-5 left-28 object-contain opacity-40"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        
        <motion.img
          src="/star2.png"
          className="absolute w-[15vw] h-[20vh] top-28 left-10 transform rotate-[40deg] object-contain opacity-50"
          animate={{
            y: [0, 15, 0],
            rotate: [40, 50, 30, 40],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        
        <motion.img
          src="/flower.png"
          className="absolute w-[30vw] h-[40vh] top-28 left-32 object-contain opacity-30"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        
        <motion.img
          src="/star3.png"
          className="absolute w-[35vw] h-[35vh] top-5 right-10 object-contain opacity-40"
          animate={{
            y: [0, -25, 0],
            rotate: [0, -15, 15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Interactive Mouse Trail with Orbit-style colors */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-[#d3aeff]/30 to-[#99ff88]/30 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />

        {/* Floating gaming elements with Orbit colors */}
        {["🎮", "🕹️", "🎯", "🚀", "💎", "⚡", "🔥", "💰", "🏆", "⭐"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 20, -20, 0],
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.8, 0.4],
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
      </div>

      {/* Hero Section with Orbit-style typography */}
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center bg-black/80 backdrop-blur-md rounded-full px-8 py-4 mb-8 border-4 border-black">
            <Sparkles className="w-6 h-6 text-[#99ff88] mr-3 animate-pulse" />
            <span className="text-white font-bold text-lg">Powered by AI & SUI Blockchain</span>
            <motion.div
              className="ml-3 w-3 h-3 bg-[#99ff88] rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl font-black text-black mb-8 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontFamily: 'Brice Black, sans-serif' }}
        >
          <motion.span
            className="bg-gradient-to-r from-black via-purple-600 to-black bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            Swipe. Predict.
          </motion.span>
          <br />
          <motion.span
            className="bg-gradient-to-r from-[#d3aeff] via-[#99ff88] to-[#d3aeff] bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
          >
            Win. Repeat.
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl text-black mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ fontFamily: 'Brice Regular, sans-serif' }}
        >
          The most addictive way to predict viral trends and earn SUI.
          <br />
          <span className="text-[#d3aeff] font-black text-3xl">Join the Gen Z revolution.</span>
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
              className="bg-[#99ff88] hover:bg-[#77dd66] text-black px-12 py-6 text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-black transform hover:-translate-y-1"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
            >
              <Gamepad2 className="mr-3 w-8 h-8" />
              Start Playing
              <ArrowRight className="ml-3 w-8 h-8" />
            </Button>
          </motion.div>

          <motion.div
            className="text-black font-bold text-lg"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            style={{ fontFamily: 'Brice SemiBold, sans-serif' }}
          >
            No signup • Just vibes 🔥
          </motion.div>
        </motion.div>

        {/* Action Indicators with Orbit-style design */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <motion.div
            className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-black"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <span className="text-2xl">👈</span>
            <span className="text-white text-sm font-semibold">Swipe Left = Skip</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-black"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
          >
            <span className="text-2xl">👉</span>
            <span className="text-white text-sm font-semibold">Swipe Right = Bet</span>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center text-black/60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="text-sm mb-2 font-medium">Scroll for more</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Features Section with Orbit-style cards */}
      <div className="relative z-10 mt-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6" style={{ fontFamily: 'Brice Black, sans-serif' }}>
            Why It's Addictive AF
          </h2>
          <p className="text-black text-2xl max-w-3xl mx-auto font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            Built different for the TikTok generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className="relative p-10 rounded-3xl text-black shadow-2xl bg-white border-4 border-black overflow-hidden group cursor-pointer hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
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
                {/* Orbit-style gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.color}`} />

                {/* Icon with Orbit-style background */}
                <div className="mb-6">
                  <motion.div
                    animate={currentFeature === index ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center border-2 border-black shadow-lg`}
                  >
                    <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                  </motion.div>
                </div>

                <h3 className="text-3xl font-black mb-6 text-center" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-center text-black/80 leading-relaxed text-lg font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Stats Section with Orbit-style design */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6" style={{ fontFamily: 'Brice Black, sans-serif' }}>
            Real Players, Real Wins
          </h2>
          <p className="text-black text-2xl font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            Join the hottest prediction game on SUI
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className="text-center bg-white backdrop-blur-lg p-10 rounded-3xl border-4 border-black hover:scale-105 transition-transform duration-300 shadow-2xl relative overflow-hidden group hover:-translate-y-2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Orbit-style accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-2 ${stat.bg}`} />
                
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${stat.bg} flex items-center justify-center border-2 border-black`}
                >
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </motion.div>
                <h4 className="text-4xl md:text-5xl font-black text-black mb-3" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  {stat.value}
                </h4>
                <p className="text-black font-medium text-lg" style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
                  {stat.label}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA Section with Orbit-style design */}
      <div className="relative z-10 text-center py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white backdrop-blur-lg rounded-3xl p-16 max-w-5xl mx-auto border-4 border-black shadow-2xl relative overflow-hidden"
        >
          {/* Orbit-style decorative elements */}
          <div className="absolute top-4 right-4 text-6xl opacity-20">🚀</div>
          <div className="absolute bottom-4 left-4 text-6xl opacity-20">💎</div>

          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Crown className="w-24 h-24 text-[#d3aeff] mx-auto mb-8" />
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl text-black font-black mb-8 leading-tight relative z-10" style={{ fontFamily: 'Brice Black, sans-serif' }}>
            Ready to Get Rich?
          </h2>
          <p className="text-2xl text-black mb-12 max-w-3xl mx-auto relative z-10 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            Join thousands of Gen Z making bank on viral predictions.
            <span className="text-[#d3aeff] font-black block mt-2">Your swipes = Your bag 💰</span>
          </p>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-[#99ff88] hover:bg-[#77dd66] text-black px-16 py-8 text-2xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-black relative overflow-hidden group transform hover:-translate-y-1"
              style={{ fontFamily: 'Brice Black, sans-serif' }}
            >
              <Flame className="mr-4 w-8 h-8 relative z-10" />
              <span className="relative z-10">Let's Go Viral</span>
              <Rocket className="ml-4 w-8 h-8 relative z-10" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer with Orbit-style design */}
      <footer className="relative z-10 py-16 px-6 border-t-4 border-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Target className="w-10 h-10 text-[#d3aeff] mr-4" />
            </motion.div>
            <span className="text-3xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              ORBIT
            </span>
          </div>
          <div className="text-black flex items-center text-lg font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            <Star className="w-5 h-5 mr-2" />© 2025 ORBIT. Built for Gen Z.
          </div>
        </div>
      </footer>
    </div>
  )
}