
import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { useThemeStore } from '@/hooks/useThemeStore';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useTradeStore } from '@/hooks/useTradeStore';

interface AccountEquityCurveProps {
  account: {
    id: string;
    name: string;
    currency: string;
    balance: number;
    initialBalance: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Define interfaces for the chart data points
interface EquityDataPoint {
  date: string;
  balance: number;
  index: number;
  tradeId?: string;
}

interface ProjectionDataPoint {
  date: string;
  index: number;
  bestCaseBalance: number;
  worstCaseBalance: number;
  isProjection: boolean;
}

// Union type for combined chart data
type ChartDataPoint = EquityDataPoint | ProjectionDataPoint;

const AccountEquityCurve: React.FC<AccountEquityCurveProps> = ({ account }) => {
  const { getThemeColors } = useThemeStore();
  const { trades, setAccountFilter } = useTradeStore();
  const colors = getThemeColors();
  const [curveType, setCurveType] = useState<'stepAfter' | 'monotone' | 'linear'>('stepAfter');
  const [showProjections, setShowProjections] = useState<boolean>(false);

  // Apply account filter when component mounts or account changes
  useEffect(() => {
    if (account && account.id) {
      setAccountFilter(account.id);
    }
    
    // Clean up filter when component unmounts
    return () => {
      setAccountFilter(null);
    };
  }, [account.id, setAccountFilter]);
  
  // Filter trades directly instead of using filteredTrades to ensure we only get this account's trades
  const accountTrades = useMemo(() => {
    return trades
      .filter(trade => trade.accountId === account.id && !trade.isPlaceholder)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
  }, [trades, account.id]);

  // Generate equity curve data using actual trades
  const equityData = useMemo(() => {
    // Always start with the initial balance
    const data: EquityDataPoint[] = [{
      date: new Date(account.createdAt).toISOString().split('T')[0],
      balance: account.initialBalance,
      index: 0
    }];
    
    if (accountTrades.length > 0) {
      let currentBalance = account.initialBalance;
      
      accountTrades.forEach((trade, index) => {
        // Calculate profit or loss based on trade data
        const profit = trade.size * trade.rMultiple;
        currentBalance += profit;
        
        const tradeDate = new Date(trade.entryDate).toISOString().split('T')[0];
        
        data.push({
          date: tradeDate,
          balance: parseFloat(currentBalance.toFixed(2)),
          index: index + 1,
          tradeId: trade.id
        });
      });
    }
    
    return data;
  }, [accountTrades, account.initialBalance, account.createdAt]);
  
  // Projection data for future performance (empty if projections are disabled)
  const projectionData = useMemo(() => {
    if (!showProjections || equityData.length <= 1) return [];
    
    const lastDataPoint = equityData[equityData.length - 1];
    const lastBalance = lastDataPoint.balance;
    const lastIndex = lastDataPoint.index;
    
    // Calculate average trade profit/loss
    if (equityData.length < 3) return [];
    
    let totalChange = 0;
    let changeCount = 0;
    
    for (let i = 2; i < equityData.length; i++) {
      totalChange += equityData[i].balance - equityData[i-1].balance;
      changeCount++;
    }
    
    if (changeCount === 0) return [];
    
    const avgChange = totalChange / changeCount;
    const volatility = Math.abs(avgChange) * 0.8;
    
    // Generate projections for next 30 trades
    const projections: ProjectionDataPoint[] = [];
    let projectedBalance = lastBalance;
    
    for (let i = 1; i <= 30; i++) {
      const optimisticChange = avgChange + (Math.random() * volatility);
      const pessimisticChange = avgChange - (Math.random() * volatility);
      
      const optimisticBalance = projectedBalance + optimisticChange;
      const pessimisticBalance = projectedBalance + pessimisticChange;
      
      // Create projection date
      const lastDate = new Date(lastDataPoint.date);
      lastDate.setDate(lastDate.getDate() + i);
      
      projections.push({
        date: lastDate.toISOString().split('T')[0],
        index: lastIndex + i,
        bestCaseBalance: parseFloat(optimisticBalance.toFixed(2)),
        worstCaseBalance: parseFloat(pessimisticBalance.toFixed(2)),
        isProjection: true
      });
      
      // Update the projected balance with the average
      projectedBalance = (optimisticBalance + pessimisticBalance) / 2;
    }
    
    return projections;
  }, [showProjections, equityData]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTick = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // Export chart as PNG
  const exportChart = () => {
    const svgElement = document.querySelector('.recharts-surface');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${account.name}-equity-curve.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  // Toggle projections
  const toggleProjections = () => {
    setShowProjections(!showProjections);
  };
  
  const isProfit = account.balance >= account.initialBalance;
  const lineColor = isProfit ? colors.positiveColor : colors.negativeColor;
  
  // Combine chart data with projections if enabled
  const combinedData: ChartDataPoint[] = showProjections && projectionData.length > 0
    ? [...equityData, ...projectionData]
    : equityData;

  // Calculate Y-axis domain to ensure account.initialBalance is the lowest point
  const yDomain = useMemo(() => {
    // Start with initialBalance as the minimum
    let min = account.initialBalance;
    let max = account.initialBalance;
    
    // Find the actual min and max in the data
    combinedData.forEach(point => {
      // Handle EquityDataPoint type
      if ('balance' in point) {
        if (point.balance < min) min = point.balance;
        if (point.balance > max) max = point.balance;
      }
      
      // Handle ProjectionDataPoint type
      if ('bestCaseBalance' in point) {
        if (point.bestCaseBalance > max) max = point.bestCaseBalance;
      }
      
      if ('worstCaseBalance' in point) {
        if (point.worstCaseBalance < min) min = point.worstCaseBalance;
      }
    });
    
    // Add minimal padding to the max (less space at top)
    const padding = (max - min) * 0.05;
    
    // Ensure the min is never higher than initialBalance with minimal bottom padding
    return [Math.min(min, account.initialBalance) - padding/2, max + padding];
  }, [combinedData, account.initialBalance]);
  
  return (
    <Card className="glass-effect h-full flex flex-col bg-black/30 backdrop-blur-md border-white/5 shadow-lg rounded-xl">
      <div className="flex flex-row items-center justify-between pb-0 p-4">
        <div className="flex items-center gap-2">
          {/* Chart Style Selector */}
          <Tabs 
            value={curveType} 
            onValueChange={(value: 'stepAfter' | 'monotone' | 'linear') => setCurveType(value)}
            className="ml-2"
          >
            <TabsList className="bg-muted/30 h-8">
              <TabsTrigger value="stepAfter" className="h-6 text-xs px-2">Step</TabsTrigger>
              <TabsTrigger value="monotone" className="h-6 text-xs px-2">Curved</TabsTrigger>
              <TabsTrigger value="linear" className="h-6 text-xs px-2">Linear</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Projection toggle */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Projections:</span>
            <Switch
              checked={showProjections}
              onCheckedChange={toggleProjections}
              className="data-[state=checked]:bg-muted/50"
            />
          </div>
          
          <Button variant="ghost" size="icon" onClick={exportChart} title="Export as PNG">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <CardContent className="flex-1 px-4 pb-2 pt-2">
        <div className="h-full w-full" style={{ minHeight: "280px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateTick}
                stroke="rgba(255,255,255,0.0)" // Hide axis line
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                stroke="rgba(255,255,255,0.0)" // Hide axis line
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                width={80}
                domain={yDomain}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Balance']}
                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  padding: '8px',
                }}
              />
              
              {/* Add reference line at initial balance */}
              <ReferenceLine 
                y={account.initialBalance} 
                stroke="#333333"
                strokeWidth={1}
                strokeDasharray="3 3"
                ifOverflow="extendDomain"
                label={{ 
                  value: `Initial: ${formatCurrency(account.initialBalance)}`, 
                  position: 'left',
                  fill: "rgba(255, 255, 255, 0.5)",
                  fontSize: 10 
                }}
              />
              
              {/* Line for actual balance */}
              <Line 
                type={curveType}
                dataKey="balance" 
                name="Balance" 
                stroke={lineColor} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              
              {/* Projection lines */}
              {showProjections && (
                <>
                  {/* Best case projection line */}
                  <Line
                    type={curveType}
                    dataKey="bestCaseBalance"
                    name="Best Case"
                    stroke="#F2FCE2" // Soft green
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                    dot={false}
                    activeDot={{ r: 4, stroke: "#F2FCE2", strokeWidth: 1, opacity: 0.7 }}
                    connectNulls={true}
                  />
                  
                  {/* Worst case projection line */}
                  <Line
                    type={curveType}
                    dataKey="worstCaseBalance"
                    name="Worst Case"
                    stroke="#ea384c" // Red
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                    dot={false}
                    activeDot={{ r: 4, stroke: "#ea384c", strokeWidth: 1, opacity: 0.7 }}
                    connectNulls={true}
                  />
                </>
              )}
              
              {/* Render a vertical line to indicate where actual data ends and projections begin */}
              {showProjections && projectionData.length > 0 && (
                <ReferenceLine 
                  x={equityData[equityData.length - 1].date} 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: "Projections →", 
                    position: "top", 
                    fill: "rgba(255, 255, 255, 0.7)", 
                    fontSize: 10 
                  }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountEquityCurve;
