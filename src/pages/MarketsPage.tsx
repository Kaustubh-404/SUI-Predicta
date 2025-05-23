// src/pages/MarketsPage.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Check, X, Clock, TrendingUp, Users, Bot, Sparkles, Filter, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Market } from '@/types/market';
import { formatSUI, placeBetTx, parseSUI, suiClient, PACKAGE_ID } from '@/lib/suiClient';
import { formatTimeRemaining, formatPercentage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BlockchainAIAgent } from '@/services/blockchainAIAgent';

interface MarketsPageProps {
  markets: Market[];
  loading: boolean;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ markets: propMarkets, loading: propLoading }) => {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [markets, setMarkets] = useState<Market[]>(propMarkets);
  const [loading, setLoading] = useState(propLoading);
  const [bettingMarketId, setBettingMarketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'ending'>('newest');

  const categories = ['All', 'Crypto', 'Sports', 'Entertainment', 'Technology', 'Politics', 'Memes'];
  const blockchainAgent = BlockchainAIAgent.getInstance();

  useEffect(() => {
    setMarkets(propMarkets);
    setLoading(propLoading);
  }, [propMarkets, propLoading]);

  useEffect(() => {
    if (account) {
      loadBlockchainMarkets();
    }
  }, [account]);

  // Listen for blockchain markets
  useEffect(() => {
    const handleBlockchainMarkets = (event: CustomEvent) => {
      const { markets: newMarkets } = event.detail;
      console.log('📊 New blockchain markets received:', newMarkets);
      setMarkets(prev => [...newMarkets, ...prev]);
      
      toast({
        title: "🔗 New Blockchain Markets!",
        description: `${newMarkets.length} markets created on SUI blockchain`,
      });
    };

    window.addEventListener('blockchainMarketsGenerated', handleBlockchainMarkets as EventListener);
    return () => window.removeEventListener('blockchainMarketsGenerated', handleBlockchainMarkets as EventListener);
  }, [toast]);

  const loadBlockchainMarkets = async () => {
    try {
      setLoading(true);
      
      if (!PACKAGE_ID) {
        console.log('Package ID not set, using demo markets');
        return;
      }

      // Load markets from blockchain events
      const marketEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::MarketCreated`
        },
        limit: 50,
        order: 'descending'
      });

      const blockchainMarkets: Market[] = [];
      
      for (const event of marketEvents.data) {
        if (event.parsedJson) {
          const data = event.parsedJson as any;
          
          try {
            const marketObject = await suiClient.getObject({
              id: data.market_id,
              options: { 
                showContent: true,
                showType: true 
              }
            });

            if (marketObject.data?.content && 'fields' in marketObject.data.content) {
              const fields = marketObject.data.content.fields as any;
              
              blockchainMarkets.push({
                id: data.market_id,
                question: data.question,
                optionA: fields.option_a || 'Option A',
                optionB: fields.option_b || 'Option B',
                expiresAt: parseInt(data.expires_at),
                status: parseInt(fields.status || '0'),
                outcome: parseInt(fields.outcome || '2'),
                totalPool: parseInt(fields.total_pool || '0'),
                optionAPool: parseInt(fields.option_a_pool || '0'),
                optionBPool: parseInt(fields.option_b_pool || '0'),
                category: 'Blockchain',
              });
            }
          } catch (error) {
            console.log('Error fetching market object:', error);
          }
        }
      }

      if (blockchainMarkets.length > 0) {
        setMarkets(prev => [...blockchainMarkets, ...prev]);
        toast({
          title: "🔗 Blockchain Markets Loaded",
          description: `Found ${blockchainMarkets.length} markets on SUI blockchain`,
        });
      }
    } catch (error) {
      console.error('Error loading blockchain markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBet = async (market: Market, option: number) => {
    if (!account) {
      toast({
        title: "Wallet Not Connected ❌",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setBettingMarketId(market.id);
      const betAmount = '0.01'; // Default bet amount
      const optionName = option === 0 ? market.optionA : market.optionB;
      
      toast({
        title: "Placing Bet... 🚀",
        description: `Betting ${betAmount} SUI on "${optionName}"`,
      });

      const tx = placeBetTx(market.id, option, parseSUI(betAmount));
      
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Bet placed successfully:', result);
            toast({
              title: "Bet Placed Successfully! ✅",
              description: `${betAmount} SUI bet on "${optionName}"`,
            });
            loadBlockchainMarkets();
          },
          onError: (error) => {
            console.error('Bet failed:', error);
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
    } finally {
      setBettingMarketId(null);
    }
  };

  const generateAIMarkets = async () => {
    try {
      toast({
        title: "🤖 Generating Blockchain Markets...",
        description: "AI agent is creating markets on SUI blockchain",
      });

      const createdMarkets = await blockchainAgent.generateMarketsNow();
      
      toast({
        title: "✅ Blockchain Markets Created!",
        description: `${createdMarkets.length} new markets created on SUI`,
      });
    } catch (error) {
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate markets",
        variant: "destructive",
      });
    }
  };

  const filteredMarkets = markets
    .filter(market => {
      const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          market.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          market.optionB.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || market.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.totalPool - a.totalPool;
        case 'ending':
          return a.expiresAt - b.expiresAt;
        case 'newest':
        default:
          return b.expiresAt - a.expiresAt;
      }
    });

  const getMarketStatus = (market: Market) => {
    if (market.status === 1) return { text: 'Resolved', color: 'text-green-600', bg: 'bg-green-50' };
    if (market.status === 2) return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' };
    if (Date.now() > market.expiresAt) return { text: 'Expired', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { text: 'Active', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-3xl h-40 mb-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Enhanced Header */}
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            Prediction Markets
          </motion.h1>
          <p className="text-gray-600 text-lg mb-6">
            Browse and bet on viral prediction markets powered by AI
          </p>
          
          {/* AI Generate Button */}
          <Button
            onClick={generateAIMarkets}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 mb-8"
          >
            <Bot className="w-4 h-4 mr-2" />
            Generate AI Markets on Blockchain
          </Button>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="ending">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Markets Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{filteredMarkets.length}</div>
            <div className="text-sm text-blue-600">Total Markets</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {filteredMarkets.filter(m => m.status === 0).length}
            </div>
            <div className="text-sm text-green-600">Active</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {formatSUI(filteredMarkets.reduce((sum, m) => sum + m.totalPool, 0))}
            </div>
            <div className="text-sm text-purple-600">Total Pool</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {filteredMarkets.filter(m => m.id.startsWith('ai_')).length}
            </div>
            <div className="text-sm text-orange-600">AI Generated</div>
          </div>
        </div>

        {/* Enhanced Markets Grid */}
        <AnimatePresence>
          {filteredMarkets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredMarkets.map((market, index) => {
                const status = getMarketStatus(market);
                const oddsA = formatPercentage(market.optionAPool, market.totalPool);
                const oddsB = 100 - oddsA;
                const isActive = status.text === 'Active';
                const isBetting = bettingMarketId === market.id;
                const isAIGenerated = market.id.startsWith('ai_');

                return (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 group"
                  >
                    <div className="space-y-6">
                      {/* Market Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {isAIGenerated && (
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Generated
                              </div>
                            )}
                            {market.category && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                {market.category}
                              </span>
                            )}
                            <div className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-xs font-medium`}>
                              {status.text}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">
                            {market.question}
                          </h3>
                          
                          {isActive && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeRemaining(market.expiresAt)} remaining</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Options */}
                      <div className="space-y-4">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200 hover:border-green-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-green-800">{market.optionA}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-green-600 font-bold text-lg">{oddsA}%</span>
                            {isActive && (
                              <Button
                                size="sm"
                                onClick={() => handleQuickBet(market, 0)}
                                disabled={isBetting}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                              >
                                {isBetting ? 'Betting...' : 'Bet'}
                              </Button>
                            )}
                          </div>
                        </motion.div>

                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 hover:border-red-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <X className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-red-800">{market.optionB}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-600 font-bold text-lg">{oddsB}%</span>
                            {isActive && (
                              <Button
                                size="sm"
                                onClick={() => handleQuickBet(market, 1)}
                                disabled={isBetting}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                              >
                                {isBetting ? 'Betting...' : 'Bet'}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="space-y-3">
                        <Progress value={oddsA} className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${oddsA}%` }}
                          />
                        </Progress>
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-green-600">{formatSUI(market.optionAPool)} SUI</span>
                          <span className="text-gray-500">{formatSUI(market.totalPool)} SUI total</span>
                          <span className="text-red-600">{formatSUI(market.optionBPool)} SUI</span>
                        </div>
                      </div>

                      {/* Market Stats */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Pool: {formatSUI(market.totalPool)} SUI</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        </div>
                        {market.status === 1 && (
                          <div className="text-sm text-green-600 font-medium">
                            Winner: {market.outcome === 0 ? market.optionA : market.optionB}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold mb-4">No Markets Found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your filters to see more markets'
                  : 'Be the first to create a prediction market!'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(searchQuery || selectedCategory !== 'All') && (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    variant="outline"
                    className="rounded-2xl"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/create')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl"
                >
                  Create Market
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};