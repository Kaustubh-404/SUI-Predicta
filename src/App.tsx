// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '@/providers/WalletProvider';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/Navigation';
import { WalletConnect } from '@/components/WalletConnect';
import { HomePage } from '@/pages/HomePage';
import { MarketsPage } from '@/pages/MarketsPage';
import { CreateMarketPage } from '@/pages/CreateMarketPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { type Market } from '@/types/market';

function AppContent() {
  const account = useCurrentAccount();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      loadMarkets();
    } else {
      setLoading(false);
    }
  }, [account]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      // TODO: Load markets from blockchain
      // For now, using mock data
      const mockMarkets: Market[] = [
        {
          id: '0x1',
          question: 'Will Bitcoin reach $100k before 2025 ends?',
          optionA: 'Yes, to the moon! 🚀',
          optionB: 'No, bear market continues 📉',
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          status: 0,
          outcome: 2,
          totalPool: 1000000000, // 1 SUI in smallest units
          optionAPool: 600000000,
          optionBPool: 400000000,
          category: 'Crypto',
        },
        {
          id: '0x2',
          question: 'Will the next viral meme be AI-generated?',
          optionA: 'Yes, AI takeover 🤖',
          optionB: 'No, humans still got it 😤',
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day
          status: 0,
          outcome: 2,
          totalPool: 500000000,
          optionAPool: 300000000,
          optionBPool: 200000000,
          category: 'Memes',
        },
      ];
      setMarkets(mockMarkets);
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMarket = (newMarket: Market) => {
    setMarkets(prev => [newMarket, ...prev]);
  };

  // Show loading state while determining wallet connection
  if (loading && !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-20">
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomePage 
                    markets={markets} 
                    loading={loading}
                    onMarketsUpdate={loadMarkets}
                  />
                } 
              />
              <Route 
                path="/markets" 
                element={
                  <MarketsPage 
                    markets={markets} 
                    loading={loading}
                  />
                } 
              />
              <Route 
                path="/create" 
                element={
                  <CreateMarketPage 
                    onMarketCreated={addMarket}
                  />
                } 
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </Router>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;