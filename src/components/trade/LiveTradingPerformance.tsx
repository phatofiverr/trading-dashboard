import React from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartLine } from 'lucide-react';

interface LiveTradingPerformanceProps {
  strategyId: string;
  className?: string;
}

const LiveTradingPerformance: React.FC<LiveTradingPerformanceProps> = ({ 
  strategyId,
  className 
}) => {
  const { accounts } = useAccountsStore();
  const { trades } = useTradeStore();

  // Skip if strategyId is "none" or undefined
  if (!strategyId || strategyId === "none") {
    return (
      <Card className={cn("bg-black/20 border-none rounded-lg shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <ChartLine className="h-4 w-4 mr-2" />
            Live Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-4 text-left">
            No strategy selected for live trading analysis.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get all account trades that use this strategy
  const strategicAccountTrades = trades.filter(
    trade => trade.strategyId === strategyId && trade.accountId
  );

  // Get relevant accounts
  const relevantAccountIds = [...new Set(strategicAccountTrades.map(trade => trade.accountId))];
  const relevantAccounts = accounts.filter(account => relevantAccountIds.includes(account.id));

  // Calculate performance metrics
  const totalTrades = strategicAccountTrades.length;
  const winningTrades = strategicAccountTrades.filter(t => t.rMultiple > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalProfit = strategicAccountTrades.reduce((sum, t) => sum + (t.profit || 0), 0);

  // Use account currencies
  const currencies = [...new Set(relevantAccounts.map(a => a.currency))];
  const primaryCurrency = currencies[0] || 'USD';

  // Format currency - fixed the type issue
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: primaryCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (strategicAccountTrades.length === 0) {
    return (
      <Card className={cn("bg-black/20 border-none rounded-lg shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <ChartLine className="h-4 w-4 mr-2" />
            Live Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-4 text-left">
            No live trading data available for this strategy.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-black/20 border-none rounded-lg shadow-lg", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <ChartLine className="h-4 w-4 mr-2" />
          Live Trading Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Live Trades</span>
            <span className="text-base font-medium">{totalTrades}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Win Rate</span>
            <span className="text-base font-medium">{winRate.toFixed(1)}%</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Total P/L</span>
            <span className={`text-base font-medium ${totalProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(totalProfit)}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Accounts</span>
            <span className="text-base font-medium">{relevantAccounts.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTradingPerformance;
