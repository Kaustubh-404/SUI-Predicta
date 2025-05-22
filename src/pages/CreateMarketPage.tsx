// src/pages/CreateMarketPage.tsx
import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createMarketTx } from '@/lib/suiClient';
import { type Market, MARKET_CATEGORIES } from '@/types/market';
import { AIMarketGenerator } from '@/lib/aiMarketGenerator';

interface CreateMarketPageProps {
  onMarketCreated: (market: Market) => void;
}

export const CreateMarketPage: React.FC<CreateMarketPageProps> = ({
  onMarketCreated,
}) => {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    duration: '24', // hours
    category: 'General',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIQuestion = async () => {
    try {
      setIsGeneratingAI(true);
      toast({
        title: "Generating Question... 🤖",
        description: "AI is creating a viral prediction market",
      });

      const aiGenerator = AIMarketGenerator.getInstance();
      const markets = await aiGenerator.generateTrendingMarkets(1);
      
      if (markets.length > 0) {
        const market = markets[0];
        setFormData({
          question: market.question,
          optionA: market.optionA,
          optionB: market.optionB,
          duration: '24',
          category: market.category,
        });
        
        toast({
          title: "AI Question Generated! ✨",
          description: "Feel free to edit and customize",
        });
      }
    } catch (error) {
      console.error('Error generating AI question:', error);
      toast({
        title: "Generation Failed ❌",
        description: "Failed to generate AI question",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: "Wallet Not Connected ❌",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.question || !formData.optionA || !formData.optionB) {
      toast({
        title: "Missing Fields ⚠️",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      toast({
        title: "Creating Market... 🚀",
        description: "Submitting to SUI blockchain",
      });

      const durationMs = parseInt(formData.duration) * 60 * 60 * 1000; // Convert hours to ms
      const tx = createMarketTx(
        formData.question,
        formData.optionA,
        formData.optionB,
        durationMs
      );

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Market creation successful:', result);
            
            const newMarket: Market = {
              id: result.digest, // Use transaction digest as temporary ID
              question: formData.question,
              optionA: formData.optionA,
              optionB: formData.optionB,
              expiresAt: Date.now() + durationMs,
              status: 0,
              outcome: 2,
              totalPool: 0,
              optionAPool: 0,
              optionBPool: 0,
              category: formData.category,
            };

            onMarketCreated(newMarket);
            
            toast({
              title: "Market Created! 🎉",
              description: "Your prediction market is now live",
            });

            // Reset form
            setFormData({
              question: '',
              optionA: '',
              optionB: '',
              duration: '24',
              category: 'General',
            });
          },
          onError: (error) => {
            console.error('Market creation failed:', error);
            toast({
              title: "Creation Failed ❌",
              description: "Failed to create market. Please try again.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error creating market:', error);
      toast({
        title: "Creation Failed ❌",
        description: "Failed to create market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
            Create Market
          </h1>
          <p className="text-gray-600">
            Create your own prediction market
          </p>
        </div>

        {/* AI Generate Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={generateAIQuestion}
            disabled={isGeneratingAI}
            variant="outline"
            className="w-full border-purple-200 hover:border-purple-300 hover:bg-purple-50"
          >
            {isGeneratingAI ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Question
              </>
            )}
          </Button>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          {/* Question */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Question *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Will Bitcoin reach $100k before 2025 ends?"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-20"
              required
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Option A *
              </label>
              <input
                type="text"
                value={formData.optionA}
                onChange={(e) => handleInputChange('optionA', e.target.value)}
                placeholder="Yes, to the moon! 🚀"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Option B *
              </label>
              <input
                type="text"
                value={formData.optionB}
                onChange={(e) => handleInputChange('optionB', e.target.value)}
                placeholder="No, bear market 📉"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="General">General</option>
              {MARKET_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Duration
            </label>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
                <option value="168">1 week</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-4"
          >
            {isCreating ? (
              <>
                <Calendar className="w-4 h-4 mr-2 animate-pulse" />
                Creating...
              </>
            ) : (
              <>
                Create Market
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
        >
          <p className="text-sm text-blue-600">
            💡 <span className="font-semibold">Tip:</span> Make your questions engaging and time-sensitive for maximum participation!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};