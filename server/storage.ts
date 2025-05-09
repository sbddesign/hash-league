import { users, type User, type InsertUser, miningPools, type MiningPool, type InsertMiningPool } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mining Pool Methods
  getAllMiningPools(): Promise<MiningPool[]>;
  getMiningPool(id: number): Promise<MiningPool | undefined>;
  createMiningPool(pool: InsertMiningPool): Promise<MiningPool>;
  updateMiningPool(id: number, updates: Partial<MiningPool>): Promise<MiningPool>;
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
      poolApiUrl: insertPool.poolApiUrl || null
    };
    
    const pool: MiningPool = poolData;
    this.pools.set(id, pool);
    return pool;
  }
  
  async updateMiningPool(id: number, updates: Partial<MiningPool>): Promise<MiningPool> {
    const currentPool = this.pools.get(id);
    if (!currentPool) {
      throw new Error(`Mining pool with id ${id} not found`);
    }
    
    // Apply updates to the existing pool
    const updatedPool: MiningPool = {
      ...currentPool,
      ...updates,
      // Ensure that optional fields that might be undefined are set to null
      website: updates.website !== undefined ? updates.website : currentPool.website,
      twitter: updates.twitter !== undefined ? updates.twitter : currentPool.twitter,
      nostr: updates.nostr !== undefined ? updates.nostr : currentPool.nostr,
      difficulty: updates.difficulty !== undefined ? updates.difficulty : currentPool.difficulty,
      networkHashrate: updates.networkHashrate !== undefined ? updates.networkHashrate : currentPool.networkHashrate,
      lastUpdated: updates.lastUpdated !== undefined ? updates.lastUpdated : currentPool.lastUpdated,
      isActive: updates.isActive !== undefined ? updates.isActive : currentPool.isActive,
      poolApiUrl: updates.poolApiUrl !== undefined ? updates.poolApiUrl : currentPool.poolApiUrl
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
        description: "The world's southernmost Bitcoin mining operation, utilizing renewable energy from McMurdo Station's geothermal sources. Our primary mission is to demonstrate sustainable Bitcoin mining in extreme environments.",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=Antarctica&backgroundColor=b6e3f4",
        website: "https://antarcticabtc.org",
        twitter: "https://twitter.com/AntarcticBTC",
        nostr: "npub1antarctica...",
        createdAt: "2025-01-05 08:00:00",
        poolApiUrl: "https://public-pool.io:40557",
        isActive: true
      },
      {
        name: "ATL Hash Force",
        country: "United States",
        city: "Atlanta",
        latitude: 33.7490,
        longitude: -84.3880,
        description: "The premier Bitcoin mining collective in the southeastern United States, founded by the Atlanta Bitcoin community. We operate with a focus on renewable energy and community education.",
        avatar: "https://images.unsplash.com/photo-1575503802870-45de6a6217c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://atlhashforce.org",
        twitter: "https://twitter.com/atlhashforce",
        nostr: "npub1atl...",
        createdAt: "2025-02-15 14:30:00",
        poolApiUrl: "http://pool.atlbitlab.com:3334",
        isActive: true
      }
    ];

    // Test mining pools with static data
    const testPools: InsertMiningPool[] = [
      {
        name: "Tokyo Bitcoin Hub",
        country: "Japan",
        city: "Tokyo",
        latitude: 35.6895,
        longitude: 139.6917,
        description: "Tokyo Bitcoin Hub is a community-driven mining pool established in 2018 by the Tokyo Bitcoin Meetup. We focus on sustainable mining practices and operate with 80% renewable energy from local hydroelectric sources.",
        avatar: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://tokyobitcoinhub.com",
        twitter: "https://twitter.com/tokyobtc",
        nostr: "npub1t0ky0hub...",
        createdAt: "2024-10-01 00:00:00",
        isActive: true,
        testData: {
          hashrate: "23.4 PH/s",
          workers: 142,
          hashHistory: [40, 60, 45, 55, 65, 70, 90]
        }
      },
      {
        name: "Berlin Miners Collective",
        country: "Germany",
        city: "Berlin",
        latitude: 52.5200,
        longitude: 13.4050,
        description: "A community of Bitcoin enthusiasts that operates a mining pool in the heart of Berlin. Established in 2019, we run our operations using green energy and contribute to Bitcoin education.",
        avatar: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://berlinminers.org",
        twitter: "https://twitter.com/berlinminers",
        nostr: "npub1berlin...",
        createdAt: "2024-09-15 00:00:00",
        isActive: true,
        testData: {
          hashrate: "15.7 PH/s",
          workers: 94,
          hashHistory: [30, 35, 45, 50, 48, 60, 65]
        }
      },
      {
        name: "New York Hash Collective",
        country: "United States",
        city: "New York",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "Based in NYC, our collective brings together tech entrepreneurs and Bitcoin believers who maintain a mining operation in upstate New York powered by hydroelectric energy.",
        avatar: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://nyhash.com",
        twitter: "https://twitter.com/nyhash",
        nostr: "npub1nyhash...",
        createdAt: "2024-08-20 00:00:00",
        isActive: true,
        testData: {
          hashrate: "31.2 PH/s",
          workers: 178,
          hashHistory: [65, 70, 68, 75, 80, 85, 90]
        }
      },
      {
        name: "Cape Town BTC Miners",
        country: "South Africa",
        city: "Cape Town",
        latitude: -33.9249,
        longitude: 18.4241,
        description: "The first community mining pool in South Africa, we leverage solar energy for our operations and actively participate in educating local communities about Bitcoin.",
        avatar: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://capetownbtc.co.za",
        twitter: "https://twitter.com/capetownbtc",
        nostr: null,
        createdAt: "2024-11-10 00:00:00",
        isActive: true,
        testData: {
          hashrate: "8.5 PH/s",
          workers: 63,
          hashHistory: [20, 25, 30, 35, 40, 45, 50]
        }
      },
      {
        name: "Singapore Bitcoin Club",
        country: "Singapore",
        city: "Singapore",
        latitude: 1.3521,
        longitude: 103.8198,
        description: "A consortium of Bitcoin enthusiasts and professionals in Singapore who operate a mining pool from a colocation facility with strong focus on security and efficiency.",
        avatar: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://sgbitcoin.club",
        twitter: "https://twitter.com/sgbitcoin",
        nostr: "npub1sgbtc...",
        createdAt: "2024-07-22 00:00:00",
        isActive: true,
        testData: {
          hashrate: "19.8 PH/s",
          workers: 110,
          hashHistory: [40, 45, 50, 55, 60, 65, 70]
        }
      },
      {
        name: "Prague Miners Guild",
        country: "Czech Republic",
        city: "Prague",
        latitude: 50.0755,
        longitude: 14.4378,
        description: "One of the oldest Bitcoin mining communities in Europe, established in 2013. We maintain a collaborative approach to mining and regularly host workshops for newcomers.",
        avatar: "https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://praguebtc.cz",
        twitter: "https://twitter.com/pragueminers",
        nostr: null,
        createdAt: "2024-06-30 00:00:00",
        isActive: true,
        testData: {
          hashrate: "12.3 PH/s",
          workers: 87,
          hashHistory: [35, 38, 40, 42, 45, 48, 50]
        }
      },
      {
        name: "Melbourne Bitcoin Miners",
        country: "Australia",
        city: "Melbourne",
        latitude: -37.8136,
        longitude: 144.9631,
        description: "The largest community-driven mining pool in Australia, with a focus on sustainable energy and transparent operations for all participants.",
        avatar: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://melbournebtc.com.au",
        twitter: "https://twitter.com/melbournebtc",
        nostr: "npub1melb...",
        createdAt: "2024-12-05 00:00:00",
        isActive: true,
        testData: {
          hashrate: "10.5 PH/s",
          workers: 75,
          hashHistory: [30, 32, 35, 40, 45, 48, 52]
        }
      },
      {
        name: "Sao Paulo BTC Collective",
        country: "Brazil",
        city: "Sao Paulo",
        latitude: -23.5505,
        longitude: -46.6333,
        description: "The first major Bitcoin mining collective in South America, promoting mining education and providing infrastructure for small miners across Brazil.",
        avatar: "https://images.unsplash.com/photo-1543699565-003b8adda5fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://saopaulobtc.com.br",
        twitter: "https://twitter.com/spbtc",
        nostr: null,
        createdAt: "2024-10-25 00:00:00",
        isActive: true,
        testData: {
          hashrate: "7.8 PH/s",
          workers: 58,
          hashHistory: [15, 20, 25, 30, 35, 40, 45]
        }
      },
      {
        name: "Amsterdam Bitcoin Pioneers",
        country: "Netherlands",
        city: "Amsterdam",
        latitude: 52.3676,
        longitude: 4.9041,
        description: "Started by the Amsterdam Bitcoin meetup group in 2017, this mining pool puts emphasis on decentralization and educational initiatives for the Dutch Bitcoin community.",
        avatar: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://amsterdambtc.nl",
        twitter: "https://twitter.com/amsterdambtc",
        nostr: "npub1ams...",
        createdAt: "2024-08-08 00:00:00",
        isActive: true,
        testData: {
          hashrate: "14.2 PH/s",
          workers: 92,
          hashHistory: [35, 40, 45, 50, 55, 60, 65]
        }
      },
      {
        name: "Satoshi's Node Seoul",
        country: "South Korea",
        city: "Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        description: "Named in honor of Bitcoin's creator, this Seoul-based mining pool combines top-tier technical expertise with a commitment to Bitcoin's core principles.",
        avatar: "https://images.unsplash.com/photo-1563770660941-10002a292fca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://satoshiseoul.kr",
        twitter: "https://twitter.com/satoshiseoul",
        nostr: "npub1seoul...",
        createdAt: "2024-09-03 00:00:00",
        isActive: true,
        testData: {
          hashrate: "42.1 PH/s",
          workers: 215,
          hashHistory: [75, 80, 85, 90, 95, 98, 100]
        }
      }
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
