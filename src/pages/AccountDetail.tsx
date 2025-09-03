import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Filter, PlusCircle, Settings, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from '@/components/ui/sidebar';
import SingleSidebarLayout from '@/components/SingleSidebarLayout';
import TradeEntryButton from '@/components/trade/TradeEntryButton';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';
import AccountNavigation from '@/components/navigation/AccountNavigation';
import AccountOverviewSection from '@/components/account/sections/AccountOverviewSection';
import AccountAnalysisSection from '@/components/account/sections/AccountAnalysisSection';
import AccountPerformanceSection from '@/components/account/sections/AccountPerformanceSection';
import AccountModelsSection from '@/components/account/sections/AccountModelsSection';
import AccountTradesSection from '@/components/account/sections/AccountTradesSection';
import { toast } from 'sonner';

// Lazy load heavy components
const ThemeEditor = lazy(() => import('@/components/trade/ThemeEditor'));

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
  const [activeSection, setActiveSection] = useState<string>('overview');
  

  
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
    <SingleSidebarLayout>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="h-full space-y-6 max-w-[1250px] mx-auto">
              
              {/* Header with Account Title and Action Buttons */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <h1 className="text-2xl font-medium text-foreground">
                    {account.name} <span className="text-sm font-normal text-muted-foreground ml-1"></span>
                  </h1>
                </div>
                
                {/* Mobile: Simplified Layout */}
                <div className="flex gap-2 lg:hidden w-full">
                  {/* Beautiful Trade Entry Form */}
                  <div className="flex-1">
                    <TradeEntryButton 
                      initialAccountId={accountId} 
                      variant="default" 
                      size="default"
                      className="w-full"
                    />
                  </div>
                  
                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className="flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5 h-9 px-3"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-48 bg-black border-white/10 z-[9999]" 
                      side="bottom" 
                      align="end"
                      sideOffset={8}
                    >
                      <DropdownMenuItem
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                      >
                        <Filter className="h-4 w-4" />
                        {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      <Popover open={showComponentPopoverMobile} onOpenChange={setShowComponentPopoverMobile}>
                        <PopoverTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                          >
                            <Settings className="h-4 w-4" />
                            Component Settings
                          </DropdownMenuItem>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-80 p-4 bg-black border-2 z-[9999]" 
                          side="bottom" 
                          align="start"
                          sideOffset={8}
                        >
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
                      
                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      <div className="p-2">
                        <div className="text-xs text-white/60 mb-2">Theme</div>
                        <Suspense fallback={<div className="h-9 bg-black/10 rounded-md animate-pulse" />}>
                          <ThemeEditor />
                        </Suspense>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Desktop: Updated Layout */}
                <div className="hidden lg:flex items-center gap-2">
                  {/* Beautiful Trade Entry Form */}
                  <TradeEntryButton 
                    initialAccountId={accountId} 
                    variant="default" 
                    size="default"
                  />
                  
                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="minimal" 
                        className="flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 text-foreground border-white/5"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-48 bg-black border-white/10 z-[9999]" 
                      side="bottom" 
                      align="end"
                      sideOffset={8}
                    >
                      <DropdownMenuItem
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                      >
                        <Filter className="h-4 w-4" />
                        {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      <Popover open={showComponentPopoverDesktop} onOpenChange={setShowComponentPopoverDesktop}>
                        <PopoverTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                          >
                            <Settings className="h-4 w-4" />
                            Component Settings
                          </DropdownMenuItem>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-80 p-4 bg-black border-2 z-[9999]" 
                          side="bottom" 
                          align="start"
                          sideOffset={8}
                        >
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
                      
                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      <div className="p-2">
                        <div className="text-xs text-white/60 mb-2">Theme</div>
                        <Suspense fallback={<div className="h-9 bg-black/10 rounded-md animate-pulse" />}>
                          <ThemeEditor />
                        </Suspense>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="mb-6">
                <AccountNavigation
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
                <AccountOverviewSection
                  accountId={accountId}
                  filteredTrades={filteredTrades}
                />
              )}

              {activeSection === 'analysis' && (
                <AccountAnalysisSection
                  account={account}
                  filteredTrades={filteredTrades}
                  visibleComponents={visibleComponents}
                />
              )}

              {activeSection === 'models' && (
                <AccountModelsSection
                  accountId={accountId}
                  visibleComponents={visibleComponents}
                />
              )}

              {activeSection === 'performance' && (
                <AccountPerformanceSection
                  accountId={accountId}
                  visibleComponents={visibleComponents}
                />
              )}

              {activeSection === 'trades' && (
                <AccountTradesSection
                  filteredTrades={filteredTrades}
                />
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
    </SingleSidebarLayout>
  );
};

export default AccountDetail;
