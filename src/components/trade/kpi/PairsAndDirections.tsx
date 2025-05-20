
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import SessionRadarChart from '../SessionRadarChart';

// MostTradedPairsCard component
export const MostTradedPairsCard = ({ pairs }: { pairs: { pair: string; count: number }[] }) => (
  <Card className="glass-effect">
    <CardContent className="p-4 flex flex-col">
      <p className="text-sm text-muted-foreground mb-2">Most Traded Pairs</p>
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
        <p className="text-sm">No data available</p>
      )}
    </CardContent>
  </Card>
);

const PairsAndDirections = () => {
  const { filteredTrades: trades } = useTradeStore();
  
  // Calculate most traded pairs
  const calculateMostTradedPairs = () => {
    if (!trades.length) return [];
    
    const pairCounts: Record<string, number> = {};
    trades.forEach(trade => {
      const instrumentName = trade.instrument || trade.pair;
      if (instrumentName) {
        pairCounts[instrumentName] = (pairCounts[instrumentName] || 0) + 1;
      }
    });
    
    return Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pair, count]) => ({ pair, count }));
  };
  
  // Calculate session stats
  const calculateSessionStats = () => {
    if (!trades.length) return { 
      London: { total: 0, winRate: 0, breakEvenRate: 0 }, 
      NY: { total: 0, winRate: 0, breakEvenRate: 0 },
      Asia: { total: 0, winRate: 0, breakEvenRate: 0 }
    };
    
    const sessions: Record<string, { total: number; won: number; breakEven: number }> = {
      London: { total: 0, won: 0, breakEven: 0 },
      NY: { total: 0, won: 0, breakEven: 0 },
      Asia: { total: 0, won: 0, breakEven: 0 }
    };
    
    trades.forEach(trade => {
      if (trade.session && sessions[trade.session]) {
        sessions[trade.session].total++;
        if (trade.rMultiple > 0) sessions[trade.session].won++;
        else if (trade.rMultiple === 0) sessions[trade.session].breakEven++;
      }
    });
    
    return Object.entries(sessions).reduce<Record<string, { total: number; winRate: number; breakEvenRate: number }>>((acc, [session, stats]) => {
      return {
        ...acc,
        [session]: {
          total: stats.total,
          winRate: stats.total ? (stats.won / stats.total) * 100 : 0,
          breakEvenRate: stats.total ? (stats.breakEven / stats.total) * 100 : 0
        }
      };
    }, {});
  };
  
  // Get data
  const mostTradedPairs = calculateMostTradedPairs();
  const sessionStats = calculateSessionStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-[350px]">
        <SessionRadarChart sessionStats={sessionStats} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <MostTradedPairsCard pairs={mostTradedPairs} />
      </div>
    </div>
  );
};

export default PairsAndDirections;
