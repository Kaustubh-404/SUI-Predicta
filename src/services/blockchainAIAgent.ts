// src/services/blockchainAIAgent.ts
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';
import { AIMarketGenerator } from '@/lib/aiMarketGenerator';
import {  suiClient, PACKAGE_ID, MARKET_CAP_ID } from '@/lib/suiClient';
import type { AIGeneratedMarket, Market } from '@/types/market';

interface AgentMetrics {
  totalMarketsGenerated: number;
  successfulGenerations: number;
  failedGenerations: number;
  lastGenerationTime: number | null;
  averageGenerationTime: number;
  dailyGenerationStreak: number;
  totalGasUsed: number;
  onChainMarketsCreated: number;
}

interface AgentConfig {
  dailyMarketCount: number;
  executionHour: number;
  enabled: boolean;
  categories: string[];
  minConfidenceThreshold: number;
  maxRetries: number;
  gasBudget: number; // Fixed: was gasbudget
  privateKey: string; // AI agent's wallet private key
}

interface GenerationLog {
  timestamp: number;
  status: 'success' | 'failed' | 'started' | 'blockchain_success' | 'blockchain_failed';
  message: string;
  marketsCount?: number;
  error?: string;
  txDigest?: string;
  gasUsed?: number; // Fixed: now properly typed as number
}

