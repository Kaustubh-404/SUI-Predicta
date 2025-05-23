// src/services/productionAIAgent.ts
import { AIMarketGenerator } from '@/lib/aiMarketGenerator';
import type { AIGeneratedMarket } from '@/types/market';

interface AgentMetrics {
  totalMarketsGenerated: number;
  successfulGenerations: number;
  failedGenerations: number;
  lastGenerationTime: number | null;
  averageGenerationTime: number;
  dailyGenerationStreak: number;
}

interface AgentConfig {
  dailyMarketCount: number;
  executionHour: number;
  enabled: boolean;
  categories: string[];
  minConfidenceThreshold: number;
  maxRetries: number;
}

interface GenerationLog {
  timestamp: number;
  status: 'success' | 'failed' | 'started';
  message: string;
  marketsCount?: number;
  error?: string;
}

export class ProductionAIAgent {
  private static instance: ProductionAIAgent;
  private config: AgentConfig;
  private metrics: AgentMetrics;
  private logs: GenerationLog[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isGenerating = false;

  private constructor() {
    this.config = this.loadConfig();
    this.metrics = this.loadMetrics();
    this.logs = this.loadLogs();
  }

  static getInstance(): ProductionAIAgent {
    if (!ProductionAIAgent.instance) {
      ProductionAIAgent.instance = new ProductionAIAgent();
    }
    return ProductionAIAgent.instance;
  }

  private loadConfig(): AgentConfig {
    const stored = localStorage.getItem('aiAgent_config');
    const defaults: AgentConfig = {
      dailyMarketCount: 5,
      executionHour: 9,
      enabled: true,
      categories: ['Crypto', 'Technology', 'Sports', 'Entertainment', 'Politics', 'Memes'],
      minConfidenceThreshold: 0.6,
      maxRetries: 3,
    };
    
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  }

  private loadMetrics(): AgentMetrics {
    const stored = localStorage.getItem('aiAgent_metrics');
    const defaults: AgentMetrics = {
      totalMarketsGenerated: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      lastGenerationTime: null,
      averageGenerationTime: 0,
      dailyGenerationStreak: 0,
    };
    
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  }

  private loadLogs(): GenerationLog[] {
    const stored = localStorage.getItem('aiAgent_logs');
    return stored ? JSON.parse(stored) : [];
  }

  private saveConfig(): void {
    localStorage.setItem('aiAgent_config', JSON.stringify(this.config));
  }

  private saveMetrics(): void {
    localStorage.setItem('aiAgent_metrics', JSON.stringify(this.metrics));
  }

  private saveLogs(): void {
    // Keep only last 100 logs
    this.logs = this.logs.slice(-100);
    localStorage.setItem('aiAgent_logs', JSON.stringify(this.logs));
  }

  private addLog(log: GenerationLog): void {
    this.logs.push(log);
    this.saveLogs();
    console.log(`[AI Agent] ${log.status.toUpperCase()}: ${log.message}`);
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

    this.addLog({
      timestamp: Date.now(),
      status: 'started',
      message: 'AI Agent started - monitoring for generation schedule',
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
        message: 'AI Agent stopped',
      });
    }
  }

  /**
   * Check if it's time to generate markets
   */
  private async checkSchedule(): Promise<void> {
    if (!this.config.enabled || this.isGenerating) return;

    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toDateString();
    
    // Check if we've already generated today
    const lastGeneration = this.metrics.lastGenerationTime;
    const lastGenerationDate = lastGeneration ? new Date(lastGeneration).toDateString() : null;

    if (currentHour === this.config.executionHour && lastGenerationDate !== today) {
      await this.generateDailyMarkets();
    }
  }

