// src/components/Navigation.tsx
import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, BarChart2, PlusCircle, User, Award } from "lucide-react"
import { motion } from "framer-motion"

export const Navigation: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: "/home", icon: Home, label: "Home", color: "from-violet-500 to-purple-500" },
    { path: "/markets", icon: BarChart2, label: "Markets", color: "from-indigo-500 to-blue-500" },
    { path: "/create", icon: PlusCircle, label: "Create", color: "from-emerald-500 to-teal-500" },
    { path: "/leaderboard", icon: Award, label: "Leaders", color: "from-amber-500 to-orange-500" },
    { path: "/profile", icon: User, label: "Profile", color: "from-rose-500 to-pink-500" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Enhanced Background with Blur */}
      <div className="" />

      <div className="relative px-4 py-1">
        <nav className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Subtle animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-transparent to-indigo-400/20" />
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 bg-gradient-to-r from-violet-400/10 to-indigo-400/10 rounded-full"
                style={{
                  left: `${i * 20}%`,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          <div className="relative flex justify-around items-center py-2">
            {navItems.map((item, _index) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link key={item.path} to={item.path} className="relative">
                  <motion.div
                    className="relative py-3 px-4 flex flex-col items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Active Background */}
                    {active && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 bg-slate-800/80 rounded-2xl backdrop-blur-sm border border-slate-600"
                        initial={false}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                      />
                    )}

                    {/* Hover Glow Effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 rounded-2xl blur-lg`}
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      {/* Icon with Enhanced Styling */}
                      <motion.div
                        className={`p-2 rounded-xl ${active ? "bg-slate-700/50" : ""}`}
                        animate={active ? { 
                          y: [0, -2, 0],
                          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        } : {}}
                      >
                        <Icon className={`w-6 h-6 ${
                          active 
                            ? "text-white drop-shadow-lg" 
                            : "text-slate-400 hover:text-slate-300"
                        } transition-colors duration-200`} />
                      </motion.div>

                      {/* Label with Animation */}
                      <motion.span
                        className={`text-xs mt-1 font-medium ${
                          active 
                            ? "text-white font-semibold" 
                            : "text-slate-500 hover:text-slate-400"
                        } transition-colors duration-200`}
                        animate={active ? { 
                          scale: [1, 1.05, 1],
                          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        } : {}}
                      >
                        {item.label}
                      </motion.span>

                      {/* Active Indicator Dot */}
                      {active && (
                        <motion.div
                          className="absolute -top-1 w-2 h-2 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full shadow-lg"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            boxShadow: [
                              "0 0 0 0 rgba(139, 92, 246, 0.7)",
                              "0 0 0 8px rgba(139, 92, 246, 0)",
                            ]
                          }}
                          transition={{ 
                            scale: { type: "spring", duration: 0.5 },
                            boxShadow: { duration: 1.5, repeat: Infinity }
                          }}
                        />
                      )}
                    </div>

                    {/* Ripple Effect on Tap */}
                    <motion.div
                      className="absolute inset-0 bg-slate-700/30 rounded-2xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        </nav>
      </div>
    </div>
  )
}