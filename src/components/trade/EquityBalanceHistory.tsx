
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BalancePoint {
  date: string;
  balance: number;
  profit: number;
}

interface EquityBalanceHistoryProps {
  accountOnly?: boolean; // Determines if this component should be account-specific
}

const EquityBalanceHistory: React.FC<EquityBalanceHistoryProps> = ({ accountOnly = false }) => {
  const { trades, filteredTrades, stats: tradeStats, currentAccountId } = useTradeStore();
  const { accounts } = useAccountsStore();
  const [chartType, setChartType] = useState<'stepAfter' | 'monotone' | 'linear'>('stepAfter');

  // Get the current account if accountOnly is true
  const currentAccount = useMemo(() => {
    if (accountOnly && currentAccountId) {
      return accounts.find(acc => acc.id === currentAccountId);
    }
    return null;
  }, [accountOnly, currentAccountId, accounts]);

  // Process trades to create balance history data
  const balanceData = useMemo(() => {
    // Filter trades based on account if needed
    const tradesToProcess = filteredTrades.length > 0 ? filteredTrades : trades;
    
    if (tradesToProcess.length === 0) return [];
    
    // Sort trades by entry date
    const sortedTrades = [...tradesToProcess].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );
    
    // Get initial balance from current account or all accounts
    let initialBalance = 0;
    
    if (accountOnly && currentAccount) {
      initialBalance = currentAccount.initialBalance;
    } else if (accounts.length > 0) {
      initialBalance = accounts.reduce((sum, account) => sum + account.initialBalance, 0);
    }
    
    let currentBalance = initialBalance;
    let initialPoint: BalancePoint = {
      date: 'Initial',
      balance: initialBalance,
      profit: 0
    };
    
    // Create data points for each trade
    const points: BalancePoint[] = [initialPoint];
    sortedTrades.forEach(trade => {
      // Calculate profit in actual currency using R multiple and risk amount
      const riskAmount = parseFloat(trade.riskAmount?.toString() || '0');
      const profit = trade.rMultiple * (riskAmount > 0 ? riskAmount : 100); // Default to 100 if risk amount not set
      
      // Update balance
      currentBalance += profit;
      
      // Format date
      const date = new Date(trade.entryDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      points.push({
        date,
        balance: parseFloat(currentBalance.toFixed(2)),
        profit: parseFloat(profit.toFixed(2))
      });
    });
    
    return points;
  }, [trades, filteredTrades, accounts, currentAccount, accountOnly]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    const currency = accountOnly && currentAccount ? currentAccount.currency : 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate balance stats
  const balanceStats = useMemo(() => {
    if (balanceData.length <= 1) {
      return { currentBalance: 0, totalProfit: 0, percentageChange: 0 };
    }
    
    const initialBalance = balanceData[0].balance;
    const currentBalance = balanceData[balanceData.length - 1].balance;
    const totalProfit = currentBalance - initialBalance;
    const percentageChange = (totalProfit / initialBalance) * 100;
    
    return { 
      currentBalance, 
      totalProfit, 
      percentageChange: isNaN(percentageChange) ? 0 : percentageChange 
    };
  }, [balanceData]);

  // Calculate Y-axis domain to start from initial balance or lowest point
  const yAxisDomain = useMemo(() => {
    if (balanceData.length <= 1) return [0, 'auto'];
    
    const initialBalance = balanceData[0].balance;
    
    // Find the lowest balance point
    const lowestBalance = Math.min(...balanceData.map(point => point.balance));
    
    // If lowest balance is less than initial, round down to nearest hundred
    const minDomain = lowestBalance < initialBalance 
      ? Math.floor(lowestBalance / 100) * 100
      : initialBalance;
      
    return [minDomain, 'auto'];
  }, [balanceData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-lg">
          <p className="text-white text-xs">{`Date: ${payload[0].payload.date}`}</p>
          <p className="text-white text-xs">{`Balance: ${formatCurrency(payload[0].value)}`}</p>
          <p className={`text-xs ${payload[0].payload.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {`Profit: ${payload[0].payload.profit >= 0 ? '+' : ''}${formatCurrency(payload[0].payload.profit)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (balanceData.length <= 1) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-none shadow-lg">
        <CardContent className="p-4">
          <div className="h-[270px] w-full flex items-center justify-center">
            <p className="text-muted-foreground text-xs">Not enough trade data to display balance history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border-none shadow-lg">
      <CardContent className="pt-4 pb-2 px-4">
        <div className="flex items-center justify-between gap-2 mb-2 px-2">
          {/* Updated dropdown menu using SelectTrigger for visual consistency */}
          <div className="flex-shrink-0">
            <Select 
              value={chartType} 
              onValueChange={(value) => setChartType(value as 'stepAfter' | 'monotone' | 'linear')}
            >
              <SelectTrigger className="w-32 h-8 text-xs bg-black/30 border-white/5 hover:bg-black/40 focus:ring-0 rounded-md">
                <SelectValue placeholder="Chart Style" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 text-xs">
                <SelectItem value="stepAfter" className="text-xs">Step Chart</SelectItem>
                <SelectItem value="monotone" className="text-xs">Curved Chart</SelectItem>
                <SelectItem value="linear" className="text-xs">Linear Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center ml-auto gap-4 mr-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="text-sm font-medium">{formatCurrency(balanceStats.currentBalance)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total P/L</p>
              <p className={`text-sm font-medium ${balanceStats.totalProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                {balanceStats.totalProfit >= 0 ? '+' : ''}{formatCurrency(balanceStats.totalProfit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Change</p>
              <p className={`text-sm font-medium ${balanceStats.percentageChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                {balanceStats.percentageChange >= 0 ? '+' : ''}{balanceStats.percentageChange.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceData} margin={{ top: 20, right: 15, left: 0, bottom: 10 }}>
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.12)" 
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={yAxisDomain as any}
                stroke="transparent"
                tick={{ fill: '#999', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={value => formatCurrency(value)}
                width={70}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={balanceData[0].balance} stroke="#444" strokeDasharray="3 3" strokeOpacity={0.3} />
              <Line
                type={chartType}
                dataKey="balance"
                stroke="#FFF"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, stroke: '#FFF', strokeWidth: 1, fill: '#000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquityBalanceHistory;
