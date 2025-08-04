
import { StateCreator } from "zustand";
import { TradesState } from "./useTradesSlice";
import { ImportExportState, GlobalState } from "./types";

export const createImportExportSlice: StateCreator<
  GlobalState,
  [],
  [],
  ImportExportState
> = (set, get) => ({
  exportAsJSON: async () => {
    // Convert trades to JSON string
    return JSON.stringify(get().trades, null, 2);
  },
  
  exportAsCSV: async (tradesOverride?: any[]) => {
    const trades = tradesOverride || get().trades;
    
    // Filter out placeholder trades
    const activeTrades = trades.filter(trade => !trade.isPlaceholder);
    
    if (activeTrades.length === 0) return "";
    
    // Get headers from the first active trade
    const headers = Object.keys(activeTrades[0]).filter(key => 
      key !== "id" && key !== "createdAt" && key !== "updatedAt"
    );
    
    // Create CSV header row
    let csv = headers.join(",") + "\n";
    
    // Add data rows
    activeTrades.forEach(trade => {
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
  }
});