export class BlockchainAIAgent {
  private static instance: BlockchainAIAgent;
  private config: AgentConfig;
  private metrics: AgentMetrics;
  private logs: GenerationLog[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isGenerating = false;
  private keypair: Ed25519Keypair | null = null;

  private constructor() {
    this.config = this.loadConfig();
    this.metrics = this.loadMetrics();
    this.logs = this.loadLogs();
    this.initializeKeypair();
  }

  static getInstance(): BlockchainAIAgent {
    if (!BlockchainAIAgent.instance) {
      BlockchainAIAgent.instance = new BlockchainAIAgent();
    }
    return BlockchainAIAgent.instance;
  }

  private loadConfig(): AgentConfig {
    const stored = localStorage.getItem('blockchainAIAgent_config');
    const defaults: AgentConfig = {
      dailyMarketCount: 5,
      executionHour: 9,
      enabled: true,
      categories: ['Crypto', 'Technology', 'Sports', 'Entertainment', 'Politics', 'Memes'],
      minConfidenceThreshold: 0.6,
      maxRetries: 3,
      gasBudget: 100000000, // Fixed: was gasbudget, 0.1 SUI
      privateKey: import.meta.env.VITE_AI_AGENT_PRIVATE_KEY || '', // Will be set by user
    };
    
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  }

  private loadMetrics(): AgentMetrics {
    const stored = localStorage.getItem('blockchainAIAgent_metrics');
    const defaults: AgentMetrics = {
      totalMarketsGenerated: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      lastGenerationTime: null,
      averageGenerationTime: 0,
      dailyGenerationStreak: 0,
      totalGasUsed: 0,
      onChainMarketsCreated: 0,
    };
    
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  }

  private loadLogs(): GenerationLog[] {
    const stored = localStorage.getItem('blockchainAIAgent_logs');
    return stored ? JSON.parse(stored) : [];
  }

  private initializeKeypair(): void {
    if (this.config.privateKey) {
      try {
        // Handle different private key formats
        let privateKeyBytes: Uint8Array;
        
        if (this.config.privateKey.startsWith('0x')) {
          // Hex format: remove 0x and convert
          const hexString = this.config.privateKey.slice(2);
          privateKeyBytes = new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
        } else {
          // Base64 format
          privateKeyBytes = fromBase64(this.config.privateKey);
        }
        
        this.keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        
        this.addLog({
          timestamp: Date.now(),
          status: 'success',
          message: `AI Agent wallet initialized: ${this.keypair.getPublicKey().toSuiAddress()}`,
        });
      } catch (error) {
        this.addLog({
          timestamp: Date.now(),
          status: 'failed',
          message: 'Failed to initialize AI agent wallet',
          error: String(error),
        });
      }
    }
  }

  private saveConfig(): void {
    localStorage.setItem('blockchainAIAgent_config', JSON.stringify(this.config));
  }

  private saveMetrics(): void {
    localStorage.setItem('blockchainAIAgent_metrics', JSON.stringify(this.metrics));
  }

  private saveLogs(): void {
    this.logs = this.logs.slice(-100);
    localStorage.setItem('blockchainAIAgent_logs', JSON.stringify(this.logs));
  }

  private addLog(log: GenerationLog): void {
    this.logs.push(log);
    this.saveLogs();
    console.log(`[Blockchain AI Agent] ${log.status.toUpperCase()}: ${log.message}`);
  }

  /**
   * Set private key for AI agent wallet
   */
  setPrivateKey(privateKey: string): void {
    this.config.privateKey = privateKey;
    this.saveConfig();
    this.initializeKeypair();
  }

  /**
   * Start the AI agent
   */
  start(): void {
    if (this.intervalId) {
      this.addLog({
        timestamp: Date.now(),
        status: 'failed',
        message: 'Agent already running',
      });
      return;
    }

    if (!this.keypair) {
      this.addLog({
        timestamp: Date.now(),
        status: 'failed',
        message: 'Cannot start agent: No private key configured',
      });
      console.warn('⚠️  AI Agent requires a private key to create markets on blockchain');
      return; // Don't throw error, just warn
    }

    this.addLog({
      timestamp: Date.now(),
      status: 'started',
      message: 'Blockchain AI Agent started - monitoring for generation schedule',
    });

    // Check every 5 minutes
    this.intervalId = setInterval(() => {
      this.checkSchedule();
    }, 5 * 60 * 1000);

    // Check immediately
    this.checkSchedule();
  }

  /**
   * Stop the AI agent
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      
      this.addLog({
        timestamp: Date.now(),
        status: 'success',
        message: 'Blockchain AI Agent stopped',
      });
    }
  }

  /**
   * Check if it's time to generate markets
   */
  private async checkSchedule(): Promise<void> {
    if (!this.config.enabled || this.isGenerating || !this.keypair) return;

    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toDateString();
    
    const lastGeneration = this.metrics.lastGenerationTime;
    const lastGenerationDate = lastGeneration ? new Date(lastGeneration).toDateString() : null;

    if (currentHour === this.config.executionHour && lastGenerationDate !== today) {
      await this.generateAndCreateMarkets();
    }
  }

  /**
   * Generate AI markets and create them on blockchain
   */
  private async generateAndCreateMarkets(): Promise<void> {
    if (this.isGenerating || !this.keypair) return;

    const startTime = Date.now();
    this.isGenerating = true;

    this.addLog({
      timestamp: startTime,
      status: 'started',
      message: `Starting daily market generation and blockchain creation (${this.config.dailyMarketCount} markets)`,
    });

    try {
      // Step 1: Generate AI markets
      const aiGenerator = AIMarketGenerator.getInstance();
      const aiMarkets = await this.generateViralMarkets(aiGenerator, this.config.dailyMarketCount);
      
      if (aiMarkets.length === 0) {
        throw new Error('No AI markets generated');
      }

      this.addLog({
        timestamp: Date.now(),
        status: 'success',
        message: `Generated ${aiMarkets.length} AI markets, creating on blockchain...`,
        marketsCount: aiMarkets.length,
      });

      // Step 2: Create markets on blockchain
      const createdMarkets = await this.createMarketsOnChain(aiMarkets);

      // Step 3: Update metrics
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      this.metrics.totalMarketsGenerated += aiMarkets.length;
      this.metrics.onChainMarketsCreated += createdMarkets.length;
      this.metrics.successfulGenerations++;
      this.metrics.lastGenerationTime = endTime;
      this.metrics.averageGenerationTime = 
        (this.metrics.averageGenerationTime * (this.metrics.successfulGenerations - 1) + generationTime) / 
        this.metrics.successfulGenerations;
      this.metrics.dailyGenerationStreak++;
      
      this.saveMetrics();

      // Step 4: Emit markets for UI
      this.emitMarketsGenerated(createdMarkets);

      this.addLog({
        timestamp: endTime,
        status: 'blockchain_success',
        message: `Successfully created ${createdMarkets.length}/${aiMarkets.length} markets on blockchain in ${generationTime}ms`,
        marketsCount: createdMarkets.length,
      });

    } catch (error) {
      this.metrics.failedGenerations++;
      this.metrics.dailyGenerationStreak = 0;
      this.saveMetrics();

      this.addLog({
        timestamp: Date.now(),
        status: 'blockchain_failed',
        message: `Market generation and blockchain creation failed: ${error}`,
        error: String(error),
      });
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Create markets on SUI blockchain
   */
  private async createMarketsOnChain(aiMarkets: AIGeneratedMarket[]): Promise<Market[]> {
    const createdMarkets: Market[] = [];
    let totalGasUsed = 0;

    for (const aiMarket of aiMarkets) {
      try {
        const tx = new Transaction();
        
        // Create market transaction
        const durationMs = new Date(aiMarket.expiresAt).getTime() - Date.now();
        
        tx.moveCall({
          target: `${PACKAGE_ID}::market::create_market`,
          arguments: [
            tx.object(MARKET_CAP_ID),
            tx.pure.vector('u8', Array.from(new TextEncoder().encode(aiMarket.question))),
            tx.pure.vector('u8', Array.from(new TextEncoder().encode(aiMarket.optionA))),
            tx.pure.vector('u8', Array.from(new TextEncoder().encode(aiMarket.optionB))),
            tx.pure.u64(durationMs),
            tx.object('0x6'), // Clock object
          ],
        });

        // Set gas budget - Fixed: use gasBudget instead of gasbudget
        tx.setGasBudget(this.config.gasBudget);

        // Sign and execute transaction
        const result = await suiClient.signAndExecuteTransaction({
          signer: this.keypair!,
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true,
          },
        });

        if (result.effects?.status?.status === 'success') {
          // Extract market ID from events
          const marketId = result.digest; // Use transaction digest as market ID for now
          
          const createdMarket: Market = {
            id: marketId,
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
          };

          createdMarkets.push(createdMarket);

          // Fixed: Ensure gasUsed is a number
          const gasUsed = Number(result.effects?.gasUsed?.computationCost || 0);
          totalGasUsed += gasUsed;

          this.addLog({
            timestamp: Date.now(),
            status: 'blockchain_success',
            message: `Market created on blockchain: ${aiMarket.question.substring(0, 50)}...`,
            txDigest: result.digest,
            gasUsed, // Now properly typed as number
          });
        } else {
          throw new Error(`Transaction failed: ${result.effects?.status?.error}`);
        }

        // Add delay between transactions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        this.addLog({
          timestamp: Date.now(),
          status: 'blockchain_failed',
          message: `Failed to create market on blockchain: ${aiMarket.question.substring(0, 50)}...`,
          error: String(error),
        });
      }
    }

    // Update gas metrics
    this.metrics.totalGasUsed += totalGasUsed;
    this.saveMetrics();

    return createdMarkets;
  }

