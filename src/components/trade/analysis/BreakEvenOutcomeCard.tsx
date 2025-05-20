
import React from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { CircleSlash, Info, CircleCheck, CircleX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export const BreakEvenOutcomeCard = () => {
  const { filteredTrades } = useTradeStore();
  
  const calculateBEStats = () => {
    if (!filteredTrades.length) {
      return {
        beTradesCount: 0,
        beTradesThatHitTP: 0,
        beTradesThatHitSL: 0,
        percentBeToTP: 0,
        percentBeToSL: 0,
      };
    }
    
    // Find trades that hit break-even
    const beTrades = filteredTrades.filter(trade => trade.didHitBE === true);
    const beTradesCount = beTrades.length;
    
    if (beTradesCount === 0) {
      return {
        beTradesCount: 0,
        beTradesThatHitTP: 0,
        beTradesThatHitSL: 0,
        percentBeToTP: 0,
        percentBeToSL: 0,
      };
    }
    
    // Calculate BE trades that hit TP afterward
    const beTradesThatHitTP = beTrades.filter(trade => trade.tpHitAfterBE === true).length;
    
    // Calculate BE trades that hit SL afterward
    const beTradesThatHitSL = beTrades.filter(trade => 
      trade.tpHitAfterBE === false && trade.rMultiple < 0
    ).length;
    
    // Calculate percentages
    const percentBeToTP = (beTradesThatHitTP / beTradesCount) * 100;
    const percentBeToSL = (beTradesThatHitSL / beTradesCount) * 100;
    
    return {
      beTradesCount,
      beTradesThatHitTP,
      beTradesThatHitSL,
      percentBeToTP: parseFloat(percentBeToTP.toFixed(2)),
      percentBeToSL: parseFloat(percentBeToSL.toFixed(2)),
    };
  };
  
  const stats = calculateBEStats();
  
  if (stats.beTradesCount === 0) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <div className="bg-black/10 p-4 rounded-lg">
        <div className="flex items-center mb-3">
          <CircleSlash className="h-4 w-4 mr-2 text-primary opacity-80" />
          <p className="text-sm font-medium">Break Even Outcomes</p>
          <InfoTooltip content="What happens after trades reach break even" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/5 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <CircleCheck className="h-3.5 w-3.5 mr-1 text-positive/80" />
              <p className="text-xs text-muted-foreground">BE to TP</p>
            </div>
            <p className="text-base font-medium text-positive/90">{stats.percentBeToTP}%</p>
          </div>
          <div className="bg-black/5 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <CircleX className="h-3.5 w-3.5 mr-1 text-negative/80" />
              <p className="text-xs text-muted-foreground">BE to SL</p>
            </div>
            <p className="text-base font-medium text-negative/90">{stats.percentBeToSL}%</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
