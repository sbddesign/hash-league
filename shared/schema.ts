import { pgTable, text, serial, integer, boolean, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema still maintained for authentication if needed later
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Mining Pool Schema
export const miningPools = pgTable("mining_pools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description").notNull(),
  avatar: text("avatar").notNull(),
  website: text("website"),
  twitter: text("twitter"),
  nostr: text("nostr"),
  createdAt: text("created_at").notNull(),
  isActive: boolean("is_active").default(true),
  
  // Live data fields (updated in real-time)
  hashrate: text("hashrate").default('0 H/s'),
  workers: integer("workers").default(0),
  hashHistory: json("hash_history").$type<number[]>().default([0,0,0,0,0,0,0]),
  rank: integer("rank").default(0),
  lastUpdated: text("last_updated"),
  networkHashrate: text("network_hashrate"),
  difficulty: text("difficulty"),
  
  // For real pools: API endpoint to fetch real-time data
  poolApiUrl: text("pool_api_url"),
  
  // For test pools: test data to display
  testData: json("test_data").$type<{
    hashrate: string, 
    workers: number,
    hashHistory: number[]
  }>(),
});

export const insertMiningPoolSchema = createInsertSchema(miningPools).omit({
  id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMiningPool = z.infer<typeof insertMiningPoolSchema>;
export type MiningPool = typeof miningPools.$inferSelect;
