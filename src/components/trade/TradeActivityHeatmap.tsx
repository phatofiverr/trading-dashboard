import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define a type to track trade data for visualization
interface TradeInterval {
  count: number;
  profit?: number; // Track profit for each interval
  entries?: number; // Track entries for each interval
  exits?: number; // Track exits for each interval
  winningExits?: number; // Track winning exits
  losingExits?: number; // Track losing exits
}

interface TradeActivityProps {
  className?: string;
}

// Format time for display (e.g., "09:05")
// IMPORTANT: Define this function at the top level before it's used in hooks
const formatTime = (intervalIndex: number) => {
  const hour = Math.floor(intervalIndex / 12);
  const minute = (intervalIndex % 12) * 5;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const TradeActivityHeatmap: React.FC<TradeActivityProps> = ({ className }) => {
  const { filteredTrades } = useTradeStore();

  // Generate a 60-color gradient from dark blue to light beige (per the image)
  const colorGradient = useMemo(() => {
    // Start with dark blue (#2596be) and end with light beige (#f4e4d3) based on the request
    const colors = [];
    const steps = 60;
    
    // Color stops from the provided gradient image
    const colorStops = [
      { r: 37, g: 150, b: 190 },  // Dark blue (#2596be) (starting)
      { r: 103, g: 71, b: 143 },  // Purple
      { r: 146, g: 39, b: 112 },  // Magenta
      { r: 194, g: 42, b: 75 },   // Deep red
      { r: 234, g: 79, b: 58 },   // Red-orange
      { r: 244, g: 228, b: 211 }  // Light beige (#f4e4d3) (ending)
    ];
    
    // Generate intermediate colors using linear interpolation
    for (let i = 0; i < steps; i++) {
      const position = i / (steps - 1);
      
      // Find the color stops to interpolate between
      let startIndex = 0;
      while (startIndex < colorStops.length - 1 && position > (startIndex + 1) / (colorStops.length - 1)) {
        startIndex++;
      }
      startIndex = Math.min(startIndex, colorStops.length - 2);
      
      const endIndex = startIndex + 1;
      const localPosition = (position - startIndex / (colorStops.length - 1)) * (colorStops.length - 1);
      
      // Interpolate between the two color stops
      const r = Math.round(colorStops[startIndex].r + (colorStops[endIndex].r - colorStops[startIndex].r) * localPosition);
      const g = Math.round(colorStops[startIndex].g + (colorStops[endIndex].g - colorStops[startIndex].g) * localPosition);
      const b = Math.round(colorStops[startIndex].b + (colorStops[endIndex].b - colorStops[startIndex].b) * localPosition);
      
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  }, []);

  // Calculate heatmap data based on 5-minute intervals (12 intervals per hour = 288 per day)
  const { 
    timeData, 
    maxTradesInInterval, 
    activePairs, 
    mostActiveTiming,
    mostProfitableTiming,
    leastProfitableTiming,
    mostWinningExitsTiming,
    mostLosingExitsTiming 
  } = useMemo(() => {
    console.log("Calculating time data with trades:", filteredTrades.length);
    
    // Get unique instruments/pairs from trades, limited to top 10
    const uniquePairs = Array.from(
      new Set(
        filteredTrades.map((trade) => trade.pair || trade.instrument || 'Unknown')
      )
    ).slice(0, 10); // Show top 10 pairs for better visualization
    
    console.log("Unique pairs found:", uniquePairs);
    
    // Initialize data structure (288 5-minute intervals per day)
    const pairsTimeData: Record<string, TradeInterval[]> = {};
    uniquePairs.forEach(pair => {
      pairsTimeData[pair] = Array(288).fill(null).map(() => ({ 
        count: 0,
        profit: 0,
        entries: 0,
        exits: 0,
        winningExits: 0,
        losingExits: 0
      }));
    });
    
    // Count trades in each 5-minute interval for each pair
    let maxCount = 0;
    
    filteredTrades.forEach(trade => {
      let entryHour = -1;
      let entryMinute = 0;
      let exitHour = -1;
      let exitMinute = 0;
      
      // First, try to use explicit entryTime if available
      if (trade.entryTime) {
        // Parse time string like "18:00" to get hour and minute
        const timeParts = trade.entryTime.split(':');
        if (timeParts.length >= 2) {
          entryHour = parseInt(timeParts[0], 10);
          entryMinute = parseInt(timeParts[1], 10);
          console.log(`Trade ${trade.id} has explicit entry time ${trade.entryTime}, hour: ${entryHour}, minute: ${entryMinute}`);
        }
      }
      // If no explicit time or parsing failed, fall back to entry date
      if (entryHour < 0 && trade.entryDate) {
        try {
          // Parse the trade entry time
          const tradeDate = typeof trade.entryDate === 'string' 
            ? parseISO(trade.entryDate) 
            : new Date(trade.entryDate);
          
          // Get hour and minute
          entryHour = tradeDate.getHours();
          entryMinute = tradeDate.getMinutes();
          console.log(`Trade ${trade.id} using entry date ${trade.entryDate}, hour: ${entryHour}, minute: ${entryMinute}`);
        } catch (e) {
          console.error("Error processing trade entry date:", e);
        }
      }
      
      // Now get exit time - first from exitTime if available
      if (trade.exitTime) {
        const timeParts = trade.exitTime.split(':');
        if (timeParts.length >= 2) {
          exitHour = parseInt(timeParts[0], 10);
          exitMinute = parseInt(timeParts[1], 10);
          console.log(`Trade ${trade.id} has explicit exit time ${trade.exitTime}, hour: ${exitHour}, minute: ${exitMinute}`);
        }
      }
      // If no explicit exit time or parsing failed, fall back to exit date
      if (exitHour < 0 && trade.exitDate) {
        try {
          // Parse the trade exit time
          const exitDate = typeof trade.exitDate === 'string' 
            ? parseISO(trade.exitDate) 
            : new Date(trade.exitDate);
          
          // Get hour and minute
          exitHour = exitDate.getHours();
          exitMinute = exitDate.getMinutes();
          console.log(`Trade ${trade.id} using exit date ${trade.exitDate}, hour: ${exitHour}, minute: ${exitMinute}`);
        } catch (e) {
          console.error("Error processing trade exit date:", e);
        }
      }
      
      // If we couldn't determine either time, skip this trade
      if (entryHour < 0 || exitHour < 0) {
        console.log(`Skipping trade ${trade.id} - couldn't determine entry/exit times`);
        return;
      }
      
      const pair = trade.pair || trade.instrument || 'Unknown';
      // Calculate profit based on outcome or rMultiple if direct profit not available
      const tradeProfit = trade.profit !== undefined ? 
        trade.profit : 
        (trade.outcome === 'win' ? Math.abs(trade.rMultiple) : -Math.abs(trade.rMultiple));
      const isWinningTrade = tradeProfit > 0;
      
      // Only track pairs we've identified in our top list
      if (uniquePairs.includes(pair)) {
        // Calculate start and end 5-minute interval indices
        const startIntervalIndex = (entryHour * 12) + Math.floor(entryMinute / 5);
        
        // Calculate end interval - handle case where exit crosses to next day
        let endIntervalIndex = (exitHour * 12) + Math.floor(exitMinute / 5);
        if (endIntervalIndex < startIntervalIndex) {
          endIntervalIndex = 287; // Cap at end of day if exit appears to be before entry
        }
        
        // Ensure we have an array for this pair
        if (!pairsTimeData[pair]) {
          pairsTimeData[pair] = Array(288).fill(null).map(() => ({ 
            count: 0,
            profit: 0,
            entries: 0,
            exits: 0,
            winningExits: 0,
            losingExits: 0
          }));
        }
        
        // Mark entry and exit intervals
        if (startIntervalIndex >= 0 && startIntervalIndex < 288) {
          pairsTimeData[pair][startIntervalIndex].entries = (pairsTimeData[pair][startIntervalIndex].entries || 0) + 1;
        }
        
        if (endIntervalIndex >= 0 && endIntervalIndex < 288) {
          pairsTimeData[pair][endIntervalIndex].exits = (pairsTimeData[pair][endIntervalIndex].exits || 0) + 1;
          
          // Track winning/losing exits
          if (isWinningTrade) {
            pairsTimeData[pair][endIntervalIndex].winningExits = (pairsTimeData[pair][endIntervalIndex].winningExits || 0) + 1;
          } else {
            pairsTimeData[pair][endIntervalIndex].losingExits = (pairsTimeData[pair][endIntervalIndex].losingExits || 0) + 1;
          }
          
          // Add profit/loss to the exit interval
          pairsTimeData[pair][endIntervalIndex].profit = (pairsTimeData[pair][endIntervalIndex].profit || 0) + tradeProfit;
        }
        
        // Increment count for all intervals that include this trade
        for (let i = startIntervalIndex; i <= endIntervalIndex; i++) {
          if (i >= 0 && i < 288) {
            pairsTimeData[pair][i].count++;
            
            if (pairsTimeData[pair][i].count > maxCount) {
              maxCount = pairsTimeData[pair][i].count;
            }
          }
        }
        
        console.log(`Marked trade for ${pair} from interval ${startIntervalIndex} to ${endIntervalIndex}`);
      }
    });
    
    // Filter out pairs with no trades
    const activePairsList = Object.keys(pairsTimeData).filter(pair => 
      pairsTimeData[pair].some(interval => interval.count > 0)
    );
    
    // Calculate most active timing
    let mostActiveInterval = -1;
    let mostActiveCount = 0;
    
    // Calculate most profitable timing
    let mostProfitableInterval = -1;
    let mostProfitableAmount = 0;
    
    // Calculate least profitable timing
    let leastProfitableInterval = -1;
    let leastProfitableAmount = 0;
    
    // Calculate winning/losing exits
    let mostWinningExitsInterval = -1;
    let mostWinningExitsCount = 0;
    let mostLosingExitsInterval = -1;
    let mostLosingExitsCount = 0;
    
    // Aggregate data across all pairs for statistical analysis
    const aggregatedIntervals: TradeInterval[] = Array(288).fill(null).map(() => ({ 
      count: 0,
      profit: 0,
      entries: 0,
      exits: 0,
      winningExits: 0,
      losingExits: 0
    }));
    
    activePairsList.forEach(pair => {
      for (let i = 0; i < 288; i++) {
        aggregatedIntervals[i].count += pairsTimeData[pair][i].count;
        aggregatedIntervals[i].profit += pairsTimeData[pair][i].profit || 0;
        aggregatedIntervals[i].entries += pairsTimeData[pair][i].entries || 0;
        aggregatedIntervals[i].exits += pairsTimeData[pair][i].exits || 0;
        aggregatedIntervals[i].winningExits += pairsTimeData[pair][i].winningExits || 0;
        aggregatedIntervals[i].losingExits += pairsTimeData[pair][i].losingExits || 0;
        
        // Track most active timing
        if (aggregatedIntervals[i].count > mostActiveCount) {
          mostActiveCount = aggregatedIntervals[i].count;
          mostActiveInterval = i;
        }
        
        // Track most profitable timing
        if (aggregatedIntervals[i].profit > mostProfitableAmount) {
          mostProfitableAmount = aggregatedIntervals[i].profit;
          mostProfitableInterval = i;
        }
        
        // Track least profitable timing
        if (aggregatedIntervals[i].profit < leastProfitableAmount) {
          leastProfitableAmount = aggregatedIntervals[i].profit;
          leastProfitableInterval = i;
        }
        
        // Track most winning/losing exits
        if (aggregatedIntervals[i].winningExits > mostWinningExitsCount) {
          mostWinningExitsCount = aggregatedIntervals[i].winningExits;
          mostWinningExitsInterval = i;
        }
        
        if (aggregatedIntervals[i].losingExits > mostLosingExitsCount) {
          mostLosingExitsCount = aggregatedIntervals[i].losingExits;
          mostLosingExitsInterval = i;
        }
      }
    });
    
    console.log("Active pairs with trade data:", activePairsList);
    console.log("Max trades in any interval:", maxCount);
    
    return {
      timeData: pairsTimeData,
      maxTradesInInterval: maxCount > 0 ? maxCount : 1, // Avoid division by zero
      activePairs: activePairsList,
      mostActiveTiming: mostActiveInterval >= 0 ? {
        time: formatTime(mostActiveInterval),
        count: mostActiveCount
      } : null,
      mostProfitableTiming: mostProfitableInterval >= 0 ? {
        time: formatTime(mostProfitableInterval),
        profit: mostProfitableAmount
      } : null,
      leastProfitableTiming: leastProfitableInterval >= 0 ? {
        time: formatTime(leastProfitableInterval),
        profit: leastProfitableAmount
      } : null,
      mostWinningExitsTiming: mostWinningExitsInterval >= 0 ? {
        time: formatTime(mostWinningExitsInterval),
        count: mostWinningExitsCount
      } : null,
      mostLosingExitsTiming: mostLosingExitsInterval >= 0 ? {
        time: formatTime(mostLosingExitsInterval),
        count: mostLosingExitsCount
      } : null
    };
  }, [filteredTrades]);
  
  // Get color for a cell based on trade count
  const getCellColor = (count: number) => {
    if (count === 0) return '#0f0f15'; // No trades - darkest background
    
    // Map the count to a color from the gradient
    const colorIndex = Math.min(
      Math.floor((count / maxTradesInInterval) * (colorGradient.length - 1)),
      colorGradient.length - 1
    );
    
    return colorGradient[colorIndex];
  };

  // Force showing empty state if there are no detectable trades
  const showEmptyState = activePairs.length === 0 || filteredTrades.length === 0;
  
  console.log("Rendering heatmap with active pairs:", activePairs.length);
  console.log("Showing empty state:", showEmptyState);

  return (
    <Card className={`glass-effect ${className || ''}`}>
      <CardContent className="py-4">
        {showEmptyState ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No trading activity data available
          </div>
        ) : (
          <div className="w-full">
            {/* Trading hours heatmap grid - Legend removed as requested */}
            <div>
              <TooltipProvider>
                {activePairs.map((pair) => (
                  <div key={pair} className="flex items-center mb-0.5">
                    {/* Pair name */}
                    <div className="w-[110px] text-sm font-medium truncate pr-2">
                      {pair}
                    </div>
                    
                    {/* 5-minute interval cells */}
                    <div className="flex flex-grow h-8 overflow-hidden">
                      {timeData[pair].map((interval, intervalIndex) => (
                        <Tooltip key={`${pair}-${intervalIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className="h-full cursor-help"
                              style={{ 
                                backgroundColor: getCellColor(interval.count),
                                width: `${100 / 288}%`,
                                minWidth: '1px'
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-black/80 text-white text-xs border-none">
                            {interval.count > 0 
                              ? `${interval.count} ${interval.count === 1 ? 'trade' : 'trades'} at ${formatTime(intervalIndex)}`
                              : `No trades at ${formatTime(intervalIndex)}`}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </div>
            
            {/* Hour markers - fixed to ensure proper alignment with the last box */}
            <div className="flex mt-1 pl-[110px] pr-0">
              {Array.from({length: 7}).map((_, i) => {
                const hour = i * 4;
                return (
                  <div 
                    key={hour} 
                    className="text-[9px] text-muted-foreground"
                    style={{ width: `${4/24 * 100}%` }}
                  >
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                );
              })}
            </div>
            
            {/* New: Trade timing statistics */}
            <div className="mt-6 border-t border-white/10 pt-4 space-y-2">
              <h4 className="text-xs font-medium">Trading Time Analytics</h4>
              
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {/* Most Active Trading Time */}
                {mostActiveTiming && (
                  <div className="bg-black/20 p-3 rounded-md">
                    <div className="text-[10px] text-muted-foreground mb-1">MOST ACTIVE TRADING TIME</div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{mostActiveTiming.time}</div>
                      <div className="text-xs">{mostActiveTiming.count} trades</div>
                    </div>
                  </div>
                )}
                
                {/* Most Profitable Trading Time */}
                {mostProfitableTiming && (
                  <div className="bg-black/20 p-3 rounded-md">
                    <div className="text-[10px] text-muted-foreground mb-1">MOST PROFITABLE TIME</div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{mostProfitableTiming.time}</div>
                      <div className="text-xs text-positive-DEFAULT">
                        {mostProfitableTiming.profit.toFixed(2)} profit
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Least Profitable Trading Time */}
                {leastProfitableTiming && leastProfitableTiming.profit < 0 && (
                  <div className="bg-black/20 p-3 rounded-md">
                    <div className="text-[10px] text-muted-foreground mb-1">LEAST PROFITABLE TIME</div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{leastProfitableTiming.time}</div>
                      <div className="text-xs text-negative-DEFAULT">
                        {leastProfitableTiming.profit.toFixed(2)} loss
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Most Winning Exits */}
                {mostWinningExitsTiming && (
                  <div className="bg-black/20 p-3 rounded-md">
                    <div className="text-[10px] text-muted-foreground mb-1">HIGHEST WINNING EXITS</div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{mostWinningExitsTiming.time}</div>
                      <div className="text-xs text-positive-DEFAULT">
                        {mostWinningExitsTiming.count} successful exits
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Most Losing Exits */}
                {mostLosingExitsTiming && (
                  <div className="bg-black/20 p-3 rounded-md">
                    <div className="text-[10px] text-muted-foreground mb-1">HIGHEST LOSING EXITS</div>
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{mostLosingExitsTiming.time}</div>
                      <div className="text-xs text-negative-DEFAULT">
                        {mostLosingExitsTiming.count} unsuccessful exits
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeActivityHeatmap;
