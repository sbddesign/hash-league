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
      const totalHashRate = poolInfo.userAgents.reduce((sum, agent) => sum + agent.totalHashRate, 0);
      updatedPool.hashrate = formatHashrate(totalHashRate);
      console.log(`Updated ${pool.name} hashrate to ${updatedPool.hashrate}`);
    }
    
    // Update workers count if available
    if (poolInfo?.userAgents) {
      const totalWorkers = poolInfo.userAgents.reduce((sum, agent) => sum + agent.count, 0);
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
    
    // Only attempt to update pools with valid API URLs
    const activePools = pools.filter(pool => pool.poolApiUrl && pool.isActive);
    console.log(`Found ${activePools.length} active pools with API URLs`);
    
    // Create mapping of all pools for later merging
    const poolsMap = new Map<number, MiningPool>();
    pools.forEach(pool => poolsMap.set(pool.id, pool));
    
    // Update active pools in parallel
    if (activePools.length > 0) {
      const updatedActivePools = await Promise.all(
        activePools.map(pool => updatePoolWithLiveData(pool))
      );
      
      // Merge updated pools back into the pools map
      updatedActivePools.forEach(pool => poolsMap.set(pool.id, pool));
    }
    
    // Get all pools back from the map
    const allPoolsUpdated = Array.from(poolsMap.values());
    
    // Sort pools by hashrate (descending) to update rankings
    const sortedPools = [...allPoolsUpdated].sort((a, b) => {
      // Extract numeric value from hashrate string
      const getNumericHashrate = (hashrate: string) => {
        const match = hashrate.match(/^([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
      };
      
      // Extract hashrate unit for comparison
      const getHashrateUnit = (hashrate: string) => {
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
      
      const aNumeric = getNumericHashrate(a.hashrate);
      const bNumeric = getNumericHashrate(b.hashrate);
      const aUnit = getHashrateUnit(a.hashrate);
      const bUnit = getHashrateUnit(b.hashrate);
      
      // Convert to same unit for comparison
      const aValue = aNumeric * (unitMultipliers[aUnit] || 1);
      const bValue = bNumeric * (unitMultipliers[bUnit] || 1);
      
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