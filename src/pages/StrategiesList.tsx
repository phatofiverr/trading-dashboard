import React, { useState, useEffect } from 'react';
import { useTradeStore } from '@/hooks/useTradeStore';
import { useAccountStore } from '@/hooks/useAccountStore';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Copy, TrendingUp, TrendingDown, ListCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { StrategyPerformance } from '@/types/Trade';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const StrategyCard = ({ 
  strategy, 
  onDuplicate 
}: { 
  strategy: StrategyPerformance, 
  onDuplicate: (strategy: StrategyPerformance) => void 
}) => (
  <Card key={strategy.name} className="glass-effect overflow-hidden">
    <CardContent className="p-4">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{strategy.name}</h3>
          <span className={strategy.profit >= 0 ? "text-green-500" : "text-red-500"}>
            {strategy.profit >= 0 ? "+" : ""}{strategy.profit.toFixed(2)}R
          </span>
        </div>
        
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mt-1">
            {strategy.tradesCount} {strategy.tradesCount === 1 ? 'trade' : 'trades'}
          </div>
          
          {/* Win rate info */}
          <div className="text-xs text-muted-foreground mt-2 flex items-center">
            <span className="mr-1">Win rate:</span>
            <span className={strategy.winRate >= 50 ? "text-green-500" : "text-yellow-500"}>
              {strategy.winRate.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Link to={`/strategies/${encodeURIComponent(strategy.name)}`} className="flex-1">
            <Button variant="minimal" className="w-full justify-between p-2 h-auto text-xs">
              View details
              <svg className="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="minimal" size="sm" className="ml-1 h-auto px-2 py-2">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/80 backdrop-blur-md border-white/5">
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={() => onDuplicate(strategy)}
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate Strategy</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StrategiesList: React.FC = () => {
  const { fetchAllStrategyPerformance, createStrategy, getUniqueStrategies, fetchTrades, initialLoadComplete, setInitialLoadComplete } = useTradeStore();
  const { currentUser, initializeMockData } = useAccountStore();
  const [strategies, setStrategies] = useState<StrategyPerformance[]>([]);
  const [newStrategy, setNewStrategy] = useState<string>("");
  const [showAddStrategyDialog, setShowAddStrategyDialog] = useState<boolean>(false);
  
  // New state for the duplicate strategy dialog
  const [showDuplicateDialog, setShowDuplicateDialog] = useState<boolean>(false);
  const [strategyToDuplicate, setStrategyToDuplicate] = useState<StrategyPerformance | null>(null);
  const [duplicateName, setDuplicateName] = useState<string>("");
  
  const navigate = useNavigate();
  
  // Initialize user data if not already done
  useEffect(() => {
    if (!currentUser) {
      initializeMockData();
    }
  }, [currentUser, initializeMockData]);
  
  // Load trades data on initial mount
  useEffect(() => {
    if (!initialLoadComplete) {
      fetchTrades();
      setInitialLoadComplete();
    }
  }, [fetchTrades, initialLoadComplete, setInitialLoadComplete]);
  
  // Get strategies from trades when component mounts and when trades change
  useEffect(() => {
    const fetchStrategies = () => {
      // Explicitly get only live strategies
      const data = fetchAllStrategyPerformance('live');
      setStrategies(data);
    };
    
    fetchStrategies();
    
    // Poll for changes every second
    const intervalId = setInterval(fetchStrategies, 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchAllStrategyPerformance]);
  
  // Calculate strategy performance indicators
  const profitableStrategies = strategies.filter(strategy => strategy.profit > 0);
  const unprofitableStrategies = strategies.filter(strategy => strategy.profit < 0);
  const totalProfit = strategies.reduce((sum, strategy) => sum + strategy.profit, 0);
  const avgWinRate = strategies.length > 0 
    ? strategies.reduce((sum, strategy) => sum + strategy.winRate, 0) / strategies.length 
    : 0;
  
  const handleAddStrategy = async () => {
    if (newStrategy.trim() === "") {
      toast.error("Strategy name cannot be empty");
      return;
    }
    
    const existingStrategies = getUniqueStrategies('live');
    if (existingStrategies.includes(newStrategy)) {
      toast.error("Strategy already exists");
      return;
    }
    
    try {
      // Create the new strategy
      await createStrategy(newStrategy, 'live'); // or 'backtest' as appropriate for the context
      
      // Update the strategy list immediately
      const updatedStrategies = [...strategies];
      const newStrategyData: StrategyPerformance = {
        name: newStrategy,
        winRate: 0,
        profit: 0,
        tradesCount: 0,
        lastTradeDate: null
      };
      updatedStrategies.push(newStrategyData);
      setStrategies(updatedStrategies);
      
      toast.success(`${newStrategy} strategy added`);
      setNewStrategy("");
      setShowAddStrategyDialog(false);
      
      // Navigate to the new strategy page
      navigate(`/strategies/${encodeURIComponent(newStrategy)}`);
    } catch (error) {
      console.error("Error creating strategy:", error);
      toast.error("Failed to create strategy");
    }
  };

  const handleDuplicateDialogOpen = (strategy: StrategyPerformance) => {
    setStrategyToDuplicate(strategy);
    setDuplicateName(`${strategy.name} (copy)`);
    setShowDuplicateDialog(true);
  };
  
  const handleDuplicateStrategy = async () => {
    if (!strategyToDuplicate) return;
    
    if (duplicateName.trim() === "") {
      toast.error("Strategy name cannot be empty");
      return;
    }
    
    const existingStrategies = getUniqueStrategies('live');
    if (existingStrategies.includes(duplicateName)) {
      toast.error("Strategy already exists");
      return;
    }
    
    try {
      // Create the duplicate strategy
      await createStrategy(duplicateName, 'live'); // or 'backtest' as appropriate for the context
      
      // Update the strategy list immediately
      const updatedStrategies = [...strategies];
      const newStrategyData: StrategyPerformance = {
        name: duplicateName,
        winRate: 0,
        profit: 0,
        tradesCount: 0,
        lastTradeDate: null
      };
      updatedStrategies.push(newStrategyData);
      setStrategies(updatedStrategies);
      
      toast.success(`Strategy duplicated as ${duplicateName}`);
      setDuplicateName("");
      setStrategyToDuplicate(null);
      setShowDuplicateDialog(false);
      
      // Navigate to the new strategy page
      navigate(`/strategies/${encodeURIComponent(duplicateName)}`);
    } catch (error) {
      console.error("Error duplicating strategy:", error);
      toast.error("Failed to duplicate strategy");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">
                  {currentUser ? `Welcome back, ${currentUser.displayName.split(' ')[0]}.` : 'Trading Strategies'}
                </h1>
                
                {/* New strategy stats section */}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center mt-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 mr-3">
                      <TrendingUp size={18} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profitable Strategies</p>
                      <p className="text-lg font-medium">{profitableStrategies.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 mr-3">
                      <TrendingDown size={18} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unprofitable Strategies</p>
                      <p className="text-lg font-medium">{unprofitableStrategies.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 mr-3">
                      <ListCheck size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total R Profit/Loss</p>
                      <p className={`text-lg font-medium ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}R
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">
                  {strategies.length > 0 ? (
                    <span>Avg. Win Rate: <span className={avgWinRate >= 50 ? 'text-green-500' : 'text-yellow-500'}>{avgWinRate.toFixed(2)}%</span></span>
                  ) : (
                    <span>No strategies found</span>
                  )}
                </div>
                <Dialog open={showAddStrategyDialog} onOpenChange={setShowAddStrategyDialog}>
                  <DialogTrigger asChild>
                    <Button variant="glass" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Strategy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
                    <DialogHeader>
                      <DialogTitle>Add New Strategy</DialogTitle>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {strategies.map((strategy) => (
                  <StrategyCard 
                    key={strategy.name} 
                    strategy={strategy} 
                    onDuplicate={handleDuplicateDialogOpen} 
                  />
                ))}
                {strategies.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No strategies found. Create your first strategy to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Duplicate Strategy Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle>Duplicate Strategy</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Create a copy of "{strategyToDuplicate?.name}" with a new name:
            </p>
            <Input
              placeholder="New Strategy Name"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              className="bg-black/20 border-white/10"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDuplicateStrategy} variant="glass">
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default StrategiesList;