  /**
   * Generate viral markets with AI
   */
  private async generateViralMarkets(_aiGenerator: AIMarketGenerator, count: number): Promise<AIGeneratedMarket[]> {
    const trendingTopics = await this.fetchTrendingTopics();
    const currentEvents = await this.fetchCurrentEvents();
    const prompt = this.createViralPrompt(count, trendingTopics, currentEvents);
    
    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        const response = await this.callGroqAPI(prompt);
        const markets = this.parseMarketsFromResponse(response);
        
        if (markets.length > 0) {
          return markets.filter(market => market.confidence >= this.config.minConfidenceThreshold);
        }
        
        retries++;
      } catch (error) {
        retries++;
        if (retries >= this.config.maxRetries) {
          throw new Error(`Failed after ${this.config.maxRetries} retries: ${error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    throw new Error('Failed to generate any valid markets');
  }

  /**
   * Manually trigger market generation and blockchain creation
   */
  async generateMarketsNow(): Promise<Market[]> {
    if (this.isGenerating) {
      throw new Error('Generation already in progress');
    }

    if (!this.keypair) {
      throw new Error('Private key required for blockchain operations');
    }

    const startTime = Date.now();
    this.isGenerating = true;

    this.addLog({
      timestamp: startTime,
      status: 'started',
      message: 'Manual market generation and blockchain creation triggered',
    });

    try {
      const aiGenerator = AIMarketGenerator.getInstance();
      const aiMarkets = await this.generateViralMarkets(aiGenerator, this.config.dailyMarketCount);
      
      if (aiMarkets.length === 0) {
        throw new Error('No markets could be generated');
      }

      const createdMarkets = await this.createMarketsOnChain(aiMarkets);

      // Update metrics
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      this.metrics.totalMarketsGenerated += aiMarkets.length;
      this.metrics.onChainMarketsCreated += createdMarkets.length;
      this.metrics.successfulGenerations++;
      this.metrics.averageGenerationTime = 
        (this.metrics.averageGenerationTime * (this.metrics.successfulGenerations - 1) + generationTime) / 
        this.metrics.successfulGenerations;
      
      this.saveMetrics();

      this.emitMarketsGenerated(createdMarkets);

      this.addLog({
        timestamp: endTime,
        status: 'blockchain_success',
        message: `Manual generation completed: ${createdMarkets.length} markets created on blockchain in ${generationTime}ms`,
        marketsCount: createdMarkets.length,
      });

      return createdMarkets;

    } catch (error) {
      this.metrics.failedGenerations++;
      this.saveMetrics();

      this.addLog({
        timestamp: Date.now(),
        status: 'blockchain_failed',
        message: `Manual generation failed: ${error}`,
        error: String(error),
      });

      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Get agent wallet address
   */
  getWalletAddress(): string {
    return this.keypair ? this.keypair.getPublicKey().toSuiAddress() : 'Not configured';
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<number> {
    if (!this.keypair) return 0;

    try {
      const coins = await suiClient.getCoins({
        owner: this.keypair.getPublicKey().toSuiAddress(),
        coinType: '0x2::sui::SUI',
      });
      
      return coins.data.reduce((sum, coin) => sum + parseInt(coin.balance), 0);
    } catch (error) {
      return 0;
    }
  }

  // Helper methods
  private async fetchTrendingTopics(): Promise<string[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    const timeBasedTopics = [];
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeBasedTopics.push('weekend sports', 'streaming shows', 'gaming tournaments');
    } else {
      timeBasedTopics.push('stock market', 'earnings reports', 'tech news');
    }
    
    if (hour >= 9 && hour <= 17) {
      timeBasedTopics.push('business news', 'tech announcements', 'market movements');
    } else {
      timeBasedTopics.push('entertainment news', 'social media trends', 'viral content');
    }
    
    return [
      ...timeBasedTopics,
      'Bitcoin price movements',
      'AI technology developments',
      'Celebrity announcements',
      'Political developments',
      'Climate change initiatives',
      'Space exploration news',
      'Gaming industry updates',
      'Social media platform changes',
      'Cryptocurrency regulations'
    ];
  }

  private async fetchCurrentEvents(): Promise<string[]> {
    return [
      'Tech companies quarterly earnings',
      'Cryptocurrency market volatility',
      'AI model releases and updates',
      'Political election predictions',
      'Sports championship outcomes',
      'Weather pattern predictions',
      'Stock market performance',
      'Social media platform updates'
    ];
  }

  private createViralPrompt(count: number, trendingTopics: string[], currentEvents: string[]): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `You are an expert viral content creator for a Web3 prediction market. Create ${count} EXTREMELY engaging, shareable prediction questions that will be created on the SUI blockchain.

TRENDING TOPICS: ${trendingTopics.join(', ')}
CURRENT EVENTS: ${currentEvents.join(', ')}

REQUIREMENTS:
- Binary questions only (Yes/No or A vs B)
- High viral potential (shareable on social media)
- Use current events and trending topics
- Include emojis and engaging language
- 1-7 day resolution timeframes
- Mix categories for diversity
- Confidence score 0.6-1.0 based on predictability

VIRAL ELEMENTS:
- Controversy/debate potential
- FOMO-inducing scenarios
- Celebrity/influencer mentions
- Specific price/number targets
- "This will age like milk" potential
- Meme-worthy content

OUTPUT FORMAT (JSON only):
[
  {
    "question": "Will Bitcoin break $100k before New Year? 💎🚀",
    "optionA": "Yes, diamond hands unite! 💎🙌",
    "optionB": "No, bear market continues 📉💔",
    "category": "Crypto",
    "expiresAt": "${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}",
    "confidence": 0.75
  }
]

Today: ${currentDate}`;
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 4000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseMarketsFromResponse(content: string): AIGeneratedMarket[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const markets = JSON.parse(jsonMatch[0]);
      
      return markets.filter((market: any) => 
        market.question && 
        market.optionA && 
        market.optionB && 
        market.category &&
        market.expiresAt &&
        typeof market.confidence === 'number'
      );
    } catch (error) {
      throw new Error(`Failed to parse markets: ${error}`);
    }
  }

  private emitMarketsGenerated(markets: Market[]): void {
    const event = new CustomEvent('blockchainMarketsGenerated', {
      detail: { 
        markets, 
        timestamp: Date.now(),
        source: 'blockchain_ai_agent'
      }
    });
    window.dispatchEvent(event);
  }

  // Public API methods
  updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    if (newConfig.privateKey) {
      this.initializeKeypair();
    }
    
    this.addLog({
      timestamp: Date.now(),
      status: 'success',
      message: `Configuration updated: ${Object.keys(newConfig).join(', ')}`,
    });
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  getLogs(): GenerationLog[] {
    return [...this.logs];
  }

  getStatus() {
    const now = new Date();
    const nextExecution = new Date();
    nextExecution.setHours(this.config.executionHour, 0, 0, 0);
    
    if (now.getHours() >= this.config.executionHour) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }

    return {
      isRunning: this.intervalId !== null,
      isGenerating: this.isGenerating,
      hasWallet: this.keypair !== null,
      walletAddress: this.getWalletAddress(),
      nextExecution: nextExecution.toLocaleString(),
      lastExecution: this.metrics.lastGenerationTime 
        ? new Date(this.metrics.lastGenerationTime).toLocaleString()
        : 'Never',
      config: this.config,
      metrics: this.metrics,
    };
  }

  resetMetrics(): void {
    this.metrics = {
      totalMarketsGenerated: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      lastGenerationTime: null,
      averageGenerationTime: 0,
      dailyGenerationStreak: 0,
      totalGasUsed: 0,
      onChainMarketsCreated: 0,
    };
    this.saveMetrics();
    
    this.addLog({
      timestamp: Date.now(),
      status: 'success',
      message: 'Metrics reset to defaults',
    });
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }
}