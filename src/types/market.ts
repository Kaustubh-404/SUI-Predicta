// src/types/market.ts
export interface Market {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  expiresAt: number;
  status: number; // 0: Active, 1: Resolved, 2: Cancelled
  outcome: number; // 0: Option A, 1: Option B, 2: Unresolved
  totalPool: number;
  optionAPool: number;
  optionBPool: number;
  created_at?: number;
  category?: string;
  image?: string;
}

export interface UserBet {
  amount: number;
  option: number;
  claimed: boolean;
}

export interface UserProfile {
  totalBets: number;
  totalWinnings: number;
  winCount: number;
  lossCount: number;
  winRate: number;
}

export interface AIGeneratedMarket {
  question: string;
  optionA: string;
  optionB: string;
  category: string;
  expiresAt: string;
  confidence: number;
}

// Constants
export const MARKET_STATUS = {
  ACTIVE: 0,
  RESOLVED: 1,
  CANCELLED: 2,
} as const;

export const MARKET_OUTCOME = {
  OPTION_A: 0,
  OPTION_B: 1,
  UNRESOLVED: 2,
} as const;

export const MARKET_CATEGORIES = [
  'Crypto',
  'Sports',
  'Politics',
  'Entertainment',
  'Technology',
  'Memes',
  'Weather',
  'Economics',
  'Social Media',
  'Gaming',
] as const;

export type MarketCategory = typeof MARKET_CATEGORIES[number];