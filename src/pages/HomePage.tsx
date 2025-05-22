// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { TinderSwipe } from '@/components/TinderSwipe';
import type { Market } from '@/types/market';
import { placeBetTx, parseSUI } from '@/lib/suiClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';
import { AIMarketGenerator } from '@/lib/aiMarketGenerator';
import { motion } from 'framer-motion';

interface HomePageProps {
  markets: Market[];
  loading: boolean;
  onMarketsUpdate: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  markets,
  loading,
  onMarketsUpdate,
}) => {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(markets.length - 1);
  const [isGeneratingMarkets, setIsGeneratingMarkets] = useState(false);
  const [betAmount] = useState('0.01'); // Default bet amount in SUI

  useEffect(() => {
    setCurrentIndex(markets.length - 1);
  }, [markets.length]);

  const handleSwipeLeft = (market: Market) => {
    console.log('Skipped market:', market.question);
    toast({
      title: "Market Skipped 👋",
      description: "Swiped left to skip this prediction",
    });
  };

  const handleSwipeRight = async (market: Market) => {
    try {
      if (!account) {
        toast({
          title: "Wallet Not Connected ❌",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      // For demo purposes, randomly choose option A or B
      const option = Math.random() > 0.5 ? 0 : 1;
      const optionName = option === 0 ? market.optionA : market.optionB;
      
      toast({
        title: "Placing Bet... 🚀",
        description: `Betting ${betAmount} SUI on "${optionName}"`,
      });

      // Create transaction
      const tx = placeBetTx(market.id, option, parseSUI(betAmount));
      
      // Sign and execute
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result);
            toast({
              title: "Bet Placed Successfully! ✅",
              description: `${betAmount} SUI bet on "${optionName}"`,
            });
            onMarketsUpdate();
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast({
              title: "Bet Failed ❌",
              description: "Failed to place bet. Please try again.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Bet Failed ❌",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateAIMarkets = async () => {
    try {
      setIsGeneratingMarkets(true);
      toast({
        title: "Generating Markets... 🤖",
        description: "AI is creating viral prediction markets",
      });

      const aiGenerator = AIMarketGenerator.getInstance();
      const aiMarkets = await aiGenerator.generateTrendingMarkets(5);
      
      // TODO: Create these markets on blockchain
      console.log('Generated AI markets:', aiMarkets);
      
      toast({
        title: "AI Markets Generated! ✨",
        description: `Created ${aiMarkets.length} new trending markets`,
      });
    } catch (error) {
      console.error('Error generating AI markets:', error);
      toast({
        title: "Generation Failed ❌",
        description: "Failed to generate AI markets",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMarkets(false);
    }
  };

  const hasMoreMarkets = currentIndex >= 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
        >
          SUI Predictions
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Swipe right to bet, left to skip
        </motion.p>
      </div>

      {/* Swipe Interface */}
      {hasMoreMarkets ? (
        <TinderSwipe
          markets={markets}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          currentIndex={currentIndex}
          isLoading={loading}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">No More Markets!</h2>
          <p className="text-gray-600 mb-8">
            You've seen all available markets. Generate new ones or check back later!
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={generateAIMarkets}
              disabled={isGeneratingMarkets}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isGeneratingMarkets ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Markets
                </>
              )}
            </Button>
            
            <Button
              onClick={onMarketsUpdate}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Markets
            </Button>
          </div>
        </motion.div>
      )}

      {/* Betting Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
      >
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Default bet amount:</span>
          <span className="font-semibold text-purple-600">{betAmount} SUI</span>
        </div>
      </motion.div>
    </div>
  );
};