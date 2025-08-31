import React, { lazy, Suspense } from 'react';
import { Trade } from '@/types/Trade';

// Lazy load heavy components
const TradeActivityHeatmap = lazy(() => import('@/components/trade/TradeActivityHeatmap'));

interface StrategyActivitySectionProps {
  trades: Trade[];
}

const StrategyActivitySection: React.FC<StrategyActivitySectionProps> = ({
  trades
}) => {
  return (
    <div className="space-y-6">
      {/* Trade Activity Heatmap */}
      <div>
        <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
          <TradeActivityHeatmap trades={trades} />
        </Suspense>
      </div>
      
      {/* Additional activity analysis can be added here */}
      {/* Future: Session analysis, time-based patterns, etc. */}
    </div>
  );
};

export default StrategyActivitySection;