import React, { useEffect, useState } from 'react';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useParams, Navigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SingleSidebarLayout from '@/components/SingleSidebarLayout';
import FilterPanel from '@/components/trade/FilterPanel';
import TradeDetailView from '@/components/trade/TradeDetailView';
import AccountOverviewSection from '@/components/account/sections/AccountOverviewSection';
import AccountAnalysisSection from '@/components/account/sections/AccountAnalysisSection';
import AccountPerformanceSection from '@/components/account/sections/AccountPerformanceSection';
import AccountModelsSection from '@/components/account/sections/AccountModelsSection';
import AccountTradesSection from '@/components/account/sections/AccountTradesSection';

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
  const { getAccountById } = useAccountsStore();
  const { setCurrentAccountId, setFilter, applyFilters, fetchTrades, selectedTrade, filteredTrades, exportAsCSV, selectTrade } = useTradeStore();
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
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
    <SingleSidebarLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showFilterPanel={showFilterPanel}
      onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)}
      onExportCSV={handleExportCSV}
      visibleComponents={visibleComponents}
      onToggleComponentVisibility={toggleComponentVisibility}
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
