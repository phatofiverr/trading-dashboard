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

// Navigation data structureas
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
        className="w-[calc(var(--sidebar-width-icon)_+_1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="md:h-8 md:p-0"
                tooltip={{
                  children: "Trading Dashboard",
                  hidden: false,
                }}
              >
                <Link to="/summary">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Home className="size-4" />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        const newContent = data.content[item.title as keyof typeof data.content] || []
                        setContent(newContent)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{
                  children: "Log Out",
                  hidden: false,
                }}
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
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