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
  hashrate: text("hashrate").notNull(),
  rank: integer("rank").notNull(),
  workers: integer("workers").notNull(),
  avatar: text("avatar").notNull(),
  website: text("website"),
  twitter: text("twitter"),
  nostr: text("nostr"),
  hashHistory: json("hash_history").$type<number[]>().notNull(),
  createdAt: text("created_at").notNull()
});

export const insertMiningPoolSchema = createInsertSchema(miningPools).omit({
  id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMiningPool = z.infer<typeof insertMiningPoolSchema>;
export type MiningPool = typeof miningPools.$inferSelect;
