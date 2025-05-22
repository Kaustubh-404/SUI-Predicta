// src/pages/MarketsPage.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Market } from '@/types/market';
import { formatSUI, placeBetTx, parseSUI, suiClient, PACKAGE_ID } from '@/lib/suiClient';
import { formatTimeRemaining, formatPercentage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    setMarkets(propMarkets);
    setLoading(propLoading);
  }, [propMarkets, propLoading]);

  useEffect(() => {
    if (account) {
      loadMarketsFromBlockchain();
    }
  }, [account]);

  const loadMarketsFromBlockchain = async () => {
    try {
      setLoading(true);
      
      if (!PACKAGE_ID) {
        console.log('Package ID not set, using prop markets');
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
          
          // Get market details from the contract
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
        setMarkets(blockchainMarkets);
      } else {
        // Fallback to prop markets if no blockchain markets
        setMarkets(propMarkets);
      }
    } catch (error) {
      console.error('Error loading markets from blockchain:', error);
      setMarkets(propMarkets);
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
            // Refresh markets
            loadMarketsFromBlockchain();
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

  const getMarketStatus = (market: Market) => {
    if (market.status === 1) return { text: 'Resolved', color: 'text-green-600' };
    if (market.status === 2) return { text: 'Cancelled', color: 'text-red-600' };
    if (Date.now() > market.expiresAt) return { text: 'Expired', color: 'text-orange-600' };
    return { text: 'Active', color: 'text-blue-600' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-32"></div>
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
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            All Markets
          </h1>
          <p className="text-gray-600">Browse and bet on prediction markets</p>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {markets.map((market, index) => {
            const status = getMarketStatus(market);
            const oddsA = formatPercentage(market.optionAPool, market.totalPool);
            const oddsB = 100 - oddsA;
            const isActive = status.text === 'Active';
            const isBetting = bettingMarketId === market.id;

            return (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  {/* Market Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{market.question}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${status.color}`}>{status.text}</span>
                        {isActive && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              {formatTimeRemaining(market.expiresAt)} left
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {market.category && (
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                        {market.category}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">{market.optionA}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-semibold">{oddsA}%</span>
                        {isActive && (
                          <Button
                            size="sm"
                            onClick={() => handleQuickBet(market, 0)}
                            disabled={isBetting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isBetting ? 'Betting...' : 'Bet'}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800">{market.optionB}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-red-600 font-semibold">{oddsB}%</span>
                        {isActive && (
                          <Button
                            size="sm"
                            onClick={() => handleQuickBet(market, 1)}
                            disabled={isBetting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isBetting ? 'Betting...' : 'Bet'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={oddsA} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatSUI(market.optionAPool)} SUI</span>
                      <span>{formatSUI(market.totalPool)} SUI total</span>
                      <span>{formatSUI(market.optionBPool)} SUI</span>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Total Pool: <span className="font-semibold">{formatSUI(market.totalPool)} SUI</span>
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

        {/* Empty State */}
        {markets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Markets Found</h3>
            <p className="text-gray-600 mb-6">Be the first to create a prediction market!</p>
            <Button 
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Create Market
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {markets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Button 
              onClick={() => navigate('/create')}
              variant="outline"
              className="border-purple-200 hover:border-purple-300 hover:bg-purple-50"
            >
              Create New Market
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};