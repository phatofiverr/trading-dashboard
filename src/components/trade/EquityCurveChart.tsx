import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { calculateSharpeRatio } from '@/lib/tradeCalculations';

const EquityCurveChart: React.FC = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { filteredTrades: trades } = useTradeStore();
  const { getThemeColorsForStrategy } = useThemeStore();
  const colors = getThemeColorsForStrategy(strategyId);
  const [fixedRValue, setFixedRValue] = useState<number>(1); // Default fixed R value
  const [curveType, setCurveType] = useState<'stepAfter' | 'monotone' | 'linear'>('stepAfter');
  const [showByPair, setShowByPair] = useState<boolean>(true); // New state to toggle pair lines
  const [showProjections, setShowProjections] = useState<boolean>(false); // New state for projections
  
  // Format data for chart
  const chartData = useMemo(() => {
    if (!trades.length) return [{
      index: 0,
      tradeId: 'start',
      date: 'Start',
      instrument: '',
      rMultiple: 0,
      cumulativeR: 0,
      fixedR: 0,
      pnl: '0%',
      isProfit: false,
      isBreakEven: false
    }];
    
    // Filter out placeholder trades
    const activeTrades = trades.filter(trade => !trade.isPlaceholder);
    
    if (activeTrades.length === 0) return [{
      index: 0,
      tradeId: 'start',
      date: 'Start',
      instrument: '',
      rMultiple: 0,
      cumulativeR: 0,
      fixedR: 0,
      pnl: '0%',
      isProfit: false,
      isBreakEven: false
    }];
    
    // Sort trades by entry date
    const sortedTrades = [...activeTrades].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );
    
    // Always start with initial point of 0
    const result = [{
      index: 0,
      tradeId: 'start',
      date: 'Start',
      instrument: '',
      rMultiple: 0,
      cumulativeR: 0,
      fixedR: 0,
      pnl: '0%',
      isProfit: false,
      isBreakEven: false
    }];
    
    let cumulativeR = 0;
    let fixedR = 0; // Start fixed R at 0
    
    // For pair-based tracking
    const pairCumulativeR = new Map<string, number>();
    const tradedPairs = new Set<string>();
    const pairTradeIndices = new Map<string, number[]>();
    const pairFirstLastDates = new Map<string, {first: string, last: string}>();
    
    sortedTrades.forEach((trade, index) => {
      // Break even trades are those with R multiple of exactly 0
      const isBreakEven = trade.rMultiple === 0;
      cumulativeR += trade.rMultiple;
      
      // Track pair-specific cumulative R
      const pair = trade.instrument || trade.pair || 'Unknown';
      tradedPairs.add(pair);
      
      // Initialize pair data if not present
      if (!pairCumulativeR.has(pair)) {
        pairCumulativeR.set(pair, 0);
        pairTradeIndices.set(pair, []);
      }
      
      // Track this trade's index for the pair
      pairTradeIndices.get(pair)?.push(index + 1);
      
      // Update the pair's cumulative R
      const pairCurrentR = pairCumulativeR.get(pair) || 0;
      pairCumulativeR.set(pair, pairCurrentR + trade.rMultiple);
      
      // Track first and last trade dates for each pair
      const formattedDate = new Date(trade.entryDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!pairFirstLastDates.has(pair)) {
        pairFirstLastDates.set(pair, {first: formattedDate, last: formattedDate});
      } else {
        pairFirstLastDates.get(pair)!.last = formattedDate;
      }
      
      // Calculate fixed R: add fixedRValue for wins, subtract 1 for losses, add 0 for break-even
      if (trade.rMultiple > 0) {
        fixedR += fixedRValue; // Win adds the fixed R value
      } else if (trade.rMultiple < 0) {
        fixedR -= 1; // Loss subtracts 1
      }
      // Break-even adds 0, so no change
      
      // Create a data point with cumulative values for each pair
      const dataPoint = {
        index: index + 1, // Index starts at 1 for actual trades (fixed)
        tradeId: trade.tradeId || trade.id.substring(0, 8),
        date: formattedDate,
        instrument: pair,
        rMultiple: parseFloat(trade.rMultiple.toFixed(2)),
        cumulativeR: parseFloat(cumulativeR.toFixed(2)),
        fixedR: parseFloat(fixedR.toFixed(2)),
        pnl: trade.percentageGainLoss ? trade.percentageGainLoss.toFixed(2) + "%" : "N/A",
        isProfit: trade.rMultiple > 0,
        isBreakEven: isBreakEven
      };
      
      // Add pair cumulative R values to the data point
      tradedPairs.forEach(pairName => {
        dataPoint[`${pairName}_R`] = parseFloat((pairCumulativeR.get(pairName) || 0).toFixed(2));
      });
      
      result.push(dataPoint);
    });
    
    return result;
  }, [trades, fixedRValue]);
  
  // Calculate projection data starting from the last known point
  const projectionData = useMemo(() => {
    if (!showProjections || chartData.length <= 1) return [];
    
    const lastDataPoint = chartData[chartData.length - 1];
    const lastIndex = lastDataPoint.index;
    const lastCumulativeR = lastDataPoint.cumulativeR;
    
    // Filter out placeholder trades for calculations
    const activeTrades = trades.filter(trade => !trade.isPlaceholder);
    
    // Calculate average R multiple and win rate
    const totalTrades = activeTrades.length;
    if (totalTrades === 0) return [];
    
    const winningTrades = activeTrades.filter(trade => trade.rMultiple > 0);
    const winRate = winningTrades.length / totalTrades;
    
    // Calculate average R for wins and losses
    const avgWinR = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + trade.rMultiple, 0) / winningTrades.length 
      : 1.5; // Default if no winning trades
    
    const losingTrades = activeTrades.filter(trade => trade.rMultiple < 0);
    const avgLossR = losingTrades.length > 0 
      ? losingTrades.reduce((sum, trade) => sum + trade.rMultiple, 0) / losingTrades.length 
      : -1; // Default if no losing trades
    
    // Calculate standard deviation of R multiples
    const avgR = activeTrades.reduce((sum, trade) => sum + trade.rMultiple, 0) / totalTrades;
    const variance = activeTrades.reduce((sum, trade) => sum + Math.pow(trade.rMultiple - avgR, 2), 0) / totalTrades;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Sharpe ratio for risk adjustment
    const sharpeRatio = calculateSharpeRatio(activeTrades);
    
    // Projection parameters
    const projectionLength = 100; // Number of future trades to project
    const bestCaseWinRateAdjustment = Math.min(winRate * 1.15, 0.95); // +15% but cap at 95%
    const worstCaseWinRateAdjustment = Math.max(winRate * 0.85, 0.05); // -15% but floor at 5%
    
    // Best case: higher win rate, higher avg win R, lower avg loss R
    const bestCaseAvgWinR = avgWinR * 1.1; // 10% higher average win
    const bestCaseAvgLossR = avgLossR * 0.9; // 10% smaller average loss
    
    // Worst case: lower win rate, lower avg win R, higher avg loss R
    const worstCaseAvgWinR = avgWinR * 0.9; // 10% lower average win
    const worstCaseAvgLossR = avgLossR * 1.1; // 10% larger average loss
    
    const projections = [];
    
    // Generate best and worst case projections
    let bestCaseCumulativeR = lastCumulativeR;
    let worstCaseCumulativeR = lastCumulativeR;
    
    for (let i = 1; i <= projectionLength; i++) {
      const tradeIndex = lastIndex + i;
      
      // Best case simulation
      const bestCaseIsWin = Math.random() < bestCaseWinRateAdjustment;
      bestCaseCumulativeR += bestCaseIsWin ? bestCaseAvgWinR : bestCaseAvgLossR;
      
      // Worst case simulation
      const worstCaseIsWin = Math.random() < worstCaseWinRateAdjustment;
      worstCaseCumulativeR += worstCaseIsWin ? worstCaseAvgWinR : worstCaseAvgLossR;
      
      projections.push({
        index: tradeIndex,
        bestCaseCumulativeR: parseFloat(bestCaseCumulativeR.toFixed(2)),
        worstCaseCumulativeR: parseFloat(worstCaseCumulativeR.toFixed(2)),
        isProjection: true
      });
    }
    
    return projections;
  }, [showProjections, chartData, trades]);
  
  // Get unique traded pairs from data
  const tradedPairs = useMemo(() => {
    const pairs = new Set<string>();
    
    chartData.forEach(point => {
      if (point.instrument && point.instrument !== '') {
        pairs.add(point.instrument);
      }
      
      // Check for pair-specific R values
      Object.keys(point).forEach(key => {
        if (key.endsWith('_R')) {
          const pairName = key.replace('_R', '');
          pairs.add(pairName);
        }
      });
    });
    
    return Array.from(pairs).filter(pair => pair !== 'Unknown');
  }, [chartData]);
  
  // Get first and last trade dates for each pair
  const pairDateLabels = useMemo(() => {
    const labels: Record<string, {first: string, last: string}> = {};
    
    // Group trades by pair
    const pairTrades = trades.reduce((acc, trade) => {
      const pair = trade.instrument || trade.pair || 'Unknown';
      if (!acc[pair]) acc[pair] = [];
      acc[pair].push(trade);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Get first and last trade dates for each pair
    Object.entries(pairTrades).forEach(([pair, pairTradeList]) => {
      if (pairTradeList.length === 0) return;
      
      // Sort trades by date
      const sortedTrades = [...pairTradeList].sort(
        (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
      );
      
      const firstTrade = sortedTrades[0];
      const lastTrade = sortedTrades[sortedTrades.length - 1];
      
      labels[pair] = {
        first: new Date(firstTrade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        last: new Date(lastTrade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
    
    return labels;
  }, [trades]);
  
  // Generate colors for each pair
  const getPairColor = (index: number) => {
    // Updated with mysterious fintech palette - dark-muted high-contrast colors
    const colors = [
      '#1A1F2C', // Dark purple-blue
      '#7E69AB', // Secondary purple
      '#403E43', // Charcoal gray
      '#6E59A5', // Tertiary purple
      '#555555', // Mid gray
      '#221F26', // Dark charcoal
      '#8E9196', // Neutral gray
      '#444444', // Dark gray
      '#333333', // Darker gray
      '#666666', // Light gray
    ];
    
    return colors[index % colors.length];
  };
  
  // Export chart as PNG
  const exportChart = () => {
    const svgElement = document.querySelector('.recharts-surface');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    
    // Create image - moved declaration above usage
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'trading-equity-curve.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  // Handle Fixed R value change
  const handleFixedRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFixedRValue(value);
    }
  };
  
  // Toggle projections
  const toggleProjections = () => {
    setShowProjections(!showProjections);
  };
  
  if (!trades.length) {
    return (
      <Card className="border-trading-border glass-effect h-full">
        <CardContent className="h-full flex items-center justify-center p-6">
          <p className="text-muted-foreground">No trades available to display</p>
        </CardContent>
      </Card>
    );
  }
  
  // Combine chart data with projections if enabled
  const combinedData = showProjections && projectionData.length > 0
    ? [...chartData, ...projectionData]
    : chartData;
  
  // Calculate the domain for X-axis when projections are enabled
  const calculateXDomain = () => {
    if (!showProjections || projectionData.length === 0) {
      return undefined; // Let recharts handle the domain normally when no projections
    }
    
    const actualDataMax = chartData.length > 0 ? chartData[chartData.length - 1].index : 0;
    const projectionDataMax = projectionData.length > 0 ? projectionData[projectionData.length - 1].index : actualDataMax;
    
    // The domain is the full range of indices
    return [0, actualDataMax + projectionData.length];
  };
  
  // Create a custom tick formatter for the X axis to ensure proper labeling
  const formatXAxisTick = (value: number) => {
    // Simply return the value as a string when no projections
    if (!showProjections || projectionData.length === 0) {
      return value.toString();
    }

    // Return the value as a string (actual tick value)
    return value.toString();
  };

  // Calculate actual data and projection boundaries for visual rendering
  const getAxisProps = () => {
    if (!showProjections || projectionData.length === 0) {
      return {
        ticks: undefined, // Let recharts handle ticks automatically
        scale: "auto"
      };
    }
    
    const actualDataMax = chartData.length > 0 ? chartData[chartData.length - 1].index : 0;
    const totalDataPoints = actualDataMax + projectionData.length;
    
    // Create strategic tick positions at start, 35% mark (transition point), and end
    // This helps visually establish the 35/65 split without overcrowding
    const transitionPoint = actualDataMax;
    
    return {
      // Place ticks at key positions: start, transition point between actual/projected, and end
      ticks: [0, Math.floor(actualDataMax * 0.5), transitionPoint, Math.floor(transitionPoint + projectionData.length * 0.5), totalDataPoints],
      // Use 'point' scale to ensure even spacing of data points
      scale: "point",
      // This is the key property to achieve the 35/65 split
      interval: "preserveStartEnd" as const // Fixed type error by using 'as const'
    };
  };

  // Get axis configuration based on projection state
  const axisProps = getAxisProps();

  return (
    <Card className="glass-effect h-full flex flex-col" style={{ minHeight: "350px" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-0 p-4">
        <div className="flex items-center gap-2">
          {/* Removed chart type selector */}
          
          {/* Fixed R input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Fixed R:</span>
            <Input
              type="number"
              value={fixedRValue}
              onChange={handleFixedRChange}
              className="w-16 h-8 text-xs px-2 bg-muted/30 border-0"
              min="0.1"
              step="0.1"
            />
          </div>
          
          {/* Chart Style Selector */}
          <Tabs 
            value={curveType} 
            onValueChange={(value: 'stepAfter' | 'monotone' | 'linear') => setCurveType(value)}
            className="ml-2"
          >
            <TabsList className="bg-muted/30 h-8">
              <TabsTrigger value="stepAfter" className="h-6 text-xs px-2">Step</TabsTrigger>
              <TabsTrigger value="monotone" className="h-6 text-xs px-2">Curved</TabsTrigger>
              <TabsTrigger value="linear" className="h-6 text-xs px-2">Linear</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* NEW: Projection toggle */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Projections:</span>
            <Switch
              checked={showProjections}
              onChange={toggleProjections}
              className="data-[state=checked]:bg-muted/50"
            />
          </div>
          
          <Button variant="ghost" size="icon" onClick={exportChart} title="Export as PNG">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-2 pt-2">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis 
                dataKey="index" 
                stroke="rgba(255, 255, 255, 0.12)" 
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
                label={null}
                minTickGap={40}
                domain={calculateXDomain()}
                tickFormatter={formatXAxisTick}
                ticks={axisProps.ticks}
                scale={axisProps.scale as any}
                interval={showProjections ? undefined : "preserveEnd"} // Use valid AxisInterval values
                padding={{ left: 5, right: 5 }}
              />
              <YAxis 
                stroke="transparent" 
                tick={false} 
                axisLine={false} 
                tickLine={false}
                width={0}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(26, 26, 26, 0.95)', 
                  borderColor: 'rgba(64, 64, 64, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  color: '#F9FAFB',
                  padding: '8px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#F9FAFB', fontSize: '12px' }}
                labelStyle={{ color: '#F9FAFB', marginBottom: '4px', fontSize: '11px' }}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeDasharray: '3 3', strokeWidth: 1 }}
                formatter={(value, name, props) => {
                  // Enhanced tooltip to include projection information
                  if (props?.payload?.isProjection) {
                    if (name === 'bestCaseCumulativeR') return [value, 'Best Case (Projection)'];
                    if (name === 'worstCaseCumulativeR') return [value, 'Worst Case (Projection)'];
                  } else {
                    if (name === 'bestCaseCumulativeR') return [value, 'Best Case'];
                    if (name === 'worstCaseCumulativeR') return [value, 'Worst Case'];
                  }
                  if (name === 'index') return [`Trade #${value}`, 'Index'];
                  return [value, name];
                }}
              />
              
              {/* Add persistent horizontal reference line at R=0 */}
              <ReferenceLine 
                y={0} 
                stroke="#333333"
                strokeWidth={1}
                ifOverflow="extendDomain"
              />
              
              {/* Render a vertical line to indicate where actual data ends and projections begin */}
              {showProjections && projectionData.length > 0 && (
                <ReferenceLine 
                  x={chartData.length - 1} 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: "Projections →", 
                    position: "top", 
                    fill: "rgba(255, 255, 255, 0.7)", 
                    fontSize: 10 
                  }} 
                />
              )}
              
              
              {/* Main cumulative R line */}
              <Line 
                type={curveType}
                dataKey="cumulativeR" 
                name="Cumulative R" 
                stroke={colors.winColor} 
                dot={false}
                activeDot={{ r: 4, stroke: colors.winColor, strokeWidth: 1 }}
                strokeWidth={1.5}
                connectNulls={true}
              />
              
              {/* Fixed R line */}
              <Line 
                type={curveType}
                dataKey="fixedR" 
                name="Fixed R" 
                stroke="#403E43" 
                dot={false}
                activeDot={{ r: 4, stroke: "#403E43", strokeWidth: 1 }}
                strokeWidth={1.5}
                strokeDasharray="4 2"
                connectNulls={true}
              />
              
              {/* Projection lines with enhanced visibility */}
              {showProjections && (
                <>
                  {/* Best case projection line */}
                  <Line
                    type={curveType}
                    dataKey="bestCaseCumulativeR"
                    name="Best Case"
                    stroke="#F2FCE2" // Soft green
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5} // Slightly increased for better visibility
                    dot={false}
                    activeDot={{ r: 4, stroke: "#F2FCE2", strokeWidth: 1, opacity: 0.7 }}
                    connectNulls={true}
                  />
                  
                  {/* Worst case projection line */}
                  <Line
                    type={curveType}
                    dataKey="worstCaseCumulativeR"
                    name="Worst Case"
                    stroke="#ea384c" // Red
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5} // Slightly increased for better visibility
                    dot={false}
                    activeDot={{ r: 4, stroke: "#ea384c", strokeWidth: 1, opacity: 0.7 }}
                    connectNulls={true}
                  />
                </>
              )}
              
              {/* Per-pair lines */}
              {showByPair && tradedPairs.map((pair, index) => (
                <Line
                  key={pair}
                  type={curveType}
                  dataKey={`${pair}_R`}
                  name={pair}
                  stroke={getPairColor(index + 2)}
                  dot={false}
                  activeDot={{ r: 3, stroke: getPairColor(index + 2), strokeWidth: 1 }}
                  strokeWidth={1}
                  strokeOpacity={0.7}
                  label={({ x, y, value, index }) => {
                    // Show first/last dates for this specific pair
                    if (index === 1 || index === chartData.length - 1) {
                      const pairLabel = pairDateLabels[pair];
                      if (pairLabel) {
                        return (
                          <text 
                            x={x} 
                            y={y - 10} 
                            fill={getPairColor(index + 2)}
                            fontSize={10}
                            textAnchor="middle"
                          >
                            {index === 1 ? pairLabel.first : pairLabel.last}
                          </text>
                        );
                      }
                    }
                    return null;
                  }}
                />
              ))}
              
              
              {showByPair && tradedPairs.length > 0 && (
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: "10px",
                    color: "rgba(255, 255, 255, 0.7)",
                    paddingTop: "10px"
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquityCurveChart;
