import { useEffect, useRef, useState } from 'react';
import { MiningPool } from '@shared/schema';
import { playHashrateSound } from '@/components/sound-utils';
import { toast } from '@/hooks/use-toast';
import { formatHashrate } from '@/lib/poolApiService';

interface PoolHashrateChange {
  pool: MiningPool;
  previousHashrate: string | null;
  currentHashrate: string | null;
  percentChange: number;
}

export function usePoolHashrateTracking(pools: MiningPool[] | undefined) {
  const [hashrateChanges, setHashrateChanges] = useState<PoolHashrateChange[]>([]);
  const previousPoolHashrates = useRef<Map<number, string | null>>(new Map());
  
  // Timer references for staggered checks
  const topPoolTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secondPoolTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thirdPoolTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up all timers when component unmounts
    return () => {
      if (topPoolTimerRef.current) clearTimeout(topPoolTimerRef.current);
      if (secondPoolTimerRef.current) clearTimeout(secondPoolTimerRef.current);
      if (thirdPoolTimerRef.current) clearTimeout(thirdPoolTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pools || pools.length === 0) return;

    // Parse hashrate function for sorting
    const parseHashrateForSorting = (hashrate: string | null): number => {
      if (!hashrate) return 0;
      
      // Extract numeric value and unit from hashrate string
      const match = hashrate.match(/^([\d.]+)\s*([A-Za-z]+)/);
      if (!match) return 0;
      
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      
      // Convert to a common unit (TH/s)
      switch(unit) {
        case 'PH/S':
          return value * 1000;
        case 'TH/S':
          return value;
        case 'GH/S':
          return value / 1000;
        case 'MH/S':
          return value / 1000000;
        default:
          return value;
      }
    };
  
    // Sort pools by hashrate to get top 3
    const sortedPools = [...pools].sort((a, b) => {
      const hashA = parseHashrateForSorting(a.hashrate);
      const hashB = parseHashrateForSorting(b.hashrate);
      return hashB - hashA;
    }).slice(0, 3);

    // Function to check hashrate changes for a specific pool
    const checkPoolHashrateChange = (pool: MiningPool, index: number) => {
      const previousHashrate = previousPoolHashrates.current.get(pool.id) || null;
      const currentHashrate = pool.hashrate;
      
      // Convert hashrates to values for comparison
      const parseHashrateValue = (hashrate: string | null): number => {
        if (!hashrate) return 0;
        
        // Extract numeric value and unit from hashrate string
        const match = hashrate.match(/^([\d.]+)\s*([A-Za-z]+)/);
        if (!match) return 0;
        
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        
        // Convert to a common unit (TH/s)
        switch(unit) {
          case 'PH/S':
            return value * 1000;
          case 'TH/S':
            return value;
          case 'GH/S':
            return value / 1000;
          case 'MH/S':
            return value / 1000000;
          default:
            return value;
        }
      };
      
      const prevValue = parseHashrateValue(previousHashrate);
      const currValue = parseHashrateValue(currentHashrate);
      
      // Calculate percent change if both values are valid
      let percentChange = 0;
      if (prevValue > 0 && currValue > 0) {
        percentChange = ((currValue - prevValue) / prevValue) * 100;
      }
      
      // Store current hashrate for next comparison
      previousPoolHashrates.current.set(pool.id, currentHashrate);
      
      // If there was an increase, notify
      if (percentChange > 1) {  // More than 1% increase
        // Create hashrate change object
        const change: PoolHashrateChange = {
          pool,
          previousHashrate,
          currentHashrate,
          percentChange
        };
        
        // Update state and show notification
        setHashrateChanges(prev => [...prev.slice(-9), change]);
        
        // Play sound
        playHashrateSound(0.4);
        
        // Show toast
        toast({
          title: `Hashrate Increase for ${pool.name}`,
          description: `Hashrate increased from ${previousHashrate || 'N/A'} to ${currentHashrate || 'N/A'} (${percentChange.toFixed(1)}%)`,
          variant: "default",
          duration: 5000,
        });
      }
    };

    // Clean up previous timers
    if (topPoolTimerRef.current) clearTimeout(topPoolTimerRef.current);
    if (secondPoolTimerRef.current) clearTimeout(secondPoolTimerRef.current);
    if (thirdPoolTimerRef.current) clearTimeout(thirdPoolTimerRef.current);

    // Set up staggered monitoring for top 3 pools
    if (sortedPools.length > 0) {
      // Monitor first pool immediately and then every 30 seconds
      const checkTopPool = () => {
        checkPoolHashrateChange(sortedPools[0], 0);
        topPoolTimerRef.current = setTimeout(checkTopPool, 30000); // 30 seconds
      };
      checkTopPool();
    }

    if (sortedPools.length > 1) {
      // Monitor second pool after 8 seconds and then every 30 seconds
      secondPoolTimerRef.current = setTimeout(() => {
        const checkSecondPool = () => {
          checkPoolHashrateChange(sortedPools[1], 1);
          secondPoolTimerRef.current = setTimeout(checkSecondPool, 30000); // 30 seconds
        };
        checkSecondPool();
      }, 8000); // Start after 8 seconds
    }

    if (sortedPools.length > 2) {
      // Monitor third pool after 16 seconds and then every 30 seconds
      thirdPoolTimerRef.current = setTimeout(() => {
        const checkThirdPool = () => {
          checkPoolHashrateChange(sortedPools[2], 2);
          thirdPoolTimerRef.current = setTimeout(checkThirdPool, 30000); // 30 seconds
        };
        checkThirdPool();
      }, 16000); // Start after 16 seconds
    }

    return () => {
      // Clean up timers when pools change
      if (topPoolTimerRef.current) clearTimeout(topPoolTimerRef.current);
      if (secondPoolTimerRef.current) clearTimeout(secondPoolTimerRef.current);
      if (thirdPoolTimerRef.current) clearTimeout(thirdPoolTimerRef.current);
    };
  }, [pools]);

  return {
    hashrateChanges
  };
}