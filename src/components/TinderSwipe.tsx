// src/components/EnhancedTinderSwipe.tsx
import React, { useState, useMemo, useRef, useCallback } from 'react';
import TinderCard from 'react-tinder-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, TrendingUp, Users, Coins, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Market } from '@/types/market';
import { formatSUI } from '@/lib/suiClient';

interface TinderSwipeProps {
  markets: Market[];
  onSwipeLeft: (market: Market) => void;
  onSwipeRight: (market: Market, betAmount: string) => void;
  currentIndex: number;
  isLoading?: boolean;
}

export const EnhancedTinderSwipe: React.FC<TinderSwipeProps> = ({
  markets,
  onSwipeLeft,
  onSwipeRight,
  currentIndex,
  isLoading = false,
}) => {
  const [lastDirection, setLastDirection] = useState<string>('');
  const [betAmount, setBetAmount] = useState('0.01');
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOption, setSelectedOption] = useState<number>(0);
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
        // Show betting modal instead of immediate bet
        setSelectedMarket(market);
        setSelectedOption(Math.random() > 0.5 ? 0 : 1); // Random option for demo
        setShowBetModal(true);
      }
    },
    [onSwipeLeft, updateCurrentIndex]
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

  const handleBetConfirm = () => {
    if (selectedMarket) {
      onSwipeRight(selectedMarket, betAmount);
      setShowBetModal(false);
      setSelectedMarket(null);
    }
  };

  const adjustBetAmount = (increment: boolean) => {
    const current = parseFloat(betAmount);
    if (increment) {
      setBetAmount(Math.min(current + 0.01, 100).toFixed(2));
    } else {
      setBetAmount(Math.max(current - 0.01, 0.01).toFixed(2));
    }
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
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-[70vh] w-full max-w-md mx-auto">
        {/* Cards Stack */}
        <div className="relative h-full">
          {markets.map((market, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="absolute w-full h-full cursor-grab active:cursor-grabbing"
              key={market.id}
              onSwipe={(dir) => swiped(dir, market, index)}
              onCardLeftScreen={() => outOfFrame(index)}
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
              swipeThreshold={100}
            >
              <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm">
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-white/10"
                      style={{
                        width: Math.random() * 100 + 50,
                        height: Math.random() * 100 + 50,
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                      }}
                      animate={{
                        x: [0, Math.random() * 50 - 25],
                        y: [0, Math.random() * 50 - 25],
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: Math.random() * 5 + 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  ))}
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col p-6 text-white">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                      <span className="text-sm font-semibold">{market.category || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{getTimeRemaining(market.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Main Question */}
                  <div className="flex-1 flex items-center justify-center text-center px-4">
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight text-shadow-lg">
                      {market.question}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="space-y-4 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-green-500/40 backdrop-blur-sm rounded-2xl p-4 border border-green-400/50 shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-lg">{market.optionA}</span>
                        </div>
                        <span className="text-green-100 font-bold text-lg">{getMarketOdds(market)}%</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-red-500/40 backdrop-blur-sm rounded-2xl p-4 border border-red-400/50 shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-lg">{market.optionB}</span>
                        </div>
                        <span className="text-red-100 font-bold text-lg">{100 - getMarketOdds(market)}%</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Market Stats */}
                  <div className="flex justify-between items-center bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-300" />
                      <span className="text-sm font-medium">Pool: {formatSUI(market.totalPool)} SUI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-300" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>

                {/* Swipe Indicators */}
                <div className="absolute top-1/2 left-8 transform -translate-y-1/2 opacity-0 pointer-events-none transition-opacity duration-300" id="nope">
                  <motion.div 
                    className="bg-red-500 rounded-full p-6 shadow-2xl border-4 border-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                <div className="absolute top-1/2 right-8 transform -translate-y-1/2 opacity-0 pointer-events-none transition-opacity duration-300" id="like">
                  <motion.div 
                    className="bg-green-500 rounded-full p-6 shadow-2xl border-4 border-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
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
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-5 shadow-2xl border-4 border-white hover:shadow-red-500/50 transition-all duration-300"
          >
            <X className="w-7 h-7 text-white" />
          </motion.button>
          
          {canGoBack && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-5 shadow-2xl border-4 border-white hover:shadow-yellow-500/50 transition-all duration-300"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => swipe('right')}
            disabled={!canSwipe}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-5 shadow-2xl border-4 border-white hover:shadow-green-500/50 transition-all duration-300"
          >
            <Check className="w-7 h-7 text-white" />
          </motion.button>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-[-130px] left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <p className="text-white font-medium">
              {currentIndex >= 0 ? markets.length - currentIndex : 0} of {markets.length} markets
            </p>
          </div>
        </div>

        {/* Last Direction Feedback */}
        <AnimatePresence>
          {lastDirection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className={`px-6 py-3 rounded-full text-white font-bold text-lg shadow-2xl border-2 border-white ${
                lastDirection === 'right' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {lastDirection === 'right' ? '🚀 Ready to Bet!' : '👋 Skipped'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Betting Modal */}
      <AnimatePresence>
        {showBetModal && selectedMarket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Place Your Bet</h3>
                <p className="text-gray-600 mb-4">{selectedMarket.question}</p>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4">
                  <p className="font-semibold text-purple-800">
                    Betting on: {selectedOption === 0 ? selectedMarket.optionA : selectedMarket.optionB}
                  </p>
                </div>
              </div>

              {/* Bet Amount Controls */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bet Amount (SUI)
                </label>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => adjustBetAmount(false)}
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0"
                    disabled={parseFloat(betAmount) <= 0.01}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0.01 && value <= 100) {
                          setBetAmount(e.target.value);
                        }
                      }}
                      min="0.01"
                      max="100"
                      step="0.01"
                      className="w-full text-center text-2xl font-bold py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  
                  <Button
                    onClick={() => adjustBetAmount(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0"
                    disabled={parseFloat(betAmount) >= 100}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-4">
                  {['0.01', '0.1', '1', '5', '10'].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      variant={betAmount === amount ? "default" : "outline"}
                      size="sm"
                      className="flex-1 rounded-xl"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Potential Winnings */}
              <div className="mb-8 bg-green-50 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Potential Winnings:</span>
                  <span className="text-green-800 font-bold text-lg">
                    ~{(parseFloat(betAmount) * 1.8).toFixed(2)} SUI
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  *Estimate based on current odds
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowBetModal(false)}
                  variant="outline"
                  className="flex-1 py-4 rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBetConfirm}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Place Bet
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};