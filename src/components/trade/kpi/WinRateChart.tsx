
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { useTradeStore } from '@/hooks/useTradeStore';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useThemeStore } from '@/hooks/useThemeStore';

const WinRateChart: React.FC = () => {
  const { filteredTrades: trades } = useTradeStore();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  const calculateWinRates = () => {
    if (!trades.length) return [];
    
    const overall = { total: 0, won: 0, breakEven: 0 };
    const longs = { total: 0, won: 0, breakEven: 0 };
    const shorts = { total: 0, won: 0, breakEven: 0 };
    
    trades.forEach(trade => {
      // Overall stats
      overall.total++;
      if (trade.rMultiple > 0) overall.won++;
      else if (trade.rMultiple === 0) overall.breakEven++;
      
      // Direction-specific stats
      if (trade.direction === "long") {
        longs.total++;
        if (trade.rMultiple > 0) longs.won++;
        else if (trade.rMultiple === 0) longs.breakEven++;
      } else if (trade.direction === "short") {
        shorts.total++;
        if (trade.rMultiple > 0) shorts.won++;
        else if (trade.rMultiple === 0) shorts.breakEven++;
      }
    });
    
    // Calculate win rates and loss rates
    const calculateRates = (stats: typeof overall) => {
      const winRate = stats.total > 0 ? (stats.won / stats.total) * 100 : 0;
      const beRate = stats.total > 0 ? (stats.breakEven / stats.total) * 100 : 0;
      const lossRate = stats.total > 0 ? 100 - winRate - beRate : 0;
      
      return { winRate, beRate, lossRate };
    };
    
    const overallRates = calculateRates(overall);
    const longRates = calculateRates(longs);
    const shortRates = calculateRates(shorts);
    
    return [
      {
        name: 'Overall',
        winRate: parseFloat(overallRates.winRate.toFixed(1)),
        lossRate: parseFloat(overallRates.lossRate.toFixed(1)),
        breakEvenRate: parseFloat(overallRates.beRate.toFixed(1)),
        total: overall.total
      },
      {
        name: 'Long',
        winRate: parseFloat(longRates.winRate.toFixed(1)),
        lossRate: parseFloat(longRates.lossRate.toFixed(1)),
        breakEvenRate: parseFloat(longRates.beRate.toFixed(1)),
        total: longs.total
      },
      {
        name: 'Short',
        winRate: parseFloat(shortRates.winRate.toFixed(1)),
        lossRate: parseFloat(shortRates.lossRate.toFixed(1)),
        breakEvenRate: parseFloat(shortRates.beRate.toFixed(1)),
        total: shorts.total
      }
    ];
  };
  
  const chartData = calculateWinRates();
  const isEmpty = !chartData.length || chartData.every(item => item.total === 0);

  return (
    <Card className="glass-effect col-span-2">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-2">Win Rate by Direction</p>
        <div className="h-[180px] w-full">
          {!isEmpty ? (
            <ChartContainer
              config={{
                winRate: { color: colors.winColor },
                breakEvenRate: { color: "#F97316" },
                lossRate: { color: colors.negativeColor },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                  barCategoryGap={20}
                  barGap={0}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => (
                      <ChartTooltipContent 
                        active={active}
                        payload={payload}
                        labelFormatter={(value) => `${value} (${payload?.[0]?.payload?.total || 0} trades)`}
                      />
                    )}
                  />
                  <Bar 
                    dataKey="winRate" 
                    name="Win Rate" 
                    fill="var(--color-winRate)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="breakEvenRate" 
                    name="Break Even Rate" 
                    fill="var(--color-breakEvenRate)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="lossRate" 
                    name="Loss Rate" 
                    fill="var(--color-lossRate)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WinRateChart;
