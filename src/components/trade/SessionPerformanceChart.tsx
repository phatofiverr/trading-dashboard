
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { metricDescriptions } from './constants/formConstants';
import { useThemeStore } from '@/hooks/useThemeStore';
import { isTradeWin } from '@/hooks/slices/useTradesSlice';

// Define the type for session statistics
export interface SessionStat {
  total: number;
  winRate: number;
  breakEvenRate: number;
  lossRate: number;
  won: number;
  breakEven: number;
  lost: number;
}

export interface SessionStats {
  [session: string]: SessionStat;
}

interface SessionPerformanceProps {
  sessionStats: SessionStats;
}

const SessionPerformanceChart: React.FC<SessionPerformanceProps> = ({ sessionStats }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  // Transform session stats for the horizontal bar chart
  const transformSessionStats = () => {
    // Define the session order we want to display
    const sessionOrder = ["Asia", "London", "NY", "Overlap"];
    
    return sessionOrder.map(session => {
      // Handle 'Late NY' as part of 'NY' by combining their stats
      const stats = sessionStats[session] || {
        total: 0, 
        winRate: 0, 
        breakEvenRate: 0, 
        lossRate: 0,
        won: 0,
        breakEven: 0,
        lost: 0
      };

      // Combine 'Late NY' stats with 'NY' if it exists and we're processing the NY session
      if (session === "NY" && sessionStats["Late NY"]) {
        const lateNYStats = sessionStats["Late NY"];
        
        // Add the raw numbers
        const totalTrades = stats.total + lateNYStats.total;
        const wonTrades = stats.won + lateNYStats.won;
        const breakEvenTrades = stats.breakEven + lateNYStats.breakEven;
        const lostTrades = stats.lost + lateNYStats.lost;
        
        // Recalculate percentages based on new totals
        return {
          session: "New York", // Display name for NY session
          winRate: totalTrades > 0 ? parseFloat(((wonTrades / totalTrades) * 100).toFixed(1)) : 0,
          breakEvenRate: totalTrades > 0 ? parseFloat(((breakEvenTrades / totalTrades) * 100).toFixed(1)) : 0,
          lossRate: totalTrades > 0 ? parseFloat(((lostTrades / totalTrades) * 100).toFixed(1)) : 0,
          count: totalTrades,
          won: wonTrades,
          breakEven: breakEvenTrades,
          lost: lostTrades,
          originalSession: session // Keep original session name for reference
        };
      }

      // Display names for sessions (e.g., "NY" to "New York")
      const displayName = session === "NY" ? "New York" : session;
      
      return {
        session: displayName,
        winRate: stats.total > 0 ? parseFloat(stats.winRate.toFixed(1)) : 0,
        breakEvenRate: stats.total > 0 ? parseFloat(stats.breakEvenRate.toFixed(1)) : 0,
        lossRate: stats.total > 0 ? parseFloat(stats.lossRate.toFixed(1)) : 0,
        count: stats.total,
        won: stats.won,
        breakEven: stats.breakEven,
        lost: stats.lost,
        originalSession: session // Keep original session name for reference
      };
    });
  };

  const chartData = transformSessionStats();
  const isEmpty = !chartData || chartData.every(item => item.count === 0);

  return (
    <Card className="glass-effect col-span-1 md:col-span-2 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-1 mb-4">
          <p className="text-sm text-muted-foreground">Session Performance</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{metricDescriptions.sessionPerformance}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1" style={{ minHeight: "350px", maxHeight: "350px" }}>
          {!isEmpty ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
                barGap={0}
                barCategoryGap="20%"
              >
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  tick={false} // Set tick to false to hide the labels
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  dataKey="session"
                  type="category"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  padding={{ top: 10, bottom: 10 }}
                />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => {
                    const item = props.payload;
                    const formattedName = name === "winRate" ? "Win Rate" : 
                                         name === "breakEvenRate" ? "Break Even Rate" : 
                                         name === "lossRate" ? "Loss Rate" : name;
                    
                    return [`${value}%`, formattedName];
                  }}
                  labelFormatter={(session) => {
                    const item = chartData.find(item => item.session === session);
                    return `${session} (${item?.count || 0} trades)`;
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    borderColor: 'rgba(64, 64, 64, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    color: '#F9FAFB',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '10px', marginTop: '20px', paddingTop: '15px' }}
                  iconSize={10}
                  iconType="circle"
                />
                <Bar 
                  dataKey="winRate" 
                  name="Win Rate" 
                  fill={colors.winColor}
                  radius={[0, 0, 0, 0]}
                  minPointSize={3}
                  stackId="stack"
                />
                <Bar 
                  dataKey="breakEvenRate" 
                  name="Break Even Rate" 
                  fill={colors.breakEvenColor}
                  radius={[0, 0, 0, 0]}
                  minPointSize={3}
                  stackId="stack"
                />
                <Bar 
                  dataKey="lossRate" 
                  name="Loss Rate" 
                  fill={colors.lossColor}
                  radius={[0, 0, 0, 0]}
                  minPointSize={3}
                  stackId="stack"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No session data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionPerformanceChart;
