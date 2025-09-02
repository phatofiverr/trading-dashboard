"use client"

import * as React from "react"
import { Home, Users, TrendingUp, LogOut, User, BarChart3, Search, Wallet } from "lucide-react"
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

// Custom Strategies Icon
const StrategiesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M3 9h18"></path>
    <path d="M9 21V9"></path>
  </svg>
);

// Navigation data structure
const createNavData = (accounts: any[], strategies: string[]) => ({
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
        title: "Demon Hunter", 
        url: "/demon-finder",
        description: "Conquer your behavioural demons",
      },
    ],
    Accounts: accounts.map(account => ({
      title: account.name,
      url: `/accounts/${account.id}`,
      description: `Balance: $${account.balance?.toFixed(2) || '0.00'}`,
    })),
    Strategies: strategies.map(strategy => ({
      title: strategy,
      url: `/strategies/${encodeURIComponent(strategy)}`,
      description: "Trading strategy analytics",
    })),
  }
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { accounts } = useAccountsStore();
  const { getUniqueStrategies } = useTradeStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get unique strategies from both live and backtest
  const strategies = React.useMemo(() => [...new Set([
    ...getUniqueStrategies('live'),
    ...getUniqueStrategies('backtest')
  ])], [getUniqueStrategies]);

  const data = React.useMemo(() => createNavData(accounts, strategies), [accounts, strategies]);
  
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
  
  // Initialize active item based on current route
  const [activeItem, setActiveItem] = React.useState(() => getActiveItemFromPath(location.pathname) || data.navMain[0])
  const [content, setContent] = React.useState(() => {
    const initialActiveItem = getActiveItemFromPath(location.pathname) || data.navMain[0];
    return data.content[initialActiveItem?.title as keyof typeof data.content] || data.content.Dashboard;
  })
  const { setOpen, open: sidebarOpen } = useSidebar()

  // Update sidebar state when route changes (but not when manually clicking sidebar)
  React.useEffect(() => {
    const newActiveItem = getActiveItemFromPath(location.pathname);
    if (newActiveItem && newActiveItem.title !== activeItem?.title) {
      setActiveItem(newActiveItem);
      const newContent = data.content[newActiveItem.title as keyof typeof data.content] || [];
      setContent(newContent);
    } else if (!newActiveItem && data.navMain.length > 0) {
      // Fallback to first item if no match found
      setActiveItem(data.navMain[0]);
      setContent(data.content[data.navMain[0]?.title as keyof typeof data.content] || []);
    }
  }, [location.pathname, getActiveItemFromPath, data.content, data.navMain]); // Removed activeItem from deps to prevent interference

  React.useEffect(() => {
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
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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
                          setActiveItem(item)
                          const newContent = data.content[item.title as keyof typeof data.content] || []
                          setContent(newContent)
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
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {content.map((item) => (
                <Link
                  to={item.url}
                  key={item.url}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0"
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
              ))}
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