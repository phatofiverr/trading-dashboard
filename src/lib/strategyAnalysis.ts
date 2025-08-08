
import { Trade, StrategyPerformance } from "@/types/Trade";
import { calculateTradeProfit } from "./accountCalculations";

/**
 * Calculate performance metrics for all strategies
 */
export const calculateStrategyPerformance = (trades: Trade[]): StrategyPerformance[] => {
  if (!trades.length) return [];
  
  // Filter out placeholder trades for calculations
  const realTrades = trades.filter(trade => !trade.isPlaceholder);
  
  // Get unique strategy IDs (including from placeholder trades)
  const strategies = Array.from(new Set(trades.map(trade => trade.strategyId)));
  
  // Calculate performance metrics for each strategy
  return strategies.map(strategyId => {
    const strategyTrades = realTrades.filter(trade => trade.strategyId === strategyId);
    
    // Calculate win rate
    const winningTrades = strategyTrades.filter(t => t.rMultiple > 0);
    const winRate = strategyTrades.length > 0 
      ? (winningTrades.length / strategyTrades.length) * 100
      : 0;
    
    // Calculate total profit
    const profit = strategyTrades.reduce((sum, t) => sum + calculateTradeProfit(t), 0);
    
    // Get last trade date
    const sortedTrades = [...strategyTrades].sort(
      (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
    
    const lastTradeDate = sortedTrades.length > 0 ? new Date(sortedTrades[0].entryDate) : null;
    
    return {
      name: strategyId || 'Undefined',
      winRate,
      profit,
      tradesCount: strategyTrades.length,
      lastTradeDate
    };
  }).filter(s => s.name !== 'Undefined').sort((a, b) => b.profit - a.profit); // Filter out undefined strategies and sort by profit
};

/**
 * Get unique strategy names from trades
 */
export const getUniqueStrategies = (trades: Trade[], type: 'live' | 'backtest'): string[] => {
  // Filter trades by type
  const filteredTrades = trades.filter(trade => {
    if (type === 'live') {
      return trade.tags?.includes("account") || !trade.tags?.includes("backtest");
    } else {
      return trade.tags?.includes("backtest");
    }
  });
  
  // Include all strategies, even those with only placeholder trades
  const strategies = Array.from(new Set(filteredTrades.map(trade => trade.strategyId || '')))
    .filter(strategyId => strategyId !== '');
  
  return strategies;
};
