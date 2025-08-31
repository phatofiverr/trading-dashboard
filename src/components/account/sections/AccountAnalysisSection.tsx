import React, { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load heavy components
const TradingCalendar = lazy(() => import('@/components/trade/TradingCalendar'));
const SimpleStatsDisplay = lazy(() => import('@/components/trade/SimpleStatsDisplay'));
const RAnalysisCard = lazy(() => import('@/components/trade/analysis/RAnalysisCard'));
const BreakEvenOutcomeCard = lazy(() => import('@/components/trade/analysis/BreakEvenOutcomeCard').then(module => ({ default: module.BreakEvenOutcomeCard })));
const MostTradedPairsCard = lazy(() => import('@/components/trade/MostTradedPairsCard'));

interface AccountAnalysisSectionProps {
  account: any;
  filteredTrades: any[];
  visibleComponents: Record<string, boolean>;
}

const AccountAnalysisSection: React.FC<AccountAnalysisSectionProps> = ({
  account,
  filteredTrades,
  visibleComponents
}) => {
  return (
    <div className="space-y-6">
      {/* Second row: Trading Statistics and Calendar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 flex flex-col h-full space-y-6">
          <Suspense fallback={<div className="w-full py-4 h-20 bg-black/10 rounded-lg animate-pulse" />}>
            <SimpleStatsDisplay currency={account.currency} className="w-full py-4" style={{ height: 'fit-content' }} />
          </Suspense>

          {/* Analysis Cards Container - Make it fill the available space */}
          <div className="flex flex-col space-y-6">
            {/* Take Profit Analysis - Always on top */}
            {visibleComponents.rAnalysis && (
              <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
                <RAnalysisCard />
              </Suspense>
            )}

            {/* Break Even Analysis - Always below Take Profit Analysis */}
            {visibleComponents.breakEvenAnalysis && (
              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-normal">Break Even Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="h-32 bg-black/10 rounded-lg animate-pulse" />}>
                    <BreakEvenOutcomeCard />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Most Traded Pairs - Moved from bottom to this container */}
            {visibleComponents.tradedPairs && (
              <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
                <MostTradedPairsCard trades={filteredTrades} />
              </Suspense>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
            <TradingCalendar account={account} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AccountAnalysisSection;
