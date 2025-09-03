"use client"

import * as React from "react"
import { Home, Users, TrendingUp, LogOut, User, BarChart3, Search, Wallet, Plus } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import AddAccountDialog from './AddAccountDialog';
import AddStrategyDialog from './AddStrategyDialog';

// Custom Strategies Icon
const StrategiesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M3 9h18"></path>
    <path d="M9 21V9"></path>
  </svg>
);

// Navigation data structure
const createNavData = (accounts: any[], strategies: string[], getStrategyStats: (strategyName: string) => any) => ({
  navMain: [
    {
      title: "Dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Accounts",
      icon: Wallet,
      isActive: false,
    },
    {
      title: "Strategies",
      icon: StrategiesIcon,
      isActive: false,
    },
  ],
  content: {
    Dashboard: [
      {
        title: "Workstation",
        url: "/summary",
        description: "Your comprehensive trading overview",
      },
      {
        title: "Accounts",
        url: "/accounts",
        description: "Manage your trading accounts",
      },
      {
        title: "Strategies",
        url: "/strategies",
        description: "View and manage all trading strategies",
      },
      {
        title: "Demon Hunter", 
        url: "/demon-finder",
        description: "Conquer your behavioural demons",
      },
    ],
    Accounts: [
      {
        title: "Add new account",
        url: "/accounts/new",
        description: "Create a new trading account",
        isAddNew: true,
      },
      ...accounts.map(account => ({
        title: account.name,
        url: `/accounts/${account.id}`,
        description: `Balance: $${account.balance?.toFixed(2) || '0.00'}`,
      }))
    ],
    Strategies: [
      {
        title: "Add new strategy",
        url: "/strategies/new",
        description: "Create a new trading strategy",
        isAddNew: true,
      },
      ...strategies.map(strategy => {
        const stats = getStrategyStats(strategy);
        return {
          title: strategy,
          url: `/strategies/${encodeURIComponent(strategy)}`,
          description: stats.totalTrades > 0 
            ? `${stats.totalTrades} trades`
            : "No trades yet",
        };
      })
    ],
  }
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { accounts } = useAccountsStore();
  const { getUniqueStrategies, trades } = useTradeStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get unique strategies from both live and backtest
  const strategies = React.useMemo(() => [...new Set([
    ...getUniqueStrategies('live'),
    ...getUniqueStrategies('backtest')
  ])], [getUniqueStrategies]);

  // Function to calculate strategy statistics
  const getStrategyStats = React.useCallback((strategyName: string) => {
    const strategyTrades = trades.filter(trade => trade.strategyId === strategyName);
    const completedTrades = strategyTrades.filter(trade => trade.profit !== undefined && trade.profit !== null);
    
    if (completedTrades.length === 0) {
      return { totalTrades: 0, winRate: 0, avgRR: 0 };
    }

    const winningTrades = completedTrades.filter(trade => (trade.profit || 0) > 0);
    const winRate = Math.round((winningTrades.length / completedTrades.length) * 100);
    
    const avgRR = completedTrades.reduce((sum, trade) => {
      return sum + (trade.riskRewardRatio || 0);
    }, 0) / completedTrades.length;

    return {
      totalTrades: completedTrades.length,
      winRate: winRate,
      avgRR: avgRR.toFixed(1),
    };
  }, [trades]);

  const data = React.useMemo(() => createNavData(accounts, strategies, getStrategyStats), [accounts, strategies, getStrategyStats]);
  
  // Helper function to determine active item based on current route
  const getActiveItemFromPath = React.useCallback((path: string) => {
    // Safety check - ensure data.navMain exists and has items
    if (!data.navMain || data.navMain.length === 0) {
      return null;
    }

    if (path.startsWith('/accounts')) {
      const accountsItem = data.navMain.find(item => item.title === 'Accounts');
      return accountsItem || data.navMain[0];
    } else if (path.startsWith('/strategies')) {
      const strategiesItem = data.navMain.find(item => item.title === 'Strategies');
      return strategiesItem || data.navMain[0];
    } else if (path === '/summary' || path === '/demon-finder') {
      const dashboardItem = data.navMain.find(item => item.title === 'Dashboard');
      return dashboardItem || data.navMain[0];
    } else {
      return data.navMain[0];
    }
  }, [data.navMain]);
  
  // Use sessionStorage to persist active section across component re-mounts
  const getPersistedSection = () => {
    try {
      return sessionStorage.getItem('sidebar-active-section') || 'Dashboard';
    } catch {
      return 'Dashboard';
    }
  }
  
  const persistSection = (section: string) => {
    try {
      sessionStorage.setItem('sidebar-active-section', section);
    } catch {
      // Ignore if sessionStorage is not available
    }
  }
  
  // Initialize state with persisted value
  const [activeItem, setActiveItem] = React.useState(() => {
    const persistedSection = getPersistedSection();
    console.log('🚀 Initializing sidebar with persisted section:', persistedSection);
    return data.navMain.find(item => item.title === persistedSection) || data.navMain[0];
  })
  const [content, setContent] = React.useState(() => {
    const persistedSection = getPersistedSection();
    return data.content[persistedSection as keyof typeof data.content] || data.content.Dashboard || [];
  })
  const [manuallySet, setManuallySet] = React.useState(false)
  const { setOpen, open: sidebarOpen } = useSidebar()

  // Debug: Track when activeItem changes
  React.useEffect(() => {
    console.log('🔄 ActiveItem changed to:', activeItem?.title);
    console.trace('Stack trace for activeItem change:');
  }, [activeItem]);

  // Debug: Track persisted section
  React.useEffect(() => {
    console.log('🎯 Persisted section is now:', getPersistedSection());
  });

  // Only update sidebar when data changes, not when route changes
  React.useEffect(() => {
    console.log('Data changed, updating sidebar if needed', {
      activeItemTitle: activeItem?.title,
      persistedSection: getPersistedSection(),
      activeItemExists: activeItem ? data.navMain.some(item => item.title === activeItem.title) : false,
      dataNavMainTitles: data.navMain.map(item => item.title)
    });
    
    // If we have a valid activeItem, just update its content - don't change the active section
    if (activeItem && data.navMain.some(item => item.title === activeItem.title)) {
      console.log('Updating content for existing active item:', activeItem.title);
      const newContent = data.content[activeItem.title as keyof typeof data.content] || [];
      setContent(newContent);
      return; // Exit early - don't do any other updates
    }
    
    // Only reset if we have no active item at all
    if (!activeItem && data.navMain.length > 0) {
      const persistedSection = getPersistedSection();
      console.log('No active item found, restoring from storage:', persistedSection);
      const restoredItem = data.navMain.find(item => item.title === persistedSection) || data.navMain[0];
      setActiveItem(restoredItem);
      setContent(data.content[restoredItem.title as keyof typeof data.content] || []);
    }
  }, [data.navMain, data.content]);

  React.useEffect(() => {
    console.log('🔥 Content update effect triggered by data/activeItem change');
    // Update content when data changes
    if (activeItem) {
      setContent(data.content[activeItem.title as keyof typeof data.content] || []);
    }
  }, [data, activeItem]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row bg-[#0A0A0B]"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] !min-w-[calc(var(--sidebar-width-icon)_+_1px)] !max-w-[calc(var(--sidebar-width-icon)_+_1px)] border-r bg-[#0A0A0B]"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="relative w-fit">
                <SidebarMenuButton
                  size="lg"
                  asChild
                  className="md:h-8 md:p-0 peer"
                >
                  <Link to="/profile">
                    <div className="text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                      <User className="size-4" />
                    </div>
                  </Link>
                </SidebarMenuButton>
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] top-1/2 -translate-y-1/2">
                  Profile
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="overflow-visible">
          <SidebarGroup className="overflow-visible">
            <SidebarGroupContent className="px-1.5 md:px-0 overflow-visible">
              <SidebarMenu className="overflow-visible">
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <div className="relative w-fit">
                      <SidebarMenuButton
                        onClick={() => {
                          console.log('Manually clicking sidebar item:', item.title);
                          console.log('Before update - activeItem:', activeItem?.title);
                          
                          // Persist the selection
                          persistSection(item.title);
                          setActiveItem(item)
                          const newContent = data.content[item.title as keyof typeof data.content] || []
                          setContent(newContent)
                          setManuallySet(true)
                          console.log('After setState calls - should be:', item.title);
                          setOpen(true)
                        }}
                        isActive={activeItem?.title === item.title}
                        className="px-2.5 md:px-2 peer"
                      >
                        <item.icon />
                      </SidebarMenuButton>
                      <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] top-1/2 -translate-y-1/2">
                        {item.title}
                      </div>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="relative w-fit">
                <SidebarMenuButton onClick={handleLogout} className="peer">
                  <LogOut className="size-4" />
                </SidebarMenuButton>
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] top-1/2 -translate-y-1/2">
                  Log Out
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and set responsive fixed width */}
      <Sidebar collapsible="none" className="hidden md:flex md:w-[280px] lg:w-[300px] md:min-w-[280px] lg:min-w-[300px] md:max-w-[280px] lg:max-w-[300px] bg-[#0A0A0B]">
        <SidebarHeader className="flex shrink-0 items-center border-b p-4 min-h-[73px]">
          <div className="flex w-full items-center justify-between">
            <div className="text-white font-medium text-sm">
              {activeItem?.title}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {content.map((item) => {
                // Helper function to determine which sidebar section this link should activate
                const getRequiredSection = (url: string) => {
                  if (url.startsWith('/accounts')) return 'Accounts';
                  if (url.startsWith('/strategies')) return 'Strategies';
                  return null; // Stay in current section
                };

                // Handle "Add new" items differently - show dialogs instead of navigating
                if (item.isAddNew) {
                  if (item.title === 'Add new account') {
                    return (
                      <AddAccountDialog
                        key={item.url}
                        trigger={
                          <div className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 border-dashed border-sidebar-accent/50 hover:border-sidebar-accent cursor-pointer">
                            <div className="flex w-full items-center gap-2">
                              <Plus className="h-4 w-4 text-sidebar-accent" />
                              <span className="font-medium text-sidebar-accent">{item.title}</span>
                            </div>
                            <span className="line-clamp-2 w-[260px] text-xs text-sidebar-foreground/70">
                              {item.description}
                            </span>
                          </div>
                        }
                        onAccountAdded={() => {
                          // Force sidebar to refresh by staying in Accounts section
                          if (activeItem?.title === 'Accounts') {
                            setContent(data.content.Accounts || []);
                          }
                        }}
                      />
                    );
                  } else if (item.title === 'Add new strategy') {
                    return (
                      <AddStrategyDialog
                        key={item.url}
                        trigger={
                          <div className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 border-dashed border-sidebar-accent/50 hover:border-sidebar-accent cursor-pointer">
                            <div className="flex w-full items-center gap-2">
                              <Plus className="h-4 w-4 text-sidebar-accent" />
                              <span className="font-medium text-sidebar-accent">{item.title}</span>
                            </div>
                            <span className="line-clamp-2 w-[260px] text-xs text-sidebar-foreground/70">
                              {item.description}
                            </span>
                          </div>
                        }
                        onStrategyAdded={() => {
                          // Force sidebar to refresh by staying in Strategies section
                          if (activeItem?.title === 'Strategies') {
                            setContent(data.content.Strategies || []);
                          }
                        }}
                      />
                    );
                  }
                }

                // Regular navigation items
                return (
                  <Link
                    to={item.url}
                    key={item.url}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0"
                    onClick={() => {
                      const requiredSection = getRequiredSection(item.url);
                      console.log('Content link clicked:', item.url, 'requires section:', requiredSection, 'current section:', activeItem?.title);
                      
                      // Only auto-switch sidebar sections when clicking from within the same type
                      // Don't auto-switch when clicking from Dashboard to accounts/strategies
                      const shouldAutoSwitch = requiredSection && 
                        activeItem?.title !== requiredSection && 
                        activeItem?.title !== 'Dashboard';
                      
                      if (shouldAutoSwitch) {
                        const targetItem = data.navMain.find(navItem => navItem.title === requiredSection);
                        if (targetItem) {
                          console.log('Auto-switching sidebar to:', requiredSection);
                          
                          // Persist the selection
                          persistSection(requiredSection);
                          setActiveItem(targetItem);
                          setContent(data.content[requiredSection as keyof typeof data.content] || []);
                          setManuallySet(true);
                        }
                      } else if (requiredSection) {
                        console.log('Not auto-switching because current section is Dashboard');
                      }
                    }}
                  >
                    <div className="flex w-full items-center gap-2">
                      {activeItem?.title === 'Accounts' && <Wallet className="h-4 w-4" />}
                      {activeItem?.title === 'Strategies' && <TrendingUp className="h-4 w-4" />}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="line-clamp-2 w-[260px] text-xs text-sidebar-foreground/70">
                      {item.description}
                    </span>
                  </Link>
                );
              })}
              {content.length === 0 && (
                <div className="p-4 text-sm text-sidebar-foreground/70">
                  No {activeItem?.title.toLowerCase()} found
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}

export default AppSidebar;