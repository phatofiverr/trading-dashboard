import React, { lazy, Suspense } from 'react';
import { Trade } from '@/types/Trade';

// Lazy load heavy components
const StochasticVolatilityModel = lazy(() => import('@/components/trade/analysis/StochasticVolatilityModel'));

interface StrategyModelsSectionProps {
  trades: Trade[];
}

const StrategyModelsSection: React.FC<StrategyModelsSectionProps> = ({
  trades
}) => {
  return (
    <div className="space-y-6">
      {/* Stochastic Volatility Model */}
      <div>
        <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
          <StochasticVolatilityModel trades={trades} />
        </Suspense>
      </div>
      
      {/* Additional models can be added here */}
      {/* Future: Monte Carlo simulations, regression models, etc. */}
    </div>
  );
};

export default StrategyModelsSection;