  /**
   * Generate daily markets automatically
   */
  private async generateDailyMarkets(): Promise<void> {
    if (this.isGenerating) return;

    const startTime = Date.now();
    this.isGenerating = true;

    this.addLog({
      timestamp: startTime,
      status: 'started',
      message: `Starting daily market generation (${this.config.dailyMarketCount} markets)`,
    });

    try {
      const aiGenerator = AIMarketGenerator.getInstance();
      const markets: AIGeneratedMarket[] = [];
      const errors: string[] = [];

      // Generate markets across different categories
      const marketsPerCategory = Math.ceil(this.config.dailyMarketCount / this.config.categories.length);
      
      for (const category of this.config.categories) {
        try {
          const categoryMarkets = await aiGenerator.generateMarketsByCategory(
            category as any,
            marketsPerCategory
          );
          
          // Filter by confidence threshold
          const highConfidenceMarkets = categoryMarkets.filter(
            market => market.confidence >= this.config.minConfidenceThreshold
          );
          
          markets.push(...highConfidenceMarkets);
        } catch (error) {
          errors.push(`Failed to generate ${category} markets: ${error}`);
        }
      }

      // Shuffle and limit to exact count
      const finalMarkets = this.shuffleArray(markets).slice(0, this.config.dailyMarketCount);

      if (finalMarkets.length === 0) {
        throw new Error('No markets generated with sufficient confidence');
      }

      // Emit event for UI to handle
      this.emitMarketsGenerated(finalMarkets);

      // Update metrics
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      this.metrics.totalMarketsGenerated += finalMarkets.length;
      this.metrics.successfulGenerations++;
      this.metrics.lastGenerationTime = endTime;
      this.metrics.averageGenerationTime = 
        (this.metrics.averageGenerationTime * (this.metrics.successfulGenerations - 1) + generationTime) / 
        this.metrics.successfulGenerations;
      this.metrics.dailyGenerationStreak++;
      
      this.saveMetrics();

      this.addLog({
        timestamp: endTime,
        status: 'success',
        message: `Successfully generated ${finalMarkets.length} markets in ${generationTime}ms`,
        marketsCount: finalMarkets.length,
      });

      if (errors.length > 0) {
        this.addLog({
          timestamp: endTime,
          status: 'failed',
          message: `Partial success with ${errors.length} errors: ${errors.join(', ')}`,
        });
      }

    } catch (error) {
      this.metrics.failedGenerations++;
      this.metrics.dailyGenerationStreak = 0;
      this.saveMetrics();

      this.addLog({
        timestamp: Date.now(),
        status: 'failed',
        message: `Daily market generation failed: ${error}`,
        error: String(error),
      });
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Manually trigger market generation
   */
  async generateMarketsNow(): Promise<AIGeneratedMarket[]> {
    if (this.isGenerating) {
      throw new Error('Generation already in progress');
    }

    const startTime = Date.now();
    this.isGenerating = true;

    this.addLog({
      timestamp: startTime,
      status: 'started',
      message: 'Manual market generation triggered',
    });

    try {
      const aiGenerator = AIMarketGenerator.getInstance();
      
      // Use enhanced generator for more viral content
      const markets = await this.generateViralMarkets(aiGenerator, this.config.dailyMarketCount);
      
      if (markets.length === 0) {
        throw new Error('No markets could be generated');
      }

      this.emitMarketsGenerated(markets);

      // Update metrics
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      
      this.metrics.totalMarketsGenerated += markets.length;
      this.metrics.successfulGenerations++;
      this.metrics.averageGenerationTime = 
        (this.metrics.averageGenerationTime * (this.metrics.successfulGenerations - 1) + generationTime) / 
        this.metrics.successfulGenerations;
      
      this.saveMetrics();

      this.addLog({
        timestamp: endTime,
        status: 'success',
        message: `Manual generation completed: ${markets.length} markets in ${generationTime}ms`,
        marketsCount: markets.length,
      });

      return markets;

    } catch (error) {
      this.metrics.failedGenerations++;
      this.saveMetrics();

      this.addLog({
        timestamp: Date.now(),
        status: 'failed',
        message: `Manual generation failed: ${error}`,
        error: String(error),
      });

      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate viral markets with trending topics
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
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    throw new Error('Failed to generate any valid markets');
  }

  /**
   * Fetch trending topics from various sources
   */
  private async fetchTrendingTopics(): Promise<string[]> {
    // Dynamic content based on current date/time
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    const timeBasedTopics = [];
    
    // Weekend vs weekday topics
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeBasedTopics.push('weekend sports', 'streaming shows', 'gaming tournaments');
    } else {
      timeBasedTopics.push('stock market', 'earnings reports', 'tech news');
    }
    
    // Time of day topics
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

  /**
   * Fetch current events and news
   */
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

  /**
   * Create optimized viral prompt
   */
  private createViralPrompt(count: number, trendingTopics: string[], currentEvents: string[]): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `You are an expert viral content creator for a Web3 prediction market. Create ${count} EXTREMELY engaging, shareable prediction questions.

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

  /**
   * Call Groq API with error handling
   */
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

  /**
   * Parse markets from AI response
   */
  private parseMarketsFromResponse(content: string): AIGeneratedMarket[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const markets = JSON.parse(jsonMatch[0]);
      
      // Validate market structure
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

  /**
   * Emit event for generated markets
   */
  private emitMarketsGenerated(markets: AIGeneratedMarket[]): void {
    const event = new CustomEvent('aiMarketsGenerated', {
      detail: { 
        markets, 
        timestamp: Date.now(),
        source: 'ai_agent'
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Utility functions
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Public API methods
   */
  updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
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