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
  
  // Effect to update pools with live data
  useEffect(() => {
    if (pools && pools.length > 0) {
      const fetchLiveData = async () => {
        try {
          const updated = await updateAllPools(pools);
          setUpdatedPools(updated);
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
          const updatedPool = await updatePoolWithLiveData(selectedPool);
          setSelectedPool(updatedPool);
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

  // Calculate global statistics from the dynamically updated data
  const calculateTotalHashrate = (): string => {
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
      console.error("Error calculating total hashrate:", err);
      return '0 PH/s';
    }
  };
  
  const totalHashrate = calculateTotalHashrate();
  const activePools = !isLoading && displayPools ? displayPools.length : 0;

  return (
    <div className="app-container relative min-h-screen bg-black">
      {/* Background Grid Overlay */}
      <div className="grid-overlay absolute inset-0 z-0"></div>
      
      {/* Header - stays on top with z-index */}
      <Header 
        globalHashrate={totalHashrate} 
        activePools={activePools}
      />
      
      {/* Main Content */}
      <main className="relative w-full h-screen overflow-hidden">
        {/* Map first in the DOM for better positioning */}
        <MapVisualization 
          isLoading={isLoading} 
          error={error as Error}
          pools={pools as MiningPool[]} 
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
          pools={pools} 
          isVisible={!isPanelOpen} 
          onSelectPool={handlePoolSelect}
        />
      </main>
    </div>
  );
}
