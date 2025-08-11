import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Filter, PlusCircle, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import TradeEntryButton from '@/components/trade/TradeEntryButton';
import TradeTable from '@/components/trade/TradeTable';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';
import { toast } from 'sonner';

// Lazy load heavy components
const EquityCurveChart = lazy(() => import('@/components/trade/EquityCurveChart'));
const TradingKPIs = lazy(() => import('@/components/trade/TradingKPIs'));
const RAnalysisCard = lazy(() => import('@/components/trade/analysis/RAnalysisCard'));
const MostTradedPairsCard = lazy(() => import('@/components/trade/MostTradedPairsCard'));
const TradeActivityHeatmap = lazy(() => import('@/components/trade/TradeActivityHeatmap'));
const ThemeEditor = lazy(() => import('@/components/trade/ThemeEditor'));
const StochasticVolatilityModel = lazy(() => import('@/components/trade/analysis/StochasticVolatilityModel'));
const BreakEvenOutcomeCard = lazy(() => import('@/components/trade/analysis/BreakEvenOutcomeCard').then(module => ({ default: module.BreakEvenOutcomeCard })));
const EquityBalanceHistory = lazy(() => import('@/components/trade/EquityBalanceHistory'));
const TradingCalendar = lazy(() => import('@/components/trade/TradingCalendar'));
const SimpleStatsDisplay = lazy(() => import('@/components/trade/SimpleStatsDisplay'));
const RiskAdjustedMetrics = lazy(() => import('@/components/trade/kpi/RiskAdjustedMetrics'));
import DailyStats from '@/components/accounts/DailyStats';

const COMPONENT_OPTIONS = [
  { id: 'tradedPairs', label: 'Most Traded Pairs', defaultVisible: true },
  { id: 'tradingKPIs', label: 'Trading KPIs', defaultVisible: true },
  { id: 'rAnalysis', label: 'R Analysis', defaultVisible: true },
  { id: 'activityHeatmap', label: 'Trade Activity Heatmap', defaultVisible: true },
  { id: 'breakEvenAnalysis', label: 'Break Even Analysis', defaultVisible: false },
  { id: 'volatilityModel', label: 'Stochastic Volatility Model', defaultVisible: false }
];

