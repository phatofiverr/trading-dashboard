
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import SessionPerformanceChart, { SessionStats } from './SessionPerformanceChart';
import { isTradeWin } from '@/hooks/slices/useTradesSlice';

// MostTradedPairsCard component
export const MostTradedPairsCard = ({ pairs }: { pairs: { pair: string; count: number }[] }) => (
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
  const calculateSessionStats = (): SessionStats => {
    if (!trades.length) return { 
      London: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 }, 
      NY: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 },
      Asia: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 },
      Overlap: { total: 0, winRate: 0, breakEvenRate: 0, lossRate: 0, won: 0, breakEven: 0, lost: 0 }
    };
    
    const sessions: Record<string, { total: number; won: number; breakEven: number; lost: number }> = {
      London: { total: 0, won: 0, breakEven: 0, lost: 0 },
      NY: { total: 0, won: 0, breakEven: 0, lost: 0 },
      Asia: { total: 0, won: 0, breakEven: 0, lost: 0 },
      Overlap: { total: 0, won: 0, breakEven: 0, lost: 0 },
      "Late NY": { total: 0, won: 0, breakEven: 0, lost: 0 } // Add Late NY tracking separately
    };
    
    trades.forEach(trade => {
      // Check for session overlap
      if (trade.session) {
        // For example purposes, we'll determine overlapping sessions based on trading time
        // Let's assume:
        // - London + NY overlap: 8:00-12:00 UTC
        // - Asia + London overlap: 7:00-9:00 UTC
        let isOverlap = false;
        
        // Check for session overlap based on trade time
        if (trade.entryTime) {
          const entryHour = new Date(trade.entryTime).getUTCHours();
          
          // London + NY overlap (8:00-12:00 UTC)
          if ((entryHour >= 8 && entryHour < 12) && 
              (trade.session === "London" || trade.session === "NY" || trade.session === "Late NY")) {
            isOverlap = true;
          }
          
          // Asia + London overlap (7:00-9:00 UTC)
          if ((entryHour >= 7 && entryHour < 9) && 
              (trade.session === "Asia" || trade.session === "London")) {
            isOverlap = true;
          }
        }
        
        // Handle 'Late NY' as part of 'NY'
        const sessionKey = isOverlap ? "Overlap" : 
                          (trade.session === "Late NY" ? "NY" : trade.session);
        
        if (sessions[sessionKey]) {
          sessions[sessionKey].total++;
          
          // Use isTradeWin function to determine if trade is a win based on direction
          const isWin = isTradeWin(trade);
          
          if (isWin) sessions[sessionKey].won++;
          else if (trade.rMultiple === 0) sessions[sessionKey].breakEven++;
          else sessions[sessionKey].lost++;
        }
      }
    });
    
    // Calculate final stats
    const resultStats: SessionStats = Object.entries(sessions).reduce<SessionStats>((acc, [session, stats]) => {
      // Skip adding Late NY to final stats as it's already combined with NY
      if (session === "Late NY") return acc;
      
      const winRate = stats.total ? (stats.won / stats.total) * 100 : 0;
      const breakEvenRate = stats.total ? (stats.breakEven / stats.total) * 100 : 0;
      const lossRate = stats.total ? (stats.lost / stats.total) * 100 : 0;
      
      return {
        ...acc,
        [session]: {
          total: stats.total,
          winRate,
          breakEvenRate,
          lossRate,
          won: stats.won,
          breakEven: stats.breakEven,
          lost: stats.lost
        }
      };
    }, {});
    
    return resultStats;
  };
  
  // Get data
  const mostTradedPairs = calculateMostTradedPairs();
  const sessionStats = calculateSessionStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-[350px]">
        <SessionPerformanceChart sessionStats={sessionStats} />
      </div>
      <div>
        <MostTradedPairsCard pairs={mostTradedPairs} />
      </div>
    </div>
  );
};

export default PairsAndDirections;
