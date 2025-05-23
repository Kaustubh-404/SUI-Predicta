// src/components/TinderSwipe.tsx
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

  const swiped = useCallback(
    (direction: string, market: Market, index: number) => {
      setLastDirection(direction);
      updateCurrentIndex(index - 1);
      
      if (direction === 'left') {
        onSwipeLeft(market);
      } else if (direction === 'right') {
        setSelectedMarket(market);
        setSelectedOption(Math.random() > 0.5 ? 0 : 1);
        setShowBetModal(true);
      }
    },
    [onSwipeLeft, updateCurrentIndex]
  );

  const outOfFrame = useCallback((idx: number) => {
    console.log(`${markets[idx]?.question} left the screen!`);
    currentIndexRef.current >= idx && childRefs[idx].current?.restoreCard();
  }, [markets, childRefs]);

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
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-[#efe7f7] border-t-[#d3aeff]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="w-8 h-8 text-[#d3aeff]" />
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex < 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-3xl border-4 border-black p-8 mx-4"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-black mb-4 text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
            Oh! Great!
          </h2>
          <p className="text-black/80 mb-8 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            You have browsed through all the active markets.
          </p>
          <p className="text-black font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
            Check back later for new predictions or create your own market!
          </p>
        </motion.div>
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
              <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-black">
                {/* Orbit-style card background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#efe7f7] via-white to-[#d3aeff]/20"></div>
                
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-gradient-to-r from-[#d3aeff]/30 to-[#99ff88]/30"
                      style={{
                        width: Math.random() * 80 + 40,
                        height: Math.random() * 80 + 40,
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                      }}
                      animate={{
                        x: [0, Math.random() * 20 - 10],
                        y: [0, Math.random() * 20 - 10],
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{
                        duration: Math.random() * 6 + 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  ))}
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col p-6 text-black">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-2 border-2 border-black">
                      <span className="text-sm font-bold text-white" style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
                        {market.category || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-2 border-2 border-black">
                      <Clock className="w-4 h-4 text-[#99ff88]" />
                      <span className="text-sm font-bold text-white" style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
                        {getTimeRemaining(market.expiresAt)}
                      </span>
                    </div>
                  </div>

                  {/* Main Question */}
                  <div className="flex-1 flex items-center justify-center text-center px-4">
                    <h2 className="text-2xl md:text-3xl font-black leading-tight text-black drop-shadow-sm" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                      {market.question}
                    </h2>
                  </div>

                  {/* Options with Orbit-style design */}
                  <div className="space-y-3 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#99ff88] backdrop-blur-sm rounded-2xl p-4 border-4 border-black shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                            <Check className="w-5 h-5 text-[#99ff88]" />
                          </div>
                          <span className="font-black text-lg text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            {market.optionA}
                          </span>
                        </div>
                        <div className="bg-black rounded-xl px-3 py-1">
                          <span className="text-[#99ff88] font-black text-sm" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            {getMarketOdds(market)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#ff6961] backdrop-blur-sm rounded-2xl p-4 border-4 border-black shadow-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                            <X className="w-5 h-5 text-[#ff6961]" />
                          </div>
                          <span className="font-black text-lg text-white" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            {market.optionB}
                          </span>
                        </div>
                        <div className="bg-black rounded-xl px-3 py-1">
                          <span className="text-[#ff6961] font-black text-sm" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            {100 - getMarketOdds(market)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Market Stats */}
                  <div className="flex justify-between items-center bg-black/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-black">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#d3aeff]" />
                      <span className="text-sm font-bold text-white" style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
                        Pool: {formatSUI(market.totalPool)} SUI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#99ff88]" />
                      <span className="text-sm font-bold text-white" style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Swipe Indicators with Orbit styling */}
                <div className="absolute top-1/2 left-8 transform -translate-y-1/2 opacity-0 pointer-events-none transition-opacity duration-300" id="nope">
                  <motion.div 
                    className="bg-[#ff6961] rounded-2xl p-6 shadow-2xl border-4 border-black"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                <div className="absolute top-1/2 right-8 transform -translate-y-1/2 opacity-0 pointer-events-none transition-opacity duration-300" id="like">
                  <motion.div 
                    className="bg-[#99ff88] rounded-2xl p-6 shadow-2xl border-4 border-black"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Check className="w-10 h-10 text-black" />
                  </motion.div>
                </div>
              </div>
            </TinderCard>
          ))}
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
              <div className={`px-6 py-3 rounded-2xl text-white font-black text-lg shadow-2xl border-4 border-black ${
                lastDirection === 'right' 
                  ? 'bg-[#99ff88] text-black' 
                  : 'bg-[#ff6961] text-white'
              }`} style={{ fontFamily: 'Brice Black, sans-serif' }}>
                {lastDirection === 'right' ? '🚀 Ready to Bet!' : '👋 Skipped'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Betting Modal with Orbit styling */}
      <AnimatePresence>
        {showBetModal && selectedMarket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            style={{ paddingBottom: '120px' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-black max-h-[70vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Place Your Bet
                </h3>
                <p className="text-black/80 mb-4 text-sm leading-relaxed font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  {selectedMarket.question}
                </p>
                <div className="bg-[#d3aeff] rounded-2xl p-4 border-2 border-black">
                  <p className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Betting on: {selectedOption === 0 ? selectedMarket.optionA : selectedMarket.optionB}
                  </p>
                </div>
              </div>

              {/* Bet Amount Controls */}
              <div className="mb-6">
                <label className="block text-sm font-black text-black mb-3" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Bet Amount (SUI)
                </label>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => adjustBetAmount(false)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl w-10 h-10 p-0 border-2 border-black bg-[#efe7f7] hover:bg-[#d3aeff] text-black font-black"
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
                      className="w-full text-center text-2xl font-black py-4 bg-[#efe7f7] border-2 border-black rounded-2xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] text-black"
                      style={{ fontFamily: 'Brice Black, sans-serif' }}
                    />
                  </div>
                  
                  <Button
                    onClick={() => adjustBetAmount(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl w-10 h-10 p-0 border-2 border-black bg-[#efe7f7] hover:bg-[#d3aeff] text-black font-black"
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
                      className={`flex-1 rounded-xl font-black border-2 border-black ${
                        betAmount === amount 
                          ? 'bg-[#d3aeff] text-black hover:bg-[#b8a3ff]' 
                          : 'bg-white hover:bg-[#efe7f7] text-black'
                      }`}
                      style={{ fontFamily: 'Brice Black, sans-serif' }}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Potential Winnings */}
              <div className="mb-6 bg-[#99ff88] rounded-2xl p-4 border-2 border-black">
                <div className="flex justify-between items-center">
                  <span className="text-black font-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Potential Winnings:
                  </span>
                  <span className="text-black font-black text-lg" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    ~{(parseFloat(betAmount) * 1.8).toFixed(2)} SUI
                  </span>
                </div>
                <p className="text-xs text-black/70 mt-1 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  *Estimate based on current odds
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowBetModal(false)}
                  variant="outline"
                  className="flex-1 py-4 rounded-2xl border-2 border-black bg-white hover:bg-[#efe7f7] text-black font-black"
                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBetConfirm}
                  className="flex-1 py-4 rounded-2xl bg-[#99ff88] hover:bg-[#77dd66] text-black border-2 border-black font-black"
                  style={{ fontFamily: 'Brice Black, sans-serif' }}
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


