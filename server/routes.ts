import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Connection } from "@solana/web3.js";
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

  app.post("/api/login", async (req, res) => {
    try {
      const { accessCode, deviceFingerprint } = loginSchema.parse(req.body);
      
      const existingCode = await storage.getAccessCode(accessCode);
      if (!existingCode || !existingCode.isActive) {
        return res.status(401).json({ message: "Invalid access code" });
      }

      const existingSession = await storage.getSession(deviceFingerprint);
      if (existingSession) {
        await storage.updateSessionActivity(existingSession.id);
        return res.json({ message: "Session updated" });
      }

      const session = await storage.createSession({
        accessCodeId: existingCode.id,
        deviceFingerprint
      });

      await storage.invalidateOtherSessions(existingCode.id, session.id);

      res.json({ message: "Logged in successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { address } = contractAddressSchema.parse(req.body);
      const filters = filterSchema.parse(req.body.filters);

      // Fetch recent transactions for the contract
      const signatures = await solana.getSignaturesForAddress(
        address,
        { limit: 1000 }
      );

      const transactions = await storage.getTransactions(address, {
        ...filters,
        timeStart: filters.timeStart ? new Date(filters.timeStart) : undefined,
        timeEnd: filters.timeEnd ? new Date(filters.timeEnd) : undefined
      });

      res.json({ transactions });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
