import {
  users,
  type User,
  type InsertUser,
  miningPools,
  type MiningPool,
  type InsertMiningPool,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Mining Pool Methods
  getAllMiningPools(): Promise<MiningPool[]>;
  getMiningPool(id: number): Promise<MiningPool | undefined>;
  createMiningPool(pool: InsertMiningPool): Promise<MiningPool>;
  updateMiningPool(
    id: number,
    updates: Partial<MiningPool>,
  ): Promise<MiningPool>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pools: Map<number, MiningPool>;
  currentUserId: number;
  currentPoolId: number;

  constructor() {
    this.users = new Map();
    this.pools = new Map();
    this.currentUserId = 1;
    this.currentPoolId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllMiningPools(): Promise<MiningPool[]> {
    return Array.from(this.pools.values());
  }

  async getMiningPool(id: number): Promise<MiningPool | undefined> {
    return this.pools.get(id);
  }

  async createMiningPool(insertPool: InsertMiningPool): Promise<MiningPool> {
    const id = this.currentPoolId++;
    // Ensure that website is not undefined to match the expected type
    const poolData = {
      ...insertPool,
      id,
      website: insertPool.website || null,
      twitter: insertPool.twitter || null,
      nostr: insertPool.nostr || null,
      difficulty: insertPool.difficulty || null,
      networkHashrate: insertPool.networkHashrate || null,
      lastUpdated: insertPool.lastUpdated || null,
      isActive: insertPool.isActive === undefined ? true : insertPool.isActive,
      poolApiUrl: insertPool.poolApiUrl || null,
      hashrate: insertPool.hashrate || "0 H/s",
      workers: insertPool.workers || 0,
      hashHistory: insertPool.hashHistory
        ? [...insertPool.hashHistory]
        : [0, 0, 0, 0, 0, 0, 0],
      testData: insertPool.testData || null,
      rank: insertPool.rank || 0,
    };

    const pool: MiningPool = poolData;
    this.pools.set(id, pool);
    return pool;
  }

  async updateMiningPool(
    id: number,
    updates: Partial<MiningPool>,
  ): Promise<MiningPool> {
    const currentPool = this.pools.get(id);
    if (!currentPool) {
      throw new Error(`Mining pool with id ${id} not found`);
    }

    // Apply updates to the existing pool
    const updatedPool: MiningPool = {
      ...currentPool,
      ...updates,
      // Ensure that optional fields that might be undefined are set to null
      website:
        updates.website !== undefined ? updates.website : currentPool.website,
      twitter:
        updates.twitter !== undefined ? updates.twitter : currentPool.twitter,
      nostr: updates.nostr !== undefined ? updates.nostr : currentPool.nostr,
      difficulty:
        updates.difficulty !== undefined
          ? updates.difficulty
          : currentPool.difficulty,
      networkHashrate:
        updates.networkHashrate !== undefined
          ? updates.networkHashrate
          : currentPool.networkHashrate,
      lastUpdated:
        updates.lastUpdated !== undefined
          ? updates.lastUpdated
          : currentPool.lastUpdated,
      isActive:
        updates.isActive !== undefined
          ? updates.isActive
          : currentPool.isActive,
      poolApiUrl:
        updates.poolApiUrl !== undefined
          ? updates.poolApiUrl
          : currentPool.poolApiUrl,
      hashrate:
        updates.hashrate !== undefined
          ? updates.hashrate
          : currentPool.hashrate,
      workers:
        updates.workers !== undefined ? updates.workers : currentPool.workers,
      hashHistory:
        updates.hashHistory !== undefined
          ? [...updates.hashHistory]
          : currentPool.hashHistory
            ? [...currentPool.hashHistory]
            : [0, 0, 0, 0, 0, 0, 0],
      testData:
        updates.testData !== undefined
          ? updates.testData
          : currentPool.testData,
      rank: updates.rank !== undefined ? updates.rank : currentPool.rank,
    };

    // Update the pool in storage
    this.pools.set(id, updatedPool);

    return updatedPool;
  }

  private initializeSampleData() {
    // Real mining pools with API endpoints - these get live data
    const realPools: InsertMiningPool[] = [
      {
        name: "Antarctic Mining Expedition",
        country: "Antarctica",
        city: "McMurdo Station",
        latitude: -77.8419,
        longitude: 166.6863,
        description:
          "The world's southernmost Bitcoin mining operation, utilizing renewable energy from McMurdo Station's geothermal sources. Our primary mission is to demonstrate sustainable Bitcoin mining in extreme environments.",
        avatar: "/antarctica.jpg",
        website: "https://antarcticabtc.org",
        twitter: "https://twitter.com/AntarcticBTC",
        nostr: "npub1antarctica...",
        createdAt: "2025-01-05 08:00:00",
        poolApiUrl: "https://public-pool.io:40557",
        isActive: true,
      },
      {
        name: "ATL Hash Force",
        country: "United States",
        city: "Atlanta",
        latitude: 33.749,
        longitude: -84.388,
        description:
          "ATL BitLab's strategic hashrate deployment squadron. Atlanta plebs unite!",
        avatar: "/atl-hash-force.jpg",
        website: "https://atlbitlab.com/",
        twitter: "https://x.com/atlbitlab",
        nostr:
          "https://primal.net/p/npub1cst99sheckxrllnh9pw093mls775tdx80x99mq096pkl2t9r9swqsugekj",
        createdAt: "2025-02-15 14:30:00",
        poolApiUrl: "http://pool.atlbitlab.com:3334",
        isActive: true,
      },
      {
        name: "Miami BTC Community",
        country: "United States",
        city: "Miami",
        latitude: 25.7617,
        longitude: -80.1918,
        description:
          "Keeping it real and hashing in the sunshine state. We got our own private table at the club girl.",
        avatar: "/bitcoin-blue.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        poolApiUrl: "http://miami.pool.atlbitlab.com:3334",
      },
    ];

    // Test mining pools with static data
    const testPools: InsertMiningPool[] = [
      {
        name: "Austin Community",
        country: "United States",
        city: "Austin",
        latitude: 30.2672,
        longitude: -97.7431,
        description: "Where's Austin's hashrate?",
        avatar: "/bitcoin-orange.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "Nashville Community",
        country: "United States",
        city: "Nashville",
        latitude: 36.1627,
        longitude: -86.7816,
        description: "Where's Nashville's hashrate?",
        avatar: "/bitcoin-purple.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "Denver Community",
        country: "United States",
        city: "Denver",
        latitude: 39.7392,
        longitude: -104.9903,
        description: "Where's Denver's hashrate?",
        avatar: "/bitcoin-red.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "Bay Area Community",
        country: "United States",
        city: "San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
        description: "Where's the Bay Area's hashrate?",
        avatar: "/bitcoin-orange.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "San Salvador Community",
        country: "El Salvador",
        city: "San Salvador",
        latitude: 13.6929,
        longitude: -89.2182,
        description: "Where's San Salvador's hashrate?",
        avatar: "/bitcoin-purple.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "Vinteum Community",
        country: "Brazil",
        city: "Rio de Janeiro",
        latitude: -22.9068,
        longitude: -43.1729,
        description: "Where's Vinteum's hashrate?",
        avatar: "/bitcoin-red.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "Berlin Community",
        country: "Germany",
        city: "Berlin",
        latitude: 52.52,
        longitude: 13.405,
        description: "Ach, wo ist mein hashrate?",
        avatar: "/bitcoin-blue.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
      {
        name: "Bitshala Community",
        country: "India",
        city: "Bangalore",
        latitude: 12.9716,
        longitude: 77.5946,
        description: "Where is Bangalore's hashrate?",
        avatar: "/bitcoin-orange.png",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "0 MH/s",
          workers: 0,
          hashHistory: [5, 4, 3, 2, 1, 0, 0],
        },
      },
    ];

    // Add real pools to storage
    realPools.forEach((pool, index) => {
      this.createMiningPool({
        ...pool,
        rank: index + 1, // Initial rank based on order
      });
    });

    // Add test pools to storage
    testPools.forEach((pool, index) => {
      this.createMiningPool({
        ...pool,
        rank: index + realPools.length + 1, // Continue ranking after real pools
      });
    });
  }
}

export const storage = new MemStorage();
