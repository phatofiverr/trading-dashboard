import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import SessionPerformanceChart, { SessionStats } from '../SessionPerformanceChart';
import CumulativeMonthlyWinRateCard from './CumulativeMonthlyWinRateCard';
import { useThemeStore } from '@/hooks/useThemeStore';
import { isTradeWin } from '@/hooks/slices/useTradesSlice';
import { Trade } from '@/types/Trade';

interface TimeBasedWinRateCardProps {
  title: string;
  data: Array<{ winRate: number; breakEvenRate?: number; [key: string]: any }>;
  dataKey: string;
  valueFormatter?: (value: any) => string;
}

// Time-based Win Rate Card component 
export const TimeBasedWinRateCard = ({ title, data, dataKey, valueFormatter }: TimeBasedWinRateCardProps) => {
  const isEmpty = !data || data.length === 0 || data.every(item => item.total === 0);
  const { strategyId } = useParams<{ strategyId: string }>();
  const { getThemeColorsForStrategy } = useThemeStore();
  const colors = getThemeColorsForStrategy(strategyId);
  
  return (
    <Card className="glass-effect col-span-1 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-1 mb-6">
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex-1" style={{ minHeight: "280px" }}>
          {!isEmpty ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                barCategoryGap={20} // Consistent spacing between categories
                barGap={0} // No gap between bars in the same category
              >
                <XAxis 
                  dataKey={dataKey} 
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
                  labelFormatter={valueFormatter || ((value) => `${value}`)}
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

// Time functions unchanged
export const EntryTimeWinRateCard = () => {
  const { filteredTrades: trades } = useTradeStore();
  
  const calculateEntryTimeStats = () => {
    if (!trades.length) return [];
    
    const hourlyStats = Array(24).fill(null).map((_, hour) => ({
      hour: hour,
      total: 0,
      won: 0,
      breakEven: 0,
      lost: 0,
      winRate: 0,
      breakEvenRate: 0,
      hourFormatted: `${hour}:00`
    }));
    
    trades.forEach(trade => {
      if (!trade.entryDate) return;
      
      // Use entryTime if available, otherwise extract from entryDate
      let hour;
      if (trade.entryTime) {
        const [hourStr] = trade.entryTime.split(':');
        hour = parseInt(hourStr, 10);
      } else {
        const entryDate = new Date(trade.entryDate);
        hour = entryDate.getHours();
      }
      
      if (isNaN(hour) || hour < 0 || hour > 23) {
        console.warn('Invalid hour value:', hour);
        return;
      }
      
      hourlyStats[hour].total++;
      if (isTradeWin(trade)) {
        hourlyStats[hour].won++;
      } else if (trade.rMultiple === 0) {
        hourlyStats[hour].breakEven++;
      } else {
        hourlyStats[hour].lost++;
      }
    });
    
    // Calculate win rates and filter out hours with no trades
    return hourlyStats
      .map(hourStat => ({
        ...hourStat,
        winRate: hourStat.total > 0 ? Math.round((hourStat.won / hourStat.total) * 100) : 0,
        breakEvenRate: hourStat.total > 0 ? Math.round((hourStat.breakEven / hourStat.total) * 100) : 0
      }))
      .filter(hourStat => hourStat.total > 0);
  };
  
  const hourlyStats = calculateEntryTimeStats();
  
  return (
    <TimeBasedWinRateCard 
      title="Entry Time Win Rate" 
      data={hourlyStats} 
      dataKey="hourFormatted" 
      valueFormatter={(hour) => `${hour}`}
    />
  );
};

// Monthly Win Rate Card component - consolidated by month only
export const MonthlyWinRateCard = () => {
  const { filteredTrades: trades } = useTradeStore();
  
  const calculateMonthlyStats = () => {
    if (!trades.length) return [];
    
    // Initialize with all months
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthlyData = monthNames.map((month, index) => ({
      month,
      monthIndex: index,
      total: 0,
      won: 0, 
      breakEven: 0,
      lost: 0,
      winRate: 0,
      breakEvenRate: 0
    }));
    
    // Populate data - aggregate by month only, ignoring year
    trades.forEach(trade => {
      if (!trade.entryDate) return;
      
      const entryDate = new Date(trade.entryDate);
      const monthIndex = entryDate.getMonth();
      
      monthlyData[monthIndex].total++;
      if (isTradeWin(trade)) {
        monthlyData[monthIndex].won++;
      } else if (trade.rMultiple === 0) {
        monthlyData[monthIndex].breakEven++;
      } else {
        monthlyData[monthIndex].lost++;
      }
    });
    
    // Calculate win rates and filter out months with no trades
    return monthlyData
      .map(month => ({
        ...month,
        winRate: month.total > 0 ? Math.round((month.won / month.total) * 100) : 0,
        breakEvenRate: month.total > 0 ? Math.round((month.breakEven / month.total) * 100) : 0
      }))
      .filter(month => month.total > 0);
  };
  
  const monthlyStats = calculateMonthlyStats();
  
  return (
    <TimeBasedWinRateCard 
      title="Monthly Win Rate" 
      data={monthlyStats} 
      dataKey="month"
      valueFormatter={(month) => `${month} (${monthlyStats.find(item => item.month === month)?.total || 0} trades)`}
    />
  );
};

// Day-wise Win Rate Card component
export const DayWiseWinRateCard = () => {
  const { filteredTrades: trades } = useTradeStore();
  
  const calculateDayWiseStats = () => {
    if (!trades.length) return [];
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = days.map(day => ({ 
      day, 
      total: 0, 
      won: 0, 
      breakEven: 0,
      lost: 0,
      winRate: 0,
      breakEvenRate: 0 
    }));
    
    trades.forEach(trade => {
      if (!trade.entryDate) return;
      
      const entryDate = new Date(trade.entryDate);
      const dayIndex = entryDate.getDay();
      
      dayStats[dayIndex].total++;
      if (isTradeWin(trade)) {
        dayStats[dayIndex].won++;
      } else if (trade.rMultiple === 0) {
        dayStats[dayIndex].breakEven++;
      } else {
        dayStats[dayIndex].lost++;
      }
    });
    
    // Calculate win rates and filter out days with no trades
    return dayStats
      .map(dayStat => ({
        ...dayStat,
        winRate: dayStat.total > 0 ? Math.round((dayStat.won / dayStat.total) * 100) : 0,
        breakEvenRate: dayStat.total > 0 ? Math.round((dayStat.breakEven / dayStat.total) * 100) : 0
      }))
      .filter(dayStat => dayStat.total > 0);
  };
  
  const dayWiseStats = calculateDayWiseStats();
  
  return (
    <TimeBasedWinRateCard 
      title="Day-wise Win Rate" 
      data={dayWiseStats} 
      dataKey="day"
      valueFormatter={(day) => `${day}`}
    />
  );
};

// The main TimeBasedKPIs component
const TimeBasedKPIs = () => {
  const { filteredTrades: trades } = useTradeStore();
  const { strategyId } = useParams<{ strategyId: string }>();
  
  // Calculate session stats with improved win/loss logic
  const calculateSessionStats = (): SessionStats => {
    if (!trades.length) return { 
      London: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 }, 
      NY: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 },
      Asia: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 }
    };
    
    const sessions: Record<string, { total: number; won: number; breakEven: number; lost: number }> = {
      London: { total: 0, won: 0, breakEven: 0, lost: 0 },
      NY: { total: 0, won: 0, breakEven: 0, lost: 0 },
      Asia: { total: 0, won: 0, breakEven: 0, lost: 0 }
    };
    
    trades.forEach(trade => {
      if (trade.session && sessions[trade.session]) {
        sessions[trade.session].total++;
        if (isTradeWin(trade)) {
          sessions[trade.session].won++;
        } else if (trade.rMultiple === 0) {
          sessions[trade.session].breakEven++;
        } else {
          sessions[trade.session].lost++;
        }
      }
    });
    
    return Object.entries(sessions).reduce<SessionStats>((acc, [session, stats]) => {
      const winRate = stats.total ? (stats.won / stats.total) * 100 : 0;
      const breakEvenRate = stats.total ? (stats.breakEven / stats.total) * 100 : 0;
      const lossRate = stats.total ? (stats.lost / stats.total) * 100 : 0;
      
      return {
        ...acc,
        [session]: {
          total: stats.total,
          won: stats.won,
          breakEven: stats.breakEven,
          lost: stats.lost,
          winRate,
          breakEvenRate,
          lossRate
        }
      };
    }, {});
  };
  
  const sessionStats = calculateSessionStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <EntryTimeWinRateCard />
      <DayWiseWinRateCard />
      <MonthlyWinRateCard />
      <div className="h-[350px]">
        <SessionPerformanceChart sessionStats={sessionStats} />
      </div>
    </div>
  );
};

export default TimeBasedKPIs;
