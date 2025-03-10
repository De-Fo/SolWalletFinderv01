import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Connection, PublicKey } from "@solana/web3.js";
import { loginSchema, contractAddressSchema, filterSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const solana = new Connection("https://api.mainnet-beta.solana.com");

  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));

  // Change the dev endpoint to ensure proper access code creation
  app.post("/api/dev/create-access-code", async (req, res) => {
    try {
      // Clear any existing access code first
      const accessCode = await storage.createAccessCode({
        code: "TEST123"
      });
      console.log("Created access code:", accessCode);
      res.json({ accessCode });
    } catch (error) {
      console.error("Failed to create access code:", error);
      res.status(500).json({ message: "Failed to create access code" });
    }
  });

  // Update the login route to improve error handling and logging
  app.post("/api/login", async (req, res) => {
    try {
      console.log("Login attempt with body:", req.body);
      const { accessCode, deviceFingerprint } = loginSchema.parse(req.body);

      const existingCode = await storage.getAccessCode(accessCode);
      console.log("Found access code:", existingCode);

      if (!existingCode) {
        console.log("Access code not found for:", accessCode);
        return res.status(401).json({ message: "Access code not found" });
      }

      if (!existingCode.isActive) {
        console.log("Access code is inactive:", accessCode);
        return res.status(401).json({ message: "Access code is inactive" });
      }

      const existingSession = await storage.getSession(deviceFingerprint);
      console.log("Existing session:", existingSession);

      if (existingSession) {
        await storage.updateSessionActivity(existingSession.id);
        return res.json({ message: "Session updated" });
      }

      const session = await storage.createSession({
        accessCodeId: existingCode.id,
        deviceFingerprint
      });
      console.log("Created new session:", session);

      await storage.invalidateOtherSessions(existingCode.id, session.id);

      res.json({ message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { address } = contractAddressSchema.parse(req.body);
      const filters = filterSchema.parse(req.body.filters);

      // Fetch recent transactions for the contract
      const signatures = await solana.getSignaturesForAddress(
        new PublicKey(address),
        { limit: 1000 }
      );

      const transactions = await storage.getTransactions(address, {
        ...filters,
        timeStart: filters.timeStart ? new Date(filters.timeStart) : undefined,
        timeEnd: filters.timeEnd ? new Date(filters.timeEnd) : undefined
      });

      res.json({ transactions });
    } catch (error) {
      console.error("Transaction error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}