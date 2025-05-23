// src/components/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Users,
  Brain,
  ArrowRight,
  Coins,
  Trophy,
  Activity,
  Shield,
  Rocket,
  Eye,
  Heart,
  Target,
  Sparkles,
  Globe,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Markets",
      description: "Our AI generates viral prediction markets daily based on trending topics",
      color: "from-purple-500 to-pink-500",
      accent: "purple"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant bets on SUI blockchain with minimal fees and maximum speed",
      color: "from-blue-500 to-cyan-500",
      accent: "blue"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Trading",
      description: "Watch odds change in real-time as the crowd makes predictions",
      color: "from-green-500 to-emerald-500",
      accent: "green"
    },
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "10K+", color: "text-blue-400", bg: "bg-blue-500/20" },
    { icon: Coins, label: "Total Volume", value: "1M+ SUI", color: "text-green-400", bg: "bg-green-500/20" },
    { icon: Trophy, label: "Markets Created", value: "500+", color: "text-purple-400", bg: "bg-purple-500/20" },
    { icon: Activity, label: "Daily Predictions", value: "50+", color: "text-orange-400", bg: "bg-orange-500/20" },
  ];

  const whyChoose = [
    {
      icon: Brain,
      title: "AI-Generated Markets",
      description: "Our AI creates 5 new viral prediction markets daily based on trending topics",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Lightning-fast bets with minimal fees thanks to SUI blockchain technology",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Heart,
      title: "Addictive Swipe Interface",
      description: "Tinder-like experience makes predicting fun and highly engaging",
      gradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "All transactions secured by SUI blockchain with full transparency",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: Target,
      title: "Real-Time Odds",
      description: "Watch market sentiment change in real-time as others place bets",
      gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: Trophy,
      title: "Competitive Leaderboards",
      description: "Compete with friends and climb the global prediction leaderboard",
      gradient: "from-indigo-500/20 to-purple-500/20"
    },
  ];

  const testimonials = [
    {
      text: "This is the future of prediction markets. The AI generates the most engaging questions!",
      author: "CryptoTrader.eth",
      avatar: "🚀",
      role: "DeFi Enthusiast"
    },
    {
      text: "Made 10x my investment in just one week. The swipe interface is addictive!",
      author: "MoonFarmer",
      avatar: "🌙",
      role: "Yield Farmer"
    },
    {
      text: "Lightning fast transactions and the community is amazing. Love the viral markets!",
      author: "SUIPredictions",
      avatar: "⚡",
      role: "Early Adopter"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-xl"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Interactive Mouse Trail */}
        <motion.div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center bg-purple-500/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-300 mr-2 animate-pulse" />
            <span className="text-purple-200 font-medium">Powered by AI & SUI Blockchain</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Predict the Future.
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Swipe. Win.
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Dive into viral, AI-generated prediction markets. Use SUI tokens. 
          <span className="text-purple-300 font-semibold"> Powered by you.</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Start Predicting
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="border-2 border-purple-400/30 text-purple-200 hover:bg-purple-500/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-md"
          >
            <Eye className="mr-2 w-5 h-5" />
            Watch Demo
          </Button>
        </motion.div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 mt-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose SUI Predictions?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience the next generation of prediction markets with cutting-edge technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className={`relative p-8 rounded-3xl text-white shadow-2xl bg-gradient-to-br ${feature.color} border border-white/20 backdrop-blur-sm overflow-hidden group cursor-pointer`}
                animate={{
                  scale: currentFeature === index ? 1.05 : 1,
                  y: currentFeature === index ? -5 : 0,
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                
                {/* Floating Icons */}
                <div className="absolute top-4 right-4 opacity-20">
                  <Icon className="w-16 h-16" />
                </div>
                
                <div className="relative z-10">
                  <Icon className="w-16 h-16 mb-6 mx-auto drop-shadow-lg" />
                  <h3 className="text-2xl font-bold mb-4 text-center">{feature.title}</h3>
                  <p className="text-center text-white/90 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-gray-300 text-lg">
            Join a thriving community of predictors making profitable decisions
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className={`text-center ${stat.bg} p-8 rounded-3xl border border-white/10 backdrop-blur-lg hover:scale-105 transition-transform duration-300`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className={`w-12 h-12 mb-4 mx-auto ${stat.color}`} />
                <h4 className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</h4>
                <p className="text-gray-300 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Enhanced Why Choose Us Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyChoose.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                className={`bg-gradient-to-br ${item.gradient} p-8 rounded-3xl backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 group`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Predictors Say
          </h2>
          <p className="text-gray-300 text-lg">
            Hear from our community of successful predictors
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white/5 p-8 rounded-3xl backdrop-blur-lg border border-white/10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="text-4xl mb-4">{testimonial.avatar}</div>
              <p className="text-gray-300 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
              <div>
                <div className="text-purple-400 font-semibold">{testimonial.author}</div>
                <div className="text-gray-400 text-sm">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <div className="relative z-10 text-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-12 max-w-4xl mx-auto border border-white/20"
        >
          <Rocket className="w-20 h-20 text-purple-400 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl text-white font-bold mb-6 leading-tight">
            Ready to Predict the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users making profitable predictions on the most viral topics
          </p>
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Journey
            <ArrowRight className="ml-3 w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Globe className="w-8 h-8 text-purple-400 mr-3" />
            <span className="text-2xl font-bold text-white">SUI Predictions</span>
          </div>
          <div className="text-gray-400 flex items-center">
            <Star className="w-4 h-4 mr-2" />
            © 2025 SUI Predictions. Powered by SUI Blockchain.
          </div>
        </div>
      </footer>
    </div>
  );
};