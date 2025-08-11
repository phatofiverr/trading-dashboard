import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, Filter, PlusCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import TradeEntryButton from '@/components/trade/TradeEntryButton';
import TradeTable from '@/components/trade/TradeTable';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';

// Lazy load heavy components
const EquityCurveChart = lazy(() => import('@/components/trade/EquityCurveChart'));
const TradingKPIs = lazy(() => import('@/components/trade/TradingKPIs'));
const RAnalysisCard = lazy(() => import('@/components/trade/analysis/RAnalysisCard'));
const MostTradedPairsCard = lazy(() => import('@/components/trade/MostTradedPairsCard'));
const TradeActivityHeatmap = lazy(() => import('@/components/trade/TradeActivityHeatmap'));
const ThemeEditor = lazy(() => import('@/components/trade/ThemeEditor'));
const StochasticVolatilityModel = lazy(() => import('@/components/trade/analysis/StochasticVolatilityModel'));
const SimpleStatsDisplay = lazy(() => import('@/components/trade/SimpleStatsDisplay'));
import { Trade } from '@/types/Trade';
import { 
  TradeTableProps, 
  TradeActivityProps,
  TradeActivityHeatmapProps, 
  SimpleStatsDisplayProps,
  EquityCurveChartProps,
  MostTradedPairsCardProps,
  RAnalysisCardProps,
  TradingKPIsProps,
  StochasticVolatilityModelProps
} from '@/components/trade/TradeComponentProps';

