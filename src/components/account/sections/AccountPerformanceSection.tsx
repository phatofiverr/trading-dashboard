import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTradeStore } from '@/hooks/useTradeStore';

// Lazy load heavy components
const TradingKPIs = lazy(() => import('@/components/trade/TradingKPIs'));
const TradeActivityHeatmap = lazy(() => import('@/components/trade/TradeActivityHeatmap'));
const StochasticVolatilityModel = lazy(() => import('@/components/trade/analysis/StochasticVolatilityModel'));
const DrawdownAnalysis = lazy(() => import('@/components/trade/kpi/DrawdownAnalysis'));
const DailyStats = lazy(() => import('@/components/accounts/DailyStats'));

interface AccountPerformanceSectionProps {
  accountId?: string;
  visibleComponents: Record<string, boolean>;
}

const AccountPerformanceSection: React.FC<AccountPerformanceSectionProps> = ({
  accountId,
  visibleComponents
}) => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { filteredTrades } = useTradeStore();

  return (
    <div className="space-y-6">
      {/* Drawdown Analysis and Daily Stats in 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawdown Analysis - 75% width on large screens */}
        <div className="flex flex-col h-full lg:col-span-3">
          <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
            <DrawdownAnalysis trades={filteredTrades} strategyId={strategyId} />
          </Suspense>
        </div>

        {/* Daily Stats - 25% width on large screens */}
        <div className="flex flex-col h-full lg:col-span-1">
          <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
            <DailyStats accountId={accountId} />
          </Suspense>
        </div>
      </div>

      {/* Stochastic Volatility Model */}
      {visibleComponents.volatilityModel && (
        <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
          <StochasticVolatilityModel />
        </Suspense>
      )}

      {/* Trade Activity Heatmap */}
      {visibleComponents.activityHeatmap && (
        <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
          <TradeActivityHeatmap />
        </Suspense>
      )}
    </div>
  );
};

export default AccountPerformanceSection;
