// src/components/AIAgentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Calendar,
  Zap,
  Target,
  RefreshCw,
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductionAIAgent } from '@/services/productionAIAgent';
import { useToast } from '@/hooks/use-toast';

interface AIAgentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAgentDashboard: React.FC<AIAgentDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [agentMetrics, setAgentMetrics] = useState<any>(null);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const aiAgent = ProductionAIAgent.getInstance();

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const interval = setInterval(refreshData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const refreshData = () => {
    const status = aiAgent.getStatus();
    const metrics = aiAgent.getMetrics();
    const logs = aiAgent.getLogs();
    
    setAgentStatus(status);
    setAgentMetrics(metrics);
    setAgentLogs(logs.slice(-50).reverse()); // Show last 50 logs, most recent first
  };

  const handleStartAgent = () => {
    setIsLoading(true);
    try {
      aiAgent.start();
      toast({
        title: "🤖 AI Agent Started",
        description: "Automatic market generation is now active",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "❌ Failed to Start Agent",
        description: "Could not start AI agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAgent = () => {
    setIsLoading(true);
    try {
      aiAgent.stop();
      toast({
        title: "⏹️ AI Agent Stopped",
        description: "Automatic market generation has been paused",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "❌ Failed to Stop Agent",
        description: "Could not stop AI agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    setIsLoading(true);
    try {
      const markets = await aiAgent.generateMarketsNow();
      toast({
        title: "✅ Markets Generated",
        description: `Generated ${markets.length} new markets manually`,
      });
      refreshData();
    } catch (error) {
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "Manual market generation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (field: string, value: any) => {
    try {
      aiAgent.updateConfig({ [field]: value });
      toast({
        title: "⚙️ Config Updated",
        description: `${field} updated successfully`,
      });
      refreshData();
    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description: `Failed to update ${field}`,
        variant: "destructive",
      });
    }
  };

  const handleResetMetrics = () => {
    if (confirm('Are you sure you want to reset all metrics? This cannot be undone.')) {
      aiAgent.resetMetrics();
      toast({
        title: "🔄 Metrics Reset",
        description: "All metrics have been reset to zero",
      });
      refreshData();
    }
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      aiAgent.clearLogs();
      toast({
        title: "🗑️ Logs Cleared",
        description: "All logs have been cleared",
      });
      refreshData();
    }
  };

  const exportLogs = () => {
    const logsData = JSON.stringify(agentLogs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-agent-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "📁 Logs Exported",
      description: "Logs have been downloaded as JSON file",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'started': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSuccessRate = () => {
    if (!agentMetrics || agentMetrics.successfulGenerations + agentMetrics.failedGenerations === 0) return 0;
    return Math.round((agentMetrics.successfulGenerations / (agentMetrics.successfulGenerations + agentMetrics.failedGenerations)) * 100);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Agent Dashboard</h2>
                <p className="text-purple-100">Monitor and control automatic market generation</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-6 h-6 text-green-600" />
                <div className={`w-3 h-3 rounded-full ${agentStatus?.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </div>
              <h3 className="font-semibold text-green-800 mb-1">Agent Status</h3>
              <p className="text-lg font-bold text-green-600">
                {agentStatus?.isRunning ? 'RUNNING' : 'STOPPED'}
              </p>
              {agentStatus?.isGenerating && (
                <p className="text-xs text-green-600 mt-1">Currently generating...</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
              <Clock className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-semibold text-blue-800 mb-1">Next Execution</h3>
              <p className="text-sm font-medium text-blue-600">
                {agentStatus?.nextExecution ? 
                  new Date(agentStatus.nextExecution).toLocaleString() : 
                  'Not scheduled'
                }
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
              <Target className="w-6 h-6 text-purple-600 mb-3" />
              <h3 className="font-semibold text-purple-800 mb-1">Daily Target</h3>
              <p className="text-lg font-bold text-purple-600">
                {agentStatus?.config?.dailyMarketCount || 5}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-200">
              <TrendingUp className="w-6 h-6 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-800 mb-1">Success Rate</h3>
              <p className="text-lg font-bold text-orange-600">
                {getSuccessRate()}%
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Agent Controls
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {agentStatus?.isRunning ? (
                <Button
                  onClick={handleStopAgent}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex items-center"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Agent
                </Button>
              ) : (
                <Button
                  onClick={handleStartAgent}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Agent
                </Button>
              )}

              <Button
                onClick={handleManualTrigger}
                disabled={isLoading || agentStatus?.isGenerating}
                variant="outline"
                className="border-purple-200 hover:border-purple-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                {agentStatus?.isGenerating ? 'Generating...' : 'Generate Now'}
              </Button>

              <Button
                onClick={refreshData}
                disabled={isLoading}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                onClick={handleResetMetrics}
                disabled={isLoading}
                variant="outline"
                className="border-red-200 hover:border-red-300 text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Metrics
              </Button>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Market Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={agentStatus?.config?.dailyMarketCount || 5}
                  onChange={(e) => updateConfig('dailyMarketCount', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Execution Hour (UTC)
                </label>
                <select
                  value={agentStatus?.config?.executionHour || 9}
                  onChange={(e) => updateConfig('executionHour', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00 UTC
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={agentStatus?.config?.minConfidenceThreshold || 0.6}
                  onChange={(e) => updateConfig('minConfidenceThreshold', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Metrics */}
          {agentMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{agentMetrics.totalMarketsGenerated}</div>
                <div className="text-xs text-gray-600">Total Generated</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{getSuccessRate()}%</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">
                  {agentMetrics.averageGenerationTime > 0 ? 
                    `${Math.round(agentMetrics.averageGenerationTime / 1000)}s` : 
                    'N/A'
                  }
                </div>
                <div className="text-xs text-gray-600">Avg Generation Time</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{agentMetrics.dailyGenerationStreak}</div>
                <div className="text-xs text-gray-600">Daily Streak</div>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Activity ({agentLogs.length} logs)
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={exportLogs}
                  variant="outline"
                  size="sm"
                  disabled={agentLogs.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handleClearLogs}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200"
                  disabled={agentLogs.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="bg-black rounded-xl p-4 font-mono text-sm max-h-64 overflow-y-auto">
              {agentLogs.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No logs available</div>
              ) : (
                agentLogs.map((log, index) => (
                  <div key={index} className={`mb-2 ${getStatusColor(log.status)}`}>
                    <span className="text-gray-400">
                      [{new Date(log.timestamp).toLocaleString()}]
                    </span>{' '}
                    <span className="font-semibold">[{log.status.toUpperCase()}]</span>{' '}
                    {log.message}
                    {log.marketsCount && (
                      <span className="text-green-400"> ({log.marketsCount} markets)</span>
                    )}
                    {log.error && (
                      <div className="text-red-400 text-xs mt-1 ml-4">Error: {log.error}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};