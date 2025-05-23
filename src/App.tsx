// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { WalletProvider } from '@/providers/WalletProvider';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/Navigation';
import { WalletConnect } from '@/components/WalletConnect';
import { LandingPage } from '@/components/LandingPage';
import { HomePage } from '@/pages/HomePage';
import { MarketsPage } from '@/pages/MarketsPage';
import { CreateMarketPage } from '@/pages/CreateMarketPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { ProductionAIAgent } from '@/services/productionAIAgent';
import { type Market, type AIGeneratedMarket } from '@/types/market';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const account = useCurrentAccount();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAgent] = useState(() => ProductionAIAgent.getInstance());

  useEffect(() => {
    if (account) {
      loadMarkets();
      startAIAgent();
    }
  }, [account]);

  // Listen for AI-generated markets
  useEffect(() => {
    const handleAIMarkets = (event: CustomEvent) => {
      const { markets: aiMarkets } = event.detail;
      console.log('🤖 AI Agent generated new markets:', aiMarkets);
      
      // Convert AI markets to Market format and add to state
      const newMarkets: Market[] = aiMarkets.map((aiMarket: AIGeneratedMarket) => ({
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: aiMarket.question,
        optionA: aiMarket.optionA,
        optionB: aiMarket.optionB,
        expiresAt: new Date(aiMarket.expiresAt).getTime(),
        status: 0,
        outcome: 2,
        totalPool: 0,
        optionAPool: 0,
        optionBPool: 0,
        category: aiMarket.category,
      }));

      setMarkets(prev => [...newMarkets, ...prev]);
      
      toast({
        title: "🤖 AI Generated New Markets!",
        description: `${newMarkets.length} viral prediction markets just dropped!`,
      });
    };

    window.addEventListener('aiMarketsGenerated', handleAIMarkets as EventListener);
    return () => window.removeEventListener('aiMarketsGenerated', handleAIMarkets as EventListener);
  }, [toast]);

  const startAIAgent = () => {
    try {
      aiAgent.start();
      const status = aiAgent.getStatus();
      console.log('🤖 AI Agent Status:', status);
      
      if (status.isRunning) {
        toast({
          title: "🤖 AI Agent Active",
          description: `Generating ${status.config.dailyMarketCount} new markets daily at ${status.config.executionHour}:00 UTC`,
        });
      }
    } catch (error) {
      console.error('Failed to start AI agent:', error);
    }
  };

  const loadMarkets = async () => {
    try {
      setLoading(true);
      
      // TODO: Load real markets from blockchain
      // For now, generate dynamic demo markets
      const now = Date.now();
      const dayOfWeek = new Date().getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const demoMarkets: Market[] = [
        {
          id: `market_${now}_1`,
          question: isWeekend ? 
            'Will any major crypto project announce this weekend? 🚀📱' : 
            'Will Bitcoin break $100k during market hours today? 💎⚡',
          optionA: isWeekend ? 'Yes, weekend surprises! 🎉✨' : 'Yes, diamond hands! 💎🙌',
          optionB: isWeekend ? 'No, quiet weekend 😴💤' : 'No, bears still strong 🐻📉',
          expiresAt: now + (isWeekend ? 2 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000),
          status: 0,
          outcome: 2,
          totalPool: Math.floor(Math.random() * 5000000000), // 0-5 SUI
          optionAPool: 0,
          optionBPool: 0,
          category: 'Crypto',
        },
        {
          id: `market_${now}_2`,
          question: 'Will the next viral TikTok trend be AI-generated? 🤖🎵',
          optionA: 'Yes, AI takeover! 🤖👑',
          optionB: 'No, humans still creative 💪😎',
          expiresAt: now + 24 * 60 * 60 * 1000,
          status: 0,
          outcome: 2,
          totalPool: Math.floor(Math.random() * 3000000000),
          optionAPool: 0,
          optionBPool: 0,
          category: 'Memes',
        },
        {
          id: `market_${now}_3`,
          question: 'Will any tech CEO tweet something controversial today? 📱💥',
          optionA: 'Yes, drama incoming! 🍿🔥',
          optionB: 'No, staying quiet 🤐✋',
          expiresAt: now + 18 * 60 * 60 * 1000,
          status: 0,
          outcome: 2,
          totalPool: Math.floor(Math.random() * 4000000000),
          optionAPool: 0,
          optionBPool: 0,
          category: 'Technology',
        },
        {
          id: `market_${now}_4`,
          question: 'Will Ethereum gas fees go below 15 gwei today? ⛽💸',
          optionA: 'Yes, finally cheap! ⚡💚',
          optionB: 'No, still expensive 💸😭',
          expiresAt: now + 8 * 60 * 60 * 1000,
          status: 0,
          outcome: 2,
          totalPool: Math.floor(Math.random() * 2000000000),
          optionAPool: 0,
          optionBPool: 0,
          category: 'Crypto',
        }
      ];

      // Randomly distribute pools between options
      demoMarkets.forEach(market => {
        const distribution = Math.random();
        market.optionAPool = Math.floor(market.totalPool * distribution);
        market.optionBPool = market.totalPool - market.optionAPool;
      });

      setMarkets(demoMarkets);
    } catch (error) {
      console.error('Error loading markets:', error);
      toast({
        title: "❌ Loading Failed",
        description: "Failed to load markets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMarket = (newMarket: Market) => {
    setMarkets(prev => [newMarket, ...prev]);
    toast({
      title: "🎉 Market Created Successfully!",
      description: "Your prediction market is now live and ready for bets!",
    });
  };

  const handleGetStarted = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Routes>
        {/* Landing Page Route */}
        <Route 
          path="/" 
          element={<LandingPage onGetStarted={handleGetStarted} />} 
        />
        
        {/* Protected Routes - Require Wallet Connection */}
        <Route 
          path="/home" 
          element={
            account ? (
              <>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1 pb-20">
                    <HomePage 
                      markets={markets} 
                      loading={loading}
                      onMarketsUpdate={loadMarkets}
                    />
                  </main>
                  <Navigation />
                </div>
              </>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <WalletConnect />
              </div>
            )
          } 
        />
        
        <Route 
          path="/markets" 
          element={
            account ? (
              <>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1 pb-20">
                    <MarketsPage 
                      markets={markets} 
                      loading={loading}
                    />
                  </main>
                  <Navigation />
                </div>
              </>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <WalletConnect />
              </div>
            )
          } 
        />
        
        <Route 
          path="/create" 
          element={
            account ? (
              <>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1 pb-20">
                    <CreateMarketPage 
                      onMarketCreated={addMarket}
                    />
                  </main>
                  <Navigation />
                </div>
              </>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <WalletConnect />
              </div>
            )
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            account ? (
              <>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1 pb-20">
                    <ProfilePage />
                  </main>
                  <Navigation />
                </div>
              </>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <WalletConnect />
              </div>
            )
          } 
        />
        
        <Route 
          path="/leaderboard" 
          element={
            account ? (
              <>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1 pb-20">
                    <LeaderboardPage />
                  </main>
                  <Navigation />
                </div>
              </>
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <WalletConnect />
              </div>
            )
          } 
        />
      </Routes>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <Router>
        <AppContent />
      </Router>
    </WalletProvider>
  );
}

export default App;