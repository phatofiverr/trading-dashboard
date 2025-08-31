import React, { lazy, Suspense } from 'react';
import { Trade } from '@/types/Trade';

// Lazy load heavy components
const RAnalysisCard = lazy(() => import('@/components/trade/analysis/RAnalysisCard'));

interface StrategyAnalysisSectionProps {
  trades: Trade[];
}

const StrategyAnalysisSection: React.FC<StrategyAnalysisSectionProps> = ({
  trades
}) => {
  return (
    <div className="space-y-6">
      {/* R Analysis Card */}
      <div>
        <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
          <RAnalysisCard trades={trades} />
        </Suspense>
      </div>
      
      {/* Additional analysis components can be added here */}
      {/* Future: Trade distribution analysis, win/loss streaks, etc. */}
    </div>
  );
};

export default StrategyAnalysisSection;