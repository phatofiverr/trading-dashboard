import React, { lazy, Suspense } from 'react';
import { Trade } from '@/types/Trade';

// Lazy load heavy components
const EquityCurveChart = lazy(() => import('@/components/trade/EquityCurveChart'));
const MostTradedPairsCard = lazy(() => import('@/components/trade/MostTradedPairsCard'));
const SimpleStatsDisplay = lazy(() => import('@/components/trade/SimpleStatsDisplay'));

interface StrategyOverviewSectionProps {
  trades: Trade[];
}

const StrategyOverviewSection: React.FC<StrategyOverviewSectionProps> = ({
  trades
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Grid - Equity Curve and Most Traded Pairs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart (takes 2 columns) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
            <EquityCurveChart trades={trades} />
          </Suspense>
        </div>
        
        {/* Most Traded Pairs */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
            <MostTradedPairsCard trades={trades} />
          </Suspense>
        </div>
      </div>
      
      {/* Simple Stats Display - reorganized into two rows of 4 KPIs */}
      <div>
        <Suspense fallback={<div className="h-20 bg-black/10 rounded-lg animate-pulse" />}>
          <SimpleStatsDisplay trades={trades} />
        </Suspense>
      </div>
    </div>
  );
};

export default StrategyOverviewSection;