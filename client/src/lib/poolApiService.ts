import { MiningPool } from '@shared/schema';

// Interfaces for API responses
interface PoolInfoResponse {
  blockData?: any[];
  userAgents?: {
    userAgent: string;
    count: number;
    bestDifficulty: number;
    totalHashRate: number;
  }[];
  highScores?: {
    updatedAt: string;
    bestDifficulty: number;
    bestDifficultyUserAgent: string;
  }[];
  uptime?: string;
}

interface PoolChartResponse {
  label: string;
  data: number;
}[]

interface NetworkInfoResponse {
  blocks?: number;
  currentblockweight?: number;
  currentblocktx?: number;
  difficulty?: number;
  networkhashps?: number;
  pooledtx?: number;
  chain?: string;
  warnings?: string;
}

// Simple fetch without timeout to avoid AbortController issues
const fetchWithTimeout = async (url: string, _timeout = 5000) => {
  try {
    // Make the request with simple caching headers but no AbortController
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    return response;
  } catch (error) {
    // Just log the error and rethrow
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};

// Format hashrate from H/s to the appropriate unit (KH/s, MH/s, GH/s, TH/s, PH/s)
export const formatHashrate = (hashrate: number): string => {
  if (hashrate < 1000) return `${hashrate.toFixed(2)} H/s`;
  if (hashrate < 1000000) return `${(hashrate / 1000).toFixed(2)} KH/s`;
  if (hashrate < 1000000000) return `${(hashrate / 1000000).toFixed(2)} MH/s`;
  if (hashrate < 1000000000000) return `${(hashrate / 1000000000).toFixed(2)} GH/s`;
  if (hashrate < 1000000000000000) return `${(hashrate / 1000000000000).toFixed(2)} TH/s`;
  return `${(hashrate / 1000000000000000).toFixed(2)} PH/s`;
};

// Fetch pool info from API via proxy
export const fetchPoolInfo = async (poolApiUrl: string): Promise<PoolInfoResponse | null> => {
  if (!poolApiUrl) return null;
  
  try {
    // Use our server proxy endpoint to avoid CORS issues
    const response = await fetchWithTimeout(`/api/proxy/pool-info?url=${encodeURIComponent(poolApiUrl)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching pool info from ${poolApiUrl}:`, error);
    return null;
  }
};

// Fetch chart data from API via proxy
export const fetchPoolChart = async (poolApiUrl: string): Promise<PoolChartResponse | null> => {
  if (!poolApiUrl) return null;
  
  try {
    // Use our server proxy endpoint to avoid CORS issues
    const response = await fetchWithTimeout(`/api/proxy/pool-chart?url=${encodeURIComponent(poolApiUrl)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching pool chart from ${poolApiUrl}:`, error);
    return null;
  }
};

// Fetch network information from API via proxy
export const fetchNetworkInfo = async (poolApiUrl: string): Promise<NetworkInfoResponse | null> => {
  if (!poolApiUrl) return null;
  
  try {
    // Use our server proxy endpoint to avoid CORS issues
    const response = await fetchWithTimeout(`/api/proxy/network-info?url=${encodeURIComponent(poolApiUrl)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching network info from ${poolApiUrl}:`, error);
    return null;
  }
};

// Update pool data with real-time information
export const updatePoolWithLiveData = async (pool: MiningPool): Promise<MiningPool> => {
  if (!pool.poolApiUrl || !pool.isActive) {
    return pool; // Return unchanged if no API URL or inactive
  }
  
  try {
    console.log(`Fetching live data for ${pool.name} from ${pool.poolApiUrl}`);
    
    // Fetch data from all endpoints
    const [poolInfo, chartData, networkInfo] = await Promise.all([
      fetchPoolInfo(pool.poolApiUrl),
      fetchPoolChart(pool.poolApiUrl),
      fetchNetworkInfo(pool.poolApiUrl)
    ]);
    
    // Create a copy of the pool to update
    const updatedPool = { ...pool };
    
    // Update hashrate from pool info if available
    if (poolInfo?.userAgents && poolInfo.userAgents.length > 0) {
      let totalHashRate = 0;
      
      // Sum the hashrates (convert from string if needed)
      for (const agent of poolInfo.userAgents) {
        // Handle totalHashRate as string or number
        const hashRate = typeof agent.totalHashRate === 'string' 
          ? parseFloat(agent.totalHashRate) 
          : agent.totalHashRate;
          
        if (!isNaN(hashRate)) {
          totalHashRate += hashRate;
        }
      }
      
      updatedPool.hashrate = formatHashrate(totalHashRate);
      console.log(`Updated ${pool.name} hashrate to ${updatedPool.hashrate}`);
    }
    
    // Update workers count if available
    if (poolInfo?.userAgents) {
      let totalWorkers = 0;
      
      // Sum the worker counts (convert from string if needed)
      for (const agent of poolInfo.userAgents) {
        // Handle count as string or number
        const count = typeof agent.count === 'string' 
          ? parseInt(agent.count, 10) 
          : agent.count;
          
        if (!isNaN(count)) {
          totalWorkers += count;
        }
      }
      
      updatedPool.workers = totalWorkers;
      console.log(`Updated ${pool.name} workers to ${updatedPool.workers}`);
    }
    
    // Update hash history from chart data if available
    if (chartData && Array.isArray(chartData) && chartData.length > 0) {
      // Extract data points from chart data
      const historyData = chartData.map(point => point.data);
      // Use last 7 points or fewer if not enough data
      const lastSevenPoints = historyData.slice(-7);
      if (lastSevenPoints.length > 0) {
        updatedPool.hashHistory = lastSevenPoints;
        console.log(`Updated ${pool.name} hash history with ${lastSevenPoints.length} points`);
      }
    }
    
    // Add network difficulty if available
    if (networkInfo?.difficulty) {
      updatedPool.difficulty = networkInfo.difficulty.toString();
      console.log(`Updated ${pool.name} difficulty to ${updatedPool.difficulty}`);
    }
    
    // Add network hashrate if available
    if (networkInfo?.networkhashps) {
      updatedPool.networkHashrate = formatHashrate(networkInfo.networkhashps);
      console.log(`Updated ${pool.name} network hashrate to ${updatedPool.networkHashrate}`);
    }
    
    // Update last updated timestamp
    updatedPool.lastUpdated = new Date().toISOString();
    
    return updatedPool;
  } catch (error) {
    console.error(`Error updating pool data for ${pool.name}:`, error);
    return {
      ...pool,
      lastUpdated: new Date().toISOString() // Update timestamp even on error to show status
    };
  }
};

// Update all pools with live data
export const updateAllPools = async (pools: MiningPool[]): Promise<MiningPool[]> => {
  if (!pools || pools.length === 0) {
    return [];
  }
  
  try {
    console.log(`Starting update for ${pools.length} pools`);
    
    // Create mapping of all pools for later merging
    const poolsMap = new Map<number, MiningPool>();
    pools.forEach(pool => poolsMap.set(pool.id, pool));
    
    // For real mining pools: Only update those with valid API URLs
    const realPools = pools.filter(pool => pool.poolApiUrl && pool.isActive);
    console.log(`Found ${realPools.length} active pools with API URLs`);
    
    // For test mining pools: Get data from testData property
    const testPools = pools.filter(pool => pool.testData && !pool.poolApiUrl && pool.isActive);
    console.log(`Found ${testPools.length} test pools with static data`);
    
    // Update real pools with live data
    if (realPools.length > 0) {
      const updatedRealPools = await Promise.all(
        realPools.map(pool => updatePoolWithLiveData(pool))
      );
      
      // Merge updated pools back into the pools map
      updatedRealPools.forEach(pool => poolsMap.set(pool.id, pool));
    }
    
    // Update test pools with static data from testData
    testPools.forEach(pool => {
      if (pool.testData) {
        // Use data from testData to populate real-time fields
        const updatedPool = { 
          ...pool,
          hashrate: pool.testData.hashrate,
          workers: pool.testData.workers,
          hashHistory: pool.testData.hashHistory,
          lastUpdated: new Date().toISOString()
        };
        poolsMap.set(pool.id, updatedPool);
      }
    });
    
    // Initialize any real pools that haven't had their data set yet
    // This ensures real pools with API errors still have some display values
    realPools.forEach(pool => {
      const currentPool = poolsMap.get(pool.id);
      if (currentPool) {
        // Make sure hashrate has a value if missing
        if (!currentPool.hashrate) {
          const updatedPool = {
            ...currentPool,
            hashrate: "0 H/s", 
            workers: 0,
            hashHistory: [0, 0, 0, 0, 0, 0, 0]
          };
          poolsMap.set(pool.id, updatedPool);
        }
      }
    });
    
    // Get all pools back from the map
    const allPoolsUpdated = Array.from(poolsMap.values());
    
    // Helper functions for hashrate comparison
    const getNumericHashrate = (hashrate: string | null) => {
      if (!hashrate) return 0;
      const match = hashrate.match(/^([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };
    
    const getHashrateUnit = (hashrate: string | null) => {
      if (!hashrate) return 'H/s';
      const match = hashrate.match(/(H\/s|KH\/s|MH\/s|GH\/s|TH\/s|PH\/s|EH\/s)$/);
      return match ? match[1] : 'H/s';
    };
    
    // Unit multipliers
    const unitMultipliers: { [key: string]: number } = {
      'H/s': 1,
      'KH/s': 1000,
      'MH/s': 1000000,
      'GH/s': 1000000000,
      'TH/s': 1000000000000,
      'PH/s': 1000000000000000,
      'EH/s': 1000000000000000000
    };
    
    // Calculate normalized hashrate value
    const getNormalizedHashrate = (pool: MiningPool): number => {
      const numeric = getNumericHashrate(pool.hashrate);
      const unit = getHashrateUnit(pool.hashrate);
      return numeric * (unitMultipliers[unit] || 1);
    };
    
    // Sort pools: first prioritize real pools over test pools, then by hashrate within each group
    const sortedPools = [...allPoolsUpdated].sort((a, b) => {
      // Check if pools are test pools (unclaimed territory) or real pools
      const aIsTestPool = 'testData' in a && a.testData !== null;
      const bIsTestPool = 'testData' in b && b.testData !== null;
      
      // If one is a real pool and the other is a test pool, prioritize real pool
      if (aIsTestPool && !bIsTestPool) return 1;  // b (real pool) comes first
      if (!aIsTestPool && bIsTestPool) return -1; // a (real pool) comes first
      
      // If both are the same type (both real or both test), sort by hashrate
      const aValue = getNormalizedHashrate(a);
      const bValue = getNormalizedHashrate(b);
      
      return bValue - aValue; // Descending order
    });
    
    // Update ranks
    const rankedPools = sortedPools.map((pool, index) => ({
      ...pool,
      rank: index + 1
    }));
    
    console.log(`Completed updating and ranking ${rankedPools.length} pools`);
    return rankedPools;
  } catch (error) {
    console.error('Error updating all pools:', error);
    return pools; // Return original pools on error
  }
};