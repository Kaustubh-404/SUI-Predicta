// src/pages/LeaderboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, User, Crown } from 'lucide-react';
import { formatAddress, formatSUIAmount } from '@/lib/utils';
import { suiClient, PACKAGE_ID } from '@/lib/suiClient';

interface LeaderboardEntry {
  address: string;
  winnings: number;
  totalBets: number;
  winRate: number;
  rank: number;
}

export const LeaderboardPage: React.FC = () => {
  const account = useCurrentAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      if (!PACKAGE_ID) {
        console.log('Package ID not set, showing empty leaderboard');
        setLoading(false);
        return;
      }

      // Get all WinningsClaimed events to calculate leaderboard
      const winEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::WinningsClaimed`
        },
        limit: 1000,
        order: 'descending'
      });

      // Get all SharesPurchased events to calculate total bets
      const betEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::BetPlaced`
        },
        limit: 1000,
        order: 'descending'
      });

      // Aggregate data by address
      const userStats = new Map<string, {
        winnings: number;
        totalBets: number;
        wins: number;
      }>();

      // Process winning events
      winEvents.data.forEach(event => {
        if (event.parsedJson) {
          const data = event.parsedJson as any;
          const address = data.winner;
          const amount = parseInt(data.amount || '0');
          
          if (!userStats.has(address)) {
            userStats.set(address, { winnings: 0, totalBets: 0, wins: 0 });
          }
          
          const stats = userStats.get(address)!;
          stats.winnings += amount;
          stats.wins += 1;
        }
      });

      // Process betting events
      betEvents.data.forEach(event => {
        if (event.parsedJson) {
          const data = event.parsedJson as any;
          const address = data.bettor;
          
          if (!userStats.has(address)) {
            userStats.set(address, { winnings: 0, totalBets: 0, wins: 0 });
          }
          
          const stats = userStats.get(address)!;
          stats.totalBets += 1;
        }
      });

      // Convert to leaderboard entries and sort by winnings
      const entries: LeaderboardEntry[] = Array.from(userStats.entries())
        .map(([address, stats]) => ({
          address,
          winnings: stats.winnings,
          totalBets: stats.totalBets,
          winRate: stats.totalBets > 0 ? Math.round((stats.wins / stats.totalBets) * 100) : 0,
          rank: 0, // Will be set after sorting
        }))
        .sort((a, b) => b.winnings - a.winnings)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboard(entries);

      // Find current user's rank
      if (account?.address) {
        const userEntry = entries.find(entry => entry.address === account.address);
        setUserRank(userEntry ? userEntry.rank : null);
      }

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 2: return 'from-gray-300 via-gray-400 to-gray-500';
      case 3: return 'from-amber-400 via-amber-500 to-amber-600';
      default: return 'from-blue-400 via-blue-500 to-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600">Top predictors by winnings</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`bg-gradient-to-r ${getRankBackground(1)} rounded-2xl p-6 text-white`}
          >
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                Hall of Fame
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((user, index) => (
                <div key={user.address} className="text-center">
                  <div className="text-2xl mb-1">{getRankEmoji(user.rank)}</div>
                  <div className="text-sm font-medium mb-1">
                    {formatAddress(user.address)}
                  </div>
                  <div className="text-xs opacity-90">
                    {formatSUIAmount(user.winnings)} SUI
                  </div>
                  <div className="text-xs opacity-75">
                    {user.winRate}% win rate
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Full Rankings
            </h3>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">No leaderboard data yet</p>
              <p className="text-sm text-gray-400">
                Start betting to see rankings appear!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.slice(0, 10).map((user, index) => (
                <motion.div
                  key={user.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 flex items-center justify-between ${
                    user.address === account?.address ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getRankBackground(user.rank)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {user.rank}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {formatAddress(user.address)}
                        {user.address === account?.address && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.totalBets} bets • {user.winRate}% win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatSUIAmount(user.winnings)} SUI
                    </div>
                    <div className="text-xs text-gray-500">Total winnings</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Your Rank Card */}
        {account?.address && userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-800">Your Rank</div>
                  <div className="text-sm text-blue-600">
                    {userRank <= 10 ? 'You\'re in the top 10!' : 'Keep betting to climb higher!'}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">#{userRank}</div>
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-200"
        >
          <div className="text-center">
            <h4 className="font-semibold text-purple-800 mb-2">
              🚀 How to Climb the Leaderboard
            </h4>
            <p className="text-sm text-purple-600">
              Win prediction markets to earn SUI rewards and climb the rankings. 
              The more you win, the higher you'll rank!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};