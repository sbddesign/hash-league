import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MiningPool } from '@shared/schema';
import { updateAllPools, updatePoolWithLiveData } from '@/lib/poolApiService';

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

export function usePoolData() {
  const [updatedPools, setUpdatedPools] = useState<MiningPool[] | null>(null);
  const [selectedPool, setSelectedPool] = useState<MiningPool | null>(null);
  
  // Query for all pools
  const { 
    data: pools, 
    isLoading, 
    error 
  } = useQuery<MiningPool[]>({
    queryKey: ['/api/mining-pools'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Query for global hashrate from mempool.space API
  const { data: globalHashrateData } = useQuery<GlobalHashrateResponse>({
    queryKey: ['/api/global-hashrate'],
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 1, // Refetch every 1 minute
  });
  
  // Effect to update all pools with live data
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
  
  // Format global hashrate from mempool.space API
  const formatGlobalHashrate = (): string => {
    if (globalHashrateData?.currentHashrate) {
      try {
        // The hashrate is returned in H/s, convert to EH/s (1 EH/s = 1,000,000,000,000,000,000 H/s)
        const hashrateEH = globalHashrateData.currentHashrate / 1_000_000_000_000_000_000;
        return hashrateEH.toFixed(2) + ' EH/s';
      } catch (err) {
        console.error("Error formatting global hashrate:", err);
      }
    }
    
    // Fallback to calculating from local pools if no global data
    return calculateLocalHashrate();
  };
  
  // Calculate hashrate from our local pools as a fallback
  const calculateLocalHashrate = (): string => {
    const displayPools = updatedPools || pools;
    if (!displayPools || displayPools.length === 0) return '0 PH/s';
    
    try {
      let total = 0;
      
      displayPools.forEach(pool => {
        // Skip pools with null or undefined hashrate
        if (!pool.hashrate) return;
        
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
  
  // Handle selecting a pool
  const handlePoolSelect = (pool: MiningPool) => {
    setSelectedPool(pool);
  };
  
  // Use global hashrate from API if available, otherwise fall back to local calculation
  const globalHashrate = formatGlobalHashrate();
  const activePools = !isLoading && updatedPools ? updatedPools.length : 0;
  const displayPools = updatedPools || pools;
  
  return {
    pools: displayPools,
    selectedPool,
    isLoading,
    error,
    globalHashrate,
    activePools,
    handlePoolSelect,
    setSelectedPool,
  };
}