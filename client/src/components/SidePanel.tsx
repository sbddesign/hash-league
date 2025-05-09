import { X, Globe, Twitter, Zap, MapPin } from 'lucide-react';
import { MiningPool } from '@shared/schema';

interface SidePanelProps {
  isOpen: boolean;
  pool: MiningPool | null;
  onClose: () => void;
}

export default function SidePanel({ isOpen, pool, onClose }: SidePanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-black bg-opacity-90 backdrop-blur-md z-20 border-l border-[#00f3ff] shadow-[0_0_10px_#00f3ff] transform transition-transform overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="relative p-6 pt-16">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#ff00ea] transition-colors"
          aria-label="Close panel"
        >
          <X className="h-6 w-6" />
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
                      href={`nostr:${pool.nostr}`} 
                      className="flex items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:bg-opacity-10 transition-colors"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Nostr</span>
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
                      <div className="text-xs text-[#39FF14]">
                        {pool.hashHistory[pool.hashHistory.length - 1] > pool.hashHistory[0] 
                          ? `+${((pool.hashHistory[pool.hashHistory.length - 1] - pool.hashHistory[0]) / pool.hashHistory[0] * 100).toFixed(1)}%` 
                          : `-${((pool.hashHistory[0] - pool.hashHistory[pool.hashHistory.length - 1]) / pool.hashHistory[0] * 100).toFixed(1)}%`
                        }
                      </div>
                    </div>
                    
                    {/* Simple chart representation with bars */}
                    <div className="h-24 flex items-end justify-between">
                      {pool.hashHistory.map((value, index) => {
                        const maxValue = Math.max(...pool.hashHistory);
                        const height = `${(value / maxValue) * 100}%`;
                        return (
                          <div 
                            key={index} 
                            className="w-[12%] bg-[#00f3ff] bg-opacity-40 hover:bg-opacity-60 transition-all rounded-t" 
                            style={{ height }}
                          ></div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between mt-2 text-xs text-gray-500 font-jetbrains">
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                      <div>Sun</div>
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
