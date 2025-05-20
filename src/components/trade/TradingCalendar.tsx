import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTradeStore } from '@/hooks/useTradeStore';
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
import { TradingCalendarProps } from './TradingCalendarProps';

interface WeekSummary {
  weekNumber: number;
  profit: number;
  activeDays: number;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ account, currency = 'USD' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { trades, filteredTrades } = useTradeStore();
  
  // Use filtered trades if available, otherwise use all trades
  const tradesToProcess = filteredTrades.length > 0 ? filteredTrades : trades;
  
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
        trades: 0
      };
    });
    
    // Get days of current month with trade data
    const currentMonthDays = daysInMonth.map(date => {
      // Find trades for this day
      const dayTrades = tradesToProcess.filter(trade => {
        const tradeDate = new Date(trade.entryDate);
        return (
          tradeDate.getDate() === date.getDate() && 
          tradeDate.getMonth() === date.getMonth() && 
          tradeDate.getFullYear() === date.getFullYear()
        );
      });
      
      // Calculate profit for this day
      const profit = dayTrades.reduce((sum, trade) => {
        // Use risk amount if available
        const riskAmount = parseFloat(trade.riskAmount?.toString() || '0');
        const tradeProfit = trade.rMultiple * (riskAmount > 0 ? riskAmount : 100);
        return sum + tradeProfit;
      }, 0);
      
      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: true,
        profit: parseFloat(profit.toFixed(2)),
        trades: dayTrades.length
      };
    });
    
    // Calculate remaining cells needed (we need 42 for 6 weeks)
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
        trades: 0
      };
    });
    
    // Combine all days
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [firstDayOfMonth, lastDayOfMonth, tradesToProcess]);
  
  // Calculate weekly summaries
  const weeklySummaries = useMemo(() => {
    const weeks: WeekSummary[] = [];
    
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
      currency: currency || 'USD',
      signDisplay: 'always',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Define weekday names starting with Monday
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <Card className="bg-black/20 backdrop-blur-md border-none shadow-lg h-full">
      {/* Calendar Header */}
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <div className="flex items-center">
          <span className={`text-xl font-medium ${monthlyProfit > 0 ? 'text-positive' : monthlyProfit < 0 ? 'text-negative' : 'text-muted-foreground'}`}>
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
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-8 gap-1">
          {/* Day headers - 7 days + 1 column for weekly summary */}
          {[...weekDays, ''].map((day, index) => (
            <div key={day || `empty-${index}`} className="text-left text-xs text-muted-foreground py-1" style={{ fontSize: 'calc(0.75rem + 2px)' }}>
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
                      aspect-square p-1 rounded-md overflow-hidden
                      ${day.isCurrentMonth ? 'bg-black/10' : 'bg-black/5 opacity-30'}
                      ${day.profit > 0 ? 'bg-green-950/20' : ''}
                      ${day.profit < 0 ? 'bg-red-950/20' : ''}
                      ${isToday(day.date) ? 'bg-black/30' : ''}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className="text-right mb-1" style={{ fontSize: 'calc(0.75rem)' }}>
                        {day.dayOfMonth}
                      </div>
                      {day.trades > 0 && (
                        <div className={`flex-1 flex flex-col justify-center items-center text-center ${day.profit > 0 ? 'text-positive' : 'text-negative'}`}>
                          <div className="font-medium" style={{ fontSize: 'calc(0.75rem)' }}>
                            {formatCurrency(day.profit)}
                          </div>
                          <div className={`${day.profit > 0 ? 'text-positive/80' : 'text-negative/80'} mt-0.5`} style={{ fontSize: 'calc(0.5rem + 2px)' }}>
                            {day.trades} {day.trades === 1 ? 'trade' : 'trades'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Weekly Summary Cell (on the right) */}
                <div 
                  className="aspect-square p-1 rounded-md bg-black/20 flex flex-col"
                >
                  <div className="text-muted-foreground mb-1 text-center" style={{ fontSize: 'calc(0.75rem)' }}>Week {weekSummary.weekNumber}</div>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    {weekSummary.profit !== 0 && (
                      <>
                        <div 
                          className={`font-medium text-center ${weekSummary.profit > 0 ? 'text-positive' : 'text-negative'}`}
                          style={{ fontSize: 'calc(0.75rem + 2px)' }}
                        >
                          {formatCurrency(weekSummary.profit)}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-center" style={{ fontSize: 'calc(0.5rem + 2px)' }}>
                          {weekSummary.activeDays} day{weekSummary.activeDays !== 1 ? 's' : ''}
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
