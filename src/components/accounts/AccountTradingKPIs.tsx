
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useThemeStore } from '@/hooks/useThemeStore';

interface AccountTradingKPIsProps {
  accountId: string;
}

// Basic KPI Card component
export const AccountKPICard = ({ title, value, className = "" }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  
  // Determine if this is a positive/negative value that should be colored
  const isNegativeNumeric = typeof value === 'number' && value < 0;
  const isPositiveNumeric = typeof value === 'number' && value > 0;
  const isPercentageNegative = typeof value === 'string' && value.includes('-') && value.includes('%');
  const isPercentagePositive = typeof value === 'string' && !value.includes('-') && value.includes('%');
  
  // Determine text color based on value and class
  let textColorClass = '';
  if (className.includes('text-positive') || isPositiveNumeric || isPercentagePositive) {
    textColorClass = 'text-positive';
  } else if (className.includes('text-negative') || isNegativeNumeric || isPercentageNegative) {
    textColorClass = 'text-negative';
  }
  
  return (
    <Card className={`bg-black/30 backdrop-blur-md border-white/5 shadow-sm ${className}`} style={{ borderColor: textColorClass ? 'rgba(255,255,255,0.1)' : '' }}>
      <CardContent className="p-3 flex flex-col items-center justify-center">
        <p className="text-xs text-muted-foreground">{title}</p>
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

// Empty data chart placeholder
export const EmptyChart = ({ message = "No data available" }) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-black/30 backdrop-blur-md rounded-md border border-white/5 shadow-lg">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

// Main AccountTradingKPIs component
const AccountTradingKPIs: React.FC<AccountTradingKPIsProps> = ({ accountId }) => {
  // In a real app, this would fetch actual trading data associated with this account
  // For now, we'll just use empty data to match the screenshot

  return (
    <div className="space-y-6">
      {/* Main KPIs - grid of metrics */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        <AccountKPICard title="Total Trades" value="0" />
        <AccountKPICard title="Win Rate" value="0.0%" />
        <AccountKPICard title="Break Even Rate" value="0.0%" />
        <AccountKPICard title="Avg R-Multiple" value="0.00R" />
        <AccountKPICard title="Total Profit" value="0.00R" className="text-positive" />
        <AccountKPICard title="Profit Factor" value="0.00" />
        <AccountKPICard title="Expectancy" value="0.00R" />
        <AccountKPICard title="Max Drawdown" value="0.00R" />
      </div>
      
      {/* Time-based KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-black/30 backdrop-blur-md border-white/5 shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Entry Time Win Rate</p>
            <EmptyChart />
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 backdrop-blur-md border-white/5 shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Day-wise Win Rate</p>
            <EmptyChart />
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly and Session Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-black/30 backdrop-blur-md border-white/5 shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Monthly Win Rate</p>
            <EmptyChart />
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 backdrop-blur-md border-white/5 shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Session Performance</p>
            <EmptyChart message="No session data available" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountTradingKPIs;
