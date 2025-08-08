import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Trade } from '@/types/Trade';
import { 
  format, 
  isToday, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addDays, 
  subMonths, 
  addMonths
} from 'date-fns';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  profit: number;
  trades: number;
  dayTrades: Trade[];
}

interface WeeklySummary {
  weekNumber: number;
  profit: number;
  activeDays: number;
}

interface TradingCalendarProps {
  account?: {
    id: string;
    name: string;
    currency: string;
  };
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ account }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { trades, setAccountFilter } = useTradeStore();
  
  // Handle the case where account might be undefined
  const accountId = account?.id;
  const accountCurrency = account?.currency || 'USD';
  
  // Apply account filter when component mounts or account changes
  useEffect(() => {
    if (accountId) {
      setAccountFilter(accountId);
    }
    
    // Clean up filter when component unmounts
    return () => {
      setAccountFilter(null);
    };
  }, [accountId, setAccountFilter]);
  
  // Filter trades for this specific account
  const accountTrades = useMemo(() => {
    return accountId 
      ? trades.filter(trade => trade.accountId === accountId && !trade.isPlaceholder)
      : [];
  }, [trades, accountId]);
  
  // Get the first day of the month
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  // Generate days for the calendar
  const calendarDays = useMemo(() => {
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth
    });
    
    // Calculate how many days from previous month we need to display
    // 0 for Monday, 1 for Tuesday, ..., 6 for Sunday
    const firstDayOfWeek = (getDay(firstDayOfMonth) + 6) % 7;
    
    // Get days from previous month
    const previousMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
      const date = addDays(firstDayOfMonth, -1 * (firstDayOfWeek - i));
      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        profit: 0,
        trades: 0,
        dayTrades: []
      };
    });
    
    // Get days of current month with trade data
    const currentMonthDays = daysInMonth.map(date => {
      // Find trades for this day
      const dayTrades = accountTrades.filter(trade => {
        const tradeDate = new Date(trade.entryDate);
        return (
          tradeDate.getDate() === date.getDate() && 
          tradeDate.getMonth() === date.getMonth() && 
          tradeDate.getFullYear() === date.getFullYear()
        );
      });
      
      // Calculate profit for this day using centralized calculation
      const profit = dayTrades.reduce((sum, trade) => {
        // Use centralized profit calculation
        const tradeProfit = trade.profit !== undefined ? trade.profit : trade.rMultiple;
        return sum + tradeProfit;
      }, 0);
      
      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: true,
        profit,
        trades: dayTrades.length,
        dayTrades
      };
    });
    
    // We need 42 cells total for a calendar (6 rows × 7 days)
    const totalCells = 42;
    const remainingDays = totalCells - (previousMonthDays.length + currentMonthDays.length);
    
    // Get days from next month
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      const date = addDays(lastDayOfMonth, i + 1);
      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        profit: 0,
        trades: 0,
        dayTrades: []
      };
    });
    
    // Combine all days
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [firstDayOfMonth, lastDayOfMonth, accountTrades]);
  
  // Calculate weekly summaries
  const weeklySummaries = useMemo(() => {
    const weeks: WeeklySummary[] = [];
    
    // Group days into weeks (6 weeks in calendar)
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
      
      // Only count current month days for the summary
      const currentMonthDays = weekDays.filter(day => day.isCurrentMonth);
      const weekProfit = currentMonthDays.reduce((sum, day) => sum + day.profit, 0);
      const activeDays = currentMonthDays.filter(day => day.trades > 0).length;
      
      weeks.push({
        weekNumber: weekIndex + 1,
        profit: weekProfit,
        activeDays
      });
    }
    
    return weeks;
  }, [calendarDays]);
  
  // Calculate monthly profit
  const monthlyProfit = useMemo(() => {
    return calendarDays
      .filter(day => day.isCurrentMonth)
      .reduce((total, day) => total + day.profit, 0);
  }, [calendarDays]);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: accountCurrency,
      signDisplay: 'always',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Define weekday names starting with Monday
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <Card className="glass-effect h-full flex flex-col bg-black/30 backdrop-blur-md border-none shadow-lg rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center">
          <span className={`text-xl font-medium ${monthlyProfit > 0 ? 'text-green-500' : monthlyProfit < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
            {formatCurrency(monthlyProfit)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={goToCurrentMonth}
            className="h-8 px-3 py-0 text-xs bg-muted/30 hover:bg-muted/40 border-white/5"
          >
            {format(currentDate, "MMMM yyyy")}
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <CardContent className="flex-1 px-4 pb-4 pt-0">
        <div className="grid grid-cols-8 gap-1">
          {/* Day headers - 7 days + 1 column for weekly summary */}
          {[...weekDays, ''].map((day, index) => (
            <div key={day || `empty-${index}`} className="text-left text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days (7 columns) + Weekly summary column (1 column) */}
          {Array.from({ length: 6 }).map((_, weekIndex) => {
            // Get the days for this week
            const weekDays = calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
            
            // Get the week summary
            const weekSummary = weeklySummaries[weekIndex];
            
            // Render 7 days + 1 summary cell
            return (
              <React.Fragment key={`week-${weekIndex}`}>
                {/* Render the 7 days of the week */}
                {weekDays.map((day, dayIndex) => (
                  <div 
                    key={`day-${weekIndex}-${dayIndex}`}
                    className={`
                      aspect-square p-1 text-xs rounded-md overflow-hidden
                      ${day.isCurrentMonth ? 'bg-black/10' : 'bg-black/5 opacity-30'}
                      ${day.profit > 0 ? 'bg-green-950/20' : ''}
                      ${day.profit < 0 ? 'bg-red-950/20' : ''}
                      ${isToday(day.date) ? 'ring-1 ring-white/20' : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className="text-right mb-1">
                        {day.dayOfMonth}
                      </div>
                      {day.trades > 0 && (
                        <div className={`flex-1 flex flex-col justify-center items-end text-right ${day.profit > 0 ? 'text-green-500' : 'text-red-400'}`}>
                          <div className="font-medium text-xs">
                            {formatCurrency(day.profit)}
                          </div>
                          <div className={`text-[9px] ${day.profit > 0 ? 'text-green-500/80' : 'text-red-400/80'} mt-0.5`}>
                            {day.trades} {day.trades === 1 ? 'trade' : 'trades'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Weekly Summary Cell (on the right) */}
                <div 
                  className="aspect-square p-1 text-xs rounded-md bg-black/20 flex flex-col"
                >
                  <div className="text-muted-foreground mb-1">Week {weekSummary.weekNumber}</div>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    {weekSummary.profit !== 0 && (
                      <>
                        <div className={`text-base font-medium ${weekSummary.profit > 0 ? 'text-green-500' : 'text-red-400'}`}>
                          {formatCurrency(weekSummary.profit)}
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-1">
                          {weekSummary.activeDays} {weekSummary.activeDays === 1 ? 'day' : 'days'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingCalendar;
