import React from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountCalculations } from '@/hooks/useAccountCalculations';
import { cn } from '@/lib/utils';

interface SimpleStatsDisplayProps {
  accountId?: string; // Optional account ID to filter trades
  currency?: string;
  className?: string;
  isAccountView?: boolean;
  style?: React.CSSProperties;
}

const SimpleStatsDisplay: React.FC<SimpleStatsDisplayProps> = ({ 
  accountId,
  currency = 'USD',
  className,
  isAccountView = false,
  style
}) => {
  const { trades, filteredTrades } = useTradeStore();
  const { 
    getAccountTrades, 
    getTradeProfit, 
    formatCurrency,
    getPortfolioSummary
  } = useAccountCalculations();
  
  // Get relevant trades for calculations - ensure consistency with EquityBalanceHistory
  const relevantTrades = accountId ? getAccountTrades(accountId) : [];
  const tradesToUse = accountId ? relevantTrades : (filteredTrades.length > 0 ? filteredTrades : trades);
  
  
  // Calculate stats using centralized logic
  const calculateStats = () => {
    if (tradesToUse.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        breakEvenRate: 0,
        averageRMultiple: 0,
        totalProfit: 0,
        profitFactor: 0,
        expectancy: 0,
        maxDrawdown: 0
      };
    }
    
    const winningTrades = tradesToUse.filter(trade => getTradeProfit(trade) > 0);
    const losingTrades = tradesToUse.filter(trade => getTradeProfit(trade) < 0);
    const breakEvenTrades = tradesToUse.filter(trade => getTradeProfit(trade) === 0);
    
    const totalTrades = tradesToUse.length;
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const breakEvenRate = totalTrades > 0 ? (breakEvenTrades.length / totalTrades) * 100 : 0;
    
    // Calculate average R-multiple (still use rMultiple for this metric)
    const averageRMultiple = tradesToUse.reduce((sum, trade) => sum + trade.rMultiple, 0) / totalTrades;
    
    // Calculate total profit using centralized calculation
    const totalProfit = tradesToUse.reduce((sum, trade) => sum + getTradeProfit(trade), 0);
    
    // Calculate profit factor
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + getTradeProfit(trade), 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + getTradeProfit(trade), 0));
    const profitFactor = totalLossAmount === 0 ? totalWinAmount : totalWinAmount / totalLossAmount;
    
    // Calculate expectancy
    const avgWin = winningTrades.length > 0 ? totalWinAmount / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLossAmount / losingTrades.length : 0;
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let currentEquity = 0;
    
    tradesToUse
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
      .forEach(trade => {
        currentEquity += getTradeProfit(trade);
        
        if (currentEquity > peak) {
          peak = currentEquity;
        }
        
        const drawdown = peak - currentEquity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });
    
    return {
      totalTrades,
      winRate,
      breakEvenRate,
      averageRMultiple,
      totalProfit,
      profitFactor,
      expectancy,
      maxDrawdown
    };
  };
  
  const calculatedStats = calculateStats();
  
  
  // Format currency value using centralized formatter
  const formatCurrencyValue = (value: number) => {
    return formatCurrency(value, currency);
  };

  return (
    <div 
      className={cn(
        "bg-black/20 backdrop-blur-md border-none rounded-lg shadow-lg p-4 flex flex-col w-full", 
        className
      )}
      style={style}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Total Trades</span>
          <span className="text-base font-medium">{calculatedStats.totalTrades}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Win Rate</span>
          <span className="text-base font-medium">{calculatedStats.winRate.toFixed(1)}%</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Break Even Rate</span>
          <span className="text-base font-medium">{calculatedStats.breakEvenRate.toFixed(1)}%</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Avg R-Multiple</span>
          <span className="text-base font-medium">{calculatedStats.averageRMultiple.toFixed(2)}R</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Total P/L</span>
          <span className={`text-base font-medium ${calculatedStats.totalProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatCurrencyValue(calculatedStats.totalProfit)}
          </span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Profit Factor</span>
          <span className="text-base font-medium">{calculatedStats.profitFactor.toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Expectancy</span>
          <span className="text-base font-medium">{formatCurrencyValue(calculatedStats.expectancy)}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Max Drawdown</span>
          <span className="text-base font-medium">{formatCurrencyValue(calculatedStats.maxDrawdown)}</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleStatsDisplay;
