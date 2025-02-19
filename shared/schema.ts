import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accessCodes = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  accessCodeId: integer("access_code_id").notNull(),
  deviceFingerprint: text("device_fingerprint").notNull(),
  lastActive: timestamp("last_active").notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  contractAddress: text("contract_address").notNull(),
  walletAddress: text("wallet_address").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  value: text("value").notNull(), // Store as string due to large numbers
  marketCap: text("market_cap").notNull(),
});

export const insertAccessCodeSchema = createInsertSchema(accessCodes).omit({
  id: true,
  isActive: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  lastActive: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
});

export type AccessCode = typeof accessCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertAccessCode = z.infer<typeof insertAccessCodeSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export const loginSchema = z.object({
  accessCode: z.string().min(1),
  deviceFingerprint: z.string().min(1),
});

export const contractAddressSchema = z.object({
  address: z.string().regex(/^[A-HJ-NP-Za-km-z1-9]*$/, "Invalid Solana address"),
});

export const filterSchema = z.object({
  marketCapMin: z.string().optional(),
  marketCapMax: z.string().optional(),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  valueMin: z.string().optional(),
  valueMax: z.string().optional(),
  maxTransactionsPerMinute: z.number().optional(),
});
