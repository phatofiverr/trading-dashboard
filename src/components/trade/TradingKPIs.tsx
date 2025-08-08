
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountCalculations } from '@/hooks/useAccountCalculations';
import TimeBasedKPIs from './kpi/TimeBasedKPIs';
import DrawdownAnalysis from './kpi/DrawdownAnalysis';
import DailyStats from '@/components/accounts/DailyStats';

interface TradingKPIsProps {
  accountId?: string;
  trades?: any[]; // For backward compatibility with StrategyPage
}

const TradingKPIs: React.FC<TradingKPIsProps> = ({ accountId }) => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { stats, filteredTrades } = useTradeStore();
  const { getPortfolioSummary } = useAccountCalculations();
  
  return (
    <div className="space-y-6">
      {/* Time-based KPIs */}
      <TimeBasedKPIs />
      
      {/* Combined Drawdown Analysis and Risk-Adjusted Returns in a 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawdown Analysis - 75% width on large screens */}
        <div className="flex flex-col h-full lg:col-span-3">
          <DrawdownAnalysis trades={filteredTrades} strategyId={strategyId} />
        </div>
        
        {/* Daily Stats - 25% width on large screens */}
        <div className="flex flex-col h-full lg:col-span-1">
          <DailyStats accountId={accountId} />
        </div>
      </div>
    </div>
  );
};

export default TradingKPIs;
