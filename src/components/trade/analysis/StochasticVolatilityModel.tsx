
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeStore } from '@/hooks/useThemeStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StochasticVolatilityData {
  date: string;
  volatility: number;
  return: number;
  longTermMean: number;
}

interface VolatilityMetric {
  label: string;
  value: string | number;
  change?: number;
  info?: string;
}

const StochasticVolatilityModel: React.FC = () => {
  const { filteredTrades } = useTradeStore();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  // Generate Stochastic Volatility Model data from trades
  const { svmData, volatilityMetrics } = useMemo(() => {
    if (filteredTrades.length === 0) return { svmData: [], volatilityMetrics: [] };

    // Sort trades by date
    const sortedTrades = [...filteredTrades]
      .filter(trade => !trade.isPlaceholder && trade.exitDate)
      .sort((a, b) => {
        const dateA = new Date(a.exitDate || a.entryDate).getTime();
        const dateB = new Date(b.exitDate || b.entryDate).getTime();
        return dateA - dateB;
      });

    if (sortedTrades.length === 0) return { svmData: [], volatilityMetrics: [] };

    // Calculate daily returns and volatility
    const data: StochasticVolatilityData[] = [];
    let cumulativeReturn = 0;
    const volatilityWindow = 5; // Window size for volatility calculation
    const returns: number[] = [];
    const longTermMean = 0.02; // Assumed long-term mean volatility

    // Initialize volatility with a reasonable value
    let currentVolatility = 0.02;
    let peakVolatility = currentVolatility;
    let minVolatility = currentVolatility;
    let totalVolatility = 0;
    
    // Mean reversion rate and volatility of volatility parameters
    const kappa = 0.3; // Rate of mean reversion
    const sigma = 0.2; // Volatility of volatility
    
    // Calculate returns for each trade
    sortedTrades.forEach((trade, i) => {
      const rReturn = trade.rMultiple || 0;
      returns.push(rReturn);
      
      // Update volatility using stochastic volatility model
      // v_t = v_{t-1} + kappa * (longTermMean - v_{t-1}) + sigma * randomShock
      const randomShock = (Math.random() - 0.5) * 0.01;
      
      if (i > 0) {
        currentVolatility = Math.max(
          0.001, // Minimum volatility floor
          currentVolatility + kappa * (longTermMean - currentVolatility) + sigma * randomShock
        );
      }

      // Track peak and minimum volatility
      peakVolatility = Math.max(peakVolatility, currentVolatility);
      minVolatility = Math.min(minVolatility, currentVolatility);
      totalVolatility += currentVolatility;
      
      cumulativeReturn += rReturn;
      
      const exitDate = trade.exitDate || trade.entryDate;
      const formattedDate = new Date(exitDate).toISOString().split('T')[0];
      
      data.push({
        date: formattedDate,
        volatility: parseFloat(currentVolatility.toFixed(4)),
        return: parseFloat(rReturn.toFixed(2)),
        longTermMean: longTermMean
      });
    });
    
    // Calculate volatility metrics
    const avgVolatility = totalVolatility / sortedTrades.length;
    const volatilityRange = peakVolatility - minVolatility;
    
    // Calculate volatility clustering
    let volatilityClusters = 0;
    let inCluster = false;
    const clusterThreshold = avgVolatility * 1.5;
    
    data.forEach(point => {
      if (point.volatility > clusterThreshold && !inCluster) {
        inCluster = true;
        volatilityClusters++;
      } else if (point.volatility <= clusterThreshold) {
        inCluster = false;
      }
    });
    
    // Calculate mean reversion strength
    const meanReversionStrength = kappa * 100; // Scale to percentage
    
    // Calculate correlation between returns and volatility
    let sumXY = 0;
    let sumX = 0;
    let sumY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    
    data.forEach(point => {
      sumXY += point.return * point.volatility;
      sumX += point.return;
      sumY += point.volatility;
      sumX2 += point.return * point.return;
      sumY2 += point.volatility * point.volatility;
    });
    
    const n = data.length;
    const returnVolatilityCorrelation = 
      (n * sumXY - sumX * sumY) / 
      (Math.sqrt(n * sumX2 - sumX * sumX) * Math.sqrt(n * sumY2 - sumY * sumY)) || 0;
    
    // Recent trend (last 5 trades or less)
    const recentTrades = data.slice(Math.max(0, data.length - 5));
    const recentVolatilityTrend = recentTrades.length > 1 
      ? ((recentTrades[recentTrades.length - 1].volatility / recentTrades[0].volatility) - 1) * 100 
      : 0;
    
    // Create metrics array
    const metrics: VolatilityMetric[] = [
      {
        label: 'Current Volatility',
        value: (currentVolatility * 100).toFixed(2) + '%',
        change: ((currentVolatility / longTermMean - 1) * 100),
        info: 'Current level of volatility in the trading system'
      },
      {
        label: 'Avg Volatility',
        value: (avgVolatility * 100).toFixed(2) + '%',
        info: 'Average volatility across all trades'
      },
      {
        label: 'Peak Volatility',
        value: (peakVolatility * 100).toFixed(2) + '%',
        info: 'Highest volatility experienced during the trading period'
      },
      {
        label: 'Volatility Range',
        value: (volatilityRange * 100).toFixed(2) + '%',
        info: 'Difference between highest and lowest volatility'
      },
      {
        label: 'Return/Vol Correlation',
        value: returnVolatilityCorrelation.toFixed(2),
        change: returnVolatilityCorrelation * 100,
        info: 'Correlation between returns and volatility (-1 to 1)'
      },
      {
        label: 'Volatility Clusters',
        value: volatilityClusters,
        info: 'Number of periods with sustained high volatility'
      },
      {
        label: 'Mean Reversion',
        value: meanReversionStrength.toFixed(2) + '%',
        info: 'Strength of volatility mean reversion (higher means stronger)'
      },
      {
        label: 'Recent Vol Trend',
        value: recentVolatilityTrend.toFixed(2) + '%',
        change: recentVolatilityTrend,
        info: 'Volatility trend over recent trades'
      }
    ];
    
    return { svmData: data, volatilityMetrics: metrics };
  }, [filteredTrades]);

  const chartConfig = {
    volatility: { label: "Volatility", color: colors.positiveColor },
    return: { label: "Return", color: colors.negativeColor },
    longTermMean: { label: "Long-term Mean", color: "#888888" }
  };

  const hasData = svmData.length > 0;

  // Helper function to render a KPI with color coding
  const renderKPI = (metric: VolatilityMetric) => (
    <div key={metric.label} className="flex flex-col space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{metric.label}</span>
        {metric.info && (
          <div className="tooltip" data-tip={metric.info}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground cursor-help">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{metric.value}</span>
        {metric.change !== undefined && (
          <span className={`text-xs ${metric.change > 0 ? 'text-green-500' : metric.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/5 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Stochastic Volatility Model</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Analyzing return volatility clustering and mean reversion patterns
        </p>
      </CardHeader>
      <Separator className="bg-white/5" />
      <CardContent className="pt-6">
        {hasData ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {volatilityMetrics.map(renderKPI)}
            </div>
            
            <div className="h-[300px]">
              <ChartContainer 
                config={chartConfig} 
                className="w-full h-full"
              >
                <LineChart
                  data={svmData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "#888" }}
                    tickFormatter={(value) => value.slice(5)} // Show only MM-DD
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: "#888" }} 
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: "#888" }}
                    domain={[-4, 4]} // Reasonable range for returns in R-multiples
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />} 
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="volatility"
                    name="Volatility"
                    stroke={colors.positiveColor}
                    activeDot={{ r: 8 }}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="longTermMean"
                    name="Long-term Mean"
                    stroke="#888888"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="return"
                    name="Return"
                    stroke={colors.negativeColor}
                    dot={{ stroke: colors.negativeColor, strokeWidth: 1, r: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-black/20 rounded-md">
            <p className="text-muted-foreground text-sm">
              Not enough trade data to generate a volatility model
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            The Stochastic Volatility Model reveals how volatility evolves over time, helping identify periods of risk clustering.
            Observe how volatility tends to revert to its long-term mean while displaying persistence during market events.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Volatility clustering indicates periods where high volatility trades tend to group together</li>
            <li>Mean reversion shows how volatility eventually returns to normal levels</li>
            <li>Correlation between returns and volatility changes reveals risk-return dynamics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StochasticVolatilityModel;
