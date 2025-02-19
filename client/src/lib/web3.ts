import { Connection } from "@solana/web3.js";

export const connection = new Connection("https://api.mainnet-beta.solana.com");

export function isValidSolanaAddress(address: string): boolean {
  return /^[A-HJ-NP-Za-km-z1-9]*$/.test(address);
}

export async function fetchTokenInfo(address: string) {
  try {
    // Fetch token metadata and market data
    // This is a placeholder - real implementation would use proper Solana APIs
    return {
      symbol: "MEME",
      name: "Memecoin",
      marketCap: "1000000",
      price: "0.01"
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    throw error;
  }
}
