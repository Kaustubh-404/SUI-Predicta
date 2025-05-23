// src/components/WalletConnect.tsx
import React, { useState } from 'react';
import { useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import { Wallet, Zap, TrendingUp, Users, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WalletConnect: React.FC = () => {
  const { mutate: connect, isPending } = useConnectWallet();
  const wallets = useWallets();
  const [error, setError] = useState<string>('');

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant bets on SUI blockchain'
    },
    {
      icon: TrendingUp,
      title: 'AI Generated',
      description: 'Trending prediction markets'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of predictors'
    }
  ];

  // Filter for SUI-specific wallets (exclude Phantom, MetaMask, etc.)
  const suiWallets = wallets.filter(wallet => {
    const name = wallet.name.toLowerCase();
    return (
      name.includes('sui') || 
      name.includes('suiet') || 
      name.includes('slush') ||
      name.includes('ethos')
    );
  });

  const handleConnectWallet = (selectedWallet?: any) => {
    setError('');
    
    if (suiWallets.length === 0) {
      setError('No SUI wallets found. Please install Suiet or Slush wallet.');
      return;
    }

    // Use selected wallet or prefer Suiet/Slush over others
    const targetWallet = selectedWallet || 
      suiWallets.find(w => w.name.toLowerCase().includes('suiet')) ||
      suiWallets.find(w => w.name.toLowerCase().includes('slush')) ||
      suiWallets.find(w => w.name.toLowerCase().includes('sui')) ||
      suiWallets[0];

    console.log('Connecting to wallet:', targetWallet.name);

    connect(
      { wallet: targetWallet },
      {
        onSuccess: () => {
          console.log('Connected successfully to:', targetWallet.name);
        },
        onError: (err) => {
          console.error('Connection failed:', err);
          setError(`Failed to connect to ${targetWallet.name}. Please try again.`);
        },
      }
    );
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Logo and Title */}
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Wallet className="w-10 h-10 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SUI Predictions
            </h1>
            <p className="text-gray-600 mt-2">
              The viral prediction market on SUI
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-3">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connect Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {/* Available Wallets */}
          {suiWallets.length > 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 space-y-4">
              <h3 className="font-semibold text-gray-800 mb-3">Connect SUI Wallet</h3>
              
              {suiWallets.map((wallet, _index) => (
                <Button
                  key={wallet.name}
                  onClick={() => handleConnectWallet(wallet)}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isPending ? 'Connecting...' : `Connect ${wallet.name}`}
                </Button>
              ))}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start text-red-700">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          ) : (
            /* No SUI Wallets Found */
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">Install SUI Wallet</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Please install one of these SUI wallets to continue:
                </p>
                
                <div className="space-y-3">
                  {/* Suiet Wallet */}
                  <a
                    href="https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Suiet Wallet</div>
                        <div className="text-xs text-gray-500">Recommended</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  {/* Slush Wallet */}
                  <a
                    href="https://chrome.google.com/webstore/detail/slush-wallet/gblgcffnklakmggjdkcdcndeafblklaf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Slush Wallet</div>
                        <div className="text-xs text-gray-500">Alternative</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  {/* Sui Wallet */}
                  <a
                    href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Sui Wallet</div>
                        <div className="text-xs text-gray-500">Official</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>

                <p className="text-xs text-yellow-600 mt-3">
                  After installation, refresh this page to connect.
                </p>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {wallets.length > 0 && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer">Debug: All detected wallets</summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-left">
                {wallets.map(w => (
                  <div key={w.name} className="flex justify-between">
                    <span>{w.name}</span>
                    <span className={suiWallets.includes(w) ? 'text-green-600' : 'text-red-600'}>
                      {suiWallets.includes(w) ? '✓ SUI' : '✗ Filtered'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
        >
          <h4 className="font-semibold text-blue-800 mb-2">🚨 Testnet Demo</h4>
          <p className="text-sm text-blue-600">
            This is running on SUI testnet. Get free testnet SUI from the{' '}
            <a 
              href="https://docs.sui.io/testnet/build/faucet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              SUI Faucet
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};