const StrategyPage: React.FC = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const { 
    selectedTrade, 
    exportAsCSV, 
    setFilter, 
    applyFilters, 
    fetchTrades, 
    getUniqueStrategies, 
    filteredTrades, 
    lastEntryDate,
    setCurrentAccountId, // Clear any account context
    selectTrade
  } = useTradeStore();
  const [showFilterPanel, setShowFilterPanel] = React.useState<boolean>(false);
  const [showLiveData, setShowLiveData] = useState<boolean>(true);
  
  // First, declare all hooks
  useEffect(() => {
    // Clear any account context when viewing strategy page
    setCurrentAccountId(null);
    
    if (strategyId) {
      setFilter('strategy', strategyId);
      // Set initial strategy type based on showLiveData state
      setFilter('strategyType', showLiveData ? 'live' : 'backtest');
      applyFilters();
      fetchTrades();
    }
    
    // Cleanup function
    return () => {
      setFilter('strategy', null);
      setFilter('strategyType', null);
    };
  }, [strategyId, setFilter, applyFilters, fetchTrades, setCurrentAccountId, showLiveData]);

  // The toggle handling is already done in the first useEffect above
  
  // Then, handle conditional returns after hooks
  const strategies = getUniqueStrategies();
  
  // Check if the strategy exists either in trades or in lastEntryDate
  const strategyExists = strategies.includes(strategyId || '') || lastEntryDate === strategyId;
  if (!strategyId || !strategyExists) {
    return <Navigate to="/strategies" replace />;
  }
  
  const handleExportCSV = async () => {
    try {
      const csvContent = await exportAsCSV(filteredByTagTrades);
      
      // Create a blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${strategyId}_trades_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  // Filter trades based on the current mode (backtest or live data)
  // The store's applyFilters() already handles strategyType filtering correctly
  const filteredByTagTrades = filteredTrades;

  // Filter out placeholder trades for display
  const activeTrades = filteredByTagTrades.filter(trade => !trade.isPlaceholder);
  const hasActiveTrades = activeTrades.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="main-content py-4 md:py-6">
              <div className="h-full space-y-6">
                
                {/* Header with Strategy Title and Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h1 className="text-2xl font-medium text-foreground">
                    {strategyId} Strategy <span className="text-sm font-normal text-muted-foreground ml-1">-BETA</span>
                  </h1>
                  
                  <div className="flex items-center gap-2">
                    {/* Trade Entry Dialog - Only show in backtest mode */}
                    {!showLiveData && (
                      <TradeEntryButton 
                        initialStrategyId={strategyId} 
                        variant="default" 
                        size="default"
                      />
                    )}
                    
                    
                    {/* Export Trades Button */}
                    <Button 
                      variant="minimal" 
                      className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
                      onClick={handleExportCSV}
                      disabled={!hasActiveTrades}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    
                    {/* Theme Editor Button */}
                    <Suspense fallback={<div className="h-32 bg-black/10 rounded-lg animate-pulse" />}>
                      <ThemeEditor />
                    </Suspense>
                    
                    {/* Toggle Button for Live Data / Backtest Mode */}
                    <Button 
                      variant="minimal" 
                      className={`flex items-center gap-2 ${showLiveData ? 'bg-red-500/20 text-red-400' : 'bg-red-900/20 hover:bg-red-900/30 text-red-300'} border-red-500/30`}
                      onClick={() => setShowLiveData(!showLiveData)}
                    >
                      {showLiveData ? <ToggleRight className="h-4 w-4 text-red-400" /> : <ToggleLeft className="h-4 w-4 text-red-300" />}
                      {showLiveData ? 'Live Data' : 'Backtest'}
                    </Button>
                    {/* Filter Button */}
                    <Button 
                      variant="minimal" 
                      className={`flex items-center gap-2 ${showFilterPanel ? 'bg-white/10 text-white' : 'bg-black/20 hover:bg-black/30 text-foreground'} border-white/5`}
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
                
                {/* Filter Panel (Collapsible) */}
                {showFilterPanel && (
                  <div className="animate-fade-in mb-6">
                    <FilterPanel />
                  </div>
                )}
                
                {/* Reorganized Layout - Strategy Page specific layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Equity Curve Chart (takes 2 columns) */}
                  <div className="lg:col-span-2">
                    <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
                      <EquityCurveChart trades={filteredByTagTrades} />
                    </Suspense>
                  </div>
                  
                  {/* Most Traded Pairs */}
                  <div className="lg:col-span-1">
                    <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
                      <MostTradedPairsCard trades={filteredByTagTrades} />
                    </Suspense>
                  </div>
                </div>
                
                {/* Simple Stats Display - reorganized into two rows of 4 KPIs */}
                <div className="mb-6">
                  <Suspense fallback={<div className="h-20 bg-black/10 rounded-lg animate-pulse" />}>
                    <SimpleStatsDisplay trades={filteredByTagTrades} />
                  </Suspense>
                </div>
                
                {/* Analysis Cards */}
                <div className="mb-6">
                  <Suspense fallback={<div className="h-48 bg-black/10 rounded-lg animate-pulse" />}>
                    <RAnalysisCard trades={filteredByTagTrades} />
                  </Suspense>
                </div>
                
                {/* Trading KPIs */}
                <div className="mb-6">
                  <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
                    <TradingKPIs trades={filteredByTagTrades} />
                  </Suspense>
                </div>
                
                {/* Trade Activity Heatmap */}
                <div className="mb-6">
                  <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
                    <TradeActivityHeatmap trades={filteredByTagTrades} />
                  </Suspense>
                </div>
                
                {/* Stochastic Volatility Model */}
                <div className="mb-6">
                  <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
                    <StochasticVolatilityModel trades={filteredByTagTrades} />
                  </Suspense>
                </div>
                
                {/* Trade Table - Full Width */}
                <div className="mb-6">
                  <TradeTable hideExportButton={true} trades={filteredByTagTrades} />
                </div>
                
                {/* Trade Details Modal */}
                {selectedTrade && (
                  <Dialog open={!!selectedTrade} onOpenChange={(open) => !open && selectTrade(null)}>
                    <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-foreground font-medium">Trade Details</DialogTitle>
                      </DialogHeader>
                      <TradeDetailView trade={selectedTrade} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StrategyPage;
