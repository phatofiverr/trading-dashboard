import React, { lazy, Suspense } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Filter, MoreHorizontal, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AppSidebar from './AppSidebar';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import AccountNavigation from '@/components/navigation/AccountNavigation';
import StrategyNavigation from '@/components/navigation/StrategyNavigation';
import TradeEntryButton from '@/components/trade/TradeEntryButton';
import { toast } from 'sonner';

// Lazy load heavy components
const ThemeEditor = lazy(() => import('@/components/trade/ThemeEditor'));

interface SingleSidebarLayoutProps {
  children: React.ReactNode;
  // Navigation props - optional, will auto-detect based on route
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  // Action button props
  showFilterPanel?: boolean;
  onToggleFilterPanel?: () => void;
  onExportCSV?: () => void;
  // Component settings for account pages
  visibleComponents?: Record<string, boolean>;
  onToggleComponentVisibility?: (componentId: string) => void;
  componentOptions?: Array<{ id: string; label: string; defaultVisible: boolean }>;
  // Strategy-specific props
  showLiveData?: boolean;
  onToggleLiveData?: () => void;
  strategyCustomActions?: React.ReactNode;
}

const COMPONENT_OPTIONS = [
  { id: 'tradedPairs', label: 'Most Traded Pairs', defaultVisible: true },
  { id: 'tradingKPIs', label: 'Trading KPIs', defaultVisible: true },
  { id: 'rAnalysis', label: 'R Analysis', defaultVisible: true },
  { id: 'activityHeatmap', label: 'Trade Activity Heatmap', defaultVisible: true },
  { id: 'breakEvenAnalysis', label: 'Break Even Analysis', defaultVisible: false },
  { id: 'volatilityModel', label: 'Stochastic Volatility Model', defaultVisible: false }
];

