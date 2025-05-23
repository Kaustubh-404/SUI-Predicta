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
    <div className="min-h-screen bg-[#efe7f7] flex flex-col justify-end relative overflow-hidden">
      {/* Orbit-style background decorations */}
      <motion.img
        src="/starsquare.png"
        className="absolute w-[15vw] h-[20vh] top-5 left-28 object-contain opacity-60"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      
      <motion.img
        src="/star2.png"
        className="absolute w-[15vw] h-[20vh] top-28 left-10 transform rotate-[40deg] object-contain opacity-70"
        animate={{
          y: [0, 10, 0],
          rotate: [40, 50, 30, 40],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      
      <motion.img
        src="/flower.png"
        className="absolute w-[30vw] h-[40vh] top-28 left-32 object-contain opacity-50"
        animate={{
          y: [0, -8, 0],
          x: [0, 3, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      
      <motion.img
        src="/star3.png"
        className="absolute w-[35vw] h-[35vh] top-5 right-10 object-contain opacity-60"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -12, 12, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Logo and Title with Orbit styling */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto bg-[#d3aeff] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-black"
            >
              <Wallet className="w-10 h-10 text-black" />
            </motion.div>
            
            <div>
              <h1 className="text-4xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                ORBIT
              </h1>
              <p className="text-black/80 mt-2 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                The viral prediction market on SUI
              </p>
            </div>
          </div>

          {/* Features with Orbit design */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-4 border-black shadow-lg"
              >
                <div className="bg-[#99ff88] rounded-xl p-3 border-2 border-black">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-black/70 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    {feature.description}
                  </p>
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
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-black shadow-xl space-y-4">
                <h3 className="font-black text-black mb-3" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  Connect SUI Wallet
                </h3>
                
                {suiWallets.map((wallet, _index) => (
                  <Button
                    key={wallet.name}
                    onClick={() => handleConnectWallet(wallet)}
                    disabled={isPending}
                    className="w-full bg-[#99ff88] hover:bg-[#77dd66] text-black font-black py-4 px-6 text-lg rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 border-4 border-black transform hover:-translate-y-1"
                    style={{ fontFamily: 'Brice Black, sans-serif' }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isPending ? 'Connecting...' : `Connect ${wallet.name}`}
                  </Button>
                ))}

                {error && (
                  <div className="bg-[#ff6961] border-4 border-black rounded-2xl p-3 flex items-start text-black shadow-lg">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium" style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
                      {error}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* No SUI Wallets Found */
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-4 border-black shadow-xl">
                <div className="bg-[#d3aeff] border-4 border-black rounded-2xl p-4">
                  <h4 className="font-black text-black mb-3" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Install SUI Wallet
                  </h4>
                  <p className="text-sm text-black/80 mb-4 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Please install one of these SUI wallets to continue:
                  </p>
                  
                  <div className="space-y-3">
                    {/* Suiet Wallet */}
                    <a
                      href="https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-black hover:border-[#d3aeff] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#d3aeff] rounded-lg flex items-center justify-center mr-3 border-2 border-black">
                          <Wallet className="w-4 h-4 text-black" />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            Suiet Wallet
                          </div>
                          <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                            Recommended
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-black/60" />
                    </a>

                    {/* Slush Wallet */}
                    <a
                      href="https://chrome.google.com/webstore/detail/slush-wallet/gblgcffnklakmggjdkcdcndeafblklaf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-black hover:border-[#99ff88] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#99ff88] rounded-lg flex items-center justify-center mr-3 border-2 border-black">
                          <Wallet className="w-4 h-4 text-black" />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            Slush Wallet
                          </div>
                          <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                            Alternative
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-black/60" />
                    </a>

                    {/* Sui Wallet */}
                    <a
                      href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-black hover:border-[#ff6961] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#ff6961] rounded-lg flex items-center justify-center mr-3 border-2 border-black">
                          <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                            Sui Wallet
                          </div>
                          <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                            Official
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-black/60" />
                    </a>
                  </div>

                  <p className="text-xs text-black/60 mt-3 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    After installation, refresh this page to connect.
                  </p>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {wallets.length > 0 && (
              <details className="text-xs text-black/60">
                <summary className="cursor-pointer font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  Debug: All detected wallets
                </summary>
                <div className="mt-2 p-2 bg-white rounded-2xl border-2 border-black text-left">
                  {wallets.map(w => (
                    <div key={w.name} className="flex justify-between">
                      <span style={{ fontFamily: 'Brice Regular, sans-serif' }}>{w.name}</span>
                      <span className={`font-medium ${suiWallets.includes(w) ? 'text-[#99ff88]' : 'text-[#ff6961]'}`} style={{ fontFamily: 'Brice SemiBold, sans-serif' }}>
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
            className="bg-[#99ff88] rounded-2xl p-4 border-4 border-black shadow-lg"
          >
            <h4 className="font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
              🚨 Testnet Demo
            </h4>
            <p className="text-sm text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
              This is running on SUI testnet. Get free testnet SUI from the{' '}
              <a 
                href="https://docs.sui.io/testnet/build/faucet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-black text-black hover:text-black/80"
                style={{ fontFamily: 'Brice Black, sans-serif' }}
              >
                SUI Faucet
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};


