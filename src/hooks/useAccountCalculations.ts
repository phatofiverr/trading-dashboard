import { useMemo } from 'react';
import { useTradeStore } from './useTradeStore';
import { useAccountsStore } from './useAccountsStore';
import {
  calculateTradeProfit,
  calculateAccountBalance,
  calculateAllAccountBalances,
  calculatePortfolioBalance,
  calculateDailyProfit,
  calculateDateRangeProfit,
  formatCurrency,
  formatPercentage,
  AccountBalance,
  validateTradeForCalculation
} from '@/lib/accountCalculations';

/**
 * Custom hook for centralized account and profit calculations
 * This provides a single source of truth for all balance and profit calculations
 */
export const useAccountCalculations = () => {
  const { trades, filteredTrades } = useTradeStore();
  const { accounts } = useAccountsStore();

  // Use filtered trades if available, otherwise use all trades
  const tradesToProcess = useMemo(() => {
    return filteredTrades.length > 0 ? filteredTrades : trades;
  }, [trades, filteredTrades]);

  // Calculate balances for all accounts
  const accountBalances = useMemo(() => {
    return calculateAllAccountBalances(accounts, tradesToProcess);
  }, [accounts, tradesToProcess]);

  // Calculate portfolio balance
  const portfolioBalance = useMemo(() => {
    return calculatePortfolioBalance(accounts, tradesToProcess);
  }, [accounts, tradesToProcess]);

  // Get balance for a specific account
  const getAccountBalance = (accountId: string): AccountBalance | null => {
    return accountBalances.find(balance => balance.accountId === accountId) || null;
  };

  // Get trades for a specific account
  const getAccountTrades = (accountId: string) => {
    const filtered = tradesToProcess.filter(trade => trade.accountId === accountId);
    console.log('getAccountTrades Debug:', {
      accountId,
      totalTrades: tradesToProcess.length,
      filteredCount: filtered.length,
      sampleTrades: tradesToProcess.slice(0, 3).map(t => ({
        id: t.id,
        accountId: t.accountId,
        hasAccountId: !!t.accountId
      }))
    });
    return filtered;
  };

  // Calculate profit for a specific trade
  const getTradeProfit = (trade: any): number => {
    if (!validateTradeForCalculation(trade)) return 0;
    return calculateTradeProfit(trade);
  };

  // Calculate today's profit
  const getTodayProfit = (accountId?: string): number => {
    const today = new Date();
    const relevantTrades = accountId 
      ? getAccountTrades(accountId)
      : tradesToProcess;
    
    return calculateDailyProfit(relevantTrades, today);
  };

  // Calculate profit for a date range
  const getDateRangeProfit = (startDate: Date, endDate: Date, accountId?: string): number => {
    const relevantTrades = accountId 
      ? getAccountTrades(accountId)
      : tradesToProcess;
    
    return calculateDateRangeProfit(relevantTrades, startDate, endDate);
  };

  // Format currency with proper error handling
  const formatCurrencyValue = (amount: number, currency: string = 'USD'): string => {
    return formatCurrency(amount, currency);
  };

  // Format percentage with proper error handling
  const formatPercentageValue = (percentage: number): string => {
    return formatPercentage(percentage);
  };

  // Get account summary with all relevant metrics
  const getAccountSummary = (accountId: string) => {
    const balance = getAccountBalance(accountId);
    const accountTrades = getAccountTrades(accountId);
    const todayProfit = getTodayProfit(accountId);

    if (!balance) return null;

    const winningTrades = accountTrades.filter(trade => getTradeProfit(trade) > 0);
    const losingTrades = accountTrades.filter(trade => getTradeProfit(trade) < 0);
    const winRate = accountTrades.length > 0 ? (winningTrades.length / accountTrades.length) * 100 : 0;

    return {
      ...balance,
      totalTrades: accountTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      todayProfit
    };
  };

  // Get portfolio summary
  const getPortfolioSummary = () => {
    const totalTrades = tradesToProcess.length;
    const winningTrades = tradesToProcess.filter(trade => getTradeProfit(trade) > 0);
    const losingTrades = tradesToProcess.filter(trade => getTradeProfit(trade) < 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const todayProfit = getTodayProfit();

    return {
      ...portfolioBalance,
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      todayProfit
    };
  };

  return {
    // Core calculations
    accountBalances,
    portfolioBalance,
    
    // Helper functions
    getAccountBalance,
    getAccountTrades,
    getTradeProfit,
    getTodayProfit,
    getDateRangeProfit,
    
    // Formatting functions
    formatCurrency: formatCurrencyValue,
    formatPercentage: formatPercentageValue,
    
    // Summary functions
    getAccountSummary,
    getPortfolioSummary,
    
    // Raw data
    trades: tradesToProcess,
    accounts
  };
};
