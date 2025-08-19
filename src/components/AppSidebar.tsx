import React, { useState, useEffect } from 'react';
import { LogOut, User, Wallet, Edit, MoreVertical, Ghost, ChevronDown, BarChart3 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountsStore, TradingAccount } from '@/hooks/useAccountsStore';
import AddAccountDialog from './AddAccountDialog';
import AddStrategyDialog from './AddStrategyDialog';
import { useAccountStore } from '@/hooks/useAccountStore';
import MiniProfile from './sidebar/MiniProfile';
import { useAuth } from '@/contexts/AuthContext';

const AppSidebar: React.FC = () => {
  const [accountsOpen, setAccountsOpen] = useState(false); // Initially closed
  const [strategiesOpen, setStrategiesOpen] = useState(false); // Initially closed
  const { getUniqueStrategies, deleteStrategy, createStrategy, renameStrategy } = useTradeStore();
  const { accounts, deleteAccount, renameAccount } = useAccountsStore();
  const { currentUser, loadUserFromFirebase, clearPersistedData } = useAccountStore();
  const { currentUser: authUser, logout } = useAuth();
  const [strategies, setStrategies] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  
  // Rename dialog state
  const [showRenameDialog, setShowRenameDialog] = useState<boolean>(false);
  const [renameType, setRenameType] = useState<'account' | 'strategy'>('account');
  const [itemToRename, setItemToRename] = useState<{id: string, currentName: string} | null>(null);
  const [newName, setNewName] = useState<string>("");
  
  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [accountToDelete, setAccountToDelete] = useState<TradingAccount | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { state, setOpen } = useSidebar();
  
  // Detect window size and collapse sidebar at 1080px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1080) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);
  
  // Update strategies when component mounts and when location changes
  useEffect(() => {
    const fetchStrategies = () => {
      // Get all unique strategies from both live and backtest
      const allStrategies = [...new Set([
        ...getUniqueStrategies('live'),
        ...getUniqueStrategies('backtest')
      ])];
      setStrategies(allStrategies);
    };
    
    fetchStrategies();
    
    // Poll for changes every second
    const intervalId = setInterval(fetchStrategies, 1000);
    
    return () => clearInterval(intervalId);
  }, [getUniqueStrategies, location.pathname]);

  // Load Firebase user data when auth user changes
  useEffect(() => {
    if (authUser?.uid) {
      // Clear any existing mock data first
      if (currentUser && currentUser.id === 'current-user') {
        clearPersistedData();
      }
      // Always load fresh Firebase data
      loadUserFromFirebase(authUser.uid);
    }
  }, [authUser, loadUserFromFirebase, clearPersistedData]);

  // Auto-open collapsible sections based on current route
  useEffect(() => {
    const path = location.pathname;
    
    // Only auto-open if we're navigating to a specific account or strategy page
    // Don't auto-open for general navigation like /accounts or /strategies
    if (path.startsWith('/accounts/') && path !== '/accounts') {
      setAccountsOpen(true);
    } else if (path.startsWith('/strategies/') && path !== '/strategies') {
      setStrategiesOpen(true);
    }
  }, [location.pathname]);
  
  // Handle mouse hover for sidebar at smaller screens
  const handleMouseEnter = () => {
    if (window.innerWidth <= 1080) {
      setIsHovering(true);
      setOpen(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (window.innerWidth <= 1080) {
      setIsHovering(false);
      setOpen(false);
    }
  };
  

  

  
  const handleDeleteStrategy = (strategy: string) => {
    const success = deleteStrategy(strategy);
    
    if (success) {
      setStrategies(strategies.filter(s => s !== strategy));
      
      // If we're on the deleted strategy's page, redirect to strategies list
      if (location.pathname.includes(`/strategies/${encodeURIComponent(strategy)}`)) {
        navigate('/strategies');
      }
      
      toast.success(`${strategy} strategy deleted`);
    } else {
      toast.error("Could not delete strategy");
    }
  };

  const handleDeleteAccount = (account: TradingAccount) => {
    setAccountToDelete(account);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;
    
    deleteAccount(accountToDelete.id);
    
    // If we're on the deleted account's page, redirect to the profile page
    if (location.pathname.includes(`/accounts/${accountToDelete.id}`)) {
      navigate('/profile');
    }
    
    toast.success(`${accountToDelete.name} account deleted`);
    setShowDeleteDialog(false);
    setAccountToDelete(null);
  };

  const handleRenameClick = (type: 'account' | 'strategy', id: string, currentName: string) => {
    setRenameType(type);
    setItemToRename({ id, currentName });
    setNewName(currentName);
    setShowRenameDialog(true);
  };

  const handleRename = () => {
    if (!itemToRename || !newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    let success = false;
    
    switch (renameType) {
      case 'account':
        success = renameAccount(itemToRename.id, newName.trim());
        break;
      case 'strategy':
        success = renameStrategy(itemToRename.currentName, newName.trim());
        if (success) {
          // Update local state for strategies
          setStrategies(prev => prev.map(s => s === itemToRename.currentName ? newName.trim() : s));
          // Navigate to new URL if we're on the renamed strategy page
          if (location.pathname === `/strategies/${encodeURIComponent(itemToRename.currentName)}`) {
            navigate(`/strategies/${encodeURIComponent(newName.trim())}`);
          }
        }
        break;
    }

    if (success) {
      setShowRenameDialog(false);
      setItemToRename(null);
      setNewName("");
    }
  };



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
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Adding a larger hoverable area on the edge of the screen for smaller screens */}
      {window.innerWidth <= 1080 && state === "collapsed" && !isHovering && (
        <div 
          className="fixed left-0 top-0 w-6 h-full z-40 bg-transparent" 
          onMouseEnter={handleMouseEnter}
        />
      )}
      
      <Sidebar variant="inset" className="border-0 bg-black/5">
        <SidebarHeader className="bg-black/10 backdrop-blur-md p-0">
          <MiniProfile user={currentUser} className="mb-0" />
        </SidebarHeader>
        
        <SidebarContent className="bg-black/5 backdrop-blur-md py-2 px-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/50 px-1 pt-2 pb-1 text-xs">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Summary" 
                    isActive={location.pathname === '/summary'}
                    className={location.pathname === '/summary' ? "" : "text-white/40 hover:text-white/60"}
                    asChild
                  >
                    <Link to="/summary">
                      <BarChart3 className="h-4 w-4" />
                      <span>Workstation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Summary" 
                    //isActive={location.pathname === '/strategies' || location.pathname.startsWith('/strategies/')}
                    className={location.pathname === '/strategies' ? "" : "text-white/40 hover:text-white/60"}
                    asChild
                  >
                    <Link to="/strategies">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                      </svg>
                      <span>Strategies</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Accounts" 
                    //isActive={location.pathname === '/accounts' || location.pathname.startsWith('/accounts/')}
                    className={location.pathname === '/accounts' ? "" : "text-white/40 hover:text-white/60"}
                    asChild
                  >
                    <Link to="/accounts">
                      <Wallet className="h-4 w-4" />
                      <span>Accounts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Demon Hunter" 
                    isActive={location.pathname === '/demon-finder'}
                    className={location.pathname === '/demon-finder' ? "" : "text-white/40 hover:text-white/60"}
                    asChild
                  >
                    <Link to="/demon-finder" className="flex items-center gap-2">
                      <Ghost className="h-4 w-4 text-black-500" strokeWidth={2} />
                    <span>Demon Hunter</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Accounts Section */}
          <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen} className="mt-2">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between text-white/40 hover:text-white/60 group">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>Accounts</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 -rotate-90 group-data-[state=open]:rotate-0" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="space-y-0.5 ml-1 border-l border-white/10 pl-1">
                {accounts.map((account) => (
                  <SidebarMenuItem key={account.id}>
                    <SidebarMenuButton 
                      isActive={location.pathname === `/accounts/${account.id}`}
                      className={location.pathname === `/accounts/${account.id}` ? "" : "text-white/40 hover:text-white/60"}
                      asChild
                    >
                      <Link to={`/accounts/${account.id}`}>
                        <Wallet className="h-4 w-4" />
                        <span>{account.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreVertical className="h-3 w-3" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="bg-black/80 backdrop-blur-md border-white/10">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick('account', account.id, account.name);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAccount(account);
                          }}
                          className="cursor-pointer text-red-400 focus:text-red-300"
                        >
                          <svg className="h-3 w-3 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
                
                {/* Add Account Dialog */}
                <SidebarMenuItem>
                  <AddAccountDialog />
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Strategies Section */}
          <Collapsible open={strategiesOpen} onOpenChange={setStrategiesOpen} className="mt-2">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between text-white/40 hover:text-white/60 group">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M9 21V9"></path>
                  </svg>
                  <span>Strategies</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 -rotate-90 group-data-[state=open]:rotate-0" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="space-y-0.5 ml-2 border-l border-white/10 pl-2">
                {strategies.map((strategy) => (
                  <SidebarMenuItem key={strategy}>
                    <SidebarMenuButton 
                      isActive={location.pathname === `/strategies/${encodeURIComponent(strategy)}`}
                      className={location.pathname === `/strategies/${encodeURIComponent(strategy)}` ? "" : "text-white/40 hover:text-white/60"}
                      asChild
                    >
                      <Link to={`/strategies/${encodeURIComponent(strategy)}`}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <path d="M3 9h18"></path>
                          <path d="M9 21V9"></path>
                        </svg>
                        <span>{strategy}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreVertical className="h-3 w-3" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="bg-black/80 backdrop-blur-md border-white/10">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick('strategy', strategy, strategy);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStrategy(strategy);
                          }}
                          className="cursor-pointer text-red-400 focus:text-red-300"
                        >
                          <svg className="h-3 w-3 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
                
                {/* Add Strategy Button */}
                <SidebarMenuItem>
                  <AddStrategyDialog />
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-white/5 bg-black/10 backdrop-blur-md p-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-start gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      

      
      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle>
              Rename {renameType === 'account' ? 'Account' : 'Strategy'}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{itemToRename?.currentName}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={renameType === 'account' ? 'Account Name' : 'Strategy Name'}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-black/20 border-white/10"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} variant="glass">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{accountToDelete?.name}"? This action cannot be undone and all associated trades will remain but will no longer be linked to this account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="glass"
              className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
              onClick={confirmDeleteAccount}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppSidebar;
