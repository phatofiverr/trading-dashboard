import { StateCreator } from "zustand";
import { GlobalState, StrategyState } from "./types";
import { Strategy } from "./types";
import { toast } from "sonner";
import { Trade, StrategyPerformance } from "@/types/Trade";
import { isTradeWin } from "./useTradesSlice";

export const createStrategySlice: StateCreator<
  GlobalState,
  [],
  [],
  StrategyState
> = (set, get) => ({
  // Create a new strategy
  createStrategy: async (name: string, type: 'live' | 'backtest' = 'live') => {
    try {
      // Basic validation
      if (!name) {
        throw new Error("Strategy name cannot be empty");
      }

      const existingStrategies = get().strategies;
      if (existingStrategies.some(s => s.name === name)) {
        throw new Error("Strategy with this name already exists");
      }

      // Create strategy object
      const newStrategy: Strategy = {
        id: crypto.randomUUID(),
        name, 
        type, // Use the type parameter, defaulting to 'live'
        createdAt: new Date().toISOString(),
      };

      // Add to strategy collection
      set(state => ({
        strategies: [...state.strategies, newStrategy],
        lastEntryDate: name, // Set last entry date to the strategy name for navigation
      }));

      toast.success(`Strategy "${name}" created successfully`);
      return newStrategy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create strategy";
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get unique strategy names, optionally filtered by type
  getUniqueStrategies: (type?: 'live' | 'backtest') => {
    const strategies = get().strategies;
    
    // If type is specified, filter by that type
    const filteredStrategies = type 
      ? strategies.filter(strategy => strategy.type === type)
      : strategies;
    
    return filteredStrategies.map(strategy => strategy.name);
  },

  // Delete strategy by name
  deleteStrategy: (name: string) => {
    try {
      const strategies = get().strategies;
      const strategyIndex = strategies.findIndex(s => s.name === name);
      
      if (strategyIndex === -1) {
        toast.error(`Strategy "${name}" not found`);
        return false;
      }
      
      // Filter out the strategy
      const updatedStrategies = strategies.filter(s => s.name !== name);
      
      // Update the store
      set({ strategies: updatedStrategies });
      
      toast.success(`Strategy "${name}" deleted`);
      return true;
    } catch (error) {
      console.error("Error deleting strategy:", error);
      toast.error("Failed to delete strategy");
      return false;
    }
  },

  // Duplicate a strategy
  duplicateStrategy: async (originalName: string, newName: string) => {
    try {
      const strategies = get().strategies;
      const originalStrategy = strategies.find(s => s.name === originalName);
      
      if (!originalStrategy) {
        toast.error(`Strategy "${originalName}" not found`);
        return false;
      }
      
      // Check if new name already exists
      if (strategies.some(s => s.name === newName)) {
        toast.error(`Strategy "${newName}" already exists`);
        return false;
      }
      
      // Create the duplicate strategy
      await get().createStrategy(newName, originalStrategy.type);
      
      toast.success(`Strategy duplicated as "${newName}"`);
      return true;
    } catch (error) {
      console.error("Error duplicating strategy:", error);
      toast.error("Failed to duplicate strategy");
      return false;
    }
  },

  // Fetch performance metrics for all strategies
  fetchAllStrategyPerformance: (type?: 'live' | 'backtest') => {
    const { trades, strategies } = get();
    
    // Create a map for efficient lookup
    const strategiesMap = new Map(strategies.map(s => [s.name, s]));
    
    // First collect performance for ALL strategies
    const performanceByStrategy: Record<string, {
      wins: number;
      losses: number;
      rProfit: number;
      tradeCount: number;
      lastTradeDate: Date | null;
      type: 'live' | 'backtest';
    }> = {};
    
    // Initialize empty performance records for all existing strategies
    // This ensures every strategy appears in the results even if it has no trades
    strategies.forEach(strategy => {
      if (!performanceByStrategy[strategy.name]) {
        performanceByStrategy[strategy.name] = {
          wins: 0,
          losses: 0,
          rProfit: 0,
          tradeCount: 0,
          lastTradeDate: null,
          type: strategy.type
        };
      }
    });
    
    // Process each trade
    for (const trade of trades) {
      if (!trade.strategyId) continue;
      
      // Initialize if first encounter (for strategies that might not be in the strategies list)
      if (!performanceByStrategy[trade.strategyId]) {
        // Determine if this is a backtest trade or a live trade
        const isBacktest = trade.tags?.includes("backtest");
        performanceByStrategy[trade.strategyId] = {
          wins: 0,
          losses: 0,
          rProfit: 0,
          tradeCount: 0,
          lastTradeDate: null,
          type: isBacktest ? 'backtest' : 'live'
        };
      }
      
      // Skip if trade is not complete
      if (!trade.exitTime) continue;
      
      // Update statistics
      const perf = performanceByStrategy[trade.strategyId];
      perf.tradeCount++;
      
      if (isTradeWin(trade)) {
        perf.wins++;
      } else {
        perf.losses++;
      }
      
      perf.rProfit += trade.rMultiple || 0;
      
      // Track last trade date
      const tradeDate = new Date(trade.exitTime || trade.entryTime);
      if (!perf.lastTradeDate || tradeDate > perf.lastTradeDate) {
        perf.lastTradeDate = tradeDate;
      }
    }
    
    // Convert to array, calculate win rates, and then filter by type
    const result = Object.entries(performanceByStrategy).map(([name, perf]) => {
      const winRate = perf.tradeCount > 0 ? (perf.wins / perf.tradeCount) * 100 : 0;
      
      // Get the strategy type from our map or from the performance record
      const strategyType = strategiesMap.get(name)?.type || perf.type || 'live';
      
      return {
        name,
        winRate,
        profit: perf.rProfit,
        tradesCount: perf.tradeCount,
        lastTradeDate: perf.lastTradeDate,
        type: strategyType
      } as StrategyPerformance;
    });
    
    // If a type was specified, filter the results
    return type ? result.filter(strategy => strategy.type === type) : result;
  }
});

// Export the StrategyState type
export type { StrategyState } from "./types";
