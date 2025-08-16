import { Trade } from '@/types/Trade';
import { TradingAccount } from '@/hooks/useAccountsStore';

export interface AccountBalance {
  accountId: string;
  initialBalance: number;
  currentBalance: number;
  totalProfit: number;
  profitPercentage: number;
  currency: string;
}

export interface TradeProfit {
  tradeId: string;
  profit: number;
  profitPercentage: number;
  isWinning: boolean;
}

/**
 * Calculate profit for a single trade
 * This is the single source of truth for profit calculations
 */
export const calculateTradeProfit = (trade: Trade): number => {
  // Priority order for profit calculation:
  // 1. Use trade.profit if explicitly set (direct dollar amount)
  // 2. Calculate from riskAmount * rMultiple (proper trading formula)
  // 3. Fallback to 0 if insufficient data
  
  if (trade.profit !== undefined && trade.profit !== null && isFinite(trade.profit)) {
    return trade.profit;
  }
  
  // Standard trading calculation: profit = risk × R-multiple
  if (trade.riskAmount && !isNaN(parseFloat(trade.riskAmount)) && isFinite(trade.rMultiple)) {
    const riskAmount = parseFloat(trade.riskAmount);
    return riskAmount * trade.rMultiple;
  }
  
  // Fallback: insufficient data to calculate profit
  return 0;
};

/**
 * Calculate profit percentage for a trade
 */
export const calculateTradeProfitPercentage = (trade: Trade, initialBalance: number): number => {
  if (initialBalance <= 0) return 0;
  
  const profit = calculateTradeProfit(trade);
  const percentage = (profit / initialBalance) * 100;
  
  // Prevent infinite values
  if (!isFinite(percentage)) return 0;
  
  return percentage;
};

/**
 * Calculate account balance and profit from trades
 */
export const calculateAccountBalance = (
  account: TradingAccount, 
  accountTrades: Trade[]
): AccountBalance => {
  const initialBalance = account.initialBalance || 0;
  
  // Calculate total profit from all trades
  const totalProfit = accountTrades.reduce((sum, trade) => {
    return sum + calculateTradeProfit(trade);
  }, 0);
  
  // Calculate current balance
  const currentBalance = initialBalance + totalProfit;
  
  // Calculate profit percentage
  let profitPercentage = 0;
  if (initialBalance > 0) {
    profitPercentage = (totalProfit / initialBalance) * 100;
    // Prevent infinite values
    if (!isFinite(profitPercentage)) {
      profitPercentage = 0;
    }
  }
  
  return {
    accountId: account.id,
    initialBalance,
    currentBalance,
    totalProfit,
    profitPercentage,
    currency: account.currency
  };
};

/**
 * Calculate balances for all accounts
 */
export const calculateAllAccountBalances = (
  accounts: TradingAccount[],
  allTrades: Trade[]
): AccountBalance[] => {
  return accounts.map(account => {
    const accountTrades = allTrades.filter(trade => trade.accountId === account.id);
    return calculateAccountBalance(account, accountTrades);
  });
};

/**
 * Calculate total portfolio balance across all accounts
 */
export const calculatePortfolioBalance = (
  accounts: TradingAccount[],
  allTrades: Trade[]
): AccountBalance => {
  const accountBalances = calculateAllAccountBalances(accounts, allTrades);
  
  const totalInitialBalance = accountBalances.reduce((sum, balance) => sum + balance.initialBalance, 0);
  const totalCurrentBalance = accountBalances.reduce((sum, balance) => sum + balance.currentBalance, 0);
  const totalProfit = accountBalances.reduce((sum, balance) => sum + balance.totalProfit, 0);
  
  let totalProfitPercentage = 0;
  if (totalInitialBalance > 0) {
    totalProfitPercentage = (totalProfit / totalInitialBalance) * 100;
    if (!isFinite(totalProfitPercentage)) {
      totalProfitPercentage = 0;
    }
  }
  
  return {
    accountId: 'portfolio',
    initialBalance: totalInitialBalance,
    currentBalance: totalCurrentBalance,
    totalProfit,
    profitPercentage: totalProfitPercentage,
    currency: 'USD' // Default currency for portfolio
  };
};

/**
 * Calculate daily profit for a specific date
 */
export const calculateDailyProfit = (
  trades: Trade[],
  date: Date
): number => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return trades.reduce((sum, trade) => {
    // Use exitDate if available, otherwise use entryDate (same logic as DailyStats)
    const tradeDate = new Date(trade.exitDate || trade.entryDate);
    tradeDate.setHours(0, 0, 0, 0);
    
    if (tradeDate.getTime() === targetDate.getTime()) {
      return sum + calculateTradeProfit(trade);
    }
    return sum;
  }, 0);
};

/**
 * Calculate profit for a date range
 */
export const calculateDateRangeProfit = (
  trades: Trade[],
  startDate: Date,
  endDate: Date
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return trades.reduce((sum, trade) => {
    const tradeDate = new Date(trade.entryDate);
    if (tradeDate >= start && tradeDate <= end) {
      return sum + calculateTradeProfit(trade);
    }
    return sum;
  }, 0);
};

/**
 * Format currency with proper handling of edge cases
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  // Handle edge cases
  if (!isFinite(amount)) return '0.00';
  if (isNaN(amount)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage with proper handling of edge cases
 */
export const formatPercentage = (percentage: number): string => {
  // Handle edge cases
  if (!isFinite(percentage)) return '0.00%';
  if (isNaN(percentage)) return '0.00%';
  
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
};

/**
 * Validate trade data for calculations
 */
export const validateTradeForCalculation = (trade: Trade): boolean => {
  // Check if trade has required fields (entryPrice can be 0, so check for null/undefined)
  if (trade.entryPrice === null || trade.entryPrice === undefined || 
      trade.exitPrice === null || trade.exitPrice === undefined) return false;
  
  // Check if prices are valid numbers
  if (isNaN(trade.entryPrice) || isNaN(trade.exitPrice)) return false;
  
  // Check if rMultiple is finite
  if (!isFinite(trade.rMultiple)) return false;
  
  // Check if profit is finite (if it exists)
  if (trade.profit !== undefined && trade.profit !== null && !isFinite(trade.profit)) return false;
  
  return true;
};
