
import { Trade } from "@/types/Trade";

const DB_NAME = "trade_journal_db";
const TRADE_STORE = "trades";
const ACCOUNT_STORE = "accounts";
const DB_VERSION = 2; // Increased version for the new store

let db: IDBDatabase | null = null;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject(new Error("Could not open IndexedDB"));
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create trades store if it doesn't exist
      if (!db.objectStoreNames.contains(TRADE_STORE)) {
        const store = db.createObjectStore(TRADE_STORE, { keyPath: "id" });
        
        // Create indexes
        store.createIndex("tradeId", "tradeId", { unique: true });
        store.createIndex("instrument", "instrument", { unique: false });
        store.createIndex("direction", "direction", { unique: false });
        store.createIndex("entryDate", "entryDate", { unique: false });
        store.createIndex("session", "session", { unique: false });
        store.createIndex("entryType", "entryType", { unique: false });
        store.createIndex("accountId", "accountId", { unique: false });
        store.createIndex("strategyId", "strategyId", { unique: false });
      }
      
      // Create accounts store if it doesn't exist
      if (!db.objectStoreNames.contains(ACCOUNT_STORE)) {
        const accountStore = db.createObjectStore(ACCOUNT_STORE, { keyPath: "id" });
        
        // Create indexes
        accountStore.createIndex("name", "name", { unique: true });
      }
    };
  });
};

export const addTrade = async (trade: Partial<Trade>): Promise<Trade> => {
  await initDB();
  
  if (!db) {
    throw new Error("Database not initialized");
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([TRADE_STORE], "readwrite");
    const store = transaction.objectStore(TRADE_STORE);
    
    // Calculate R multiple based on entry, exit, and SL prices
    let rMultiple = 0;
    const slDistance = Math.abs(trade.entryPrice! - (trade.slPrice || trade.stopLoss || 0));
    
    if (slDistance > 0) {
      const priceChange = trade.exitPrice! - trade.entryPrice!;
      
      if (trade.direction === "long") {
        rMultiple = priceChange / slDistance;
      } else {
        rMultiple = -priceChange / slDistance;
      }
    }
    
    // Determine outcome based on R multiple
    let outcome: "win" | "loss" | "breakeven" = "breakeven";
    if (rMultiple > 0) outcome = "win";
    else if (rMultiple < 0) outcome = "loss";
    
    // Calculate percentage gain/loss
    const percentageGainLoss = ((trade.exitPrice! - trade.entryPrice!) / trade.entryPrice!) * 100 * (trade.direction === "long" ? 1 : -1);
    
    const newTrade: Trade = {
      ...trade as any, // Cast to any to prevent excess property errors
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rMultiple,
      outcome,
      percentageGainLoss,
      // Ensure required fields exist with defaults
      pair: trade.pair || trade.instrument || "",
      notes: trade.notes || "",
      setup: trade.setup || "",
      timeframe: trade.timeframe || trade.entryTimeframe || "",
      stopLoss: trade.stopLoss || 0,
      targetPrice: trade.targetPrice || 0,
      size: trade.size || 0,
      drawdown: trade.drawdown || 0,
      confluences: trade.confluences || [],
      images: trade.images || [],
      accountId: trade.accountId || null
    };
    
    const request = store.add(newTrade);
    
    request.onsuccess = () => {
      resolve(newTrade);
    };
    
    request.onerror = (event) => {
      reject(new Error("Failed to add trade"));
    };
  });
};

export const updateTrade = async (trade: Trade): Promise<Trade> => {
  await initDB();
  
  if (!db) {
    throw new Error("Database not initialized");
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([TRADE_STORE], "readwrite");
    const store = transaction.objectStore(TRADE_STORE);
    
    // Calculate R multiple based on entry, exit, and SL prices
    let rMultiple = 0;
    const slDistance = Math.abs(trade.entryPrice! - (trade.slPrice || trade.stopLoss || 0));
    
    if (slDistance > 0) {
      const priceChange = trade.exitPrice! - trade.entryPrice!;
      
      if (trade.direction === "long") {
        rMultiple = priceChange / slDistance;
      } else {
        rMultiple = -priceChange / slDistance;
      }
    }
    
    // Determine outcome based on R multiple
    let outcome: "win" | "loss" | "breakeven" = "breakeven";
    if (rMultiple > 0) outcome = "win";
    else if (rMultiple < 0) outcome = "loss";
    
    const updatedTrade = {
      ...trade,
      rMultiple,
      outcome,
      updatedAt: new Date().toISOString(),
      // Ensure required fields exist with defaults
      pair: trade.pair || trade.instrument || "",
      notes: trade.notes || "",
      setup: trade.setup || "",
      timeframe: trade.timeframe || trade.entryTimeframe || "",
      stopLoss: trade.stopLoss || 0,
      targetPrice: trade.targetPrice || 0,
      size: trade.size || 0,
      drawdown: trade.drawdown || 0,
      confluences: trade.confluences || [],
      images: trade.images || []
    };
    
    const request = store.put(updatedTrade);
    
    request.onsuccess = () => {
      resolve(updatedTrade);
    };
    
    request.onerror = (event) => {
      reject(new Error("Failed to update trade"));
    };
  });
};

export const deleteTrade = async (id: string): Promise<void> => {
  await initDB();
  
  if (!db) {
    throw new Error("Database not initialized");
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([TRADE_STORE], "readwrite");
    const store = transaction.objectStore(TRADE_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(new Error("Failed to delete trade"));
    };
  });
};

export const getAllTrades = async (): Promise<Trade[]> => {
  await initDB();
  
  if (!db) {
    throw new Error("Database not initialized");
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([TRADE_STORE], "readonly");
    const store = transaction.objectStore(TRADE_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const trades = request.result.map(trade => {
        // Ensure date fields are strings if they're Date objects
        return {
          ...trade,
          entryDate: typeof trade.entryDate === 'object' ? trade.entryDate.toISOString() : trade.entryDate,
          exitDate: typeof trade.exitDate === 'object' ? trade.exitDate.toISOString() : trade.exitDate,
          createdAt: trade.createdAt ? (typeof trade.createdAt === 'object' ? trade.createdAt.toISOString() : trade.createdAt) : undefined,
          updatedAt: trade.updatedAt ? (typeof trade.updatedAt === 'object' ? trade.updatedAt.toISOString() : trade.updatedAt) : undefined
        };
      });
      resolve(trades as Trade[]);
    };
    
    request.onerror = (event) => {
      reject(new Error("Failed to get trades"));
    };
  });
};

export const exportTradesAsJSON = async (): Promise<string> => {
  const trades = await getAllTrades();
  return JSON.stringify(trades, null, 2);
};

export const exportTradesAsCSV = async (): Promise<string> => {
  const trades = await getAllTrades();
  if (trades.length === 0) return "";
  
  // Get headers from the first trade
  const headers = Object.keys(trades[0]).filter(key => 
    key !== "id" && key !== "createdAt" && key !== "updatedAt"
  );
  
  // Create CSV header row
  let csv = headers.join(",") + "\n";
  
  // Add data rows
  trades.forEach(trade => {
    const row = headers.map(header => {
      const key = header as keyof typeof trade;
      const value = trade[key];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return "";
      } 
      else if (value instanceof Date) {
        return value.toISOString();
      }
      else if (Array.isArray(value)) {
        return `"${value.join("; ")}"`;
      }
      else if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value;
    });
    
    csv += row.join(",") + "\n";
  });
  
  return csv;
};