// Internal component that renders the main content
const SidebarContent: React.FC<SingleSidebarLayoutProps> = ({ 
  children,
  activeSection,
  onSectionChange,
  showFilterPanel,
  onToggleFilterPanel,
  onExportCSV,
  visibleComponents,
  onToggleComponentVisibility,
  componentOptions = COMPONENT_OPTIONS,
  showLiveData,
  onToggleLiveData,
  strategyCustomActions
}) => {
  const location = useLocation();
  const params = useParams();
  const { accounts, getAccountById } = useAccountsStore();
  const { getUniqueStrategies, exportAsCSV, filteredTrades } = useTradeStore();
  const { toggleSidebar, open: sidebarOpen } = useSidebar();
  const [showComponentPopoverDesktop, setShowComponentPopoverDesktop] = React.useState(false);
  const [showComponentPopoverMobile, setShowComponentPopoverMobile] = React.useState(false);
  const [showMoreDropdownDesktop, setShowMoreDropdownDesktop] = React.useState(false);
  const [showMoreDropdownMobile, setShowMoreDropdownMobile] = React.useState(false);
  
  // Track sidebar state changes in layout
  React.useEffect(() => {
    console.log('🏗️ SingleSidebarLayout: Sidebar state changed - open:', sidebarOpen);
  }, [sidebarOpen]);
  
  const strategies = React.useMemo(() => [...new Set([
    ...getUniqueStrategies('live'),
    ...getUniqueStrategies('backtest')
  ])], [getUniqueStrategies]);

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs: Array<{ label: string; href?: string; isCurrentPage?: boolean }> = [];

    if (path === '/summary') {
      breadcrumbs.push(
        { label: 'Dashboard', href: '/summary' },
        { label: 'Workstation', isCurrentPage: true }
      );
    } else if (path === '/demon-finder') {
      breadcrumbs.push(
        { label: 'Dashboard', href: '/summary' },
        { label: 'Demon Hunter', isCurrentPage: true }
      );
    } else if (path === '/accounts') {
      breadcrumbs.push(
        { label: 'Accounts', isCurrentPage: true }
      );
    } else if (path.startsWith('/accounts/') && params.accountId) {
      const account = accounts.find(acc => acc.id === params.accountId);
      breadcrumbs.push(
        { label: 'Accounts', href: '/accounts' },
        { label: account?.name || 'Account Details', isCurrentPage: true }
      );
    } else if (path === '/strategies') {
      breadcrumbs.push(
        { label: 'Strategies', isCurrentPage: true }
      );
    } else if (path.startsWith('/strategies/') && params.strategyId) {
      const strategyName = decodeURIComponent(params.strategyId);
      breadcrumbs.push(
        { label: 'Strategies', href: '/strategies' },
        { label: strategyName, isCurrentPage: true }
      );
    } else if (path === '/profile') {
      breadcrumbs.push(
        { label: 'Profile', isCurrentPage: true }
      );
    } else if (path === '/profile/edit') {
      breadcrumbs.push(
        { label: 'Profile', href: '/profile' },
        { label: 'Edit Profile', isCurrentPage: true }
      );
    } else if (path === '/settings') {
      breadcrumbs.push(
        { label: 'Settings', isCurrentPage: true }
      );
    } else {
      // Default fallback
      breadcrumbs.push(
        { label: 'Dashboard', isCurrentPage: true }
      );
    }

    return breadcrumbs;
  };

  const breadcrumbs = React.useMemo(() => generateBreadcrumbs(), [location.pathname, accounts, strategies]);
  
  // Debug log
  React.useEffect(() => {
    console.log('🍞 Generated breadcrumbs for path:', location.pathname, breadcrumbs);
  }, [location.pathname, breadcrumbs]);

  // Determine page type and data
  const isAccountPage = location.pathname.startsWith('/accounts/') && params.accountId;
  const isStrategyPage = location.pathname.startsWith('/strategies/') && params.strategyId;
  const account = isAccountPage ? getAccountById(params.accountId || '') : null;
  
  const strategyName = isStrategyPage ? decodeURIComponent(params.strategyId || '') : null;

  // Handle CSV export
  const handleExportCSV = React.useCallback(async () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    
    // Default export logic
    try {
      const csvContent = await exportAsCSV(filteredTrades);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = account 
        ? `${account.name}_transactions_${new Date().toISOString().split('T')[0]}.csv`
        : `trades_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }, [onExportCSV, exportAsCSV, filteredTrades, account]);

  // Handle component visibility toggle
  const handleToggleComponentVisibility = React.useCallback((componentId: string) => {
    if (onToggleComponentVisibility) {
      onToggleComponentVisibility(componentId);
    }
  }, [onToggleComponentVisibility]);

  // Mobile theme section
  const mobileThemeSection = (
    <>
      <DropdownMenuSeparator className="bg-white/10" />
      <div className="p-2">
        <div className="text-xs text-white/60 mb-2">Theme</div>
        <Suspense fallback={<div className="h-9 bg-black/10 rounded-md animate-pulse" />}>
          <ThemeEditor />
        </Suspense>
      </div>
    </>
  );

  // Desktop theme section
  const desktopThemeSection = (
    <>
      <DropdownMenuSeparator className="bg-white/10" />
      <div className="p-2">
        <div className="text-xs text-white/60 mb-2">Theme</div>
        <Suspense fallback={<div className="h-9 bg-black/10 rounded-md animate-pulse" />}>
          <ThemeEditor />
        </Suspense>
      </div>
    </>
  );

  // Reset components to default
  const handleResetComponents = React.useCallback(() => {
    if (onToggleComponentVisibility) {
      componentOptions.forEach(option => {
        if (visibleComponents?.[option.id] !== option.defaultVisible) {
          onToggleComponentVisibility(option.id);
        }
      });
      toast.success("Component visibility reset to defaults");
    }
  }, [onToggleComponentVisibility, componentOptions, visibleComponents]);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Header with Breadcrumb, Actions, and Navigation */}
        <header className="bg-black/5 backdrop-blur-md sticky top-0 shrink-0 border-b border-white/5 z-10">
          {/* Top row: Breadcrumb and Actions */}
          <div className="flex items-center gap-2 p-4 min-h-[63px]">
            <SidebarTrigger 
              className="-ml-1 text-white/60 hover:text-white" 
              onClick={() => {
                console.log('🍔 SidebarTrigger clicked!');
              }}
            />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-white/10"
            />
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => [
                      <BreadcrumbItem key={`item-${index}`} className={index === 0 ? "hidden md:block" : ""}>
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage 
                            className="text-white font-medium cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🍞 Breadcrumb current page clicked:', crumb.label);
                              console.log('🍞 Toggling sidebar...');
                              toggleSidebar();
                            }}
                          >
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            asChild
                            className="text-white/60 hover:text-white transition-colors cursor-pointer"
                          >
                            <Link 
                              to={crumb.href!}
                              onClick={(e) => {
                                console.log('🍞 Breadcrumb link clicked:', crumb.label, 'navigating to:', crumb.href);
                                console.log('🍞 Toggling sidebar after navigation...');
                                // Small delay to allow navigation to complete first
                                setTimeout(() => {
                                  toggleSidebar();
                                }, 50);
                              }}
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>,
                      index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator key={`sep-${index}`} className={index === 0 ? "hidden md:block" : ""}>
                          <span className="text-white/40">/</span>
                        </BreadcrumbSeparator>
                      )
                    ]).flat().filter(Boolean)}
                  </BreadcrumbList>
                </Breadcrumb>
                
                {/* Navigation tabs inline with breadcrumb - only show on account/strategy pages */}
                {(isAccountPage || isStrategyPage) && activeSection && onSectionChange && (
                  <div className="ml-4">
                    {isAccountPage && (
                      <AccountNavigation
                        activeSection={activeSection}
                        onSectionChange={onSectionChange}
                        className="border-b-0"
                      />
                    )}
                    {isStrategyPage && (
                      <StrategyNavigation
                        activeSection={activeSection}
                        onSectionChange={onSectionChange}
                        className="border-b-0"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons - only show on account/strategy pages */}
              {(isAccountPage || isStrategyPage) && (
                <div className="flex items-center gap-2">
                  {/* Mobile: Simplified Layout */}
                  <div className="flex gap-2 lg:hidden">
                    {/* Trade Entry Button - only show in backtest mode for strategies or always for accounts */}
                    {(isAccountPage || (isStrategyPage && !showLiveData)) && (
                      <TradeEntryButton 
                        initialAccountId={params.accountId}
                        initialStrategyId={params.strategyId}
                        variant="default" 
                        size="sm"
                      />
                    )}
                    
                    {/* Strategy Live/Backtest Toggle - mobile */}
                    {isStrategyPage && onToggleLiveData && (
                      <Button 
                        variant="minimal" 
                        size="sm"
                        className={`${showLiveData ? 'bg-red-500/20 text-red-400' : 'bg-red-900/20 text-red-300'} border-red-500/30`}
                        onClick={onToggleLiveData}
                      >
                        {showLiveData ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        <span className="ml-1 text-xs">{showLiveData ? 'Live' : 'Test'}</span>
                      </Button>
                    )}
                  
                    {/* MOBILE DROPDOWN */}
                    <DropdownMenu open={showMoreDropdownMobile} onOpenChange={setShowMoreDropdownMobile}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="minimal" 
                          size="sm"
                          className="bg-black/20 hover:bg-black/30 text-foreground border-white/5"
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
                        
                        {onToggleFilterPanel && (
                          <DropdownMenuItem
                            onClick={onToggleFilterPanel}
                            className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                          >
                            <Filter className="h-4 w-4" />
                            {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                          </DropdownMenuItem>
                        )}
                        
                        {/* Strategy custom actions in dropdown */}
                        {isStrategyPage && strategyCustomActions && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {strategyCustomActions}
                          </>
                        )}
                        
                        {isAccountPage && visibleComponents && onToggleComponentVisibility && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setShowMoreDropdownMobile(false);
                                // Use setTimeout to ensure dropdown closes first
                                setTimeout(() => {
                                  setShowComponentPopoverMobile(true);
                                }, 100);
                              }}
                              className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                            >
                              <Settings className="h-4 w-4" />
                              Component Settings
                            </DropdownMenuItem>
                          </>
                        )}
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Desktop: Full Layout */}
                  <div className="hidden lg:flex items-center gap-2">
                    {/* Trade Entry Button - only show in backtest mode for strategies or always for accounts */}
                    {(isAccountPage || (isStrategyPage && !showLiveData)) && (
                      <TradeEntryButton 
                        initialAccountId={params.accountId}
                        initialStrategyId={params.strategyId}
                        variant="default" 
                        size="default"
                      />
                    )}
                    
                    {/* Strategy Live/Backtest Toggle - desktop */}
                    {isStrategyPage && onToggleLiveData && (
                      <Button 
                        variant="minimal" 
                        className={`flex items-center gap-2 ${showLiveData ? 'bg-red-500/20 text-red-400' : 'bg-red-900/20 text-red-300'} border-red-500/30`}
                        onClick={onToggleLiveData}
                      >
                        {showLiveData ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {showLiveData ? 'Live Data' : 'Backtest'}
                      </Button>
                    )}
                  
                    {/* DESKTOP DROPDOWN */}
                    <DropdownMenu open={showMoreDropdownDesktop} onOpenChange={setShowMoreDropdownDesktop}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="minimal" 
                          className="bg-black/20 hover:bg-black/30 text-foreground border-white/5"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="ml-2">More</span>
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
                        
                        {onToggleFilterPanel && (
                          <DropdownMenuItem
                            onClick={onToggleFilterPanel}
                            className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                          >
                            <Filter className="h-4 w-4" />
                            {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                          </DropdownMenuItem>
                        )}
                        
                        {/* Strategy custom actions in dropdown */}
                        {isStrategyPage && strategyCustomActions && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {strategyCustomActions}
                          </>
                        )}
                        
                        {isAccountPage && visibleComponents && onToggleComponentVisibility && (
                          <>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setShowMoreDropdownDesktop(false);
                                // Use setTimeout to ensure dropdown closes first
                                setTimeout(() => {
                                  setShowComponentPopoverDesktop(true);
                                }, 100);
                              }}
                              className="flex items-center gap-2 text-white/80 hover:text-white focus:text-white"
                            >
                              <Settings className="h-4 w-4" />
                              Component Settings
                            </DropdownMenuItem>
                          </>
                        )}
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Component Settings Modal - centered modal approach */}
        {isAccountPage && visibleComponents && onToggleComponentVisibility && (showComponentPopoverMobile || showComponentPopoverDesktop) && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowComponentPopoverMobile(false);
                setShowComponentPopoverDesktop(false);
              }}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md p-6 bg-black border-2 border-white/20 rounded-lg shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Component Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowComponentPopoverMobile(false);
                    setShowComponentPopoverDesktop(false);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-3">
                {componentOptions.map(component => (
                  <div key={component.id} className="flex items-center justify-between p-3 rounded-md hover:bg-white/5 border border-white/10">
                    <Label htmlFor={`toggle-${component.id}`} className="cursor-pointer text-white/80 text-sm">
                      {component.label}
                    </Label>
                    <Switch
                      id={`toggle-${component.id}`}
                      checked={visibleComponents[component.id] || false}
                      onCheckedChange={() => handleToggleComponentVisibility(component.id)}
                      className="data-[state=checked]:bg-trading-accent1"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <Button
                  variant="minimal"
                  className="text-sm text-white/70 hover:text-white"
                  onClick={handleResetComponents}
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex h-full justify-center">
          <div className="w-full max-w-[1250px] px-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

const SingleSidebarLayout: React.FC<SingleSidebarLayoutProps> = (props) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "400px",
        } as React.CSSProperties
      }
    >
      <SidebarContent {...props} />
    </SidebarProvider>
  );
};

export default SingleSidebarLayout;