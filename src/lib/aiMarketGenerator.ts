// src/lib/aiMarketGenerator.ts
// src/lib/aiMarketGenerator.ts
import type { AIGeneratedMarket, MarketCategory } from '@/types/market';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIMarketGenerator {
  private static instance: AIMarketGenerator;
  
  static getInstance(): AIMarketGenerator {
    if (!AIMarketGenerator.instance) {
      AIMarketGenerator.instance = new AIMarketGenerator();
    }
    return AIMarketGenerator.instance;
  }

  async generateTrendingMarkets(count: number = 5): Promise<AIGeneratedMarket[]> {
    const prompt = this.createPrompt(count);
    
    try {
      if (!GROQ_API_KEY) {
        console.warn('GROQ API key not found, using fallback markets');
        return this.getFallbackMarkets();
      }

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from GROQ API');
      }

      return this.parseMarketsFromResponse(content);
    } catch (error) {
      console.error('Error generating markets:', error);
      return this.getFallbackMarkets();
    }
  }

  private createPrompt(count: number): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `Generate ${count} viral and engaging prediction market questions for a Web3 betting platform. Focus on current trends in crypto, memes, sports, technology, and pop culture.

Requirements:
- Each question should be binary (Yes/No or A vs B)
- Make them fun, engaging, and likely to go viral
- Include recent events and trending topics
- Mix different categories: crypto, sports, entertainment, memes, tech
- Questions should resolve within 1-7 days
- Use internet slang and Gen Z language

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Will Bitcoin hit $100k before 2025 ends?",
    "optionA": "Yes, to the moon! 🚀",
    "optionB": "No, bear market vibes 📉",
    "category": "Crypto",
    "expiresAt": "2025-05-29T23:59:59Z",
    "confidence": 0.8
  }
]

Today's date: ${currentDate}
Generate exactly ${count} markets with different categories and expiration dates.`;
  }

  private parseMarketsFromResponse(content: string): AIGeneratedMarket[] {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const markets = JSON.parse(jsonMatch[0]);
      return markets.map((market: any) => ({
        question: market.question,
        optionA: market.optionA,
        optionB: market.optionB,
        category: market.category,
        expiresAt: market.expiresAt,
        confidence: market.confidence || 0.5,
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackMarkets();
    }
  }

  private getFallbackMarkets(): AIGeneratedMarket[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        question: "Will Bitcoin break $100k this week?",
        optionA: "Yes, to the moon! 🚀",
        optionB: "No, still crabbing 🦀",
        category: "Crypto",
        expiresAt: nextWeek.toISOString(),
        confidence: 0.7,
      },
      {
        question: "Will the next viral meme be AI-generated?",
        optionA: "Yes, AI takeover 🤖",
        optionB: "No, humans still got it 😤",
        category: "Memes",
        expiresAt: tomorrow.toISOString(),
        confidence: 0.6,
      },
      {
        question: "Will Ethereum gas fees go below 10 gwei today?",
        optionA: "Yes, finally cheap! ⚡",
        optionB: "No, still expensive 💸",
        category: "Crypto",
        expiresAt: tomorrow.toISOString(),
        confidence: 0.4,
      },
      {
        question: "Will any tech CEO tweet about AI regulation this week?",
        optionA: "Yes, drama incoming 🍿",
        optionB: "No, staying quiet 🤐",
        category: "Technology",
        expiresAt: nextWeek.toISOString(),
        confidence: 0.8,
      },
      {
        question: "Will the weather be sunny in California tomorrow?",
        optionA: "Yes, beach day! ☀️",
        optionB: "No, clouds and rain 🌧️",
        category: "Weather",
        expiresAt: tomorrow.toISOString(),
        confidence: 0.5,
      },
    ];
  }

async generateMarketsByCategory(category: MarketCategory, count: number = 3): Promise<AIGeneratedMarket[]> {
  const prompt = `Generate ${count} engaging prediction market questions specifically about ${category}.
Requirements:
- Each question should be binary (Yes/No or A vs B)
- Make them fun, engaging, and likely to go viral
- Include recent events or trending news in ${category}
- Use internet slang and Gen Z language
- Questions should resolve within 1-7 days
Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "Will the Lakers make the NBA Finals this year?",
    "optionA": "Yes, Lakers in 6 🏀🔥",
    "optionB": "No, too washed 💀",
    "category": "${category}",
    "expiresAt": "2025-05-29T23:59:59Z",
    "confidence": 0.8
  }
]`;

  try {
    if (!GROQ_API_KEY) {
      console.warn('GROQ API key not found, using fallback markets');
      return this.getFallbackMarkets().filter(m => m.category === category).slice(0, count);
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`GROQ API error: ${response.statusText}`);

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No content received from GROQ API');

    return this.parseMarketsFromResponse(content);
  } catch (error) {
    console.error('Error generating category-specific markets:', error);
    return this.getFallbackMarkets().filter(m => m.category === category).slice(0, count);
  }
}

}