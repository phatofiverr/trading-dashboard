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
import SingleSidebarLayout from '@/components/SingleSidebarLayout';
import TradeEntryButton from '@/components/trade/TradeEntryButton';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';
import EditConfluencesDialog from '@/components/EditConfluencesDialog';
import StrategyNavigation from '@/components/navigation/StrategyNavigation';
import StrategyOverviewSection from '@/components/strategy/sections/StrategyOverviewSection';
import StrategyAnalysisSection from '@/components/strategy/sections/StrategyAnalysisSection';
import StrategyPerformanceSection from '@/components/strategy/sections/StrategyPerformanceSection';
import StrategyActivitySection from '@/components/strategy/sections/StrategyActivitySection';
import StrategyModelsSection from '@/components/strategy/sections/StrategyModelsSection';
import StrategyTradesSection from '@/components/strategy/sections/StrategyTradesSection';
import { Trade } from '@/types/Trade';

// Lazy load heavy components
const ThemeEditor = lazy(() => import('@/components/trade/ThemeEditor'));

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
  const [activeSection, setActiveSection] = useState<string>('overview');
  
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
    <SingleSidebarLayout>
      <div className="h-full space-y-6">
        {/* Header with Strategy Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-medium text-foreground">
            {strategyId} Strategy <span className="text-sm font-normal text-muted-foreground ml-1"></span>
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
            
            {/* Edit Confluences Button */}
            <EditConfluencesDialog 
              strategyId={strategyId || ''}
              onConfluencesUpdated={() => {
                // Optionally refresh data or show success message
                console.log('Confluences updated for strategy:', strategyId);
              }}
            />
            
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
        
        {/* Navigation Bar */}
        <div className="mb-6">
          <StrategyNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Filter Panel (Collapsible) */}
        {showFilterPanel && (
          <div className="animate-fade-in mb-6">
            <FilterPanel />
          </div>
        )}
        
        {/* Dynamic Section Content */}
        {activeSection === 'overview' && (
          <StrategyOverviewSection trades={filteredByTagTrades} />
        )}

        {activeSection === 'analysis' && (
          <StrategyAnalysisSection trades={filteredByTagTrades} />
        )}

        {activeSection === 'performance' && (
          <StrategyPerformanceSection trades={filteredByTagTrades} />
        )}

        {activeSection === 'activity' && (
          <StrategyActivitySection trades={filteredByTagTrades} />
        )}

        {activeSection === 'models' && (
          <StrategyModelsSection trades={filteredByTagTrades} />
        )}

        {activeSection === 'trades' && (
          <StrategyTradesSection trades={filteredByTagTrades} />
        )}
        
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
    </SingleSidebarLayout>
  );
};

export default StrategyPage;
