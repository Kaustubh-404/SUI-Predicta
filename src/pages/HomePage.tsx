// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { EnhancedTinderSwipe } from '@/components/TinderSwipe';
import { AIAgentDashboard } from '@/components/AIAgentDashboard';
import type { Market } from '@/types/market';
import { placeBetTx, parseSUI } from '@/lib/suiClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, TrendingUp, Target, Zap, Settings } from 'lucide-react';
import { ProductionAIAgent } from '@/services/productionAIAgent';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showAgentDashboard, setShowAgentDashboard] = useState(false);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalVolume: 0,
    winRate: 0,
  });

  const aiAgent = ProductionAIAgent.getInstance();

  useEffect(() => {
    setCurrentIndex(markets.length - 1);
  }, [markets.length]);

  useEffect(() => {
    // Initialize AI agent
    aiAgent.start();
    updateAgentStatus();
    
    // Update status every 30 seconds
    const statusInterval = setInterval(updateAgentStatus, 30000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  useEffect(() => {
    // Calculate real stats from markets
    const totalVolume = markets.reduce((sum, market) => sum + market.totalPool, 0);
    const activeBets = markets.filter(market => market.status === 0).length;
    
    // Calculate win rate based on user's past performance (mock for now)
    const mockWinRate = Math.min(Math.max(45 + Math.random() * 20, 45), 85);
    
    setStats({
      totalBets: activeBets,
      totalVolume,
      winRate: Math.round(mockWinRate),
    });
  }, [markets]);

  const updateAgentStatus = () => {
    const status = aiAgent.getStatus();
    setAgentStatus(status);
  };

  const handleSwipeLeft = (market: Market) => {
    console.log('Skipped market:', market.question);
    toast({
      title: "Market Skipped 👋",
      description: "Swiped left to skip this prediction",
    });
  };

  const handleSwipeRight = async (market: Market, betAmount: string) => {
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

      const generatedMarkets = await aiAgent.generateMarketsNow();
      
      toast({
        title: "Markets Generated! ✨",
        description: `${generatedMarkets.length} new viral markets created`,
      });
      
      updateAgentStatus();
      
    } catch (error) {
      console.error('Error generating AI markets:', error);
      toast({
        title: "Generation Failed ❌",
        description: error instanceof Error ? error.message : "Failed to generate AI markets",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMarkets(false);
    }
  };

  const hasMoreMarkets = currentIndex >= 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            SUI Predictions
          </h1>
          <p className="text-gray-600 mb-4">
            Swipe right to bet, left to skip
          </p>
          
          {/* AI Agent Status */}
          <div className={`${agentStatus?.isRunning ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-2xl p-3 mb-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${agentStatus?.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${agentStatus?.isRunning ? 'text-green-700' : 'text-red-700'}`}>
                  AI Agent {agentStatus?.isRunning ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button
                onClick={() => setShowAgentDashboard(true)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            {agentStatus?.isRunning && (
              <div className="text-xs text-green-600 mt-1">
                Generated {agentStatus.metrics?.totalMarketsGenerated || 0} markets • 
                Next: {agentStatus.nextExecution}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-600">{stats.totalBets}</div>
            <div className="text-xs text-gray-600">Active Markets</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">{stats.winRate}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
            <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{markets.length}</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
        </motion.div>

        {/* Swipe Interface */}
        <AnimatePresence mode="wait">
          {hasMoreMarkets ? (
            <motion.div
              key="swipe-interface"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedTinderSwipe
                markets={markets}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                currentIndex={currentIndex}
                isLoading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="no-markets"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">All Markets Swiped!</h2>
              <p className="text-gray-600 mb-8">
                You've seen all available markets. Generate new ones or check back later!
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={generateAIMarkets}
                  disabled={isGeneratingMarkets || agentStatus?.isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-4"
                >
                  {isGeneratingMarkets || agentStatus?.isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      AI Agent Working...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Markets Now
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={onMarketsUpdate}
                  variant="outline"
                  className="w-full py-4"
                  disabled={isGeneratingMarkets}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Markets
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Agent Info */}
        {agentStatus?.metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-200"
          >
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🤖</span>
              AI Agent Performance
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-purple-600 font-medium">
                  Total Generated: {agentStatus.metrics.totalMarketsGenerated}
                </div>
                <div className="text-purple-600 font-medium">
                  Success Rate: {agentStatus.metrics.successfulGenerations > 0 
                    ? Math.round((agentStatus.metrics.successfulGenerations / 
                       (agentStatus.metrics.successfulGenerations + agentStatus.metrics.failedGenerations)) * 100)
                    : 0}%
                </div>
              </div>
              <div>
                <div className="text-purple-600 font-medium">
                  Daily Streak: {agentStatus.metrics.dailyGenerationStreak}
                </div>
                <div className="text-purple-600 font-medium">
                  Avg Speed: {agentStatus.metrics.averageGenerationTime > 0 
                    ? Math.round(agentStatus.metrics.averageGenerationTime / 1000) + 's'
                    : 'N/A'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-4"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Pro Tips
            </h4>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Swipe right to customize your bet amount (0.01 - 100 SUI)</li>
              <li>• Higher odds = higher potential winnings</li>
              <li>• AI generates fresh markets daily based on trending topics</li>
              <li>• Check the dashboard to monitor AI agent performance</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* AI Agent Dashboard Modal */}
      <AIAgentDashboard
        isOpen={showAgentDashboard}
        onClose={() => {
          setShowAgentDashboard(false);
          updateAgentStatus();
        }}
      />
    </>
  );
};