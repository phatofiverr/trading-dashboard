
/**
 * Utility functions to help with trade form initialization
 */

import { Trade } from "@/types/Trade";

/**
 * Returns initial trade data based on provided account or strategy ID
 */
export const getInitialTradeData = (
  initialAccountId?: string, 
  initialStrategyId?: string,
  initialTrade?: Trade
): Partial<Trade> => {
  if (initialTrade) {
    return initialTrade;
  }
  
  return {
    // Default values
    accountId: initialAccountId || null,
    strategyId: initialStrategyId || null,
    // Any other defaults
  };
};
