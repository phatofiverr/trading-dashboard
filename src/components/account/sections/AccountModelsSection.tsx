import React, { lazy, Suspense } from 'react';

// Lazy load heavy components
const TradingKPIs = lazy(() => import('@/components/trade/TradingKPIs'));

interface AccountModelsSectionProps {
  accountId?: string;
  visibleComponents: Record<string, boolean>;
}

const AccountModelsSection: React.FC<AccountModelsSectionProps> = ({
  accountId,
  visibleComponents
}) => {
  return (
    <div className="space-y-6">
      {/* Trading KPIs - 4 Charts Grid */}
      {visibleComponents.tradingKPIs && (
        <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
          <TradingKPIs accountId={accountId} />
        </Suspense>
      )}
    </div>
  );
};

export default AccountModelsSection;
