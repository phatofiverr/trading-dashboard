import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TradeStats } from '@/types/Trade';
import { ArrowUp, ArrowDown, Award, Calendar, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper component for tooltips
const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 ml-1 inline-flex text-muted-foreground cursor-help opacity-70" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface DailyStatsProps {
  trades?: any[]; // Using any[] to be flexible with the trade type
  currency?: string;
  className?: string;
}

const DailyStats: React.FC<DailyStatsProps> = ({ trades = [], currency = 'USD', className = '' }) => {
  // Filter to get only today's trades
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.exitDate || trade.entryDate);
    tradeDate.setHours(0, 0, 0, 0);
    return tradeDate.getTime() === today.getTime();
  });
  
  // Calculate today's stats
  const totalTrades = todayTrades.length;
  const winningTrades = todayTrades.filter(trade => 
    (trade.direction === 'long' && trade.exitPrice > trade.entryPrice) || 
    (trade.direction === 'short' && trade.exitPrice < trade.entryPrice)
  ).length;
  
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  // Calculate total profit for today
  const totalProfit = todayTrades.reduce((sum, trade) => {
    return sum + (trade.profit || trade.rMultiple || 0);
  }, 0);
  
  // Format the date for display
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return (
    <Card className={`glass-effect h-full ${className}`}>
      <CardContent className="p-6">
        <div className="bg-black/10 p-4 rounded-lg h-full flex flex-col">
          <div className="flex items-center mb-4">
            <Calendar className="h-4 w-4 mr-2 text-positive opacity-80" />
            <p className="text-sm font-semibold">Today's Trading ({formattedDate})</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <div className="bg-black/5 p-5 rounded-lg flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-2">Trades</p>
              <p className="text-xl font-medium">{totalTrades}</p>
            </div>
            
            <div className="bg-black/5 p-5 rounded-lg flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
              <p className={`text-xl font-medium ${winRate >= 50 ? 'text-positive/90' : winRate > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                {winRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-black/5 p-5 rounded-lg flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-2">Profit/Loss</p>
              <div className="flex items-center">
                {totalProfit > 0 ? (
                  <ArrowUp className="mr-1 h-4 w-4 text-positive/90" />
                ) : totalProfit < 0 ? (
                  <ArrowDown className="mr-1 h-4 w-4 text-negative/90" />
                ) : null}
                <p className={`text-xl font-medium ${
                  totalProfit > 0 
                    ? 'text-positive/90' 
                    : totalProfit < 0 
                      ? 'text-negative/90' 
                      : 'text-muted-foreground'
                }`}>
                  {totalProfit > 0 ? '+' : ''}{totalProfit.toFixed(2)}{currency === 'USD' ? 'R' : currency}
                </p>
              </div>
            </div>
            
            <div className="bg-black/5 p-5 rounded-lg flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-2">Best Trade</p>
              {todayTrades.length > 0 ? (
                <div className="flex items-center">
                  <Award className="mr-1 h-4 w-4 text-amber-400" />
                  <p className="text-xl font-medium">
                    {Math.max(...todayTrades.map(t => t.profit || t.rMultiple || 0)).toFixed(2)}{currency === 'USD' ? 'R' : currency}
                  </p>
                </div>
              ) : (
                <p className="text-xl font-medium text-muted-foreground">—</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStats; 