
import React from 'react';
import TimeBasedKPIs from './kpi/TimeBasedKPIs';

interface TradingKPIsProps {
  accountId?: string;
  trades?: any[]; // For backward compatibility with StrategyPage
}

const TradingKPIs: React.FC<TradingKPIsProps> = ({ accountId }) => {
  return (
    <div className="space-y-6">
      {/* Time-based KPIs - 4 Chart Grid */}
      <TimeBasedKPIs />
    </div>
  );
};

export default TradingKPIs;
