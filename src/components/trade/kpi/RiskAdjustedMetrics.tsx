
import React, { useMemo } from 'react';
import { useThemeStore } from '@/hooks/useThemeStore';
import { Trade } from '@/types/Trade';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface RiskAdjustedMetricsProps {
  trades: Trade[];
}

const RiskAdjustedMetrics: React.FC<RiskAdjustedMetricsProps> = ({ trades }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  // Calculate Sharpe Ratio (assuming risk-free rate = 0)
  const calculateSharpeRatio = (trades: Trade[]): number => {
    if (trades.length < 2) return 0;
    
    const rMultiples = trades
      .filter(trade => !trade.isPlaceholder)
      .map(trade => trade.rMultiple);
    
    const meanReturn = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
    
    const squaredDeviations = rMultiples.map(r => Math.pow(r - meanReturn, 2));
    const variance = squaredDeviations.reduce((sum, dev) => sum + dev, 0) / rMultiples.length;
    const stdDev = Math.sqrt(variance);
    
    // Avoid division by zero
    if (stdDev === 0) return 0;
    
    // Sharpe Ratio = (Mean Return - Risk Free Rate) / Standard Deviation
    // With risk-free rate = 0
    return meanReturn / stdDev;
  };
  
  // Calculate Sortino Ratio (focuses only on downside risk)
  const calculateSortinoRatio = (trades: Trade[]): number => {
    if (trades.length < 2) return 0;
    
    const rMultiples = trades
      .filter(trade => !trade.isPlaceholder)
      .map(trade => trade.rMultiple);
    
    const meanReturn = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
    
    // Only consider negative returns (below target = 0) for downside risk
    const negativeDifferences = rMultiples
      .filter(r => r < 0)
      .map(r => Math.pow(r, 2));
    
    if (negativeDifferences.length === 0) {
      // Special case: no negative returns
      return meanReturn > 0 ? Number.POSITIVE_INFINITY : 0;
    }
    
    const downsideRisk = Math.sqrt(
      negativeDifferences.reduce((sum, diff) => sum + diff, 0) / negativeDifferences.length
    );
    
    // Avoid division by zero
    if (downsideRisk === 0) return 0;
    
    // Sortino Ratio = (Mean Return - Risk Free Rate) / Downside Deviation
    // With risk-free rate = 0
    return meanReturn / downsideRisk;
  };
  
  // Calculate MAR Ratio (annualized return / maximum drawdown)
  const calculateMARRatio = (trades: Trade[]): number => {
    if (trades.length < 2) return 0;
    
    const sortedTrades = [...trades]
      .filter(trade => !trade.isPlaceholder)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
    // Calculate total return
    const totalR = sortedTrades.reduce((sum, trade) => sum + trade.rMultiple, 0);
    
    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let cumulativeR = 0;
    
    sortedTrades.forEach(trade => {
      cumulativeR += trade.rMultiple;
      
      if (cumulativeR > peak) {
        peak = cumulativeR;
      }
      
      const drawdown = peak - cumulativeR;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // Avoid division by zero
    if (maxDrawdown === 0) return 0;
    
    // MAR Ratio = Total Return / Maximum Drawdown
    return totalR / maxDrawdown;
  };
  
  // Calculate Calmar Ratio (similar to MAR ratio but using annualized returns)
  const calculateCalmarRatio = (trades: Trade[]): number => {
    if (trades.length < 2) return 0;
    
    const sortedTrades = [...trades]
      .filter(trade => !trade.isPlaceholder)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
    // Calculate total return
    const totalR = sortedTrades.reduce((sum, trade) => sum + trade.rMultiple, 0);
    
    // Estimate trading period in years
    const firstDate = new Date(sortedTrades[0].entryDate);
    const lastDate = new Date(sortedTrades[sortedTrades.length - 1].entryDate);
    const tradingDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // If period is too short, use a minimum period of 30 days
    const tradingYears = Math.max(tradingDays / 365, 30/365);
    
    // Annualized return
    const annualizedReturn = Math.pow(1 + (totalR / sortedTrades.length), sortedTrades.length / tradingYears) - 1;
    
    // Calculate max drawdown (same as in MAR ratio)
    let peak = 0;
    let maxDrawdown = 0;
    let cumulativeR = 0;
    
    sortedTrades.forEach(trade => {
      cumulativeR += trade.rMultiple;
      
      if (cumulativeR > peak) {
        peak = cumulativeR;
      }
      
      const drawdown = peak - cumulativeR;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    // Avoid division by zero
    if (maxDrawdown === 0) return 0;
    
    // Calmar Ratio = Annualized Return / Maximum Drawdown
    return annualizedReturn / maxDrawdown;
  };
  
  const sharpeRatio = calculateSharpeRatio(trades);
  const sortinoRatio = calculateSortinoRatio(trades);
  const marRatio = calculateMARRatio(trades);
  const calmarRatio = calculateCalmarRatio(trades);
  
  // Define thresholds for each ratio
  const sharpeThreshold = 1.0;
  const sortinoThreshold = 1.0;
  const marThreshold = 0.5;
  const calmarThreshold = 0.5;
  
  // Mini chart component with minimal styling - now all line charts
  const MiniChart = ({ value, threshold }) => {
    const isPositive = value >= threshold;
    const color = isPositive ? colors.positiveColor : colors.negativeColor;
    
    // Generate dummy data for visualization
    const generateData = (currentValue: number) => {
      const data = [];
      for (let i = 0; i < 5; i++) {
        data.push({
          value: Math.max(0, currentValue * (0.7 + Math.random() * 0.6)),
        });
      }
      data.push({ value: currentValue });
      return data;
    };
    
    const data = useMemo(() => generateData(value), [value]);
    
    return (
      <ResponsiveContainer width="100%" height={18}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render a minimal KPI item
  const KpiItem = ({ label, value, threshold }) => {
    const isPositive = value >= threshold;
    const color = isPositive ? colors.positiveColor : colors.negativeColor;
    
    return (
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span 
            className="text-sm font-medium" 
            style={{ color }}
          >
            {typeof value === 'number' && isFinite(value) ? value.toFixed(2) : value}
          </span>
        </div>
        <MiniChart value={value} threshold={threshold} />
      </div>
    );
  };

  return (
    <div className="p-5 h-full rounded-lg bg-black/20 backdrop-blur-sm flex flex-col justify-between">
      <div className="space-y-6 flex-grow flex flex-col justify-evenly">
        <KpiItem 
          label="Sharpe Ratio" 
          value={sharpeRatio}
          threshold={sharpeThreshold} 
        />
        
        <KpiItem 
          label="Sortino Ratio" 
          value={typeof sortinoRatio === 'number' && isFinite(sortinoRatio) ? sortinoRatio : '∞'}
          threshold={sortinoThreshold} 
        />
        
        <KpiItem 
          label="MAR Ratio" 
          value={marRatio}
          threshold={marThreshold} 
        />
        
        <KpiItem 
          label="Calmar Ratio" 
          value={calmarRatio}
          threshold={calmarThreshold} 
        />
      </div>
    </div>
  );
};

export default RiskAdjustedMetrics;
