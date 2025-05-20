import React, { useState, useEffect } from 'react';
import { LogOut, User, Wallet, Users, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountsStore, TradingAccount } from '@/hooks/useAccountsStore';
import { useAccountStore } from '@/hooks/useAccountStore';
import MiniProfile from './sidebar/MiniProfile';
import { useAuth } from '@/contexts/AuthContext';
import FirestoreSyncButton from '@/components/FirestoreSyncButton';

const AppSidebar: React.FC = () => {
  const { getUniqueStrategies, deleteStrategy, createStrategy } = useTradeStore();
  const { accounts, addAccount, deleteAccount } = useAccountsStore();
  const { currentUser } = useAccountStore();
  const { logout } = useAuth();
  const [liveStrategies, setLiveStrategies] = useState<string[]>([]);
  const [backtestStrategies, setBacktestStrategies] = useState<string[]>([]);
  const [newStrategy, setNewStrategy] = useState<string>("");
  const [newStrategyType, setNewStrategyType] = useState<'live' | 'backtest'>('live');
  const [showAddStrategyDialog, setShowAddStrategyDialog] = useState<boolean>(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    currency: 'USD',
    balance: 0,
    initialBalance: 0,
  });
  const [isHovering, setIsHovering] = useState<boolean>(false);
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
      const liveStrats = getUniqueStrategies('live');
      const backtestStrats = getUniqueStrategies('backtest');
      setLiveStrategies(liveStrats);
      setBacktestStrategies(backtestStrats);
    };
    
    fetchStrategies();
    
    // Poll for changes every second
    const intervalId = setInterval(fetchStrategies, 1000);
    
    return () => clearInterval(intervalId);
  }, [getUniqueStrategies, location.pathname]);
  
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
  
  const handleAddStrategy = async () => {
    if (newStrategy.trim() === "") {
      toast.error("Strategy name cannot be empty");
      return;
    }
    
    const existingStrategies = getUniqueStrategies(newStrategyType);
    if (existingStrategies.includes(newStrategy)) {
      toast.error(`Strategy already exists in ${newStrategyType} section`);
      return;
    }
    
    try {
      // Create the strategy in the store and persist it
      await createStrategy(newStrategy, newStrategyType);
      
      // Update local state immediately for better UX
      if (newStrategyType === 'live') {
        setLiveStrategies(prev => [...prev, newStrategy]);
      } else {
        setBacktestStrategies(prev => [...prev, newStrategy]);
      }
      
      toast.success(`${newStrategy} ${newStrategyType} strategy added`);
      setNewStrategy("");
      setShowAddStrategyDialog(false);
      
      // Navigate to the new strategy
      if (newStrategyType === 'live') {
        navigate(`/strategies/${encodeURIComponent(newStrategy)}`);
      } else {
        navigate(`/backtest-strategies/${encodeURIComponent(newStrategy)}`);
      }
    } catch (error) {
      console.error("Error creating strategy:", error);
      toast.error("Failed to create strategy");
    }
  };
  
  const handleAddAccount = () => {
    if (!newAccount.name) {
      toast.error("Account name is required");
      return;
    }
    
    if (accounts.some(acc => acc.name === newAccount.name)) {
      toast.error("Account already exists");
      return;
    }
    
    // Store the return value from addAccount
    const createdAccount = addAccount({
      name: newAccount.name,
      currency: newAccount.currency,
      balance: parseFloat(newAccount.balance.toString()),
      initialBalance: parseFloat(newAccount.initialBalance.toString()),
    });
    
    // Reset form and close dialog
    setNewAccount({ name: '', currency: 'USD', balance: 0, initialBalance: 0 });
    setShowAddAccountDialog(false);
    
    // Navigate to the new account - only if createdAccount is defined
    if (createdAccount && typeof createdAccount === 'object' && 'id' in createdAccount) {
      navigate(`/accounts/${createdAccount.id}`);
    }
  };
  
  const handleDeleteStrategy = (strategy: string, type: 'live' | 'backtest') => {
    const success = deleteStrategy(strategy);
    
    if (success) {
      if (type === 'live') {
        setLiveStrategies(liveStrategies.filter(s => s !== strategy));
        
        // If we're on the deleted strategy's page, redirect to strategies list
        if (location.pathname.includes(`/strategies/${encodeURIComponent(strategy)}`)) {
          navigate('/strategies');
        }
      } else {
        setBacktestStrategies(backtestStrategies.filter(s => s !== strategy));
        
        // If we're on the deleted strategy's page, redirect to backtest strategies list
        if (location.pathname.includes(`/backtest-strategies/${encodeURIComponent(strategy)}`)) {
          navigate('/backtest-strategies');
        }
      }
      
      toast.success(`${strategy} strategy deleted`);
    } else {
      toast.error("Could not delete strategy");
    }
  };

  const handleDeleteAccount = (account: TradingAccount) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteAccount(account.id);
      
      // If we're on the deleted account's page, redirect to the profile page
      if (location.pathname.includes(`/accounts/${account.id}`)) {
        navigate('/profile');
      }
    }
  };

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "BTC", "ETH"];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
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
            <SidebarGroupLabel className="text-white/70 px-1 pt-2 pb-1 text-xs">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Profile" 
                    isActive={location.pathname === '/profile' || location.pathname.startsWith('/profile/')}
                    asChild
                    className="px-2 py-1.5"
                  >
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Live Strategies" 
                    isActive={location.pathname === '/strategies' || 
                              (location.pathname.startsWith('/strategies/') && 
                               !location.pathname.startsWith('/backtest-strategies/'))}
                    asChild
                    className="px-2 py-1.5"
                  >
                    <Link to="/strategies">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                      </svg>
                      <span>Live Strategies</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Backtest Strategies" 
                    isActive={location.pathname === '/backtest-strategies' || 
                              location.pathname.startsWith('/backtest-strategies/')}
                    asChild
                    className="px-2 py-1.5"
                  >
                    <Link to="/backtest-strategies">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                      </svg>
                      <span>Backtest Strategies</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Accounts" 
                    isActive={location.pathname === '/accounts' || location.pathname.startsWith('/accounts/')}
                    asChild
                    className="px-2 py-1.5"
                  >
                    <Link to="/accounts">
                      <Wallet className="h-4 w-4" />
                      <span>Accounts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Accounts Section */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-white/70 px-1 pt-2 pb-1 text-xs">Accounts</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {accounts.map((account) => (
                  <SidebarMenuItem key={account.id}>
                    <SidebarMenuButton 
                      isActive={location.pathname === `/accounts/${account.id}`}
                      asChild
                      className="px-2 py-1.5"
                    >
                      <Link to={`/accounts/${account.id}`}>
                        <Wallet className="h-4 w-4" />
                        <span>{account.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction 
                      showOnHover
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(account);
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
                
                {/* Add Account Button */}
                <SidebarMenuItem>
                  <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
                    <DialogTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add Account</span>
                      </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
                      <DialogHeader>
                        <DialogTitle>Add New Trading Account</DialogTitle>
                        <DialogDescription>Create a new trading account to track your performance</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">Account Name</label>
                          <Input
                            id="name"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                            placeholder="My Trading Account"
                            className="bg-black/20 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="currency" className="text-sm font-medium">Currency</label>
                          <select
                            id="currency"
                            value={newAccount.currency}
                            onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                            className="w-full bg-black/20 border-white/10 rounded-md p-2"
                          >
                            {currencies.map(currency => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="initialBalance" className="text-sm font-medium">Initial Balance</label>
                            <Input
                              id="initialBalance"
                              type="number"
                              value={newAccount.initialBalance}
                              onChange={(e) => setNewAccount({ ...newAccount, initialBalance: parseFloat(e.target.value) })}
                              placeholder="10000"
                              className="bg-black/20 border-white/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="balance" className="text-sm font-medium">Current Balance</label>
                            <Input
                              id="balance"
                              type="number"
                              value={newAccount.balance}
                              onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
                              placeholder="10000"
                              className="bg-black/20 border-white/10"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddAccount}>Add Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Live Trading Strategies Section */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-white/70 px-1 pt-2 pb-1 text-xs">Live Trading Strategies</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {liveStrategies.map((strategy) => (
                  <SidebarMenuItem key={strategy}>
                    <SidebarMenuButton 
                      isActive={location.pathname === `/strategies/${encodeURIComponent(strategy)}`}
                      asChild
                      className="px-2 py-1.5"
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
                    <SidebarMenuAction 
                      showOnHover
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStrategy(strategy, 'live');
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
                
                {/* Add Live Strategy Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton className="px-2 py-1.5" onClick={() => {
                    setNewStrategyType('live');
                    setShowAddStrategyDialog(true);
                  }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Live Strategy</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Backtest Strategies Section */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-white/70 px-1 pt-2 pb-1 text-xs">Backtest Strategies</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {backtestStrategies.map((strategy) => (
                  <SidebarMenuItem key={strategy}>
                    <SidebarMenuButton 
                      isActive={location.pathname === `/backtest-strategies/${encodeURIComponent(strategy)}`}
                      asChild
                      className="px-2 py-1.5"
                    >
                      <Link to={`/backtest-strategies/${encodeURIComponent(strategy)}`}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <path d="M3 9h18"></path>
                          <path d="M9 21V9"></path>
                        </svg>
                        <span>{strategy}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction 
                      showOnHover
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStrategy(strategy, 'backtest');
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
                
                {/* Add Backtest Strategy Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton className="px-2 py-1.5" onClick={() => {
                    setNewStrategyType('backtest');
                    setShowAddStrategyDialog(true);
                  }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Backtest Strategy</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-white/5 bg-black/10 backdrop-blur-md p-2">
          <div className="gap-2 flex flex-col">
            <FirestoreSyncButton 
              variant="outline" 
              className="w-full bg-black/20 border-white/10"
            />
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      {/* Add Strategy Dialog */}
      <Dialog open={showAddStrategyDialog} onOpenChange={setShowAddStrategyDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle>
              Add New {newStrategyType === 'live' ? 'Live Trading' : 'Backtest'} Strategy
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Strategy Name"
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              className="bg-black/20 border-white/10"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddStrategy} variant="glass">
              Add Strategy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppSidebar;
