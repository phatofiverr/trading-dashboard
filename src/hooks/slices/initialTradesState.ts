
import { FilterState } from "./types";
import { TradeStats } from "@/types/Trade";

export const initialTradeStats: TradeStats = {
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  breakEvenTrades: 0,
  breakEvenRate: 0,
  winRate: 0,
  averageRMultiple: 0,
  totalProfit: 0,
  maxDrawdown: 0,
  profitFactor: 0,
  expectancy: 0
};

export const initialFilterState: FilterState = {
  session: null,
  entryType: null,
  obType: null,
  timeframe: null,
  direction: null,
  dateRange: [null, null],
  strategy: null,
  pair: null,
};
