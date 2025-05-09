import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

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

  // Proxy endpoints for fetching pool data (to avoid CORS issues)
  app.get("/api/proxy/pool-info", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL parameter is required" });
      }

      const fetchUrl = `${url}/api/info`;
      console.log(`Proxying request to: ${fetchUrl}`);
      
      const response = await fetch(fetchUrl, { timeout: 5000 });
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      console.error("Error proxying pool info:", error);
      res.status(500).json({ message: "Failed to fetch pool info", error: error.message });
    }
  });

  app.get("/api/proxy/pool-chart", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL parameter is required" });
      }

      const fetchUrl = `${url}/api/info/chart`;
      console.log(`Proxying request to: ${fetchUrl}`);
      
      const response = await fetch(fetchUrl, { timeout: 5000 });
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      console.error("Error proxying pool chart:", error);
      res.status(500).json({ message: "Failed to fetch pool chart", error: error.message });
    }
  });

  app.get("/api/proxy/network-info", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL parameter is required" });
      }

      const fetchUrl = `${url}/api/network`;
      console.log(`Proxying request to: ${fetchUrl}`);
      
      const response = await fetch(fetchUrl, { timeout: 5000 });
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      console.error("Error proxying network info:", error);
      res.status(500).json({ message: "Failed to fetch network info", error: error.message });
    }
  });

  // Update mining pool data endpoint
  app.post("/api/mining-pools/:id/update", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const pool = await storage.getMiningPool(id);
      if (!pool) {
        return res.status(404).json({ message: "Mining pool not found" });
      }

      // Update the pool with the data from the request body
      const updatedPool = await storage.updateMiningPool(id, req.body);
      
      res.json(updatedPool);
    } catch (error) {
      console.error(`Error updating mining pool with id ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update mining pool" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
