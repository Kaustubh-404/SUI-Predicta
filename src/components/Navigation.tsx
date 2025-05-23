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
      {/* Orbit-style background */}
      <div className="absolute inset-0 bg-[#efe7f7] opacity-95" />

      <div className="relative px-4 py-1">
        <nav className="rounded-3xl  border-3 border-black">
          {/* Orbit-style decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-[#d3aeff]/20 via-transparent to-[#99ff88]/20" />
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
                    {/* Active Background with Orbit styling */}
                    {active && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 bg-[#d3aeff] rounded-2xl border-2 border-black"
                        initial={false}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                      />
                    )}

                    {/* Hover Effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 rounded-2xl`}
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      {/* Icon with enhanced styling */}
                      <motion.div
                        className={`p-2 rounded-xl ${active ? "bg-white/20" : ""}`}
                        animate={active ? { 
                          y: [0, -2, 0],
                          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        } : {}}
                      >
                        <Icon className={`w-6 h-6 ${
                          active 
                            ? "text-black drop-shadow-sm" 
                            : "text-black/60 hover:text-black"
                        } transition-colors duration-200`} />
                      </motion.div>

                      {/* Label with Orbit font */}
                      <motion.span
                        className={`text-xs mt-1 font-bold ${
                          active 
                            ? "text-black" 
                            : "text-black/60 hover:text-black"
                        } transition-colors duration-200`}
                        animate={active ? { 
                          scale: [1, 1.05, 1],
                          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        } : {}}
                        style={{ fontFamily: 'Brice SemiBold, sans-serif' }}
                      >
                        {item.label}
                      </motion.span>

                      {/* Active Indicator Dot */}
                      {active && (
                        <motion.div
                          className="absolute -top-1 w-2 h-2 bg-[#99ff88] rounded-full shadow-lg border border-black"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                          }}
                          transition={{ 
                            scale: { type: "spring", duration: 0.5 },
                          }}
                        />
                      )}
                    </div>

                    {/* Ripple Effect on Tap */}
                    <motion.div
                      className="absolute inset-0 bg-black/10 rounded-2xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Bottom accent line with Orbit colors */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d3aeff] via-[#99ff88] to-[#d3aeff]" />
        </nav>
      </div>
    </div>
  )
}