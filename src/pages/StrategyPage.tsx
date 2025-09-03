import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import SingleSidebarLayout from '@/components/SingleSidebarLayout';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';
import EditConfluencesDialog from '@/components/EditConfluencesDialog';
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
  const editConfluencesRef = React.useRef<HTMLButtonElement>(null);
  
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

  // Custom strategy actions for the dropdown
  const strategyCustomActions = (
    <DropdownMenuItem
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Trigger the hidden dialog button
        if (editConfluencesRef.current) {
          editConfluencesRef.current.click();
        }
      }}
      className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white cursor-pointer"
    >
      <Settings className="h-4 w-4" />
      Edit Confluences
    </DropdownMenuItem>
  );

  // Filter trades based on the current mode (backtest or live data)
  // The store's applyFilters() already handles strategyType filtering correctly
  const filteredByTagTrades = filteredTrades;

  // Filter out placeholder trades for display
  const activeTrades = filteredByTagTrades.filter(trade => !trade.isPlaceholder);
  const hasActiveTrades = activeTrades.length > 0;

  return (
    <SingleSidebarLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showFilterPanel={showFilterPanel}
      onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)}
      onExportCSV={hasActiveTrades ? handleExportCSV : undefined}
      showLiveData={showLiveData}
      onToggleLiveData={() => setShowLiveData(!showLiveData)}
      strategyCustomActions={strategyCustomActions}
    >
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="h-full space-y-6 max-w-[1250px] mx-auto">

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
      </main>
      
      {/* Edit Confluences Dialog - Standalone */}
      <EditConfluencesDialog 
        strategyId={strategyId || ''}
        onConfluencesUpdated={() => {
          console.log('Confluences updated for strategy:', strategyId);
        }}
        trigger={
          <button 
            ref={editConfluencesRef}
            style={{ 
              position: 'fixed', 
              left: '-9999px', 
              opacity: 0
            }}
            aria-hidden="true"
          />
        }
      />
    </SingleSidebarLayout>
  );
};

export default StrategyPage;
