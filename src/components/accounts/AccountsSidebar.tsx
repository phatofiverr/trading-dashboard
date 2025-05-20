
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserIcon, Wallet, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAccountStore } from '@/hooks/useAccountStore';

const AccountsSidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAccountStore();

  const menuItems = [
    { title: 'Accounts Overview', path: '/accounts', icon: Wallet },
    { title: 'My Profile', path: '/profile', icon: UserIcon },
    { title: 'Find Friends', path: '/profile?tab=friends', icon: Users },
  ];

  return (
    <Sidebar variant="inset" className="border-0 bg-black/10">
      <SidebarContent className="bg-black/10 backdrop-blur-md">
        <SidebarGroup>
          <div className="flex flex-col items-center py-6">
            <Avatar className="h-20 w-20 border-2 border-white/20">
              <AvatarImage src={currentUser?.avatarUrl || ""} alt="Profile picture" />
              <AvatarFallback className="bg-black/30 text-xl">
                {currentUser?.displayName.split(' ').map(n => n[0]).join('') || 'JD'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center mt-4">
              <h2 className="font-medium">{currentUser?.displayName || 'John Doe'}</h2>
              <p className="text-sm text-muted-foreground">{currentUser?.email || 'john@example.com'}</p>
            </div>
          </div>
          
          <SidebarGroupLabel className="text-white/70">Account Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={
                      item.path === '/profile' 
                        ? location.pathname === '/profile' && !location.search.includes('tab=friends')
                        : item.path === '/profile?tab=friends'
                        ? location.search.includes('tab=friends')
                        : location.pathname === item.path
                    }
                    asChild
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AccountsSidebar;
