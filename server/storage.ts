import {
  type AccessCode,
  type Session,
  type WalletTransaction,
  type InsertAccessCode,
  type InsertSession,
  type InsertWalletTransaction,
} from "@shared/schema";

export interface IStorage {
  // Access code methods
  getAccessCode(code: string): Promise<AccessCode | undefined>;
  createAccessCode(code: InsertAccessCode): Promise<AccessCode>;

  // Session methods
  getSession(deviceFingerprint: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSessionActivity(id: number): Promise<void>;
  invalidateOtherSessions(accessCodeId: number, currentSessionId: number): Promise<void>;

  // Transaction methods
  getTransactions(
    contractAddress: string,
    filters: {
      marketCapMin?: string;
      marketCapMax?: string;
      timeStart?: Date;
      timeEnd?: Date;
      valueMin?: string;
      valueMax?: string;
      maxTransactionsPerMinute?: number;
    }
  ): Promise<WalletTransaction[]>;
  createTransaction(tx: InsertWalletTransaction): Promise<WalletTransaction>;
}

export class MemStorage implements IStorage {
  private accessCodes: Map<number, AccessCode>;
  private sessions: Map<number, Session>;
  private transactions: Map<number, WalletTransaction>;
  private currentId: { [key: string]: number };

  constructor() {
    this.accessCodes = new Map();
    this.sessions = new Map();
    this.transactions = new Map();
    this.currentId = {
      accessCodes: 1,
      sessions: 1,
      transactions: 1,
    };

    // Initialize with a test access code
    this.createAccessCode({ code: "TEST123" });
  }

  async getAccessCode(code: string): Promise<AccessCode | undefined> {
    const normalizedCode = code.trim().toUpperCase();
    const codes = Array.from(this.accessCodes.values());
    console.log("Available access codes:", codes);
    return codes.find(ac => ac.code.trim().toUpperCase() === normalizedCode);
  }

  async createAccessCode(code: InsertAccessCode): Promise<AccessCode> {
    const id = this.currentId.accessCodes++;
    const accessCode: AccessCode = { ...code, id, isActive: true };
    this.accessCodes.set(id, accessCode);
    console.log("Created new access code:", accessCode);
    console.log("Current access codes:", Array.from(this.accessCodes.values()));
    return accessCode;
  }

  async getSession(deviceFingerprint: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      s => s.deviceFingerprint === deviceFingerprint
    );
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = this.currentId.sessions++;
    const newSession: Session = {
      ...session,
      id,
      lastActive: new Date(),
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateSessionActivity(id: number): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActive = new Date();
      this.sessions.set(id, session);
    }
  }

  async invalidateOtherSessions(accessCodeId: number, currentSessionId: number): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.accessCodeId === accessCodeId && id !== currentSessionId) {
        this.sessions.delete(id);
      }
    }
  }

  async getTransactions(
    contractAddress: string,
    filters: {
      marketCapMin?: string;
      marketCapMax?: string;
      timeStart?: Date;
      timeEnd?: Date;
      valueMin?: string;
      valueMax?: string;
      maxTransactionsPerMinute?: number;
    }
  ): Promise<WalletTransaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(
      tx => tx.contractAddress === contractAddress
    );

    if (filters.marketCapMin) {
      transactions = transactions.filter(
        tx => BigInt(tx.marketCap) >= BigInt(filters.marketCapMin!)
      );
    }

    if (filters.marketCapMax) {
      transactions = transactions.filter(
        tx => BigInt(tx.marketCap) <= BigInt(filters.marketCapMax!)
      );
    }

    if (filters.timeStart) {
      transactions = transactions.filter(
        tx => tx.timestamp >= filters.timeStart!
      );
    }

    if (filters.timeEnd) {
      transactions = transactions.filter(
        tx => tx.timestamp <= filters.timeEnd!
      );
    }

    if (filters.valueMin) {
      transactions = transactions.filter(
        tx => BigInt(tx.value) >= BigInt(filters.valueMin!)
      );
    }

    if (filters.valueMax) {
      transactions = transactions.filter(
        tx => BigInt(tx.value) <= BigInt(filters.valueMax!)
      );
    }

    if (filters.maxTransactionsPerMinute) {
      // Group by wallet and check transaction frequency
      const walletGroups = new Map<string, WalletTransaction[]>();
      transactions.forEach(tx => {
        const group = walletGroups.get(tx.walletAddress) || [];
        group.push(tx);
        walletGroups.set(tx.walletAddress, group);
      });

      const validWallets = new Set<string>();
      walletGroups.forEach((txs, wallet) => {
        const maxTxPerMinute = Math.max(
          ...txs.map((tx, i) => {
            if (i === 0) return 0;
            const prevTx = txs[i - 1];
            const timeDiff = (tx.timestamp.getTime() - prevTx.timestamp.getTime()) / 1000 / 60;
            return 1 / timeDiff;
          })
        );

        if (maxTxPerMinute <= filters.maxTransactionsPerMinute!) {
          validWallets.add(wallet);
        }
      });

      transactions = transactions.filter(tx => validWallets.has(tx.walletAddress));
    }

    return transactions;
  }

  async createTransaction(tx: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = this.currentId.transactions++;
    const transaction: WalletTransaction = { ...tx, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();