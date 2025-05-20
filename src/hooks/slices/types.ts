
import { Trade, TradeStats, StrategyPerformance } from "@/types/Trade";

// Define a Strategy type
export interface Strategy {
  id: string;
  name: string;
  type: 'live' | 'backtest';  // Add type field
  createdAt: string;
}

export interface FilterState {
  session: string | null;
  entryType: string | null;
  obType: string | null;
  timeframe: string | null;
  direction: string | null;
  dateRange: [Date | null, Date | null];
  strategy: string | null;
  pair?: string | null;
  accountId?: string | null;  // Add accountId filter
  tag?: string | null;  // Add tag filter for filtering by "account" or "backtest"
  strategyType?: 'live' | 'backtest'; // Add strategy type filter
}

export interface TradesState {
  trades: Trade[];
  filteredTrades: Trade[];
  selectedTrade: Trade | null;
  isLoading: boolean;
  stats: TradeStats;
  filters: FilterState;
  currentAccountId: string | null;  // Define currentAccountId here only
  strategies: Strategy[]; // Add strategies array
  
  fetchTrades: () => Promise<void>;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Partial<Trade>) => Promise<Trade>;
  updateTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  selectTrade: (trade: Trade | null) => void;
  
  setFilter: (key: string, value: any) => void;
  setPairFilter: (pair: string | null) => void;
  setAccountFilter: (accountId: string | null) => void; // Add account filter setter
  applyFilters: () => void;
  clearFilters: () => void;
}

export interface StrategyState {
  createStrategy: (name: string, type: 'live' | 'backtest') => Promise<Strategy>;
  getUniqueStrategies: (type?: 'live' | 'backtest') => string[];
  deleteStrategy: (name: string) => boolean;
  duplicateStrategy: (originalName: string, newName: string) => Promise<boolean>;
  fetchAllStrategyPerformance: (type?: 'live' | 'backtest') => StrategyPerformance[];
}

export interface ImportExportState {
  exportAsJSON: () => Promise<string>;
  exportAsCSV: () => Promise<string>;
}

export interface GlobalState extends TradesState, StrategyState, ImportExportState {
  // Additional global state can be added here
  lastEntryDate?: string | null;
  setLastEntryDate: (date: string | null) => void;
  initialLoadComplete: boolean;
  setInitialLoadComplete: () => void;
  setCurrentAccountId: (accountId: string | null) => void;
}
