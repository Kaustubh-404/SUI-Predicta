// src/components/TinderSwipe.tsx
import React, { useState, useMemo, useRef, useCallback } from 'react';
import TinderCard from 'react-tinder-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, TrendingUp, Users } from 'lucide-react';
import type { Market } from '@/types/market';
import { formatSUI } from '@/lib/suiClient';

interface TinderSwipeProps {
  markets: Market[];
  onSwipeLeft: (market: Market) => void;
  onSwipeRight: (market: Market) => void;
  currentIndex: number;
  isLoading?: boolean;
}

export const TinderSwipe: React.FC<TinderSwipeProps> = ({
  markets,
  onSwipeLeft,
  onSwipeRight,
  currentIndex,
  isLoading = false,
}) => {
  const [lastDirection, setLastDirection] = useState<string>('');
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(markets.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    [markets.length]
  );

  const updateCurrentIndex = useCallback((val: number) => {
    currentIndexRef.current = val;
  }, []);

  const canGoBack = currentIndex < markets.length - 1;
  const canSwipe = currentIndex >= 0;

  const swiped = useCallback(
    (direction: string, market: Market, index: number) => {
      setLastDirection(direction);
      updateCurrentIndex(index - 1);
      
      if (direction === 'left') {
        onSwipeLeft(market);
      } else if (direction === 'right') {
        onSwipeRight(market);
      }
    },
    [onSwipeLeft, onSwipeRight, updateCurrentIndex]
  );

  const outOfFrame = useCallback((idx: number) => {
    console.log(`${markets[idx]?.question} left the screen!`);
    currentIndexRef.current >= idx && childRefs[idx].current?.restoreCard();
  }, [markets, childRefs]);

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < markets.length) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    childRefs[newIndex].current?.restoreCard();
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const getMarketOdds = (market: Market) => {
    if (market.totalPool === 0) return 50;
    return Math.round((market.optionAPool / market.totalPool) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] w-full max-w-md mx-auto">
      {/* Cards Stack */}
      <div className="relative h-full">
        {markets.map((market, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="absolute w-full h-full"
            key={market.id}
            onSwipe={(dir) => swiped(dir, market, index)}
            onCardLeftScreen={() => outOfFrame(index)}
            preventSwipe={['up', 'down']}
          >
            <div className="relative w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col p-6 text-white">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-medium">{market.category || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{getTimeRemaining(market.expiresAt)}</span>
                  </div>
                </div>

                {/* Main Question */}
                <div className="flex-1 flex items-center justify-center text-center">
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                    {market.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-4 border border-green-400/50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{market.optionA}</span>
                      <span className="text-green-200">{getMarketOdds(market)}%</span>
                    </div>
                  </div>
                  <div className="bg-red-500/30 backdrop-blur-sm rounded-xl p-4 border border-red-400/50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{market.optionB}</span>
                      <span className="text-red-200">{100 - getMarketOdds(market)}%</span>
                    </div>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Pool: {formatSUI(market.totalPool)} SUI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </div>

              {/* Swipe Indicators */}
              <div className="absolute top-1/2 left-8 transform -translate-y-1/2 opacity-0 pointer-events-none" id="nope">
                <div className="bg-red-500 rounded-full p-4 shadow-lg">
                  <X className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2 opacity-0 pointer-events-none" id="like">
                <div className="bg-green-500 rounded-full p-4 shadow-lg">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 flex gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => swipe('left')}
          disabled={!canSwipe}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-4 shadow-lg"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
        
        {canGoBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-4 shadow-lg"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => swipe('right')}
          disabled={!canSwipe}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-4 shadow-lg"
        >
          <Check className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-[-120px] left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-600">
          {currentIndex >= 0 ? markets.length - currentIndex : 0} of {markets.length} markets
        </p>
      </div>

      {/* Last Direction Feedback */}
      <AnimatePresence>
        {lastDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`px-4 py-2 rounded-full text-white font-semibold ${
              lastDirection === 'right' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {lastDirection === 'right' ? '🚀 Bet Placed!' : '👋 Skipped'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};