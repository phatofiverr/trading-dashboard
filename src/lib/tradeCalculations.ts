
import { Trade, TradeStats } from "@/types/Trade";

/**
 * Calculate comprehensive statistics for a set of trades
 */
export const calculateTradeStats = (trades: Trade[]): TradeStats => {
  if (trades.length === 0) {
    return {
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
  }

  const winningTrades = trades.filter(t => t.rMultiple > 0);
  const losingTrades = trades.filter(t => t.rMultiple < 0);
  const breakEvenTrades = trades.filter(t => t.rMultiple === 0);

  const totalWinAmount = winningTrades.reduce((sum, t) => sum + t.rMultiple, 0);
  const totalLossAmount = Math.abs(losingTrades.reduce((sum, t) => sum + t.rMultiple, 0));

  // Calculate max drawdown
  let maxDrawdown = 0;
  let peak = 0;
  let currentEquity = 0;

  trades
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .forEach(trade => {
      currentEquity += trade.rMultiple;
      
      if (currentEquity > peak) {
        peak = currentEquity;
      }
      
      const drawdown = peak - currentEquity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakEvenTrades: breakEvenTrades.length,
    breakEvenRate: (breakEvenTrades.length / trades.length) * 100,
    winRate: (winningTrades.length / trades.length) * 100,
    averageRMultiple: trades.reduce((sum, t) => sum + t.rMultiple, 0) / trades.length,
    totalProfit: trades.reduce((sum, t) => sum + t.rMultiple, 0),
    maxDrawdown,
    profitFactor: totalLossAmount === 0 ? totalWinAmount : totalWinAmount / totalLossAmount,
    expectancy: 
      (winningTrades.length / trades.length) * (totalWinAmount / winningTrades.length || 0) - 
      (losingTrades.length / trades.length) * (totalLossAmount / losingTrades.length || 0)
  };
};

/**
 * Apply filters to a set of trades
 */
export const applyTradeFilters = (trades: Trade[], filters: {
  session: string | null;
  entryType: string | null;
  obType: string | null;
  timeframe: string | null;
  direction: string | null;
  dateRange: [Date | null, Date | null];
  strategy: string | null;
  pair?: string | null;
  strategyType?: string | null;
}): Trade[] => {
  return trades.filter(trade => {
    // Filter by strategy type first (live or backtest) - same logic as filterActions.ts
    if (filters.strategyType) {
      if (filters.strategyType === 'live') {
        // Live data mode: only show trades with "account" tag (created from account page)
        if (!trade.tags?.includes("account")) return false;
      } else if (filters.strategyType === 'backtest') {
        // Backtest mode: only show trades with "backtest" tag (created from strategy page)
        if (!trade.tags?.includes("backtest")) return false;
      }
    }
    
    if (filters.session && trade.session !== filters.session) return false;
    if (filters.entryType && trade.entryType !== filters.entryType) return false;
    if (filters.obType && trade.obType !== filters.obType) return false;
    if (filters.timeframe && (trade.entryTimeframe !== filters.timeframe && trade.timeframe !== filters.timeframe)) return false;
    if (filters.direction && trade.direction !== filters.direction.toLowerCase()) return false;
    if (filters.strategy && trade.strategyId !== filters.strategy) return false;
    // Add pair filter
    if (filters.pair && (trade.instrument || trade.pair) !== filters.pair) return false;
    
    const entryDate = new Date(trade.entryDate);
    if (filters.dateRange[0] && entryDate < filters.dateRange[0]) return false;
    if (filters.dateRange[1] && entryDate > filters.dateRange[1]) return false;
    
    return true;
  });
};

/**
 * Calculate the maximum consecutive losing trades
 */
export const calculateMaxConsecutiveLosses = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  
  let maxConsecutiveLosses = 0;
  let currentStreak = 0;
  
  // Sort trades by date
  const sortedTrades = [...trades]
    .filter(trade => !trade.isPlaceholder)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
  
  sortedTrades.forEach(trade => {
    if (trade.rMultiple < 0) {
      currentStreak++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxConsecutiveLosses;
};

/**
 * Calculate the Sharpe Ratio (assuming risk-free rate = 0)
 */
export const calculateSharpeRatio = (trades: Trade[]): number => {
  if (trades.length < 2) return 0;
  
  const rMultiples = trades
    .filter(trade => !trade.isPlaceholder)
    .map(trade => trade.rMultiple);
  
  const meanReturn = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
  
  const squaredDeviations = rMultiples.map(r => Math.pow(r - meanReturn, 2));
  const variance = squaredDeviations.reduce((sum, dev) => sum + dev, 0) / rMultiples.length;
  const stdDev = Math.sqrt(variance);
  
  // Avoid division by zero
  if (stdDev === 0) return 0;
  
  // Sharpe Ratio = (Mean Return - Risk Free Rate) / Standard Deviation
  // With risk-free rate = 0
  return meanReturn / stdDev;
};

/**
 * Calculate the Sortino Ratio (focuses only on downside risk)
 */
export const calculateSortinoRatio = (trades: Trade[]): number => {
  if (trades.length < 2) return 0;
  
  const rMultiples = trades
    .filter(trade => !trade.isPlaceholder)
    .map(trade => trade.rMultiple);
  
  const meanReturn = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
  
  // Only consider negative returns (below target = 0) for downside risk
  const negativeDifferences = rMultiples
    .filter(r => r < 0)
    .map(r => Math.pow(r, 2));
  
  if (negativeDifferences.length === 0) {
    // Special case: no negative returns
    return meanReturn > 0 ? 10 : 0; // Cap at 10 instead of Infinity for display purposes
  }
  
  const downsideRisk = Math.sqrt(
    negativeDifferences.reduce((sum, diff) => sum + diff, 0) / negativeDifferences.length
  );
  
  // Avoid division by zero
  if (downsideRisk === 0) return 0;
  
  // Sortino Ratio = (Mean Return - Risk Free Rate) / Downside Deviation
  // With risk-free rate = 0
  return meanReturn / downsideRisk;
};
