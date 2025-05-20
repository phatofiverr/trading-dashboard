import React from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { cn } from '@/lib/utils';

interface SimpleStatsDisplayProps {
  trades?: any[];
  currency?: string;
  className?: string;
  isAccountView?: boolean;
  style?: React.CSSProperties;
}

const SimpleStatsDisplay: React.FC<SimpleStatsDisplayProps> = ({ 
  trades,
  currency = 'USD',
  className,
  isAccountView = false,
  style
}) => {
  const { stats } = useTradeStore();
  
  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      signDisplay: 'always',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          <span className="text-base font-medium">{stats.totalTrades}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Win Rate</span>
          <span className="text-base font-medium">{stats.winRate.toFixed(1)}%</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Break Even Rate</span>
          <span className="text-base font-medium">{stats.breakEvenRate ? stats.breakEvenRate.toFixed(1) : "0.0"}%</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Avg R-Multiple</span>
          <span className="text-base font-medium">{stats.averageRMultiple.toFixed(2)}R</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Total P/L</span>
          <span className={`text-base font-medium ${stats.totalProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatCurrency(stats.totalProfit)}
          </span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Profit Factor</span>
          <span className="text-base font-medium">{stats.profitFactor.toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Expectancy</span>
          <span className="text-base font-medium">{stats.expectancy.toFixed(2)}R</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-muted-foreground mb-0.5">Max Drawdown</span>
          <span className="text-base font-medium">{stats.maxDrawdown.toFixed(2)}R</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleStatsDisplay;
