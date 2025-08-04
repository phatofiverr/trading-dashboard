import { useMemo } from 'react';
import { useTradeStore } from './useTradeStore';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export interface DemonWarningInfo {
  currentMonthCount: number;
  isWarningLevel: boolean;
  isCriticalLevel: boolean;
  warningMessage: string;
  remainingAllowed: number;
}

const WARNING_THRESHOLD = 7;  // Start warning users at 7 demons
const CRITICAL_THRESHOLD = 10; // Stop trading at 10 demons

export const useDemonWarning = (): DemonWarningInfo => {
  const { trades } = useTradeStore();
  
  const demonWarning = useMemo(() => {
    // Get current month range
    const now = new Date();
    const currentMonth = { 
      start: startOfMonth(now), 
      end: endOfMonth(now) 
    };
    
    // Filter trades from current month with behavioral tags
    const currentMonthTrades = trades.filter(trade => 
      trade.behavioralTags && 
      trade.behavioralTags.length > 0 &&
      isWithinInterval(new Date(trade.entryDate), currentMonth)
    );
    
    // Count total demons this month
    const currentMonthCount = currentMonthTrades.reduce((total, trade) => 
      total + (trade.behavioralTags?.length || 0), 0
    );
    
    const isWarningLevel = currentMonthCount >= WARNING_THRESHOLD;
    const isCriticalLevel = currentMonthCount >= CRITICAL_THRESHOLD;
    const remainingAllowed = Math.max(0, CRITICAL_THRESHOLD - currentMonthCount);
    
    let warningMessage = '';
    
    if (isCriticalLevel) {
      warningMessage = `🚨 STOP TRADING! You've committed ${currentMonthCount} demons this month. Take a break and review your trading plan.`;
    } else if (isWarningLevel) {
      warningMessage = `⚠️ Warning: ${currentMonthCount} demons this month. Only ${remainingAllowed} more before you should stop trading.`;
    } else if (currentMonthCount > 0) {
      warningMessage = `${currentMonthCount} demons this month. Stay disciplined! ${remainingAllowed} remaining before warning level.`;
    } else {
      warningMessage = 'No demons this month. Excellent discipline! 🎯';
    }
    
    return {
      currentMonthCount,
      isWarningLevel,
      isCriticalLevel,
      warningMessage,
      remainingAllowed
    };
  }, [trades]);
  
  return demonWarning;
};