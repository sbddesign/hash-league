import { Wifi, Clock } from 'lucide-react';
import { MiningPool } from '@shared/schema';
import { formatUpdateTime } from '@/lib/utils';

interface StatusIndicatorProps {
  pool: MiningPool;
  showTimestamp?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusIndicator({ pool, showTimestamp = false, size = 'md' }: StatusIndicatorProps) {
  // Determine API status indicator
  const getApiStatus = () => {
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
  };

  
  const poolStatus = getApiStatus();
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  
  return (
    <div className={`flex items-center ${textSize}`}>
      <Wifi className={`${iconSize} ${poolStatus.color} mr-1`} />
      <span className={`${poolStatus.color}`}>{poolStatus.text}</span>
      {showTimestamp && pool.lastUpdated && (
        <span className="text-gray-500 ml-2">
          <Clock className={`${iconSize} inline mr-1`} />
          {formatUpdateTime(pool.lastUpdated)}
        </span>
      )}
    </div>
  );
}