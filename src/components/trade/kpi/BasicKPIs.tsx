
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useThemeStore } from '@/hooks/useThemeStore';

// KPI Card component for reusability - reduced size
export const KPICard = ({ title, value, className = "" }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  // Determine if this is a positive/negative value that should be colored
  const isNegativeNumeric = typeof value === 'number' && value < 0;
  const isPositiveNumeric = typeof value === 'number' && value > 0;
  
  // Determine text color based on value and class
  let textColorClass = '';
  if (className.includes('text-positive') || isPositiveNumeric) {
    textColorClass = 'text-positive';
  } else if (className.includes('text-negative') || isNegativeNumeric) {
    textColorClass = 'text-negative';
  }
  
  return (
    <Card className={`glass-effect ${className}`} style={{ borderColor: textColorClass ? 'rgba(255,255,255,0.1)' : '' }}>
      <CardContent className="p-2 flex flex-col items-center justify-center"> {/* Reduced padding */}
        <p className="text-xs text-muted-foreground">{title}</p> {/* Smaller text */}
        <p className={textColorClass || ''} style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          color: textColorClass === 'text-positive' ? colors.positiveColor : 
                 textColorClass === 'text-negative' ? colors.negativeColor : ''
        }}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
};

// Main KPIs component
const BasicKPIs = ({ stats }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  return (
    <>
      <KPICard title="Total Trades" value={stats.totalTrades} />
      <KPICard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
      <KPICard title="Break Even Rate" value={`${stats.breakEvenRate ? stats.breakEvenRate.toFixed(1) : "0.0"}%`} />
      <KPICard title="Avg R-Multiple" value={`${stats.averageRMultiple.toFixed(2)}R`} />
      
      <KPICard 
        title="Total Profit" 
        value={`${stats.totalProfit.toFixed(2)}R`} 
        className={stats.totalProfit >= 0 ? 'text-positive' : 'text-negative'}
      />
      <KPICard title="Profit Factor" value={stats.profitFactor.toFixed(2)} />
      <KPICard title="Expectancy" value={`${stats.expectancy.toFixed(2)}R`} />
      <KPICard title="Max Drawdown" value={`${stats.maxDrawdown.toFixed(2)}R`} />
    </>
  );
};

export default BasicKPIs;
