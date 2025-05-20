
import { StateCreator } from "zustand";
import { GlobalState, TradesState, Strategy } from "./types";
import { initialTradeStats, initialFilterState } from "./initialTradesState";
import { createTradeActions } from "./tradeActions";
import { createFilterActions } from "./filterActions";
import { Trade } from "@/types/Trade";

// Change regular exports to "export type" for types
export type { GlobalState, TradesState } from "./types";
export type { FilterState } from "./types";

// Helper function to determine if a trade is profitable based on direction
export const isTradeWin = (trade: Trade): boolean => {
  if (trade.direction === 'long') {
    return trade.exitPrice > trade.entryPrice;
  } else if (trade.direction === 'short') {
    return trade.exitPrice < trade.entryPrice;
  }
  
  // Fallback to rMultiple if direction-based calculation isn't possible
  return trade.rMultiple > 0;
};

export const createTradesSlice: StateCreator<
  GlobalState,
  [],
  [],
  TradesState
> = (set, get) => ({
  // Initial state
  trades: [],
  filteredTrades: [],
  selectedTrade: null,
  isLoading: false,
  stats: initialTradeStats,
  filters: {
    ...initialFilterState,
    strategyType: null, // Add strategyType filter
  },
  currentAccountId: null, // Initialize currentAccountId
  strategies: [], // Initialize strategies array

  // Include all actions
  ...createTradeActions(set, get),
  ...createFilterActions(set, get),
});