const AccountDetail: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { getAccountById } = useAccountsStore();
  const { setCurrentAccountId, setFilter, applyFilters, fetchTrades, selectedTrade, filteredTrades, exportAsCSV, selectTrade } = useTradeStore();
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [showComponentPopoverMobile, setShowComponentPopoverMobile] = useState<boolean>(false);
  const [showComponentPopoverDesktop, setShowComponentPopoverDesktop] = useState<boolean>(false);
  

  
  // Visibility state for each component
  const [visibleComponents, setVisibleComponents] = useState<Record<string, boolean>>(() => {
    // Try to load from localStorage first
    const savedVisibility = localStorage.getItem(`account-${accountId}-components`);
    if (savedVisibility) {
      try {
        return JSON.parse(savedVisibility);
      } catch (e) {
        console.error("Error parsing saved component visibility:", e);
      }
    }
    
    // Fall back to default values
    return COMPONENT_OPTIONS.reduce((acc, option) => {
      acc[option.id] = option.defaultVisible;
      return acc;
    }, {} as Record<string, boolean>);
  });
  
  // Set account filter when the page loads
  useEffect(() => {
    // Clear strategy filter first
    setFilter('strategy', null);
    
    if (accountId) {
      // Set current account context
      setCurrentAccountId(accountId);
      // Apply filters to refresh filtered trades
      applyFilters();
      // Fetch trades specific to this account
      fetchTrades();
    }
    
    // Clean up filters when component unmounts
    return () => {
      setCurrentAccountId(null);
      setFilter('accountId', null);
      applyFilters();
    };
  }, [accountId, setCurrentAccountId, setFilter, applyFilters, fetchTrades]);
  
  // Save visibility settings when they change
  useEffect(() => {
    if (accountId) {
      localStorage.setItem(`account-${accountId}-components`, JSON.stringify(visibleComponents));
    }
  }, [visibleComponents, accountId]);
  
  // Toggle a component's visibility
  const toggleComponentVisibility = (componentId: string) => {
    console.log('Toggling component:', componentId);
    setVisibleComponents(prev => {
      const newState = {
        ...prev,
        [componentId]: !prev[componentId]
      };
      console.log('New visibility state:', newState);
      return newState;
    });
  };
  
  // Find the account with the given ID
  const account = getAccountById(accountId || '');
  
  // Then, handle conditional returns after hooks
  if (!account) {
    return <Navigate to="/accounts" replace />;
  }
  
  const handleExportCSV = async () => {
    try {
      const csvContent = await exportAsCSV(filteredTrades);
      
      // Create a blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${account.name}_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="h-full space-y-6 max-w-7xl mx-auto">
              
              {/* Header with Account Title and Action Buttons */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <h1 className="text-2xl font-medium text-foreground">
                    {account.name} <span className="text-sm font-normal text-muted-foreground ml-1">-BETA</span>
                  </h1>
                </div>
                
                {/* Mobile: Grid Layout */}
                <div className="grid grid-cols-2 gap-2 lg:hidden w-full">
                  {/* Beautiful Trade Entry Form */}
                  <div className="col-span-2">
                    <TradeEntryButton 
                      initialAccountId={accountId} 
                      variant="default" 
                      size="default"
                      className="w-full"
                    />
                  </div>
                  
                  {/* Export Trades Button */}
                  <Button 
                    variant="minimal" 
                    className="flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5 h-9"
                    onClick={handleExportCSV}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {/* Component Visibility Toggle */}
                  <Popover open={showComponentPopoverMobile} onOpenChange={setShowComponentPopoverMobile}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className={`flex items-center justify-center gap-2 ${showComponentPopoverMobile ? 'bg-red-500' : 'bg-black/20'} hover:bg-black/30 text-foreground h-9 w-full`}
                      >
                        <Settings className="h-4 w-4" />
                        {showComponentPopoverMobile && <span className="text-xs">OPEN</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-4 bg-black border-2 z-[9999]" 
                      side="bottom" 
                      align="start"
                      sideOffset={8}
                    >
                        {/* <h4 className="text-sm font-medium mb-3 text-white/90">Component Visibility</h4> */}
                        <div className="space-y-2">
                          {COMPONENT_OPTIONS.map(component => (
                            <div key={component.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5">
                              <Label htmlFor={`toggle-${component.id}`} className="cursor-pointer text-white/80">
                                {component.label}
                              </Label>
                              <Switch
                                id={`toggle-${component.id}`}
                                checked={visibleComponents[component.id] || false}
                                onChange={() => toggleComponentVisibility(component.id)}
                                className="data-[state=checked]:bg-trading-accent1"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                          <Button
                            variant="minimal"
                            className="text-xs text-white/70"
                            onClick={() => {
                              // Reset to defaults
                              const defaults = COMPONENT_OPTIONS.reduce((acc, option) => {
                                acc[option.id] = option.defaultVisible;
                                return acc;
                              }, {} as Record<string, boolean>);
                              setVisibleComponents(defaults);
                              toast.success("Component visibility reset to defaults");
                            }}
                          >
                            Reset to Defaults
                          </Button>
                        </div>
                    </PopoverContent>
                  </Popover>
                   <div className="h-9 lg:hidden flex items-center justify-center w-full">
                    <ThemeEditor />
                </div>
                  {/* Filter Button - Mobile */}
                  <Button 
                    variant="minimal" 
                    className={`flex items-center justify-center gap-2 ${showFilterPanel ? 'bg-white/10 text-white' : 'bg-black/20 hover:bg-black/30 text-foreground'} border-white/5 h-9 lg:hidden`}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Desktop: Original Horizontal Layout */}
                <div className="hidden lg:flex items-center gap-2">
                  {/* Beautiful Trade Entry Form */}
                  <TradeEntryButton 
                    initialAccountId={accountId} 
                    variant="default" 
                    size="default"
                  />
                  
                  {/* Export Trades Button */}
                  <Button 
                    variant="minimal" 
                    className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
                    onClick={handleExportCSV}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  
                  {/* Component Visibility Toggle */}
                  <Popover open={showComponentPopoverDesktop} onOpenChange={setShowComponentPopoverDesktop}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground "
                      >
                        <Settings className="h-4 w-4" />
                        Components
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-4 bg-black border-2 z-[9999]" 
                      side="bottom" 
                      align="start"
                      sideOffset={8}
                    >
                        {/* <h4 className="text-sm font-medium mb-3 text-white/90">Component Visibility</h4> */}
                        <div className="space-y-2">
                          {COMPONENT_OPTIONS.map(component => (
                            <div key={component.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5">
                              <Label htmlFor={`toggle-${component.id}`} className="cursor-pointer text-white/80">
                                {component.label}
                              </Label>
                              <Switch
                                id={`toggle-${component.id}`}
                                checked={visibleComponents[component.id] || false}
                                onChange={() => toggleComponentVisibility(component.id)}
                                className="data-[state=checked]:bg-trading-accent1"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                          <Button
                            variant="minimal"
                            className="text-xs text-white/70"
                            onClick={() => {
                              // Reset to defaults
                              const defaults = COMPONENT_OPTIONS.reduce((acc, option) => {
                                acc[option.id] = option.defaultVisible;
                                return acc;
                              }, {} as Record<string, boolean>);
                              setVisibleComponents(defaults);
                              toast.success("Component visibility reset to defaults");
                            }}
                          >
                            Reset to Defaults
                          </Button>
                        </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Theme Editor Button - Desktop */}
                  <Suspense fallback={<div className="h-9 bg-black/10 rounded-md animate-pulse" />}>
                    <div className="hidden lg:block">
                      <ThemeEditor />
                    </div>
                  </Suspense>
                  
                  {/* Filter Button - Desktop */}
                  <Button 
                    variant="minimal" 
                    className={`hidden lg:flex items-center gap-2 ${showFilterPanel ? 'bg-white/10 text-white' : 'bg-black/20 hover:bg-black/30 text-foreground'} border-white/5`}
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
              
              {/* First row: Equity Balance History and Risk Adjusted Metrics side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch min-h-[500px]">
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
              
              {/* Second row: Trading Statistics and Calendar side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
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
                
                <div className="lg:col-span-3 h-full">
                  <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
                    <TradingCalendar account={account} />
                  </Suspense>
                </div>
              </div>
              
              {/* Trading KPIs */}
              {visibleComponents.tradingKPIs && (
                <div className="mb-6">
                  <Suspense fallback={<div className="h-96 bg-black/10 rounded-lg animate-pulse" />}>
                    <TradingKPIs accountId={accountId} />
                  </Suspense>
                </div>
              )}
              
              {/* Trade Activity Heatmap */}
              {visibleComponents.activityHeatmap && (
                <div className="mb-6">
                  <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
                    <TradeActivityHeatmap />
                  </Suspense>
                </div>
              )}
              
              {/* Stochastic Volatility Model */}
              {visibleComponents.volatilityModel && (
                <div className="mb-6">
                  <Suspense fallback={<div className="h-64 bg-black/10 rounded-lg animate-pulse" />}>
                    <StochasticVolatilityModel />
                  </Suspense>
                </div>
              )}
              
              {/* Trade Table - Full Width */}
              <div className="mb-6">
                <TradeTable hideExportButton={true} trades={filteredTrades} />
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

export default AccountDetail;
