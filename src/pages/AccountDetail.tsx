import React, { useEffect, useState } from 'react';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Filter, PlusCircle, Pencil, Palette, Eye, EyeOff, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import TradeEntryForm from '@/components/trade/TradeEntryForm';
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
import { BreakEvenOutcomeCard } from '@/components/trade/analysis/BreakEvenOutcomeCard';
import { toast } from 'sonner';
import EquityBalanceHistory from '@/components/trade/EquityBalanceHistory';
import TradingCalendar from '@/components/trade/TradingCalendar';
import SimpleStatsDisplay from '@/components/trade/SimpleStatsDisplay';
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
  const { setCurrentAccountId, setFilter, applyFilters, fetchTrades, selectedTrade, filteredTrades } = useTradeStore();
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  
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
    setVisibleComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };
  
  // Find the account with the given ID
  const account = getAccountById(accountId || '');
  
  // Then, handle conditional returns after hooks
  if (!account) {
    return <Navigate to="/accounts" replace />;
  }
  
  const handleExportCSV = async () => {
    try {
      const csvContent = "dummy csv content"; // Placeholder for actual export function
      
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-medium text-foreground">
                  {account.name} <span className="text-sm font-normal text-muted-foreground ml-1">-BETA</span>
                </h1>
                
                <div className="flex items-center gap-2">
                  {/* Transaction Entry Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="glass" className="flex items-center gap-2 bg-black/30 hover:bg-black/40 text-foreground border-white/5 shadow-md">
                        <PlusCircle className="h-4 w-4" />
                        New Trade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-xl border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-foreground font-medium">New Trade Entry</DialogTitle>
                      </DialogHeader>
                      <TradeEntryForm initialAccountId={accountId} />
                    </DialogContent>
                  </Dialog>
                  
                  {/* Edit Trade Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className={`flex items-center gap-2 ${selectedTrade ? 'bg-white/10 hover:bg-white/15' : 'bg-black/20 hover:bg-black/30'} text-foreground border-white/5`}
                        disabled={!selectedTrade}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Trade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-xl border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-foreground font-medium">Edit Trade</DialogTitle>
                      </DialogHeader>
                      {selectedTrade && <TradeEntryForm initialTrade={selectedTrade} isEditing />}
                    </DialogContent>
                  </Dialog>
                  
                  {/* Account Settings Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-foreground border-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-xl border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-foreground font-medium">Edit Account</DialogTitle>
                      </DialogHeader>
                      {/* Account edit form would go here */}
                    </DialogContent>
                  </Dialog>
                  
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
                      >
                        <Settings className="h-4 w-4" />
                        Components
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 bg-black/80 backdrop-blur-xl border-white/10">
                      <div className="p-4">
                        <h4 className="text-sm font-medium mb-3 text-white/90">Component Visibility</h4>
                        <div className="space-y-2">
                          {COMPONENT_OPTIONS.map(component => (
                            <div key={component.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5">
                              <Label htmlFor={`toggle-${component.id}`} className="cursor-pointer text-white/80">
                                {component.label}
                              </Label>
                              <Switch
                                id={`toggle-${component.id}`}
                                checked={visibleComponents[component.id] || false}
                                onCheckedChange={() => toggleComponentVisibility(component.id)}
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
                      </div>
                    </PopoverContent>
                  </Popover>
                  
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
              
              {/* First row: Equity Balance History and Daily Stats side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div className="lg:col-span-3">
                  <EquityBalanceHistory accountOnly={true} />
                </div>
                <div className="lg:col-span-1">
                  <DailyStats trades={filteredTrades} currency={account.currency} className="h-full" />
                </div>
              </div>
              
              {/* Second row: Trading Statistics and Calendar side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                <div className="lg:col-span-2 flex flex-col h-full space-y-6">
                  <SimpleStatsDisplay currency={account.currency} className="w-full py-4" style={{ height: 'fit-content' }} />
                  
                  {/* Analysis Cards Container - Make it fill the available space */}
                  <div className="flex flex-col space-y-6">
                    {/* Take Profit Analysis - Always on top */}
                    {visibleComponents.rAnalysis && (
                      <RAnalysisCard />
                    )}
                    
                    {/* Break Even Analysis - Always below Take Profit Analysis */}
                    {visibleComponents.breakEvenAnalysis && (
                      <Card className="glass-effect">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl font-normal">Break Even Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <BreakEvenOutcomeCard />
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Most Traded Pairs - Moved from bottom to this container */}
                    {visibleComponents.tradedPairs && (
                      <MostTradedPairsCard trades={filteredTrades} />
                    )}
                  </div>
                </div>
                
                <div className="lg:col-span-3 h-full">
                  <TradingCalendar account={account} />
                </div>
              </div>
              
              {/* Trading KPIs */}
              {visibleComponents.tradingKPIs && (
                <div className="mb-6">
                  <TradingKPIs />
                </div>
              )}
              
              {/* Trade Activity Heatmap */}
              {visibleComponents.activityHeatmap && (
                <div className="mb-6">
                  <TradeActivityHeatmap />
                </div>
              )}
              
              {/* Stochastic Volatility Model */}
              {visibleComponents.volatilityModel && (
                <div className="mb-6">
                  <StochasticVolatilityModel />
                </div>
              )}
              
              {/* Trade Table with Trade Details integrated */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {selectedTrade && (
                  <div className="col-span-1">
                    <div className="bg-black/30 backdrop-blur-md border-white/5 shadow-lg rounded-xl p-4">
                      <TradeDetailView trade={selectedTrade} />
                    </div>
                  </div>
                )}
                <div className={`${selectedTrade ? 'col-span-1 lg:col-span-3' : 'col-span-1 lg:col-span-4'}`}>
                  <TradeTable hideExportButton={true} trades={filteredTrades} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AccountDetail;
