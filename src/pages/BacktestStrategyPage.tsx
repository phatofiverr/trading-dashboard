import React, { useEffect, useState } from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, Filter, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import TradeEntryButton from '@/components/trade/TradeEntryButton';
import EquityCurveChart from '@/components/trade/EquityCurveChart';
import TradeTable from '@/components/trade/TradeTable';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';
import TradingKPIs from '@/components/trade/TradingKPIs';
import RAnalysisCard from '@/components/trade/analysis/RAnalysisCard';
import MostTradedPairsCard from '@/components/trade/MostTradedPairsCard';
import TradeActivityHeatmap from '@/components/trade/TradeActivityHeatmap';
import ThemeEditor from '@/components/trade/ThemeEditor';
import StochasticVolatilityModel from '@/components/trade/analysis/StochasticVolatilityModel';
import SimpleStatsDisplay from '@/components/trade/SimpleStatsDisplay';
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

const BacktestStrategyPage: React.FC = () => {
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
  
  // First, declare all hooks
  useEffect(() => {
    // Clear any account context when viewing strategy page
    setCurrentAccountId(null);
    
    if (strategyId) {
      setFilter('strategy', strategyId);
      setFilter('strategyType', 'backtest'); // Set strategy type to backtest
      applyFilters();
      fetchTrades();
    }
    
    // Cleanup function
    return () => {
      setFilter('strategy', null);
      setFilter('strategyType', null);
    };
  }, [strategyId, setFilter, applyFilters, fetchTrades, setCurrentAccountId]);
  
  // Filter trades to only include backtest trades
  const backtestTrades = filteredTrades.filter(trade => 
    trade.tags?.includes("backtest")
  );
  
  // Then, handle conditional returns after hooks
  const strategies = getUniqueStrategies('backtest');
  
  // Check if the strategy exists either in trades or in lastEntryDate
  const strategyExists = strategies.includes(strategyId || '') || lastEntryDate === strategyId;
  if (!strategyId || !strategyExists) {
    return <Navigate to="/backtest-strategies" replace />;
  }
  
  const handleExportCSV = async () => {
    try {
      const csvContent = await exportAsCSV();
      
      // Create a blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${strategyId}_backtest_trades_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  // Filter out placeholder trades for display
  const activeTrades = backtestTrades.filter(trade => !trade.isPlaceholder);
  const hasActiveTrades = activeTrades.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="h-full space-y-6 max-w-7xl mx-auto">
              
              {/* Header with Strategy Title and Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-medium text-foreground">
                  {strategyId} <span className="text-sm font-normal text-trading-accent1">Backtest Strategy</span>
                </h1>
                
                <div className="flex items-center gap-2">
                  {/* Beautiful Trade Entry Form */}
                  <TradeEntryButton 
                    initialStrategyId={strategyId} 
                    variant="default" 
                    size="default"
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
                  <ThemeEditor />
                  
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
                  <EquityCurveChart trades={backtestTrades} />
                </div>
                
                {/* Most Traded Pairs */}
                <div className="lg:col-span-1">
                  <MostTradedPairsCard trades={backtestTrades} />
                </div>
              </div>
              
              {/* Simple Stats Display */}
              <div className="mb-6">
                <SimpleStatsDisplay trades={backtestTrades} />
              </div>
              
              {/* Analysis Cards */}
              <div className="mb-6">
                <RAnalysisCard trades={backtestTrades} />
              </div>
              
              {/* Trading KPIs */}
              <div className="mb-6">
                <TradingKPIs trades={backtestTrades} />
              </div>
              
              {/* Trade Activity Heatmap */}
              <div className="mb-6">
                <TradeActivityHeatmap trades={backtestTrades} />
              </div>
              
              {/* Stochastic Volatility Model */}
              <div className="mb-6">
                <StochasticVolatilityModel trades={backtestTrades} />
              </div>
              
              {/* Trade Table - Full Width */}
              <div className="mb-6">
                <TradeTable hideExportButton={true} trades={backtestTrades} />
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BacktestStrategyPage;
