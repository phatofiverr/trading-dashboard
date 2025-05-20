
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { isTradeWin } from '@/hooks/slices/useTradesSlice';
import { MostTradedPairsCardProps } from './TradeComponentProps';

// MostTradedPairsCard component
const MostTradedPairsCard: React.FC<MostTradedPairsCardProps> = ({ trades }) => {
  interface PairStat {
    pair: string;
    count: number;
  }
  
  // Calculate most traded pairs
  const calculateMostTradedPairs = (): PairStat[] => {
    if (!trades || !trades.length) return [];
    
    const pairCounts: Record<string, number> = {};
    trades.forEach(trade => {
      const instrumentName = trade.instrument || trade.pair;
      if (instrumentName) {
        pairCounts[instrumentName] = (pairCounts[instrumentName] || 0) + 1;
      }
    });
    
    return Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Show top 5 pairs
      .map(([pair, count]) => ({ pair, count }));
  };
  
  const pairs = calculateMostTradedPairs();

  return (
    <Card className="glass-effect h-full">
      <CardContent className="p-6 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4">Most Traded Pairs</p>
        {pairs.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {pairs.map(({ pair, count }) => (
              <div key={pair} className="flex justify-between items-center">
                <span className="font-medium">{pair}</span>
                <span className="text-sm text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MostTradedPairsCard;
