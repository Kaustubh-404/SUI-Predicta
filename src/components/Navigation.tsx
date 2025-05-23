// src/components/Navigation.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  List, 
  Plus, 
  User, 
  Trophy 
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, path: '/home', label: 'Home' },
    { icon: List, path: '/markets', label: 'Markets' },
    { icon: Plus, path: '/create', label: 'Create', special: true },
    { icon: Trophy, path: '/leaderboard', label: 'Leaders' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-4 py-2 z-50 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;

          if (item.special) {
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 shadow-2xl -mt-6 hover:shadow-purple-500/25 transition-all duration-300"
              >
                <IconComponent className="w-6 h-6 text-white" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconComponent className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-2 h-2 bg-purple-600 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};