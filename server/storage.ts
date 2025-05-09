import { users, type User, type InsertUser, miningPools, type MiningPool, type InsertMiningPool } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mining Pool Methods
  getAllMiningPools(): Promise<MiningPool[]>;
  getMiningPool(id: number): Promise<MiningPool | undefined>;
  createMiningPool(pool: InsertMiningPool): Promise<MiningPool>;
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
    const pool: MiningPool = { ...insertPool, id };
    this.pools.set(id, pool);
    return pool;
  }

  private initializeSampleData() {
    const samplePools: InsertMiningPool[] = [
      {
        name: "Tokyo Bitcoin Hub",
        country: "Japan",
        city: "Tokyo",
        latitude: 35.6895,
        longitude: 139.6917,
        description: "Tokyo Bitcoin Hub is a community-driven mining pool established in 2018 by the Tokyo Bitcoin Meetup. We focus on sustainable mining practices and operate with 80% renewable energy from local hydroelectric sources.",
        hashrate: "23.4 PH/s",
        rank: 3,
        workers: 142,
        avatar: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://tokyobitcoinhub.com",
        twitter: "https://twitter.com/tokyobtc",
        nostr: "npub1t0ky0hub...",
        hashHistory: [40, 60, 45, 55, 65, 70, 90],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.tokyobitcoin.jp:3334",
        isActive: true
      },
      {
        name: "Berlin Miners Collective",
        country: "Germany",
        city: "Berlin",
        latitude: 52.5200,
        longitude: 13.4050,
        description: "A community of Bitcoin enthusiasts that operates a mining pool in the heart of Berlin. Established in 2019, we run our operations using green energy and contribute to Bitcoin education.",
        hashrate: "15.7 PH/s",
        rank: 5,
        workers: 94,
        avatar: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://berlinminers.org",
        twitter: "https://twitter.com/berlinminers",
        nostr: "npub1berlin...",
        hashHistory: [30, 35, 45, 50, 48, 60, 65],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.berlinminers.de:3334",
        isActive: true
      },
      {
        name: "New York Hash Collective",
        country: "United States",
        city: "New York",
        latitude: 40.7128,
        longitude: -74.0060,
        description: "Based in NYC, our collective brings together tech entrepreneurs and Bitcoin believers who maintain a mining operation in upstate New York powered by hydroelectric energy.",
        hashrate: "31.2 PH/s",
        rank: 2,
        workers: 178,
        avatar: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://nyhash.com",
        twitter: "https://twitter.com/nyhash",
        nostr: "npub1nyhash...",
        hashHistory: [65, 70, 68, 75, 80, 85, 90],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.nyhash.com:3334",
        isActive: true
      },
      {
        name: "Cape Town BTC Miners",
        country: "South Africa",
        city: "Cape Town",
        latitude: -33.9249,
        longitude: 18.4241,
        description: "The first community mining pool in South Africa, we leverage solar energy for our operations and actively participate in educating local communities about Bitcoin.",
        hashrate: "8.5 PH/s",
        rank: 8,
        workers: 63,
        avatar: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://capetownbtc.co.za",
        twitter: "https://twitter.com/capetownbtc",
        nostr: null,
        hashHistory: [20, 25, 30, 35, 40, 45, 50],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.capetownbtc.co.za:3334",
        isActive: true
      },
      {
        name: "Singapore Bitcoin Club",
        country: "Singapore",
        city: "Singapore",
        latitude: 1.3521,
        longitude: 103.8198,
        description: "A consortium of Bitcoin enthusiasts and professionals in Singapore who operate a mining pool from a colocation facility with strong focus on security and efficiency.",
        hashrate: "19.8 PH/s",
        rank: 4,
        workers: 110,
        avatar: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://sgbitcoin.club",
        twitter: "https://twitter.com/sgbitcoin",
        nostr: "npub1sgbtc...",
        hashHistory: [40, 45, 50, 55, 60, 65, 70],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.sgbitcoin.club:3334",
        isActive: true
      },
      {
        name: "Prague Miners Guild",
        country: "Czech Republic",
        city: "Prague",
        latitude: 50.0755,
        longitude: 14.4378,
        description: "One of the oldest Bitcoin mining communities in Europe, established in 2013. We maintain a collaborative approach to mining and regularly host workshops for newcomers.",
        hashrate: "12.3 PH/s",
        rank: 6,
        workers: 87,
        avatar: "https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://praguebtc.cz",
        twitter: "https://twitter.com/pragueminers",
        nostr: null,
        hashHistory: [35, 38, 40, 42, 45, 48, 50],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.praguebtc.cz:3334",
        isActive: true
      },
      {
        name: "Melbourne Bitcoin Miners",
        country: "Australia",
        city: "Melbourne",
        latitude: -37.8136,
        longitude: 144.9631,
        description: "The largest community-driven mining pool in Australia, with a focus on sustainable energy and transparent operations for all participants.",
        hashrate: "10.5 PH/s",
        rank: 7,
        workers: 75,
        avatar: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://melbournebtc.com.au",
        twitter: "https://twitter.com/melbournebtc",
        nostr: "npub1melb...",
        hashHistory: [30, 32, 35, 40, 45, 48, 52],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.melbournebtc.com.au:3334",
        isActive: true
      },
      {
        name: "Sao Paulo BTC Collective",
        country: "Brazil",
        city: "Sao Paulo",
        latitude: -23.5505,
        longitude: -46.6333,
        description: "The first major Bitcoin mining collective in South America, promoting mining education and providing infrastructure for small miners across Brazil.",
        hashrate: "7.8 PH/s",
        rank: 9,
        workers: 58,
        avatar: "https://images.unsplash.com/photo-1543699565-003b8adda5fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://saopaulobtc.com.br",
        twitter: "https://twitter.com/spbtc",
        nostr: null,
        hashHistory: [15, 20, 25, 30, 35, 40, 45],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.saopaulobtc.com.br:3334",
        isActive: true
      },
      {
        name: "Amsterdam Bitcoin Pioneers",
        country: "Netherlands",
        city: "Amsterdam",
        latitude: 52.3676,
        longitude: 4.9041,
        description: "Started by the Amsterdam Bitcoin meetup group in 2017, this mining pool puts emphasis on decentralization and educational initiatives for the Dutch Bitcoin community.",
        hashrate: "14.2 PH/s",
        rank: 6,
        workers: 92,
        avatar: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://amsterdambtc.nl",
        twitter: "https://twitter.com/amsterdambtc",
        nostr: "npub1ams...",
        hashHistory: [35, 40, 45, 50, 55, 60, 65],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.amsterdambtc.nl:3334",
        isActive: true
      },
      {
        name: "Satoshi's Node Seoul",
        country: "South Korea",
        city: "Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        description: "Named in honor of Bitcoin's creator, this Seoul-based mining pool combines top-tier technical expertise with a commitment to Bitcoin's core principles.",
        hashrate: "42.1 PH/s",
        rank: 1,
        workers: 215,
        avatar: "https://images.unsplash.com/photo-1563770660941-10002a292fca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://satoshiseoul.kr",
        twitter: "https://twitter.com/satoshiseoul",
        nostr: "npub1seoul...",
        hashHistory: [75, 80, 85, 90, 95, 98, 100],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.satoshiseoul.kr:3334",
        isActive: true
      },
      {
        name: "ATL Hash Force",
        country: "United States",
        city: "Atlanta",
        latitude: 33.7490,
        longitude: -84.3880,
        description: "The premier Bitcoin mining collective in the southeastern United States, founded by the Atlanta Bitcoin community. We operate with a focus on renewable energy and community education.",
        hashrate: "1.17 PH/s",
        rank: 10,
        workers: 35,
        avatar: "https://images.unsplash.com/photo-1575503802870-45de6a6217c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&h=128",
        website: "https://atlhashforce.org",
        twitter: "https://twitter.com/atlhashforce",
        nostr: "npub1atl...",
        hashHistory: [10, 15, 20, 25, 30, 35, 40],
        createdAt: new Date().toISOString(),
        poolApiUrl: "http://pool.atlbitlab.com:3334",
        isActive: true
      }
    ];

    // Add each pool to the storage
    samplePools.forEach(pool => {
      this.createMiningPool(pool);
    });
  }
}

export const storage = new MemStorage();
