import React from 'react';
import { Trade } from '@/types/Trade';
import TradeTable from '@/components/trade/TradeTable';

interface StrategyTradesSectionProps {
  trades: Trade[];
}

const StrategyTradesSection: React.FC<StrategyTradesSectionProps> = ({
  trades
}) => {
  return (
    <div className="space-y-6">
      {/* Trade Table - Full Width */}
      <div>
        <TradeTable hideExportButton={true} trades={trades} />
      </div>
    </div>
  );
};

export default StrategyTradesSection;