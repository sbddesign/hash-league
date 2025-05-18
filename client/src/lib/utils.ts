import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MiningPool } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format timestamp to readable format
export function formatUpdateTime(timestamp: string | null | undefined): string {
  if (!timestamp) return "Not available";
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return "Invalid time";
  }
}

// Format large numbers for better readability
export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null) return "N/A";
  
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(parsedNum)) return "N/A";
  
  if (parsedNum >= 1000000000) {
    return (parsedNum / 1000000000).toFixed(2) + 'B';
  } else if (parsedNum >= 1000000) {
    return (parsedNum / 1000000).toFixed(2) + 'M';
  } else if (parsedNum >= 1000) {
    return (parsedNum / 1000).toFixed(2) + 'K';
  } else {
    return parsedNum.toFixed(0);
  }
}

// Determine API connection status for a pool
export function getPoolApiStatus(pool: MiningPool | null | undefined) {
  if (!pool?.poolApiUrl) {
    return { color: 'text-gray-500', text: 'No API URL' };
  }
  
  if (pool.lastUpdated) {
    const lastUpdate = new Date(pool.lastUpdated);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) {
      return { color: 'text-green-500', text: 'Connected' };
    } else if (diffMinutes < 15) {
      return { color: 'text-yellow-500', text: 'Slow' };
    }
  }
  
  return { color: 'text-red-500', text: 'Offline' };
}

// Calculate trend for hashrate or any numeric array
export function calculateTrend(data: number[] | undefined) {
  if (!data || data.length < 2) return { text: 'No data', color: 'text-gray-400' };
  
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  
  if (lastValue > firstValue) {
    const percentChange = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
    return { text: `+${percentChange}%`, color: 'text-[#39FF14]' };
  } else if (lastValue < firstValue) {
    const percentChange = ((firstValue - lastValue) / firstValue * 100).toFixed(1);
    return { text: `-${percentChange}%`, color: 'text-red-500' };
  }
  
  return { text: 'Stable', color: 'text-yellow-500' };
}
