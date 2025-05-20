
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createTradesSlice } from "./slices/useTradesSlice";
import { createImportExportSlice } from "./slices/useImportExportSlice";
import { createStrategySlice } from "./slices/useStrategySlice";
import { GlobalState } from "./slices/types";

// Add lastEntryDate to the store types
export type TradeStore = GlobalState;

export const useTradeStore = create<TradeStore>()(
  persist(
    (...params) => ({
      ...createTradesSlice(...params),
      ...createImportExportSlice(...params),
      ...createStrategySlice(...params),
      lastEntryDate: null, // Initialize the lastEntryDate field
      setLastEntryDate: (date) => params[0](() => ({ lastEntryDate: date })),
      initialLoadComplete: false, // Add flag to track initial load
      setInitialLoadComplete: () => params[0](() => ({ initialLoadComplete: true })),
      setCurrentAccountId: (accountId) => params[0](() => ({ currentAccountId: accountId })),
    }),
    {
      name: 'trade-store',  // Add storage name
      partialize: (state) => ({
        // Only persist these fields
        strategies: state.strategies,
        initialLoadComplete: state.initialLoadComplete,
      }),
    }
  )
);
