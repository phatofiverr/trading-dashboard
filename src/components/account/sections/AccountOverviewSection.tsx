import React, { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load heavy components
const EquityBalanceHistory = lazy(() => import('@/components/trade/EquityBalanceHistory'));
const RiskAdjustedMetrics = lazy(() => import('@/components/trade/kpi/RiskAdjustedMetrics'));

interface AccountOverviewSectionProps {
  accountId?: string;
  filteredTrades: any[];
}

const AccountOverviewSection: React.FC<AccountOverviewSectionProps> = ({
  accountId,
  filteredTrades
}) => {
  return (
    <div className="space-y-6">
      {/* First row: Equity Balance History and Risk Adjusted Metrics side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[500px]">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
            <EquityBalanceHistory accountOnly={true} />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
            <RiskAdjustedMetrics trades={filteredTrades} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewSection;
