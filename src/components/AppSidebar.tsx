"use client"

import * as React from "react"
import { Home, Users, TrendingUp, LogOut, User, BarChart3, Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
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

// Navigation data structure
const createNavData = (accounts: any[], strategies: string[]) => ({
  navMain: [
    {
      title: "Dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Accounts", 
      icon: Users,
      isActive: false,
    },
    {
      title: "Strategies",
      icon: TrendingUp,
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
        description: "Advanced trading signal detection",
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
  
  // Get unique strategies from both live and backtest
  const strategies = React.useMemo(() => [...new Set([
    ...getUniqueStrategies('live'),
    ...getUniqueStrategies('backtest')
  ])], [getUniqueStrategies]);

  const data = React.useMemo(() => createNavData(accounts, strategies), [accounts, strategies]);
  
  // Note: Using state to show active item.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const [content, setContent] = React.useState(data.content.Dashboard)
  const { setOpen } = useSidebar()

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
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] !min-w-[calc(var(--sidebar-width-icon)_+_1px)] !max-w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
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
      <Sidebar collapsible="none" className="hidden md:flex md:w-[280px] lg:w-[300px] md:min-w-[280px] lg:min-w-[300px] md:max-w-[280px] lg:max-w-[300px]">
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