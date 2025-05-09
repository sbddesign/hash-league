import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import MapVisualization from '@/components/MapVisualization';
import SidePanel from '@/components/SidePanel';
import AddPoolButton from '@/components/AddPoolButton';
import TopRankingsPanel from '@/components/TopRankingsPanel';
import { MiningPool } from '@shared/schema';
import { updateAllPools, updatePoolWithLiveData, formatHashrate } from '@/lib/poolApiService';

// Import Leaflet for map functionality
import L from 'leaflet';
// Import Leaflet CSS file - this is necessary for the map to display properly
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const [selectedPool, setSelectedPool] = useState<MiningPool | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [updatedPools, setUpdatedPools] = useState<MiningPool[] | null>(null);
  const queryClient = useQueryClient();
  
  const { data: pools, isLoading, error } = useQuery<MiningPool[]>({
    queryKey: ['/api/mining-pools'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Define the type for mempool.space API response
  interface GlobalHashrateResponse {
    currentHashrate: number;
    currentDifficulty: number;
    hashrates: Array<{
      timestamp: number;
      avgHashrate: number;
    }>;
    difficulty: Array<{
      time: number;
      height: number;
      difficulty: number;
      adjustment: number;
    }>;
  }
  
  // Query for global hashrate from mempool.space API
  const { data: globalHashrateData } = useQuery<GlobalHashrateResponse>({
    queryKey: ['/api/global-hashrate'],
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 1, // Refetch every 1 minute
  });
  
  // Effect to update pools with live data
  useEffect(() => {
    if (pools && pools.length > 0) {
      const fetchLiveData = async () => {
        try {
          // Update pools with live data
          const updated = await updateAllPools(pools);
          setUpdatedPools(updated);
          
          // Persist updated data to server for each pool
          updated.forEach(async (pool) => {
            try {
              await fetch(`/api/mining-pools/${pool.id}/update`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  hashrate: pool.hashrate,
                  rank: pool.rank,
                  workers: pool.workers,
                  hashHistory: pool.hashHistory,
                  lastUpdated: new Date().toISOString(),
                  difficulty: pool.difficulty,
                  networkHashrate: pool.networkHashrate
                }),
              });
            } catch (error) {
              console.error(`Failed to persist pool updates for ${pool.name}:`, error);
            }
          });
        } catch (err) {
          console.error("Error updating pools with live data:", err);
        }
      };
      
      fetchLiveData();
      
      // Set up polling interval for live updates
      const intervalId = setInterval(fetchLiveData, 60000); // Update every minute
      
      return () => clearInterval(intervalId);
    }
  }, [pools]);
  
  // If we have a selected pool and live data is available, update it
  useEffect(() => {
    if (selectedPool && selectedPool.poolApiUrl) {
      const updateSelectedPool = async () => {
        try {
          // Get updated data for the selected pool
          const updatedPool = await updatePoolWithLiveData(selectedPool);
          setSelectedPool(updatedPool);
          
          // Persist changes to server
          await fetch(`/api/mining-pools/${updatedPool.id}/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              hashrate: updatedPool.hashrate,
              workers: updatedPool.workers,
              hashHistory: updatedPool.hashHistory,
              lastUpdated: new Date().toISOString(),
              difficulty: updatedPool.difficulty,
              networkHashrate: updatedPool.networkHashrate
            }),
          });
        } catch (err) {
          console.error("Error updating selected pool:", err);
        }
      };
      
      updateSelectedPool();
      
      // Set polling interval for the selected pool (more frequent)
      const intervalId = setInterval(updateSelectedPool, 30000); // Update every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [selectedPool?.id]);
  
  const handlePoolSelect = (pool: MiningPool) => {
    setSelectedPool(pool);
    setIsPanelOpen(true);
  };
  
  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  // Use the updated pools if available, otherwise use the original pools
  const displayPools = updatedPools || pools;

  // Format global hashrate from mempool.space API
  const formatGlobalHashrate = (): string => {
    if (globalHashrateData) {
      console.log("Global hashrate data received:", globalHashrateData);
      
      if (globalHashrateData.currentHashrate) {
        try {
          // The hashrate is returned in H/s, convert to PH/s (1 PH/s = 1,000,000,000,000,000 H/s)
          const hashratePH = globalHashrateData.currentHashrate / 1_000_000_000_000_000;
          console.log(`Converting global hashrate: ${globalHashrateData.currentHashrate} H/s → ${hashratePH.toFixed(2)} PH/s`);
          return hashratePH.toFixed(2) + ' PH/s';
        } catch (err) {
          console.error("Error formatting global hashrate:", err);
        }
      } else {
        console.log("No currentHashrate property in the response");
      }
    } else {
      console.log("No global hashrate data received yet");
    }
    
    // Fallback to calculating from local pools if no global data
    return calculateLocalHashrate();
  };
  
  // Calculate hashrate from our local pools as a fallback
  const calculateLocalHashrate = (): string => {
    if (!displayPools || displayPools.length === 0) return '0 PH/s';
    
    try {
      let total = 0;
      
      displayPools.forEach(pool => {
        // Extract numeric value from hashrate string
        const match = pool.hashrate.match(/^([\d.]+)/);
        if (match) {
          const value = parseFloat(match[1]);
          
          // Convert to PH/s based on unit
          if (pool.hashrate.includes('EH/s')) {
            total += value * 1000;
          } else if (pool.hashrate.includes('PH/s')) {
            total += value;
          } else if (pool.hashrate.includes('TH/s')) {
            total += value / 1000;
          } else if (pool.hashrate.includes('GH/s')) {
            total += value / 1000000;
          } else if (pool.hashrate.includes('MH/s')) {
            total += value / 1000000000;
          } else if (pool.hashrate.includes('KH/s')) {
            total += value / 1000000000000;
          } else {
            total += value / 1000000000000000;
          }
        }
      });
      
      return total.toFixed(1) + ' PH/s';
    } catch (err) {
      console.error("Error calculating local hashrate:", err);
      return '0 PH/s';
    }
  };
  
  // Use global hashrate from API if available, otherwise fall back to local calculation
  const globalHashrate = formatGlobalHashrate();
  const activePools = !isLoading && displayPools ? displayPools.length : 0;

  return (
    <div className="app-container relative min-h-screen bg-black">
      {/* Background Grid Overlay */}
      <div className="grid-overlay absolute inset-0 z-0"></div>
      
      {/* Header - stays on top with z-index */}
      <Header 
        globalHashrate={globalHashrate} 
        activePools={activePools}
      />
      
      {/* Main Content */}
      <main className="relative w-full h-screen overflow-hidden">
        {/* Map first in the DOM for better positioning */}
        <MapVisualization 
          isLoading={isLoading} 
          error={error as Error}
          pools={displayPools as MiningPool[]} 
          onSelectPool={handlePoolSelect}
          selectedPool={selectedPool}
        />
        
        {/* Side Panel - high z-index to overlay map */}
        <SidePanel 
          isOpen={isPanelOpen} 
          pool={selectedPool}
          onClose={handlePanelClose}
        />
        
        {/* Add Pool Button - highest z-index for accessibility */}
        <AddPoolButton />
        
        {/* Top Rankings Panel */}
        <TopRankingsPanel 
          pools={displayPools} 
          isVisible={!isPanelOpen} 
          onSelectPool={handlePoolSelect}
        />
      </main>
    </div>
  );
}
