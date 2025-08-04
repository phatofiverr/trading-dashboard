
import { TradesState, FilterState } from "./types";

export const createFilterActions = (set: any, get: any) => ({
  setFilter: (key: string, value: any) => {
    set((state: TradesState) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  setPairFilter: (pair: string | null) => {
    set((state: TradesState) => ({
      filters: {
        ...state.filters,
        pair,
      },
    }));
  },

  setAccountFilter: (accountId: string | null) => {
    set((state: TradesState) => ({
      filters: {
        ...state.filters,
        accountId,
      },
    }));
  },

  applyFilters: () => {
    const { trades, filters } = get();

    let filtered = [...trades];

    // Filter by strategy type first (live or backtest)
    if (filters.strategyType) {
      filtered = filtered.filter(trade => {
        if (filters.strategyType === 'live') {
          // Live data mode: only show trades with "account" tag (created from account page)
          return trade.tags?.includes("account");
        } else {
          // Backtest mode: only show trades with "backtest" tag (created from strategy page)
          return trade.tags?.includes("backtest");
        }
      });
    }

    // Apply other filters
    if (filters.strategy) {
      filtered = filtered.filter(trade => trade.strategyId === filters.strategy);
    }

    if (filters.session) {
      filtered = filtered.filter(trade => trade.session === filters.session);
    }

    if (filters.entryType) {
      filtered = filtered.filter(trade => trade.entryType === filters.entryType);
    }

    if (filters.obType) {
      filtered = filtered.filter(trade => trade.obType === filters.obType);
    }

    if (filters.timeframe) {
      filtered = filtered.filter(
        trade => trade.entryTimeframe === filters.timeframe || trade.htfTimeframe === filters.timeframe
      );
    }

    if (filters.direction) {
      filtered = filtered.filter(
        trade => trade.direction.toLowerCase() === filters.direction?.toLowerCase()
      );
    }

    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = filters.dateRange[0];
      const endDate = filters.dateRange[1];

      filtered = filtered.filter(trade => {
        const tradeDate = new Date(trade.entryDate);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    if (filters.pair) {
      filtered = filtered.filter(trade => trade.pair === filters.pair);
    }

    if (filters.accountId) {
      filtered = filtered.filter(trade => trade.accountId === filters.accountId);
    }

    if (filters.tag) {
      filtered = filtered.filter(trade => trade.tags?.includes(filters.tag || ''));
    }

    set({ filteredTrades: filtered });
  },

  clearFilters: () => {
    set((state: TradesState) => ({
      filters: {
        ...initialFilterState,
        strategy: state.filters.strategy,
        strategyType: state.filters.strategyType,
      },
    }));
    get().applyFilters();
  },
});

// Initial filter state
export const initialFilterState: FilterState = {
  session: null,
  entryType: null,
  obType: null,
  timeframe: null,
  direction: null,
  dateRange: [null, null],
  strategy: null,
  pair: null,
  accountId: null,
  tag: null,
  strategyType: null,
};
