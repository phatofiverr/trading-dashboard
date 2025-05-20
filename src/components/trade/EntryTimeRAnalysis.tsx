import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Clock, TrendingUp, Target, Shield, Repeat, Info, CircleCheck, CircleX, CircleSlash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface EntryTimeStats {
  avgTimeToTP: string;
  avgTimeToSL: string;
  potentialR: number;
  missedRAfterBE: number;
  tradesHitBE: number;
  tradesHitTPAfterBE: number;
  percentTradesHitTP: number;
  percentTradesHitSL: number;
  avgRAfterBE: number;
  maxRAfterBE: number;
  minRAfterBE: number;
  percentPositiveRAfterBE: number;
  avgRAfterTP: number;
  minRAfterTP: number;
  maxRAfterTP: number;
  tradesHitTP: number;
}

const EntryTimeRAnalysis: React.FC = () => {
  const { filteredTrades } = useTradeStore();
  
  // Calculate time and R-potential statistics
  const calculateStats = (): EntryTimeStats => {
    if (!filteredTrades.length) {
      return {
        avgTimeToTP: "N/A",
        avgTimeToSL: "N/A",
        potentialR: 0,
        missedRAfterBE: 0,
        tradesHitBE: 0,
        tradesHitTPAfterBE: 0,
        percentTradesHitTP: 0,
        percentTradesHitSL: 0,
        avgRAfterBE: 0,
        maxRAfterBE: 0,
        minRAfterBE: 0,
        percentPositiveRAfterBE: 0,
        avgRAfterTP: 0,
        minRAfterTP: 0,
        maxRAfterTP: 0,
        tradesHitTP: 0
      };
    }
    
    // Find trades with both entry and exit dates
    const tradesWithDates = filteredTrades.filter(
      t => t.entryDate && t.exitDate
    );
    
    // Calculate average time to TP for winning trades
    const winningTrades = tradesWithDates.filter(t => t.rMultiple > 0);
    const totalTimeToTPInHours = winningTrades.reduce((total, trade) => {
      const entryDate = new Date(trade.entryDate);
      const exitDate = new Date(trade.exitDate);
      const timeInHours = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
      return total + timeInHours;
    }, 0);
    
    // Calculate average time to SL for losing trades
    const losingTrades = tradesWithDates.filter(t => t.rMultiple < 0);
    const totalTimeToSLInHours = losingTrades.reduce((total, trade) => {
      const entryDate = new Date(trade.entryDate);
      const exitDate = new Date(trade.exitDate);
      const timeInHours = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
      return total + timeInHours;
    }, 0);
    
    // Calculate potential R if held to optimal exit
    // This is a simplification - in a real app you might have historical price data to compute this
    const potentialR = filteredTrades.reduce((total, trade) => {
      // Here we're using target price as a proxy for potential exit point if tp1Price isn't available
      if (trade.tp1Price || trade.targetPrice) {
        const direction = trade.direction === "long" ? 1 : -1;
        const entryPrice = trade.entryPrice;
        const slPrice = trade.slPrice || trade.stopLoss;
        const slDistance = Math.abs(entryPrice - slPrice);
        
        if (slDistance > 0) {
          const targetPrice = trade.tp1Price || trade.targetPrice;
          const tp1Distance = Math.abs(targetPrice - entryPrice);
          const potentialRMultiple = (tp1Distance / slDistance);
          
          // If actual R is less than potential, we missed some potential
          if (trade.rMultiple < potentialRMultiple) {
            return total + (potentialRMultiple - trade.rMultiple);
          }
        }
      }
      return total;
    }, 0);
    
    // Calculate percentage of trades that hit TP and SL
    const tradesWithTpInfo = filteredTrades.filter(t => t.tpHit !== undefined);
    const tradesHitTP = tradesWithTpInfo.filter(t => t.tpHit && t.tpHit !== 'none').length;
    const percentTradesHitTP = tradesWithTpInfo.length > 0 
      ? (tradesHitTP / tradesWithTpInfo.length) * 100
      : 0;
    
    // Calculate percentage of trades that hit SL
    const percentTradesHitSL = filteredTrades.length > 0 
      ? (losingTrades.length / filteredTrades.length) * 100
      : 0;
    
    // Get break even metrics
    const beReachedTrades = filteredTrades.filter(t => t.didHitBE === true);
    const tradesHitBE = beReachedTrades.length;
    
    // Trades that hit TP after BE based on explicit user input
    const tradesHitTPAfterBE = beReachedTrades.filter(t => t.tpHitAfterBE === true).length;
    
    // Calculate R metrics after BE
    let rValuesAfterBE: number[] = [];
    let positiveRAfterBE = 0;
    
    beReachedTrades.forEach(trade => {
      if (trade.rMultiple > 0) {
        rValuesAfterBE.push(trade.rMultiple);
        positiveRAfterBE++;
      } else if (trade.rMultiple < 0) {
        rValuesAfterBE.push(trade.rMultiple);
      }
    });
    
    const avgRAfterBE = rValuesAfterBE.length > 0 
      ? rValuesAfterBE.reduce((sum, r) => sum + r, 0) / rValuesAfterBE.length
      : 0;
      
    const maxRAfterBE = rValuesAfterBE.length > 0 
      ? Math.max(...rValuesAfterBE)
      : 0;
      
    const minRAfterBE = rValuesAfterBE.length > 0 
      ? Math.min(...rValuesAfterBE)
      : 0;
    
    const percentPositiveRAfterBE = tradesHitBE > 0 
      ? (positiveRAfterBE / tradesHitBE) * 100
      : 0;
    
    // Calculate missed R after BE based on user data
    let missedRAfterBE = 0;
    beReachedTrades.forEach(trade => {
      if (trade.tp1Price || trade.targetPrice) {
        const slPrice = trade.slPrice || trade.stopLoss;
        const slDistance = Math.abs(trade.entryPrice - slPrice);
        
        if (slDistance > 0) {
          const targetPrice = trade.tp1Price || trade.targetPrice;
          const tp1Distance = Math.abs(targetPrice - trade.entryPrice);
          const potentialRMultiple = (tp1Distance / slDistance);
          
          // If we didn't hit TP after BE, calculate missed R
          if (!trade.tpHitAfterBE && potentialRMultiple > 0) {
            const actualR = Math.max(0, trade.rMultiple); // Only consider positive R or 0
            missedRAfterBE += (potentialRMultiple - actualR);
          }
        }
      }
    });

    // New analysis: R after hitting Take Profit
    // Get trades that hit any take profit level (tp1, tp2, tp3)
    const tpHitTrades = filteredTrades.filter(t => t.tpHit && t.tpHit !== 'none');
    
    // Calculate R metrics for trades that hit TPs
    const rValuesAfterTP = tpHitTrades.map(trade => trade.rMultiple);
    
    const avgRAfterTP = rValuesAfterTP.length > 0
      ? rValuesAfterTP.reduce((sum, r) => sum + r, 0) / rValuesAfterTP.length
      : 0;
      
    const minRAfterTP = rValuesAfterTP.length > 0
      ? Math.min(...rValuesAfterTP)
      : 0;
      
    const maxRAfterTP = rValuesAfterTP.length > 0
      ? Math.max(...rValuesAfterTP)
      : 0;
    
    return {
      avgTimeToTP: winningTrades.length ? 
        formatTime(totalTimeToTPInHours / winningTrades.length) : "N/A",
      avgTimeToSL: losingTrades.length ? 
        formatTime(totalTimeToSLInHours / losingTrades.length) : "N/A",
      potentialR: parseFloat(potentialR.toFixed(2)),
      missedRAfterBE: parseFloat(missedRAfterBE.toFixed(2)),
      tradesHitBE: beReachedTrades.length,
      tradesHitTPAfterBE,
      percentTradesHitTP: parseFloat(percentTradesHitTP.toFixed(2)),
      percentTradesHitSL: parseFloat(percentTradesHitSL.toFixed(2)),
      avgRAfterBE: parseFloat(avgRAfterBE.toFixed(2)),
      maxRAfterBE: parseFloat(maxRAfterBE.toFixed(2)),
      minRAfterBE: parseFloat(minRAfterBE.toFixed(2)),
      percentPositiveRAfterBE: parseFloat(percentPositiveRAfterBE.toFixed(2)),
      avgRAfterTP: parseFloat(avgRAfterTP.toFixed(2)),
      minRAfterTP: parseFloat(minRAfterTP.toFixed(2)),
      maxRAfterTP: parseFloat(maxRAfterTP.toFixed(2)),
      tradesHitTP: tpHitTrades.length
    };
  };
  
  // Helper function to format time in hours to a readable format
  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    } else {
      const d = Math.floor(hours / 24);
      const h = Math.round(hours % 24);
      return `${d}d ${h}h`;
    }
  };

  // Quick access to stats
  const stats = calculateStats();
  
  // Helper component for tooltips
  const InfoTooltip = ({ content }: { content: string }) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 ml-1 inline-flex text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <Card className="glass-effect h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Entry Time & R-Potential
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Time Metrics Section */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1 text-primary" />
                <p className="text-sm font-medium">Time Statistics</p>
                <InfoTooltip content="Average time trades were held before hitting take profit or stop loss" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time to TP</p>
                  <p className="text-xl font-semibold text-positive">{stats.avgTimeToTP}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time to SL</p>
                  <p className="text-xl font-semibold text-negative">{stats.avgTimeToSL}</p>
                </div>
              </div>
            </div>
            
            {/* Outcome Rates Section */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                <p className="text-sm font-medium">Outcome Rates</p>
                <InfoTooltip content="Percentage of trades that hit take profit vs stop loss" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <CircleCheck className="h-4 w-4 mr-1 text-positive" />
                    <p className="text-sm text-muted-foreground">Trades Hit TP</p>
                  </div>
                  <p className="text-xl font-semibold text-positive">{stats.percentTradesHitTP}%</p>
                </div>
                <div>
                  <div className="flex items-center">
                    <CircleX className="h-4 w-4 mr-1 text-negative" />
                    <p className="text-sm text-muted-foreground">Trades Hit SL</p>
                  </div>
                  <p className="text-xl font-semibold text-negative">{stats.percentTradesHitSL}%</p>
                </div>
              </div>
            </div>
            
            {/* NEW TP R Analysis Section */}
            <div className="bg-gradient-to-br from-black/30 to-black/20 p-4 rounded-lg border border-positive/20 shadow-md">
              <div className="flex items-center mb-3">
                <Target className="h-5 w-5 mr-2 text-positive" />
                <p className="text-lg font-medium">Take Profit Analysis</p>
                <InfoTooltip content="Performance metrics for trades that hit take profit levels" />
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm">Trades Hit TP:</p>
                  <p className="text-base font-medium">{stats.tradesHitTP}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="text-sm">Avg R After TP:</p>
                    <InfoTooltip content="Average R-multiple for trades that hit a take profit level" />
                  </div>
                  <p className="text-base font-medium text-positive">{stats.avgRAfterTP}R</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-white/20" />
              
              {/* R metrics after TP */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-positive">R Metrics After Take Profit</p>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="cursor-pointer bg-black/40 hover:bg-black/50 px-3 py-1.5 rounded-full text-xs flex items-center transition-colors">
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        View TP Stats
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="text-sm mb-2 font-medium">R-Multiple After Hitting TP</div>
                      <div className="h-24 w-full bg-black/20 rounded-md flex items-end justify-between px-2 py-1">
                        {stats.tradesHitTP > 0 ? (
                          <>
                            <div className="h-14 w-2 bg-amber-400 rounded-t" title="Min R"></div>
                            <div 
                              className={`h-${Math.max(4, Math.min(16, Math.round(stats.avgRAfterTP * 5)))} w-2 bg-positive rounded-t`}
                              title="Avg R"
                            ></div>
                            <div className="h-18 w-2 bg-green-400 rounded-t" title="Max R"></div>
                          </>
                        ) : (
                          <div className="text-xs text-center w-full mt-8">No TP data available</div>
                        )}
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <div>Min: {stats.minRAfterTP}R</div>
                        <div>Avg: {stats.avgRAfterTP}R</div>
                        <div>Max: {stats.maxRAfterTP}R</div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-3 gap-3 bg-black/10 p-3 rounded-lg">
                  <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <p className="text-xs text-center mb-1">Min R</p>
                    <p className="text-lg font-semibold text-center">{stats.minRAfterTP}R</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <p className="text-xs text-center mb-1">Max R</p>
                    <p className="text-lg font-semibold text-center">{stats.maxRAfterTP}R</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <p className="text-xs text-center mb-1">Total Missed R</p>
                    <p className="text-lg font-semibold text-center text-amber-400">{stats.potentialR}R</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Missed R Potential Section - Keep this after the new TP section */}
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="h-4 w-4 mr-1 text-primary" />
                <p className="text-sm font-medium">Missed R-Potential</p>
                <InfoTooltip content="Additional R you could have gained by holding trades longer" />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Total Missed R</p>
                <p className="text-xl font-semibold text-amber-400">{stats.potentialR}R</p>
              </div>
            </div>
            
            {/* Break Even Analysis Section */}
            <div className="bg-gradient-to-br from-black/30 to-black/20 p-4 rounded-lg border border-primary/20 shadow-md">
              <div className="flex items-center mb-3">
                <CircleSlash className="h-5 w-5 mr-2 text-primary" />
                <p className="text-lg font-medium">Break Even Analysis</p>
                <InfoTooltip content="Performance metrics for trades after reaching break even" />
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm">BE Trades:</p>
                  <p className="text-base font-medium">{stats.tradesHitBE}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Hit TP After BE:</p>
                  <p className="text-base font-medium">{stats.tradesHitTPAfterBE}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <p className="text-sm">Missed R After BE:</p>
                    <InfoTooltip content="Potential R not captured after trade reached break even" />
                  </div>
                  <p className="text-base font-medium text-amber-400">{stats.missedRAfterBE}R</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Avg R After BE:</p>
                  <p className="text-base font-medium">{stats.avgRAfterBE}R</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-white/20" />
              
              {/* R metrics after BE - Enhanced styling */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-primary">R Metrics After Break Even</p>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="cursor-pointer bg-black/40 hover:bg-black/50 px-3 py-1.5 rounded-full text-xs flex items-center transition-colors">
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        View Trend
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="text-sm mb-2 font-medium">R-Multiple Trend After Reaching BE</div>
                      <div className="h-24 w-full bg-black/20 rounded-md flex items-end justify-between px-2 py-1">
                        {stats.tradesHitBE > 0 ? (
                          <>
                            <div className="h-14 w-2 bg-negative rounded-t" title="Min R"></div>
                            <div 
                              className={`h-${Math.max(4, Math.min(16, Math.round(stats.avgRAfterBE * 5)))} w-2 ${stats.avgRAfterBE >= 0 ? 'bg-positive' : 'bg-negative'} rounded-t`} 
                              title="Avg R"
                            ></div>
                            <div className="h-18 w-2 bg-positive rounded-t" title="Max R"></div>
                          </>
                        ) : (
                          <div className="text-xs text-center w-full mt-8">No BE data available</div>
                        )}
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <div>Min: {stats.minRAfterBE}R</div>
                        <div>Avg: {stats.avgRAfterBE}R</div>
                        <div>Max: {stats.maxRAfterBE}R</div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-3 gap-3 bg-black/10 p-3 rounded-lg">
                  <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <p className="text-xs text-center mb-1">Min R</p>
                    <p className="text-lg font-semibold text-center">{stats.minRAfterBE}R</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <p className="text-xs text-center mb-1">Max R</p>
                    <p className="text-lg font-semibold text-center">{stats.maxRAfterBE}R</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <div className="flex items-center justify-center mb-1">
                      <p className="text-xs text-center">+R After BE</p>
                      <InfoTooltip content="Percentage of BE trades that closed with positive R" />
                    </div>
                    <p className="text-lg font-semibold text-center">{stats.percentPositiveRAfterBE}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EntryTimeRAnalysis;
