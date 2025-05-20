
import React from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import TimeBasedKPIs from './kpi/TimeBasedKPIs';
import DrawdownAnalysis from './kpi/DrawdownAnalysis';
import RiskAdjustedMetrics from './kpi/RiskAdjustedMetrics';

const TradingKPIs: React.FC = () => {
  const { stats, filteredTrades } = useTradeStore();
  
  return (
    <div className="space-y-6">
      {/* Time-based KPIs */}
      <TimeBasedKPIs />
      
      {/* Combined Drawdown Analysis and Risk-Adjusted Returns in a 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Drawdown Analysis - 50% width on large screens */}
        <div className="flex flex-col h-full">
          <DrawdownAnalysis trades={filteredTrades} />
        </div>
        
        {/* Risk-Adjusted Return Metrics - 50% width on large screens */}
        <div className="flex flex-col h-full">
          <RiskAdjustedMetrics trades={filteredTrades} />
        </div>
      </div>
    </div>
  );
};

export default TradingKPIs;
