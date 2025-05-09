import { useState } from 'react';
import { ChevronUp, ChevronDown, Trophy, Wifi } from 'lucide-react';
import { MiningPool } from '@shared/schema';

interface TopRankingsPanelProps {
  pools: MiningPool[] | undefined;
  isVisible: boolean;
  onSelectPool: (pool: MiningPool) => void;
}

export default function TopRankingsPanel({ pools, isVisible, onSelectPool }: TopRankingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible || !pools) return null;
  
  // Sort pools by rank (ascending), handle null or undefined ranks
  const topPools = [...pools]
    .sort((a, b) => {
      // If either rank is null/undefined, use default values
      const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    })
    .slice(0, 10);
    
  // Determine API status indicator color
  const getApiStatusColor = (pool: MiningPool): string => {
    if (!pool.poolApiUrl) {
      return "text-gray-500";
    }
    
    if (pool.lastUpdated) {
      const lastUpdate = new Date(pool.lastUpdated);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      
      if (diffMinutes < 5) {
        return "text-green-500";
      } else if (diffMinutes < 15) {
        return "text-yellow-500";
      }
    }
    
    return "text-red-500";
  };
  
  return (
    <div className="fixed top-20 left-5 z-20 w-96 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg border border-[#00f3ff] shadow-[0_0_10px_#00f3ff] overflow-hidden">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-black bg-opacity-40 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Trophy className="text-[#00f3ff] mr-2 h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Top 10 Mining Pools</h2>
        </div>
        <button 
          className="text-white hover:text-[#00f3ff]"
          aria-label={isExpanded ? "Collapse rankings" : "Expand rankings"}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "50%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>
            <thead className="text-xs text-gray-400 uppercase font-jetbrains">
              <tr className="border-b border-gray-800">
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Pool</th>
                <th className="px-4 py-2 text-right">Hashrate</th>
              </tr>
            </thead>
            <tbody>
              {topPools.map(pool => (
                <tr 
                  key={pool.id} 
                  className="border-b border-gray-800 hover:bg-black hover:bg-opacity-40 cursor-pointer"
                  onClick={() => onSelectPool(pool)}
                >
                  <td className="px-4 py-3 font-jetbrains">
                    {getRankDisplay(pool.rank)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <div className="flex items-center">
                      <img 
                        src={pool.avatar} 
                        alt={pool.name} 
                        className="w-6 h-6 rounded-full mr-2 border border-[#ff00ea]" 
                      />
                      <div className="flex flex-col">
                        <span className="truncate max-w-[120px]">{pool.name}</span>
                        {pool.poolApiUrl && (
                          <div className="flex items-center text-xs">
                            <Wifi className={`h-3 w-3 ${getApiStatusColor(pool)} mr-1`} />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-jetbrains text-[#00f3ff]">
                    {pool.hashrate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getRankDisplay(rank: number | null): JSX.Element {
  // If rank is null or undefined, display a placeholder
  if (rank === null || rank === undefined) {
    return <span className="text-gray-500">--</span>;
  }
  
  if (rank === 1) {
    return <span className="text-orange-500 font-bold">#{rank}</span>;
  } else if (rank === 2) {
    return <span className="text-amber-500 font-bold">#{rank}</span>;
  } else if (rank === 3) {
    return <span className="text-yellow-500 font-bold">#{rank}</span>;
  }
  return <span>#{rank}</span>;
}