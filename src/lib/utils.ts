import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatSUIAmount(amount: bigint | number | string): string {
  const amountNum = typeof amount === 'bigint' ? Number(amount) : 
                   typeof amount === 'string' ? parseFloat(amount) : amount
  return (amountNum / 1_000_000_000).toFixed(4)
}

export function parseSUIAmount(amount: string): number {
  return Math.floor(parseFloat(amount) * 1_000_000_000)
}

export function formatTimeRemaining(expiresAt: number): string {
  const now = Date.now()
  const diff = expiresAt - now
  
  if (diff <= 0) return "Expired"
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m`
  return "< 1m"
}

export function formatPercentage(value: number, total: number): number {
  if (total === 0) return 50
  return Math.round((value / total) * 100)
}

export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getMarketStatusText(status: number): string {
  switch (status) {
    case 0: return "Active"
    case 1: return "Resolved"
    case 2: return "Cancelled"
    default: return "Unknown"
  }
}

export function getMarketOutcomeText(outcome: number): string {
  switch (outcome) {
    case 0: return "Option A Won"
    case 1: return "Option B Won"
    case 2: return "Unresolved"
    default: return "Unknown"
  }
}

export function calculateWinnings(
  userBet: number,
  userOption: number,
  winningOption: number,
  optionAPool: number,
  optionBPool: number
): number {
  if (userOption !== winningOption) return 0
  
  const winningPool = userOption === 0 ? optionAPool : optionBPool
  const losingPool = userOption === 0 ? optionBPool : optionAPool
  
  if (winningPool === 0) return userBet
  
  const shareOfWinnings = (userBet * losingPool) / winningPool
  return userBet + shareOfWinnings
}

export function getRandomGradient(): string {
  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-rose-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
    "from-orange-500 to-red-500",
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateMockMarketId(): string {
  return `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`
}

export function isValidSUIAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false)
}

export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function getExplorerUrl(txDigest: string, network: string = 'testnet'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://suiexplorer.com'
    : 'https://testnet.suivision.xyz'
  return `${baseUrl}/txblock/${txDigest}`
}