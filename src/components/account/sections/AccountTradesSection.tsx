import React from 'react';
import TradeTable from '@/components/trade/TradeTable';

interface AccountTradesSectionProps {
  filteredTrades: any[];
}

const AccountTradesSection: React.FC<AccountTradesSectionProps> = ({
  filteredTrades
}) => {
  return (
    <div className="space-y-6">
      {/* Trade Table - Full Width */}
      <TradeTable hideExportButton={true} trades={filteredTrades} />
    </div>
  );
};

export default AccountTradesSection;
