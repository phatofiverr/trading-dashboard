
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useParams } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';

// Cumulative Monthly Win Rate Card component
const CumulativeMonthlyWinRateCard = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { filteredTrades: trades } = useTradeStore();
  const { getThemeColorsForStrategy } = useThemeStore();
  const colors = getThemeColorsForStrategy(strategyId);
  
  const calculateCumulativeMonthlyStats = () => {
    if (!trades.length) return [];
    
    // Initialize with all months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = monthNames.map((month, index) => ({
      month,
      monthIndex: index,
      total: 0,
      won: 0,
      breakEven: 0,
      winRate: 0,
      breakEvenRate: 0
    }));
    
    // Populate data - aggregate by month only, ignoring year
    trades
      .filter(trade => !trade.isPlaceholder)
      .forEach(trade => {
        if (!trade.entryDate) return;
        
        const entryDate = new Date(trade.entryDate);
        const monthIndex = entryDate.getMonth();
        
        monthlyData[monthIndex].total++;
        
        if (trade.rMultiple > 0) {
          monthlyData[monthIndex].won++;
        } else if (trade.rMultiple === 0) {
          monthlyData[monthIndex].breakEven++;
        }
      });
    
    // Calculate win rates
    return monthlyData.map(month => ({
      ...month,
      winRate: month.total > 0 ? Math.round((month.won / month.total) * 100) : 0,
      breakEvenRate: month.total > 0 ? Math.round((month.breakEven / month.total) * 100) : 0
    }));
  };
  
  const monthlyStats = calculateCumulativeMonthlyStats();
  const isEmpty = !monthlyStats || monthlyStats.every(item => item.total === 0);
  
  return (
    <Card className="glass-effect col-span-1 md:col-span-2 h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-1 mb-2">
          <p className="text-sm text-muted-foreground">Monthly Win Rate</p>
        </div>
        <div className="flex-1" style={{ minHeight: "280px", maxHeight: "350px" }}>
          {!isEmpty ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyStats} 
                margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                barCategoryGap={20} // Consistent spacing between categories
                barGap={0} // No gap between bars in the same category
              >
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  height={20}
                  tickMargin={5}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                  width={30}
                  domain={[0, 'dataMax']}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "breakEvenRate") return [`${value}%`, 'Break Even Rate'];
                    return [`${value}%`, 'Win Rate'];
                  }}
                  labelFormatter={(month) => `${month}`}
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    borderColor: 'rgba(64, 64, 64, 0.3)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    color: '#F9FAFB',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar 
                  dataKey="winRate" 
                  name="Win Rate" 
                  fill={colors.winColor}
                  radius={[4, 4, 0, 0]}
                  minPointSize={2}
                />
                <Bar 
                  dataKey="breakEvenRate" 
                  name="Break Even Rate" 
                  fill={colors.breakEvenColor}
                  radius={[4, 4, 0, 0]}
                  minPointSize={2}
                />
              </BarChart>
            </ResponsiveContainer>
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

export default CumulativeMonthlyWinRateCard;
