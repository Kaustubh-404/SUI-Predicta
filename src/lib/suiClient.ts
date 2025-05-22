// src/lib/suiClient.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// SUI Testnet configuration
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// Contract configuration
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "";
export const MARKET_CAP_ID = import.meta.env.VITE_MARKET_CAP_ID || "";

// Market functions
export const createMarketTx = (
  question: string,
  optionA: string,
  optionB: string,
  durationMs: number
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::market::create_market`,
    arguments: [
      tx.object(MARKET_CAP_ID),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(question))),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(optionA))),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(optionB))),
      tx.pure.u64(durationMs),
      tx.object('0x6'), // Clock object
    ],
  });
  
  return tx;
};

export const placeBetTx = (
  marketId: string,
  option: number,
  amount: string
) => {
  const tx = new Transaction();
  
  // Split coins for the bet
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::market::place_bet`,
    arguments: [
      tx.object(marketId),
      tx.pure.u8(option),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });
  
  return tx;
};

export const claimWinningsTx = (marketId: string) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::market::claim_winnings`,
    arguments: [
      tx.object(marketId),
    ],
  });
  
  return tx;
};

// Utility functions
export const formatSUI = (amount: bigint | number | string): string => {
  const amountNum = typeof amount === 'bigint' ? Number(amount) : 
                   typeof amount === 'string' ? parseFloat(amount) : amount;
  return (amountNum / 1_000_000_000).toFixed(4); // SUI has 9 decimals
};

export const parseSUI = (amount: string): string => {
  return Math.floor(parseFloat(amount) * 1_000_000_000).toString();
};