import { Trade } from "@/types/Trade";
import * as TradeDB from "@/lib/db";
import { toast } from "sonner";
import { calculateTradeStats, applyTradeFilters } from "@/lib/tradeCalculations";
import { formatDateToISOString } from "@/lib/dateUtils";
import { GlobalState } from "./types";
import { detectSession } from "@/components/trade/utils/sessionDetector";
import firebaseService from "@/services/firebaseService";

/**
 * Trade-related actions for the trade store
 */
export const createTradeActions = (set: Function, get: () => GlobalState) => ({
  fetchTrades: async () => {
    set({ isLoading: true });
    try {
      // Get current filters to determine context (account or strategy)
      const { filters, currentAccountId } = get();
      
      // Try to fetch from Firebase first, fall back to IndexedDB
      let trades: Trade[] = [];
      try {
        trades = await firebaseService.fetchTrades();
      } catch (firebaseError) {
        console.warn('Firebase fetch failed, using IndexedDB:', firebaseError);
        trades = await TradeDB.getAllTrades();
      }
      
      // Filter trades based on context (account or strategy)
      if (currentAccountId) {
        // In account view, only show trades for this account
        trades = trades.filter(trade => trade.accountId === currentAccountId);
      } else if (filters.strategy) {
        // In strategy view, only show trades for this strategy
        trades = trades.filter(trade => trade.strategyId === filters.strategy);
      }
      
      // Ensure all trades have a session value
      const tradesWithSessions = trades.map(trade => {
        if (!trade.session && trade.entryTime && trade.entryTimezone) {
          // Detect and add session if missing but has time info
          trade.session = detectSession(trade.entryTime, trade.entryTimezone);
        } else if (!trade.session) {
          // Use a default session if no time info exists
          trade.session = 'Unknown';
        }
        return trade;
      });
      
      const filteredTrades = applyTradeFilters(tradesWithSessions, get().filters);
      const stats = calculateTradeStats(filteredTrades);
      
      set({ trades: tradesWithSessions, filteredTrades, stats, isLoading: false });
    } catch (error) {
      console.error("Error fetching trades:", error);
      toast.error("Failed to fetch trades");
      set({ isLoading: false });
    }
  },
  
  setTrades: (trades: Trade[]) => {
    // Get current context (account or strategy)
    const { currentAccountId, filters } = get();
    
    // Filter trades based on context
    let contextTrades = trades;
    if (currentAccountId) {
      // In account view, only show trades for this account
      contextTrades = trades.filter(trade => trade.accountId === currentAccountId);
    } else if (filters.strategy) {
      // In strategy view, only show trades for this strategy
      contextTrades = trades.filter(trade => trade.strategyId === filters.strategy);
    }
    
    // Ensure all trades have session information
    const tradesWithSessions = contextTrades.map(trade => {
      if (!trade.session && trade.entryTime && trade.entryTimezone) {
        trade.session = detectSession(trade.entryTime, trade.entryTimezone);
      } else if (!trade.session) {
        trade.session = 'Unknown';
      }
      return trade;
    });
    
    const filteredTrades = applyTradeFilters(tradesWithSessions, get().filters);
    const stats = calculateTradeStats(filteredTrades);
    set({ trades: tradesWithSessions, filteredTrades, stats });
  },

  addTrade: async (trade: Partial<Trade>) => {
    set({ isLoading: true });
    try {
      // Get current context (account or strategy)
      const { currentAccountId, filters, strategies } = get();
      
      // Make sure we have the minimum required fields for a trade
      const newTradeData: Partial<Trade> = {
        ...trade,
        // If no strategy is explicitly selected, leave it undefined (don't default to "default")
        strategyId: trade.strategyId === "none" ? undefined : trade.strategyId,
        // Ensure account ID is properly set from context or trade data
        accountId: trade.accountId || currentAccountId || null,
        pair: trade.instrument || trade.pair || "Unknown",
        setup: trade.entryType || trade.setup || "",
        timeframe: trade.entryTimeframe || trade.timeframe || "Unknown",
        // Convert direction from "Long"/"Short" form to "long"/"short" as required by Trade type
        direction: typeof trade.direction === 'string' 
          ? (trade.direction.toLowerCase() as "long" | "short") 
          : "long",
        // Ensure dates are strings
        entryDate: formatDateToISOString(trade.entryDate),
        exitDate: formatDateToISOString(trade.exitDate),
        // Make sure to keep time data
        entryTime: trade.entryTime,
        entryTimezone: trade.entryTimezone || "UTC",
        // Ensure session is included - prioritize existing value, then detect
        session: trade.session || (trade.entryTime ? detectSession(
          trade.entryTime, 
          trade.entryTimezone || "UTC"
        ) : 'Unknown'),
        // Ensure tags are properly handled
        tags: trade.tags || []
      };
      
      // If using a strategy that doesn't exist yet, create it
      if (newTradeData.strategyId && 
          !strategies.some(s => s.name === newTradeData.strategyId) && 
          strategies.length > 0 && 
          newTradeData.strategyId !== "none") {
        // Only create strategy if it's not "none" and doesn't exist yet
        await get().createStrategy(newTradeData.strategyId, 'live');
      }
      
      const newTrade = await TradeDB.addTrade(newTradeData);
      
      // Auto-sync to Firestore
      firebaseService.saveTrade(newTrade).catch(error => {
        console.error('Failed to auto-sync trade to Firestore:', error);
      });
      
      // Only add this trade to the current state if it matches the current context
      let shouldAddToState = true;
      if (currentAccountId && newTrade.accountId !== currentAccountId) {
        shouldAddToState = false;
      } else if (filters.strategy && newTrade.strategyId !== filters.strategy) {
        shouldAddToState = false;
      }
      
      if (shouldAddToState) {
        const trades = [...get().trades, newTrade];
        const filteredTrades = applyTradeFilters(trades, get().filters);
        const stats = calculateTradeStats(filteredTrades);
        
        set({ 
          trades, 
          filteredTrades, 
          stats, 
          isLoading: false,
          lastEntryDate: newTradeData.entryDate,
        });
      } else {
        set({ isLoading: false });
      }
      
      toast.success("Trade added successfully");
      return newTrade;
    } catch (error) {
      console.error("Error adding trade:", error);
      toast.error("Failed to add trade: " + (error instanceof Error ? error.message : "Unknown error"));
      set({ isLoading: false });
      throw error;
    }
  },

  updateTrade: async (trade: Trade) => {
    set({ isLoading: true });
    try {
      // Get current context (account or strategy)
      const { currentAccountId, filters } = get();
      
      // Ensure session is set - prioritize existing value, then detect based on time
      if (!trade.session && trade.entryTime && trade.entryTimezone) {
        trade.session = detectSession(trade.entryTime, trade.entryTimezone);
      } else if (!trade.session) {
        trade.session = 'Unknown';
      }
      
      const updatedTrade = await TradeDB.updateTrade(trade);
      
      // Auto-sync to Firestore
      firebaseService.saveTrade(updatedTrade).catch(error => {
        console.error('Failed to auto-sync updated trade to Firestore:', error);
      });
      
      // Check if the updated trade matches the current context
      let shouldUpdateState = true;
      if (currentAccountId && updatedTrade.accountId !== currentAccountId) {
        shouldUpdateState = false;
      } else if (filters.strategy && updatedTrade.strategyId !== filters.strategy) {
        shouldUpdateState = false;
      }
      
      if (shouldUpdateState) {
        const trades = get().trades.map(t => t.id === updatedTrade.id ? updatedTrade : t);
        const filteredTrades = applyTradeFilters(trades, get().filters);
        const stats = calculateTradeStats(filteredTrades);
        
        set({ trades, filteredTrades, stats, isLoading: false, selectedTrade: null });
      } else {
        // If trade no longer matches context, remove it from state
        const trades = get().trades.filter(t => t.id !== updatedTrade.id);
        const filteredTrades = applyTradeFilters(trades, get().filters);
        const stats = calculateTradeStats(filteredTrades);
        
        set({ trades, filteredTrades, stats, isLoading: false, selectedTrade: null });
      }
      
      toast.success("Trade updated successfully");
    } catch (error) {
      console.error("Error updating trade:", error);
      toast.error("Failed to update trade");
      set({ isLoading: false });
    }
  },

  deleteTrade: async (id: string) => {
    set({ isLoading: true });
    try {
      await TradeDB.deleteTrade(id);
      
      // Delete from Firestore
      firebaseService.deleteTrade(id).catch(error => {
        console.error('Failed to delete trade from Firestore:', error);
      });
      
      const trades = get().trades.filter(t => t.id !== id);
      const filteredTrades = applyTradeFilters(trades, get().filters);
      const stats = calculateTradeStats(filteredTrades);
      
      set({ trades, filteredTrades, stats, isLoading: false, selectedTrade: null });
      toast.success("Trade deleted successfully");
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Failed to delete trade");
      set({ isLoading: false });
    }
  },

  selectTrade: (trade: Trade | null) => {
    set({ selectedTrade: trade });
  },
});
