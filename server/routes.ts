import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for mining pools
  app.get("/api/mining-pools", async (req, res) => {
    try {
      const pools = await storage.getAllMiningPools();
      res.json(pools);
    } catch (error) {
      console.error("Error fetching mining pools:", error);
      res.status(500).json({ message: "Failed to fetch mining pools" });
    }
  });

  app.get("/api/mining-pools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const pool = await storage.getMiningPool(id);
      if (!pool) {
        return res.status(404).json({ message: "Mining pool not found" });
      }

      res.json(pool);
    } catch (error) {
      console.error(`Error fetching mining pool with id ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch mining pool" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
