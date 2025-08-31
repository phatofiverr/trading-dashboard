import React from 'react';
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
import AppSidebar from './AppSidebar';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';

interface SingleSidebarLayoutProps {
  children: React.ReactNode;
}

// Internal component that renders the main content
const SidebarContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const params = useParams();
  const { accounts } = useAccountsStore();
  const { getUniqueStrategies } = useTradeStore();
  const { toggleSidebar, open: sidebarOpen } = useSidebar();
  
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

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Header with Breadcrumb */}
        <header className="bg-black/5 backdrop-blur-md sticky top-0 flex shrink-0 items-center gap-2 border-b border-white/5 p-4 z-10">
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
        </header>

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

const SingleSidebarLayout: React.FC<SingleSidebarLayoutProps> = ({
  children
}) => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <SidebarContent>{children}</SidebarContent>
    </SidebarProvider>
  );
};

export default SingleSidebarLayout;