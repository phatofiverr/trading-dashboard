import React, { useMemo, useState } from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { BEHAVIORAL_TAGS, BehavioralTagDefinition, getBehavioralTagById } from '@/constants/behavioralTags';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, TrendingUp, Calendar, Target, Award, Ghost, Zap, Brain } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

interface DemonStats {
  tagId: string;
  count: number;
  percentage: number;
  category: BehavioralTagDefinition['category'];
  lastOccurrence?: Date;
  trend: 'up' | 'down' | 'stable';
}

interface PeriodStats {
  totalDemons: number;
  uniqueDemons: number;
  mostCommonDemon: string | null;
  improvementScore: number;
}

const DemonFinder: React.FC = () => {
  const { trades } = useTradeStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'last' | 'all'>('current');
  
  // Calculate demon statistics
  const demonStats = useMemo(() => {
    // Filter trades that have behavioral tags
    const tradesWithDemons = trades.filter(trade => 
      trade.behavioralTags && trade.behavioralTags.length > 0
    );
    
    // Get date ranges
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = { 
      start: startOfMonth(subMonths(now, 1)), 
      end: endOfMonth(subMonths(now, 1)) 
    };
    
    // Filter trades by period
    const getTradesForPeriod = (period: 'current' | 'last' | 'all') => {
      if (period === 'all') return tradesWithDemons;
      
      const range = period === 'current' ? currentMonth : lastMonth;
      return tradesWithDemons.filter(trade => 
        isWithinInterval(new Date(trade.entryDate), range)
      );
    };
    
    const periodTrades = getTradesForPeriod(selectedPeriod);
    const currentMonthTrades = getTradesForPeriod('current');
    const lastMonthTrades = getTradesForPeriod('last');
    
    // Count demons
    const demonCounts: Record<string, number> = {};
    const demonDates: Record<string, Date[]> = {};
    
    periodTrades.forEach(trade => {
      trade.behavioralTags?.forEach(tagId => {
        demonCounts[tagId] = (demonCounts[tagId] || 0) + 1;
        if (!demonDates[tagId]) demonDates[tagId] = [];
        demonDates[tagId].push(new Date(trade.entryDate));
      });
    });
    
    // Calculate current vs last month for trends
    const currentCounts: Record<string, number> = {};
    const lastCounts: Record<string, number> = {};
    
    currentMonthTrades.forEach(trade => {
      trade.behavioralTags?.forEach(tagId => {
        currentCounts[tagId] = (currentCounts[tagId] || 0) + 1;
      });
    });
    
    lastMonthTrades.forEach(trade => {
      trade.behavioralTags?.forEach(tagId => {
        lastCounts[tagId] = (lastCounts[tagId] || 0) + 1;
      });
    });
    
    // Create demon stats array
    const totalDemons = Object.values(demonCounts).reduce((sum, count) => sum + count, 0);
    
    const stats: DemonStats[] = BEHAVIORAL_TAGS.map(tag => {
      const count = demonCounts[tag.id] || 0;
      const currentCount = currentCounts[tag.id] || 0;
      const lastCount = lastCounts[tag.id] || 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (currentCount > lastCount) trend = 'up';
      else if (currentCount < lastCount) trend = 'down';
      
      return {
        tagId: tag.id,
        count,
        percentage: totalDemons > 0 ? (count / totalDemons) * 100 : 0,
        category: tag.category,
        lastOccurrence: demonDates[tag.id] ? 
          new Date(Math.max(...demonDates[tag.id].map(d => d.getTime()))) : 
          undefined,
        trend
      };
    }).filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);
    
    // Calculate period stats
    const periodStats: PeriodStats = {
      totalDemons: totalDemons,
      uniqueDemons: stats.length,
      mostCommonDemon: stats.length > 0 ? stats[0].tagId : null,
improvementScore: (() => {
        // Improvement score based on percentage of clean trades (no demons)
        // Need to get ALL trades for the period, not just trades with demons
        const getAllTradesForPeriod = (period: 'current' | 'last' | 'all') => {
          if (period === 'all') return trades; // All trades
          
          const now = new Date();
          const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
          const lastMonth = { 
            start: startOfMonth(subMonths(now, 1)), 
            end: endOfMonth(subMonths(now, 1)) 
          };
          
          const range = period === 'current' ? currentMonth : lastMonth;
          return trades.filter(trade => 
            isWithinInterval(new Date(trade.entryDate), range)
          );
        };
        
        const allPeriodTrades = getAllTradesForPeriod(selectedPeriod);
        if (allPeriodTrades.length === 0) return 100;
        
        const cleanTrades = allPeriodTrades.filter(trade => 
          !trade.behavioralTags || trade.behavioralTags.length === 0
        ).length;
        
        // Simple percentage of clean trades
        return Math.round((cleanTrades / allPeriodTrades.length) * 100);
      })()
    };
    
    return { stats, periodStats, currentMonthCount: Object.values(currentCounts).reduce((sum, count) => sum + count, 0) };
  }, [trades, selectedPeriod]);
  
  
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-400" />;
      default: return <div className="h-4 w-4" />;
    }
  };
  
  // Check if any individual demon has reached the warning threshold (10 occurrences this month)
  const criticalDemons = demonStats.stats.filter(demon => {
    // Get current month count for this specific demon
    const currentMonthTrades = trades.filter(trade => 
      trade.behavioralTags?.includes(demon.tagId) &&
      isWithinInterval(new Date(trade.entryDate), { 
        start: startOfMonth(new Date()), 
        end: endOfMonth(new Date()) 
      })
    );
    return currentMonthTrades.length >= 10;
  });
  
  const isWarningLevel = criticalDemons.length > 0;
  
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3">
                      <Ghost className="h-8 w-8" />
                      <span>Demon Finder</span>
                    </h1>
                    <p className="text-muted-foreground">
                      Track and conquer your trading behavioral demons
                    </p>
                  </div>
                  
                  {/* Period Selector */}
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedPeriod === 'current' ? 'glass' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('current')}
                    >
                      This Month
                    </Button>
                    <Button
                      variant={selectedPeriod === 'last' ? 'glass' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('last')}
                    >
                      Last Month
                    </Button>
                    <Button
                      variant={selectedPeriod === 'all' ? 'glass' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('all')}
                    >
                      All Time
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Warning Alert */}
              {isWarningLevel && (
                <Card className="glass-effect bg-red-500/10 border-red-500/20 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">
                          STOP TRADING WARNING
                        </h3>
                        <p className="text-red-300 mb-2">
                          The following demon{criticalDemons.length > 1 ? 's have' : ' has'} reached <strong>10 occurrences</strong> this month:
                        </p>
                        <ul className="text-red-300 mb-2 list-disc list-inside">
                          {criticalDemons.map(demon => {
                            const tagInfo = getBehavioralTagById(demon.tagId as any);
                            const currentMonthCount = trades.filter(trade => 
                              trade.behavioralTags?.includes(demon.tagId) &&
                              isWithinInterval(new Date(trade.entryDate), { 
                                start: startOfMonth(new Date()), 
                                end: endOfMonth(new Date()) 
                              })
                            ).length;
                            return (
                              <li key={demon.tagId}>
                                <strong>{tagInfo?.label}</strong> - {currentMonthCount} times
                              </li>
                            );
                          })}
                        </ul>
                        <p className="text-red-200 text-sm">
                          Take a break, review your trading plan, and work on this specific behavioral issue before continuing.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="glass-effect bg-black/5 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Total Demons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">
                      {demonStats.periodStats.totalDemons}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedPeriod === 'current' ? 'This month' : 
                       selectedPeriod === 'last' ? 'Last month' : 'All time'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect bg-black/5 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Unique Demons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">
                      {demonStats.periodStats.uniqueDemons}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Out of {BEHAVIORAL_TAGS.length} possible
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect bg-black/5 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Improvement Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">
                      {demonStats.periodStats.improvementScore}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      % of trades without demons
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect bg-black/5 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {(() => {
                      // Find the demon with highest count this month
                      const currentMonthDemonCounts = demonStats.stats.map(demon => {
                        const currentMonthCount = trades.filter(trade => 
                          trade.behavioralTags?.includes(demon.tagId) &&
                          isWithinInterval(new Date(trade.entryDate), { 
                            start: startOfMonth(new Date()), 
                            end: endOfMonth(new Date()) 
                          })
                        ).length;
                        return { demon, count: currentMonthCount };
                      }).filter(item => item.count > 0);
                      
                      const highestDemon = currentMonthDemonCounts.reduce((max, current) => 
                        current.count > max.count ? current : max, 
                        { demon: null, count: 0 }
                      );
                      
                      return (
                        <>
                          <div className={`text-2xl font-bold ${isWarningLevel ? 'text-red-400' : ''}`}>
                            {highestDemon.count}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {isWarningLevel ? 'STOP TRADING!' : 'Highest demon count'}
                          </p>
                          {highestDemon.demon && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {getBehavioralTagById(highestDemon.demon.tagId as any)?.label}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
              
              {/* Demon Statistics */}
              <Card className="glass-effect bg-black/5 border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Brain className="h-6 w-6 mr-2" />
                    Your Trading Demons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {demonStats.stats.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">No Demons Found!</h3>
                      <p className="text-muted-foreground">
                        {selectedPeriod === 'all' 
                          ? "You haven't recorded any behavioral mistakes yet. Keep up the disciplined trading!"
                          : `No behavioral mistakes recorded for ${selectedPeriod === 'current' ? 'this month' : 'last month'}. Excellent discipline!`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {demonStats.stats.map((demon) => {
                        const tagInfo = getBehavioralTagById(demon.tagId as any);
                        if (!tagInfo) return null;
                        
                        return (
                          <div
                            key={demon.tagId}
                            className="flex items-center justify-between p-4 glass-effect bg-black/5 rounded-lg border-0 transition-all hover:bg-black/10"
                          >
                            <div className="flex items-center space-x-4 flex-1">
                              <Zap className="h-6 w-6 text-orange-500" />
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-medium">{tagInfo.label}</h4>
                                  {getTrendIcon(demon.trend)}
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">{tagInfo.description}</p>
                                
                                {(() => {
                                  // Calculate what percentage of total trades in the period had this demon
                                  const getTradesForPeriod = (period: 'current' | 'last' | 'all') => {
                                    const tradesWithDemons = trades.filter(trade => 
                                      trade.behavioralTags && trade.behavioralTags.length > 0
                                    );
                                    
                                    if (period === 'all') return trades; // All trades, not just those with demons
                                    
                                    const now = new Date();
                                    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
                                    const lastMonth = { 
                                      start: startOfMonth(subMonths(now, 1)), 
                                      end: endOfMonth(subMonths(now, 1)) 
                                    };
                                    
                                    const range = period === 'current' ? currentMonth : lastMonth;
                                    return trades.filter(trade => 
                                      isWithinInterval(new Date(trade.entryDate), range)
                                    );
                                  };
                                  
                                  const currentPeriodTrades = getTradesForPeriod(selectedPeriod);
                                  const totalTradesInPeriod = currentPeriodTrades.length;
                                  const tradesWithThisDemon = currentPeriodTrades.filter((trade: any) => 
                                    trade.behavioralTags?.includes(demon.tagId)
                                  ).length;
                                  const tradeRatio = totalTradesInPeriod > 0 ? 
                                    ((tradesWithThisDemon / totalTradesInPeriod) * 100).toFixed(1) : '0';
                                  
                                  return (
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Affected {tradeRatio}% of your trades ({tradesWithThisDemon}/{totalTradesInPeriod})
                                    </p>
                                  );
                                })()}
                                
                                {demon.lastOccurrence && (
                                  <p className="text-xs text-muted-foreground">
                                    Last occurrence: {format(demon.lastOccurrence, 'MMM dd, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold mb-1">
                                {demon.count}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {demon.percentage.toFixed(1)}%
                              </div>
                              <Progress 
                                value={demon.percentage} 
                                className="w-20 h-2"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DemonFinder;