import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
