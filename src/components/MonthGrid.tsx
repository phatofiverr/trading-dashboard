import React, { useState } from 'react';
import { StrategyPerformance } from '@/types/Trade';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useThemeStore } from '@/hooks/useThemeStore';

interface MonthGridProps {
  strategy: StrategyPerformance;
}

interface TradeInfo {
  hasTrade: boolean;
  isWinningTrade: boolean; // Making this always present
}

const MonthGrid: React.FC<MonthGridProps> = ({ strategy }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const [hoveredCell, setHoveredCell] = useState<{year: number, month: number} | null>(null);
  
  // Create a grid for years 2015-2025 and months Jan-Dec
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate mock data based on strategy name's character code
  // In a real implementation, this would analyze actual trade dates
  const getTradeInfo = (year: number, month: number): TradeInfo => {
    // Generate consistent pseudo-random data based on strategy name and date
    const seed = strategy.name.charCodeAt(0) + year + month;
    const hasTrade = seed % 7 === 0 || (strategy.tradesCount > 0 && seed % 5 === 0);
    
    return {
      hasTrade,
      isWinningTrade: seed % 3 === 0, // Always include isWinningTrade
    };
  };
  
  // Check if adjacent months have trades to interpolate
  const shouldFill = (year: number, month: number) => {
    // Find previous and next months that have trades
    let prevMonth = month - 1;
    let prevYear = year;
    let nextMonth = month + 1;
    let nextYear = year;
    
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }
    
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    
    // Check if both adjacent months have trades
    const prevTradeInfo = prevYear >= 2015 && prevYear <= 2025 ? getTradeInfo(prevYear, prevMonth) : { hasTrade: false, isWinningTrade: false };
    const nextTradeInfo = nextYear >= 2015 && nextYear <= 2025 ? getTradeInfo(nextYear, nextMonth) : { hasTrade: false, isWinningTrade: false };
    const currentTradeInfo = getTradeInfo(year, month);
    
    // Get the trade outcome of the previous trade (for color consistency)
    const isWinningFill = prevTradeInfo.hasTrade ? prevTradeInfo.isWinningTrade : nextTradeInfo.isWinningTrade;
    
    return {
      shouldFill: prevTradeInfo.hasTrade && nextTradeInfo.hasTrade,
      isWinningFill
    };
  };
  
  // Get color for cell based on status
  const getCellColor = (year: number, month: number) => {
    const tradeInfo = getTradeInfo(year, month);
    const fillInfo = shouldFill(year, month);
    
    if (tradeInfo.hasTrade) {
      // Use appropriate color based on trade outcome
      return tradeInfo.isWinningTrade ? colors.positiveColor : colors.negativeColor;
    } else if (fillInfo.shouldFill) {
      // Apply transparency for trade duration with the same outcome color
      return fillInfo.isWinningFill 
        ? `${colors.positiveColor}59` // 35% opacity
        : `${colors.negativeColor}59`; // 35% opacity
    } else {
      return 'bg-neutral-800'; // Background for no activity
    }
  };
  
  // Get trading activity description for this cell 
  const getCellDescription = (year: number, month: number) => {
    const tradeInfo = getTradeInfo(year, month);
    const fillInfo = shouldFill(year, month);
    
    if (tradeInfo.hasTrade) {
      // This would normally use actual data
      const tradeCount = Math.floor((strategy.name.charCodeAt(0) + year + month) % 10) + 1;
      const outcomeText = tradeInfo.isWinningTrade ? 'winning' : 'losing';
      return `${tradeCount} ${tradeCount === 1 ? outcomeText + ' trade' : outcomeText + ' trades'} in ${shortMonthNames[month]} ${year}`;
    } else if (fillInfo.shouldFill) {
      const outcomeText = fillInfo.isWinningFill ? 'winning' : 'losing';
      return `Active ${outcomeText} trading period (${shortMonthNames[month]} ${year})`;
    } else {
      return `No trading activity in ${shortMonthNames[month]} ${year}`;
    }
  };
  
  return (
    <div className="mt-4">
      <div className="text-xs text-muted-foreground mb-2">Trader's Activity</div>
      <div className="grid grid-cols-[30px_1fr]">
        {/* Year labels */}
        <div className="grid grid-rows-11 gap-[2px]">
          {years.map(year => (
            <div key={year} className="h-3.5 text-[9px] flex items-center justify-end pr-1 text-muted-foreground">
              {year}
            </div>
          ))}
        </div>
        
        {/* Month grid cells */}
        <div className="grid grid-rows-11 gap-[2px]">
          {years.map(year => (
            <div key={year} className="grid grid-cols-12 gap-[2px]">
              {months.map(month => (
                <Popover key={`${year}-${month}`}>
                  <PopoverTrigger asChild>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`w-full h-3.5 rounded-[1px] cursor-pointer`}
                            style={{
                              backgroundColor: getCellColor(year, month)
                            }}
                            onMouseEnter={() => setHoveredCell({year, month})}
                            onMouseLeave={() => setHoveredCell(null)}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black/80 backdrop-blur-md border-white/5">
                          {getCellDescription(year, month)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </PopoverTrigger>
                  <PopoverContent className="bg-black/80 backdrop-blur-md border-white/5 p-3 w-64">
                    <div className="space-y-2">
                      <h4 className="font-medium">{fullMonthNames[month]} {year}</h4>
                      <div className="text-sm">
                        {getTradeInfo(year, month).hasTrade ? (
                          <>
                            <p>{getCellDescription(year, month)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Click to view details</p>
                          </>
                        ) : shouldFill(year, month).shouldFill ? (
                          <p>Trading activity continued during this period</p>
                        ) : (
                          <p>No trading records for this period</p>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Month labels at bottom */}
      <div className="grid grid-cols-[30px_1fr] mt-2">
        <div></div>
        <div className="grid grid-cols-12">
          {shortMonthNames.map((month, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-[9px] text-muted-foreground text-center cursor-help">
                    {month.charAt(0)}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 backdrop-blur-md border-white/5">
                  {month}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      
      {/* Color legend tooltip - Updated for win/loss colors */}
      <div className="mt-2 flex items-center justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground cursor-help">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.positiveColor }}></div>
                <span>Winning trades</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.negativeColor }}></div>
                <span>Losing trades</span>
                <div className="w-2 h-2 rounded-full bg-neutral-800"></div>
                <span>No activity</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black/80 backdrop-blur-md border-white/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.positiveColor }}></div>
                  <span>Winning trade entry/exit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${colors.positiveColor}59` }}></div>
                  <span>Winning trade duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.negativeColor }}></div>
                  <span>Losing trade entry/exit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${colors.negativeColor}59` }}></div>
                  <span>Losing trade duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neutral-800"></div>
                  <span>No trading activity</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MonthGrid;
