import React, { useEffect, useState } from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  ChevronUp, 
  ChevronDown, 
  TrendingUp,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StrategyPerformance } from '@/types/Trade';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import ThemeSelector from '@/components/trade/ThemeSelector';
import EquityBalanceHistory from '@/components/trade/EquityBalanceHistory';
import TradingCalendar from '@/components/trade/TradingCalendar';

const StrategyCard = ({ strategy }) => (
  <Card key={strategy.name} className="bg-black/20 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
    <CardContent className="p-4">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{strategy.name}</h3>
          {strategy.profit >= 0 ? (
            <ChevronUp className="h-5 w-5 text-positive" />
          ) : (
            <ChevronDown className="h-5 w-5 text-negative" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="text-2xl font-medium">
            {strategy.profit.toFixed(2)}R
          </div>
          <div className="text-xs text-muted-foreground">
            Win rate: {strategy.winRate.toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {strategy.tradesCount} trades
          </div>
        </div>
        
        <Link to={`/?strategy=${encodeURIComponent(strategy.name)}`} className="mt-2">
          <Button variant="minimal" className="w-full justify-between p-2 h-auto text-xs bg-black/20 hover:bg-black/40 border-0 shadow-sm transition-all">
            View details
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { fetchAllStrategyPerformance, fetchTrades } = useTradeStore();
  const [strategies, setStrategies] = useState<StrategyPerformance[]>([]);
  const [equityCurveData, setEquityCurveData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // First fetch all trades to ensure data is loaded
        await fetchTrades();
        
        // Then get performance data for each strategy
        const performanceData = await fetchAllStrategyPerformance();
        setStrategies(performanceData);
        
        // Extract available pairs from trades
        const { trades } = useTradeStore.getState();
        const pairs = [...new Set(trades.map(trade => trade.instrument || trade.pair || 'Unknown'))];
        setAvailablePairs(pairs.filter(p => p !== 'Unknown'));
        
        // Generate equity curve data for all strategies
        generateEquityCurveData(performanceData.map(strategy => strategy.name));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [fetchTrades, fetchAllStrategyPerformance]);
  
  // Generate equity curve data for multiple strategies
  const generateEquityCurveData = (strategyNames: string[]) => {
    const { trades } = useTradeStore.getState();
    
    // Filter trades by selected pair if any
    const filteredTrades = selectedPair 
      ? trades.filter(t => (t.instrument || t.pair) === selectedPair)
      : trades;
    
    // Create a map of dates to hold cumulative R values for each strategy
    const strategiesData: Record<string, Record<string, number>> = {};
    
    strategyNames.forEach(strategy => {
      const strategyTrades = filteredTrades
        .filter(t => t.strategyId === strategy)
        .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
      
      let cumulativeR = 0;
      
      strategyTrades.forEach(trade => {
        const date = new Date(trade.entryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        cumulativeR += trade.rMultiple;
        
        if (!strategiesData[date]) {
          strategiesData[date] = {};
        }
        
        strategiesData[date][strategy] = cumulativeR;
      });
    });
    
    // Convert the map to array for Recharts
    const chartData = Object.entries(strategiesData).map(([date, values]) => ({
      date,
      ...values
    }));
    
    // Sort by date
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setEquityCurveData(chartData);
  };

  // Handle pair selection
  const handlePairSelect = (pair: string | null) => {
    setSelectedPair(pair);
    // Regenerate equity curve data with the selected pair
    generateEquityCurveData(strategies.map(strategy => strategy.name));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium">Trading Dashboard</h1>
        
        {/* Theme and Filter dropdowns */}
        <div className="flex items-center gap-2">
          <ThemeSelector />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {selectedPair ? `Pair: ${selectedPair}` : 'All Pairs'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Pair</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlePairSelect(null)}>
                All Pairs
              </DropdownMenuItem>
              {availablePairs.map(pair => (
                <DropdownMenuItem key={pair} onClick={() => handlePairSelect(pair)}>
                  {pair}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* New Equity Balance History and Trading Calendar side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <EquityBalanceHistory />
        </div>
        <div className="col-span-1">
          <TradingCalendar />
        </div>
      </div>
      
      {/* Strategy Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-black/20 backdrop-blur-md border border-white/5 shadow-lg animate-pulse">
              <CardContent className="p-6 h-32"></CardContent>
            </Card>
          ))
        ) : (
          strategies.slice(0, 4).map((strategy) => (
            <StrategyCard key={strategy.name} strategy={strategy} />
          ))
        )}
      </div>
      
      {/* Combined Equity Curve */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/5 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-medium">
            {selectedPair ? `Strategy Comparison - ${selectedPair}` : 'Strategy Comparison'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : equityCurveData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityCurveData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#999' }}
                    axisLine={{ stroke: '#222222', opacity: 0.15 }}
                    tickLine={{ stroke: '#222222', opacity: 0.1 }}
                  />
                  <YAxis 
                    stroke="transparent"
                    tick={{ fill: '#999' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(26, 26, 26, 0.95)', 
                      borderColor: 'rgba(64, 64, 64, 0.2)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      color: '#F9FAFB'
                    }}
                    itemStyle={{ color: '#F9FAFB' }}
                    labelStyle={{ color: '#F9FAFB', marginBottom: '4px' }}
                  />
                  <Legend />
                  
                  {strategies.map((strategy, index) => {
                    // Array of grayscale colors for different strategies
                    const colors = [
                      "#FFFFFF", // White
                      "#CCCCCC", // Light gray
                      "#999999", // Medium gray
                      "#666666", // Dark gray
                      "#333333", // Very dark gray
                      "#AAAAAA", // Another gray
                    ];
                    
                    return (
                      <Line
                        key={strategy.name}
                        type="monotone"
                        dataKey={strategy.name}
                        name={strategy.name}
                        stroke={colors[index % colors.length]}
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">No trade data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Strategy Details Table */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/5 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">
            {selectedPair ? `Strategy Details - ${selectedPair}` : 'Strategy Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Strategy</th>
                  <th className="text-right py-3 px-4">Win Rate</th>
                  <th className="text-right py-3 px-4">Profit</th>
                  <th className="text-right py-3 px-4">Trades</th>
                  <th className="text-right py-3 px-4">Last Trade</th>
                  <th className="text-right py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={6} className="py-3 px-4">
                        <div className="h-6 bg-white/10 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : strategies.length > 0 ? (
                  strategies.map((strategy) => (
                    <tr key={strategy.name} className="border-b border-white/5 hover:bg-black/20 transition-colors">
                      <td className="py-3 px-4 font-medium">{strategy.name}</td>
                      <td className="text-right py-3 px-4">{strategy.winRate.toFixed(2)}%</td>
                      <td className={`text-right py-3 px-4 ${strategy.profit >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {strategy.profit.toFixed(2)}R
                      </td>
                      <td className="text-right py-3 px-4">{strategy.tradesCount}</td>
                      <td className="text-right py-3 px-4">
                        {strategy.lastTradeDate ? new Date(strategy.lastTradeDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Link to={`/?strategy=${encodeURIComponent(strategy.name)}`}>
                          <Button variant="minimal" size="sm" className="bg-black/20 hover:bg-black/40 border-0 shadow-sm transition-all">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No strategies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
