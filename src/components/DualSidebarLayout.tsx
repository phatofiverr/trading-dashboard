import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';

interface SingleSidebarLayoutProps {
  children: React.ReactNode;
}

const SingleSidebarLayout: React.FC<SingleSidebarLayoutProps> = ({
  children
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        {/* Primary Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SingleSidebarLayout;
