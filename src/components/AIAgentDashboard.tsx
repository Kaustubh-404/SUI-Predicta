// src/components/AIAgentDashboard.tsx
import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bot,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Calendar,
  Zap,
  Target,
  RefreshCw,
  Trash2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductionAIAgent } from "@/services/productionAIAgent"
import { useToast } from "@/hooks/use-toast"

interface AIAgentDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export const AIAgentDashboard: React.FC<AIAgentDashboardProps> = ({ isOpen, onClose }) => {
  const [agentStatus, setAgentStatus] = useState<any>(null)
  const [agentMetrics, setAgentMetrics] = useState<any>(null)
  const [agentLogs, setAgentLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const aiAgent = ProductionAIAgent.getInstance()

  useEffect(() => {
    if (isOpen) {
      refreshData()
      const interval = setInterval(refreshData, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const refreshData = () => {
    const status = aiAgent.getStatus()
    const metrics = aiAgent.getMetrics()
    const logs = aiAgent.getLogs()

    setAgentStatus(status)
    setAgentMetrics(metrics)
    setAgentLogs(logs.slice(-50).reverse()) // Show last 50 logs, most recent first
  }

  const handleStartAgent = () => {
    setIsLoading(true)
    try {
      aiAgent.start()
      toast({
        title: "🤖 AI Agent Started",
        description: "Automatic market generation is now active",
      })
      refreshData()
    } catch (error) {
      toast({
        title: "❌ Failed to Start Agent",
        description: "Could not start AI agent",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopAgent = () => {
    setIsLoading(true)
    try {
      aiAgent.stop()
      toast({
        title: "⏹️ AI Agent Stopped",
        description: "Automatic market generation has been paused",
      })
      refreshData()
    } catch (error) {
      toast({
        title: "❌ Failed to Stop Agent",
        description: "Could not stop AI agent",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualTrigger = async () => {
    setIsLoading(true)
    try {
      const markets = await aiAgent.generateMarketsNow()
      toast({
        title: "✅ Markets Generated",
        description: `Generated ${markets.length} new markets manually`,
      })
      refreshData()
    } catch (error) {
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "Manual market generation failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfig = (field: string, value: any) => {
    try {
      aiAgent.updateConfig({ [field]: value })
      toast({
        title: "⚙️ Config Updated",
        description: `${field} updated successfully`,
      })
      refreshData()
    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description: `Failed to update ${field}`,
        variant: "destructive",
      })
    }
  }

  const handleResetMetrics = () => {
    if (confirm("Are you sure you want to reset all metrics? This cannot be undone.")) {
      aiAgent.resetMetrics()
      toast({
        title: "🔄 Metrics Reset",
        description: "All metrics have been reset to zero",
      })
      refreshData()
    }
  }

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear all logs?")) {
      aiAgent.clearLogs()
      toast({
        title: "🗑️ Logs Cleared",
        description: "All logs have been cleared",
      })
      refreshData()
    }
  }

  const exportLogs = () => {
    const logsData = JSON.stringify(agentLogs, null, 2)
    const blob = new Blob([logsData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-agent-logs-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "📁 Logs Exported",
      description: "Logs have been downloaded as JSON file",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-[#99ff88]"
      case "failed":
        return "text-[#ff6b6b]"
      case "started":
        return "text-[#66ccff]"
      default:
        return "text-black/60"
    }
  }

  const getSuccessRate = () => {
    if (!agentMetrics || agentMetrics.successfulGenerations + agentMetrics.failedGenerations === 0) return 0
    return Math.round(
      (agentMetrics.successfulGenerations / (agentMetrics.successfulGenerations + agentMetrics.failedGenerations)) *
        100,
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Background with floating elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#efe7f7] backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Floating AI-themed emojis */}
        {["🤖", "⚡", "🎯", "📊", "🔥", "💫", "⭐", "🚀"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.6,
            }}
          >
            {emoji}
          </motion.div>
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#d3aeff] to-[#66ccff] text-black p-6 rounded-t-3xl border-b-4 border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-black">
                  <Bot className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    AI Agent Dashboard
                  </h2>
                  <p className="text-black/80 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Monitor and control automatic market generation
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-black hover:bg-white/20 rounded-2xl w-12 h-12 p-0 border-2 border-black bg-white/20 font-black text-xl"
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <Activity className="w-6 h-6 text-[#99ff88]" />
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-black ${agentStatus?.isRunning ? "bg-[#99ff88] animate-pulse" : "bg-[#ff6b6b]"}`}
                  ></div>
                </div>
                <h3 className="font-black text-black mb-1" style={{ fontFamily: 'Brice Black, sans-serif' }}>Agent Status</h3>
                <p className="text-lg font-black text-[#99ff88]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  {agentStatus?.isRunning ? "RUNNING" : "STOPPED"}
                </p>
                {agentStatus?.isGenerating && (
                  <p className="text-xs text-[#ffb347] mt-1 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Currently generating...
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
              >
                <Clock className="w-6 h-6 text-[#66ccff] mb-3" />
                <h3 className="font-black text-black mb-1" style={{ fontFamily: 'Brice Black, sans-serif' }}>Next Execution</h3>
                <p className="text-sm font-medium text-[#66ccff]" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                  {agentStatus?.nextExecution ? new Date(agentStatus.nextExecution).toLocaleString() : "Not scheduled"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
              >
                <Target className="w-6 h-6 text-[#d3aeff] mb-3" />
                <h3 className="font-black text-black mb-1" style={{ fontFamily: 'Brice Black, sans-serif' }}>Daily Target</h3>
                <p className="text-lg font-black text-[#d3aeff]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  {agentStatus?.config?.dailyMarketCount || 5}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl p-4 border-4 border-black shadow-lg"
              >
                <TrendingUp className="w-6 h-6 text-[#ffb347] mb-3" />
                <h3 className="font-black text-black mb-1" style={{ fontFamily: 'Brice Black, sans-serif' }}>Success Rate</h3>
                <p className="text-lg font-black text-[#ffb347]" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  {getSuccessRate()}%
                </p>
              </motion.div>
            </div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <h3 className="font-black text-black mb-4 flex items-center" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                <Settings className="w-5 h-5 mr-2" />
                Agent Controls
              </h3>

              <div className="flex flex-wrap gap-3">
                {agentStatus?.isRunning ? (
                  <Button
                    onClick={handleStopAgent}
                    disabled={isLoading}
                    className="bg-[#ff6b6b] hover:bg-[#ff5555] text-white border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                    style={{ fontFamily: 'Brice Black, sans-serif' }}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Agent
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartAgent}
                    disabled={isLoading}
                    className="bg-[#99ff88] hover:bg-[#88ee77] text-black border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                    style={{ fontFamily: 'Brice Black, sans-serif' }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Agent
                  </Button>
                )}

                <Button
                  onClick={handleManualTrigger}
                  disabled={isLoading || agentStatus?.isGenerating}
                  className="bg-[#ffb347] hover:bg-[#ff9933] text-black border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {agentStatus?.isGenerating ? "Generating..." : "Generate Now"}
                </Button>

                <Button 
                  onClick={refreshData} 
                  disabled={isLoading} 
                  className="bg-[#66ccff] hover:bg-[#55bbee] text-black border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  onClick={handleResetMetrics}
                  disabled={isLoading}
                  className="bg-[#d3aeff] hover:bg-[#cc99ff] text-black border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                  style={{ fontFamily: 'Brice Black, sans-serif' }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Metrics
                </Button>
              </div>
            </motion.div>

            {/* Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <h3 className="font-black text-black mb-4" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Daily Market Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={agentStatus?.config?.dailyMarketCount || 5}
                    onChange={(e) => updateConfig("dailyMarketCount", Number.parseInt(e.target.value))}
                    className="w-full p-3 border-4 border-black rounded-xl focus:ring-2 focus:ring-[#d3aeff] focus:border-[#d3aeff] font-medium text-black shadow-lg"
                    style={{ fontFamily: 'Brice Regular, sans-serif' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Execution Hour (UTC)
                  </label>
                  <select
                    value={agentStatus?.config?.executionHour || 9}
                    onChange={(e) => updateConfig("executionHour", Number.parseInt(e.target.value))}
                    className="w-full p-3 border-4 border-black rounded-xl focus:ring-2 focus:ring-[#66ccff] focus:border-[#66ccff] font-medium text-black shadow-lg"
                    style={{ fontFamily: 'Brice Regular, sans-serif' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}:00 UTC
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-black mb-2" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    Confidence Threshold
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={agentStatus?.config?.minConfidenceThreshold || 0.6}
                    onChange={(e) => updateConfig("minConfidenceThreshold", Number.parseFloat(e.target.value))}
                    className="w-full p-3 border-4 border-black rounded-xl focus:ring-2 focus:ring-[#99ff88] focus:border-[#99ff88] font-medium text-black shadow-lg"
                    style={{ fontFamily: 'Brice Regular, sans-serif' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Metrics */}
            {agentMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="text-center p-4 bg-white rounded-2xl border-4 border-black shadow-lg">
                  <TrendingUp className="w-6 h-6 text-[#d3aeff] mx-auto mb-2" />
                  <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    {agentMetrics.totalMarketsGenerated}
                  </div>
                  <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Total Generated
                  </div>
                </div>

                <div className="text-center p-4 bg-white rounded-2xl border-4 border-black shadow-lg">
                  <CheckCircle className="w-6 h-6 text-[#99ff88] mx-auto mb-2" />
                  <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    {getSuccessRate()}%
                  </div>
                  <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Success Rate
                  </div>
                </div>

                <div className="text-center p-4 bg-white rounded-2xl border-4 border-black shadow-lg">
                  <Clock className="w-6 h-6 text-[#66ccff] mx-auto mb-2" />
                  <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    {agentMetrics.averageGenerationTime > 0
                      ? `${Math.round(agentMetrics.averageGenerationTime / 1000)}s`
                      : "N/A"}
                  </div>
                  <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Avg Generation Time
                  </div>
                </div>

                <div className="text-center p-4 bg-white rounded-2xl border-4 border-black shadow-lg">
                  <Activity className="w-6 h-6 text-[#ffb347] mx-auto mb-2" />
                  <div className="text-2xl font-black text-black" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                    {agentMetrics.dailyGenerationStreak}
                  </div>
                  <div className="text-xs text-black/60 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    Daily Streak
                  </div>
                </div>
              </motion.div>
            )}

            {/* Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-2xl p-6 border-4 border-black shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-black flex items-center" style={{ fontFamily: 'Brice Black, sans-serif' }}>
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Activity ({agentLogs.length} logs)
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={exportLogs}
                    disabled={agentLogs.length === 0}
                    className="bg-[#66ccff] hover:bg-[#55bbee] text-black border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                    style={{ fontFamily: 'Brice Black, sans-serif' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={handleClearLogs}
                    disabled={agentLogs.length === 0}
                    className="bg-[#ff6b6b] hover:bg-[#ff5555] text-white border-2 border-black font-black rounded-xl shadow-lg transition-all duration-200"
                    style={{ fontFamily: 'Brice Black, sans-serif' }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="bg-black rounded-2xl p-4 font-mono text-sm max-h-64 overflow-y-auto border-4 border-black shadow-inner">
                {agentLogs.length === 0 ? (
                  <div className="text-white/60 text-center py-8 font-medium" style={{ fontFamily: 'Brice Regular, sans-serif' }}>
                    No logs available
                  </div>
                ) : (
                  agentLogs.map((log, index) => (
                    <div key={index} className={`mb-2 ${getStatusColor(log.status)}`}>
                      <span className="text-white/60">[{new Date(log.timestamp).toLocaleString()}]</span>{" "}
                      <span className="font-bold">[{log.status.toUpperCase()}]</span> {log.message}
                      {log.marketsCount && <span className="text-[#99ff88]"> ({log.marketsCount} markets)</span>}
                      {log.error && <div className="text-[#ff6b6b] text-xs mt-1 ml-4">Error: {log.error}</div>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}




