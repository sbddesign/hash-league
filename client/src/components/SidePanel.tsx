import { useState, useEffect } from 'react';
import { X, Globe, Twitter, Zap, MapPin, Link2, Server, Cpu, Calendar, Wifi, Activity, Clock } from 'lucide-react';
import { MiningPool } from '@shared/schema';
import { updatePoolWithLiveData } from '@/lib/poolApiService';
import { DAYS_OF_WEEK } from '@/lib/constants';

interface SidePanelProps {
  isOpen: boolean;
  pool: MiningPool | null;
  onClose: () => void;
}

export default function SidePanel({ isOpen, pool, onClose }: SidePanelProps) {
  const [isLiveDataFetching, setIsLiveDataFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  if (!isOpen) {
    return null;
  }
  
  // Format timestamp to readable format
  const formatUpdateTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return "Not available";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Invalid time";
    }
  };
  
  // Format large numbers for better readability
  const formatNumber = (num: number | string | undefined): string => {
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
  };
  
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
  
  // Get status of the mining pool
  const poolStatus = getApiStatus();

  // Display appropriate message for hashrate trend
  const getHashrateTrend = (hashHistory: number[] | undefined) => {
    if (!hashHistory || hashHistory.length < 2) return { text: 'No data', color: 'text-gray-400' };
    
    const firstValue = hashHistory[0];
    const lastValue = hashHistory[hashHistory.length - 1];
    
    if (lastValue > firstValue) {
      const percentChange = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
      return { text: `+${percentChange}%`, color: 'text-[#39FF14]' };
    } else if (lastValue < firstValue) {
      const percentChange = ((firstValue - lastValue) / firstValue * 100).toFixed(1);
      return { text: `-${percentChange}%`, color: 'text-red-500' };
    }
    
    return { text: 'Stable', color: 'text-yellow-500' };
  };
  
  const hashrateTrend = pool?.hashHistory ? getHashrateTrend(pool.hashHistory) : { text: 'No data', color: 'text-gray-400' };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-black bg-opacity-90 backdrop-blur-md z-40 border-l border-[#00f3ff] shadow-[0_0_10px_#00f3ff] transform transition-transform overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="relative p-6 pt-16">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#ff00ea] transition-colors z-50"
          aria-label="Close panel"
        >
          <X className="h-6 w-6 shadow-[0_0_5px_#ff00ea]" />
        </button>
        
        <div className="mt-2">
          {!pool ? (
            <div className="text-center py-12">
              <div className="text-[#ff00ea] text-5xl mb-4">
                <MapPin className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Pool Selected</h3>
              <p className="text-gray-400 mb-4">Click on a marker on the map to view details about a mining pool.</p>
            </div>
          ) : (
            <div>
              {/* Pool Header */}
              <div className="flex items-center mb-6">
                {/* Avatar */}
                <img 
                  src={pool.avatar} 
                  alt={`${pool.name} Avatar`} 
                  className="w-16 h-16 rounded-full border-2 border-[#ff00ea]" 
                  style={{ boxShadow: '0 0 5px #ff00ea' }}
                />
                
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white">{pool.name}</h2>
                  <div className="flex items-center text-sm text-gray-300 mt-1">
                    <MapPin className="h-4 w-4 text-[#ff00ea] mr-1" />
                    <span>{pool.city}, {pool.country}</span>
                  </div>
                  
                  {/* API Status Indicator */}
                  {pool.poolApiUrl && (
                    <div className="flex items-center text-xs mt-1">
                      <Wifi className={`h-3 w-3 ${poolStatus.color} mr-1`} />
                      <span className={`${poolStatus.color}`}>{poolStatus.text}</span>
                      {pool.lastUpdated && (
                        <span className="text-gray-500 ml-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatUpdateTime(pool.lastUpdated)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pool Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="hash-stat bg-black bg-opacity-50 p-3 rounded-lg border border-[#00f3ff]">
                  <div className="text-xs text-gray-400 mb-1 font-jetbrains">HASHRATE</div>
                  <div className="text-lg font-bold text-[#00f3ff] font-jetbrains">{pool.hashrate}</div>
                </div>
                <div className="hash-stat bg-black bg-opacity-50 p-3 rounded-lg border border-[#00f3ff]">
                  <div className="text-xs text-gray-400 mb-1 font-jetbrains">RANK</div>
                  <div className="text-lg font-bold text-[#00f3ff] font-jetbrains">#{pool.rank}</div>
                </div>
                <div className="hash-stat bg-black bg-opacity-50 p-3 rounded-lg border border-[#00f3ff]">
                  <div className="text-xs text-gray-400 mb-1 font-jetbrains">WORKERS</div>
                  <div className="text-lg font-bold text-[#00f3ff] font-jetbrains">{pool.workers}</div>
                </div>
              </div>
              
              {/* Network Stats (if available) */}
              {(pool.networkHashrate || pool.difficulty) && (
                <div className="mb-6">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">Network</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pool.networkHashrate && (
                      <div className="hash-stat bg-black bg-opacity-50 p-3 rounded-lg border border-[#39FF14]">
                        <div className="text-xs text-gray-400 mb-1 font-jetbrains">NETWORK HASHRATE</div>
                        <div className="text-md font-bold text-[#39FF14] font-jetbrains">{pool.networkHashrate}</div>
                      </div>
                    )}
                    {pool.difficulty && (
                      <div className="hash-stat bg-black bg-opacity-50 p-3 rounded-lg border border-[#39FF14]">
                        <div className="text-xs text-gray-400 mb-1 font-jetbrains">DIFFICULTY</div>
                        <div className="text-md font-bold text-[#39FF14] font-jetbrains">{parseFloat(pool.difficulty).toExponential(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">About</h3>
                <p className="text-gray-200 leading-relaxed">
                  {pool.description}
                </p>
              </div>
              
              {/* Links */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">Links</h3>
                <div className="flex flex-wrap gap-2">
                  {pool.website && (
                    <a 
                      href={pool.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Website</span>
                    </a>
                  )}
                  
                  {pool.twitter && (
                    <a 
                      href={pool.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      <span>Twitter</span>
                    </a>
                  )}
                  
                  {pool.nostr && (
                    <a 
                      href={pool.nostr} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Nostr</span>
                    </a>
                  )}
                  
                  {pool.poolApiUrl && (
                    <a 
                      href={`${pool.poolApiUrl}/api/info`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#ff00ea] text-[#ff00ea] hover:bg-[#ff00ea] hover:bg-opacity-10 transition-colors"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      <span>Mining Pool API</span>
                    </a>
                  )}
                </div>
              </div>
              
              {/* Historical Data */}
              {pool.hashHistory && (
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-jetbrains">Hashrate History</h3>
                  <div className="bg-black bg-opacity-50 p-4 rounded-lg border border-[#00f3ff]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-gray-400">Last 7 Days</div>
                      <div className={`text-xs ${hashrateTrend.color}`}>
                        {hashrateTrend.text}
                      </div>
                    </div>
                    
                    {/* Simple chart representation with bars */}
                    <div className="h-24 flex items-end justify-between">
                      {(pool.hashHistory && pool.hashHistory.length > 0) ? (
                        // If we have history data, show the bars
                        pool.hashHistory.map((value, index) => {
                          // Find the maximum value for scaling
                          const maxValue = Math.max(...pool.hashHistory || [1]);
                          // Calculate height as percentage
                          const height = `${(value / maxValue) * 100}%`;
                          
                          return (
                            <div 
                              key={index} 
                              className="w-[12%] bg-[#00f3ff] bg-opacity-40 hover:bg-opacity-60 transition-all rounded-t" 
                              style={{ height }}
                            ></div>
                          );
                        })
                      ) : (
                        // If no history data, show empty placeholder bars
                        Array(7).fill(0).map((_, index) => (
                          <div 
                            key={index} 
                            className="w-[12%] bg-gray-800 bg-opacity-40 rounded-t"
                            style={{ height: '10%' }}
                          ></div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex justify-between mt-2 text-xs text-gray-500 font-jetbrains">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <div key={index}>{day}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
