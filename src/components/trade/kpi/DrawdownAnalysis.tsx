
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trade } from '@/types/Trade';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { KPICard } from './BasicKPIs';
import { useThemeStore } from '@/hooks/useThemeStore';

interface DrawdownAnalysisProps {
  trades: Trade[];
}

const DrawdownAnalysis: React.FC<DrawdownAnalysisProps> = ({ trades }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  // Calculate maximum consecutive losing trades
  const calculateMaxConsecutiveLosses = (trades: Trade[]): number => {
    if (trades.length === 0) return 0;
    
    let maxConsecutiveLosses = 0;
    let currentStreak = 0;
    
    // Sort trades by date
    const sortedTrades = [...trades]
      .filter(trade => !trade.isPlaceholder)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
    sortedTrades.forEach(trade => {
      if (trade.rMultiple < 0) {
        currentStreak++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxConsecutiveLosses;
  };
  
  // Calculate time to recovery after drawdowns
  const calculateTimeToRecovery = (trades: Trade[]): { avgRecoveryDays: number; maxRecoveryDays: number } => {
    if (trades.length === 0) {
      return { avgRecoveryDays: 0, maxRecoveryDays: 0 };
    }
    
    const sortedTrades = [...trades]
      .filter(trade => !trade.isPlaceholder)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
    let cumulativeR = 0;
    let drawdownStart: Date | null = null;
    let recoveryTimes: number[] = [];
    let peak = 0;
    
    sortedTrades.forEach(trade => {
      cumulativeR += trade.rMultiple;
      
      if (cumulativeR > peak) {
        // New peak - if we were in drawdown, calculate recovery time
        if (drawdownStart) {
          const recoveryTime = (new Date(trade.entryDate).getTime() - drawdownStart.getTime()) / (1000 * 60 * 60 * 24);
          recoveryTimes.push(recoveryTime);
          drawdownStart = null;
        }
        peak = cumulativeR;
      } else if (cumulativeR < peak && !drawdownStart) {
        // Start of drawdown
        drawdownStart = new Date(trade.entryDate);
      }
    });
    
    // If there are no recovery periods detected
    if (recoveryTimes.length === 0) {
      return { avgRecoveryDays: 0, maxRecoveryDays: 0 };
    }
    
    const avgRecoveryDays = recoveryTimes.reduce((sum, days) => sum + days, 0) / recoveryTimes.length;
    const maxRecoveryDays = Math.max(...recoveryTimes);
    
    return { 
      avgRecoveryDays: Math.round(avgRecoveryDays), 
      maxRecoveryDays: Math.round(maxRecoveryDays) 
    };
  };
  
  // Prepare drawdown profile data using R-multiples instead of percentages
  const prepareDrawdownProfileData = (trades: Trade[]) => {
    if (trades.length === 0) {
      return [{ index: 1, drawdownR: 0, date: '' }];
    }
    
    const sortedTrades = [...trades]
      .filter(trade => !trade.isPlaceholder)
      .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    
    let peak = 0;
    let cumulativeR = 0;
    const drawdownData = []; // Removed the initial "Start" point
    
    sortedTrades.forEach((trade, index) => {
      cumulativeR += trade.rMultiple;
      
      if (cumulativeR > peak) {
        peak = cumulativeR;
      }
      
      // Calculate drawdown in R-multiples directly
      const drawdownR = peak - cumulativeR;
      
      const formattedDate = new Date(trade.entryDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      drawdownData.push({
        index: index + 1,
        drawdownR: drawdownR,
        date: formattedDate
      });
    });
    
    return drawdownData;
  };
  
  const maxConsecutiveLosses = calculateMaxConsecutiveLosses(trades);
  const { avgRecoveryDays, maxRecoveryDays } = calculateTimeToRecovery(trades);
  const drawdownProfileData = prepareDrawdownProfileData(trades);
  
  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-3 mb-3">
        <KPICard 
          title="Max Consecutive Losses" 
          value={maxConsecutiveLosses} 
        />
        <KPICard 
          title="Avg Recovery Time" 
          value={`${avgRecoveryDays} days`} 
        />
        <KPICard 
          title="Max Recovery Time" 
          value={`${maxRecoveryDays} days`} 
        />
      </div>
      
      <Card className="glass-effect flex-grow">
        <CardContent className="p-3">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={drawdownProfileData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <XAxis 
                  dataKey="date"
                  tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 9 }}
                  stroke="rgba(255, 255, 255, 0.12)"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={(value) => `${Math.abs(value)}R`}
                  tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 9 }}
                  stroke="transparent"
                  axisLine={false}
                  tickLine={false}
                  width={25}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}R`, 'Drawdown']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(26, 26, 26, 0.95)', 
                    borderColor: 'rgba(64, 64, 64, 0.2)',
                    color: '#F9FAFB',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.12)" />
                <Line 
                  type="monotone" 
                  dataKey="drawdownR" 
                  stroke={colors.negativeColor} 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: colors.negativeColor, strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawdownAnalysis;
