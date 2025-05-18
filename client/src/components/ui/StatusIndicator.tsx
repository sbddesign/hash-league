import { Wifi, Clock } from 'lucide-react';
import { MiningPool } from '@shared/schema';
import { formatUpdateTime, getPoolApiStatus } from '@/lib/utils';

interface StatusIndicatorProps {
  pool: MiningPool;
  showTimestamp?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusIndicator({ pool, showTimestamp = false, size = 'md' }: StatusIndicatorProps) {
  const poolStatus = getPoolApiStatus(pool);
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