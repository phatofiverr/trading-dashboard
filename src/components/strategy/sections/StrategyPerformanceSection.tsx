import React, { lazy, Suspense } from 'react';
import { Trade } from '@/types/Trade';

// Lazy load heavy components
const TradingKPIs = lazy(() => import('@/components/trade/TradingKPIs'));

interface StrategyPerformanceSectionProps {
  trades: Trade[];
}

const StrategyPerformanceSection: React.FC<StrategyPerformanceSectionProps> = ({
  trades
}) => {
  return (
    <div className="space-y-6">
      {/* Trading KPIs */}
      <div>
        <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
          <TradingKPIs trades={trades} />
        </Suspense>
      </div>
      
      {/* Additional performance metrics can be added here */}
      {/* Future: Sharpe ratio, Sortino ratio, max drawdown details, etc. */}
    </div>
  );
};

export default StrategyPerformanceSection;