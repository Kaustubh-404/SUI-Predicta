// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  Clock,
  ExternalLink,
  Copy,
  LogOut,
  Coins,
  BarChart3,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatAddress, formatSUIAmount, copyToClipboard } from '@/lib/utils';
import { suiClient, PACKAGE_ID } from '@/lib/suiClient';

interface UserStats {
  totalBets: number;
  totalWinnings: number;
  winRate: number;
  activeBets: number;
  balance: number;
  joinedDate: string;
}

export const ProfilePage: React.FC = () => {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    totalBets: 0,
    totalWinnings: 0,
    winRate: 0,
    activeBets: 0,
    balance: 0,
    joinedDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account?.address) {
      loadUserData();
    }
  }, [account?.address]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!account?.address) return;

      // Load user balance
      const coins = await suiClient.getCoins({
        owner: account.address,
        coinType: '0x2::sui::SUI',
      });
      
      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + parseInt(coin.balance);
      }, 0);

      // Load user bet history from events
      let totalBets = 0;
      let totalWinnings = 0;
      let activeBets = 0;
      let userWins: any[] = [];

      try {
        if (PACKAGE_ID) {
          // Query SharesPurchased events for this user
          const betEvents = await suiClient.queryEvents({
            query: {
              MoveEventType: `${PACKAGE_ID}::market::BetPlaced`
            },
            limit: 100,
            order: 'descending'
          });

          const userBets = betEvents.data.filter(event => 
            event.parsedJson && (event.parsedJson as any).bettor === account.address
          );

          totalBets = userBets.length;

          // Query WinningsClaimed events for this user
          const winEvents = await suiClient.queryEvents({
            query: {
              MoveEventType: `${PACKAGE_ID}::market::WinningsClaimed`
            },
            limit: 100,
            order: 'descending'
          });

          userWins = winEvents.data.filter(event => 
            event.parsedJson && (event.parsedJson as any).winner === account.address
          );

          totalWinnings = userWins.reduce((sum, event) => {
            const amount = (event.parsedJson as any).amount;
            return sum + (amount ? parseInt(amount) : 0);
          }, 0);

          // Count active bets (bets without corresponding claims)
          const claimedMarkets = new Set(userWins.map(event => 
            (event.parsedJson as any).market_id
          ));
          
          activeBets = userBets.filter(event => 
            !claimedMarkets.has((event.parsedJson as any).market_id)
          ).length;
        }
      } catch (eventError) {
        console.log('Could not load event data:', eventError);
        // Continue with zero values if events can't be loaded
      }

      const winRate = totalBets > 0 ? Math.round((userWins.length / totalBets) * 100) : 0;

      setUserStats({
        totalBets,
        totalWinnings,
        winRate,
        activeBets,
        balance: totalBalance,
        joinedDate: new Date().toISOString().split('T')[0],
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error Loading Profile",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (account?.address) {
      const success = await copyToClipboard(account.address);
      if (success) {
        toast({
          title: "Address Copied! 📋",
          description: "Wallet address copied to clipboard",
        });
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected 👋",
      description: "Successfully disconnected from wallet",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="space-y-6">
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
            Profile
          </h1>
          <p className="text-gray-600">Your prediction journey</p>
        </div>

        {/* Wallet Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Predictor</h3>
                <p className="text-sm opacity-90">Since {userStats.joinedDate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatSUIAmount(userStats.balance)}</div>
              <div className="text-sm opacity-90">SUI Balance</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
            <span className="font-mono text-sm">
              {formatAddress(account?.address || '')}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyAddress}
                className="text-white hover:bg-white/10 p-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => account?.address && window.open(`https://testnet.suivision.xyz/account/${account.address}`, '_blank')}
                className="text-white hover:bg-white/10 p-2"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Total Bets</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{userStats.totalBets}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Winnings</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{formatSUIAmount(userStats.totalWinnings)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{userStats.winRate}%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Active Bets</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{userStats.activeBets}</div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity
          </h3>
          
          {userStats.totalBets === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No betting activity yet</p>
              <p className="text-sm text-gray-400">Start swiping to place your first bet!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                You've placed {userStats.totalBets} bets and won {formatSUIAmount(userStats.totalWinnings)} SUI total!
              </div>
            </div>
          )}
        </motion.div>

        {/* Disconnect Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};