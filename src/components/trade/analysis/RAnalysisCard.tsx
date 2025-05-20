import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Target, CircleSlash, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trade } from '@/types/Trade'; // Add this import to fix the error

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

const RAnalysisCard: React.FC = () => {
  const { filteredTrades } = useTradeStore();
  
  // Calculate R-potential statistics
  const calculateTPStats = () => {
    if (!filteredTrades.length) {
      return {
        avgRAfterTP: 0,
        minRAfterTP: 0,
        maxRAfterTP: 0,
        tradesHitTP: 0
      };
    }
    
    // TP Analysis
    const tpHitTrades = filteredTrades.filter(t => t.tpHit && t.tpHit !== 'none');
    
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
      avgRAfterTP: parseFloat(avgRAfterTP.toFixed(2)),
      minRAfterTP: parseFloat(minRAfterTP.toFixed(2)),
      maxRAfterTP: parseFloat(maxRAfterTP.toFixed(2)),
      tradesHitTP: tpHitTrades.length
    };
  };

  // Calculate break even statistics
  const calculateBEStats = () => {
    if (!filteredTrades.length) {
      return {
        tradesHitBE: 0,
        tradesHitTPAfterBE: 0,
        beTradesThatHitSL: 0,
        percentBeToTP: 0,
        percentBeToSL: 0,
      };
    }
    
    // Find trades that hit break-even
    const beTrades = filteredTrades.filter(trade => trade.didHitBE === true);
    const tradesHitBE = beTrades.length;
    
    if (tradesHitBE === 0) {
      return {
        tradesHitBE: 0,
        tradesHitTPAfterBE: 0,
        beTradesThatHitSL: 0,
        percentBeToTP: 0,
        percentBeToSL: 0,
      };
    }
    
    // Calculate BE trades that hit TP afterward
    const tradesHitTPAfterBE = beTrades.filter(trade => trade.tpHitAfterBE === true).length;
    
    // Calculate BE trades that hit SL afterward
    const beTradesThatHitSL = beTrades.filter(trade => 
      trade.tpHitAfterBE === false && trade.rMultiple < 0
    ).length;
    
    // Calculate percentages
    const percentBeToTP = (tradesHitTPAfterBE / tradesHitBE) * 100;
    const percentBeToSL = (beTradesThatHitSL / tradesHitBE) * 100;
    
    return {
      tradesHitBE,
      tradesHitTPAfterBE,
      beTradesThatHitSL,
      percentBeToTP: parseFloat(percentBeToTP.toFixed(2)),
      percentBeToSL: parseFloat(percentBeToSL.toFixed(2)),
    };
  };

  // Calculate Sharpe Ratio
  const calculateSharpeRatio = (trades: Trade[]): number => {
    if (trades.length < 2) return 0;
    
    const rMultiples = trades
      .filter(trade => !trade.isPlaceholder)
      .map(trade => trade.rMultiple);
    
    const meanReturn = rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
    
    const squaredDeviations = rMultiples.map(r => Math.pow(r - meanReturn, 2));
    const variance = squaredDeviations.reduce((sum, dev) => sum + dev, 0) / rMultiples.length;
    const stdDev = Math.sqrt(variance);
    
    // Avoid division by zero
    if (stdDev === 0) return 0;
    
    // Sharpe Ratio = (Mean Return - Risk Free Rate) / Standard Deviation
    // With risk-free rate = 0
    return meanReturn / stdDev;
  };

  const tpStats = calculateTPStats();
  const beStats = calculateBEStats();
  const sharpeRatio = calculateSharpeRatio(filteredTrades);
  const sharpeThreshold = 1.0; // Threshold for good Sharpe Ratio
  
  return (
    <Card className="glass-effect h-full col-span-2">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Take Profit Analysis Section - Minimal Design */}
          <div className="bg-black/10 p-4 rounded-lg h-full flex flex-col">
            <div className="flex items-center mb-4">
              <Target className="h-4 w-4 mr-2 text-positive opacity-80" />
              <p className="text-sm font-medium">Take Profit Analysis</p>
              <InfoTooltip content="Performance metrics for trades that hit take profit levels" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 flex-grow">
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">Trades Hit TP</p>
                <p className="text-base font-medium">{tpStats.tradesHitTP}</p>
              </div>
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">Avg R After TP</p>
                <p className="text-base font-medium text-positive/90">{tpStats.avgRAfterTP}R</p>
              </div>
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">Min R</p>
                <p className="text-base font-medium">{tpStats.minRAfterTP}R</p>
              </div>
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">Max R</p>
                <p className="text-base font-medium">{tpStats.maxRAfterTP}R</p>
              </div>
            </div>
          </div>
          
          {/* Break Even Analysis Section - Minimal Design */}
          <div className="bg-black/10 p-4 rounded-lg h-full flex flex-col">
            <div className="flex items-center mb-4">
              <CircleSlash className="h-4 w-4 mr-2 text-primary opacity-80" />
              <p className="text-sm font-medium">Break Even Analysis</p>
              <InfoTooltip content="Performance metrics for trades after reaching break even" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 flex-grow">
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">BE Trades</p>
                <p className="text-base font-medium">{beStats.tradesHitBE}</p>
              </div>
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">TP After BE</p>
                <p className="text-base font-medium">{beStats.tradesHitTPAfterBE}</p>
              </div>
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">BE→TP Rate</p>
                <p className="text-base font-medium text-positive/80">{beStats.percentBeToTP}%</p>
              </div>
              <div className="bg-black/5 p-3 rounded-lg flex flex-col justify-center">
                {/* Replaced BE→SL Rate with Sharpe Ratio */}
                <p className="text-xs text-muted-foreground mb-1">BE→SL Rate</p>
                <p className="text-base font-medium text-negative/80">{beStats.percentBeToSL}%</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAnalysisCard;
