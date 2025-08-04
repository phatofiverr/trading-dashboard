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

const StrategyCard = ({ 
  strategy, 
  onDuplicate 
}: { 
  strategy: StrategyPerformance, 
  onDuplicate: (strategy: StrategyPerformance) => void 
}) => (
  <Card className="glass-effect bg-black/5 border-0 overflow-hidden transition-all hover:bg-black/10">
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
        
        <div className="flex mt-4 gap-2">
          <Button variant="minimal" size="sm" asChild className="flex-1">
            <Link to={`/backtest-strategies/${encodeURIComponent(strategy.name)}`}>
              View
            </Link>
          </Button>
          <Button variant="minimal" size="sm" className="flex-1" onClick={() => onDuplicate(strategy)}>
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const BacktestStrategies: React.FC = () => {
  const { 
    fetchAllStrategyPerformance, 
    createStrategy, 
    getUniqueStrategies, 
    fetchTrades, 
    initialLoadComplete, 
    setInitialLoadComplete 
  } = useTradeStore();
  const { currentUser } = useAccountStore();
  const [strategies, setStrategies] = useState<StrategyPerformance[]>([]);
  const [newStrategy, setNewStrategy] = useState<string>("");
  const [showAddStrategyDialog, setShowAddStrategyDialog] = useState<boolean>(false);
  
  // New state for the duplicate strategy dialog
  const [showDuplicateDialog, setShowDuplicateDialog] = useState<boolean>(false);
  const [strategyToDuplicate, setStrategyToDuplicate] = useState<StrategyPerformance | null>(null);
  const [duplicateName, setDuplicateName] = useState<string>("");
  
  const navigate = useNavigate();
  
  // User data will be loaded automatically via AppSidebar
  
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
      const data = fetchAllStrategyPerformance('backtest');
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
    
    const existingStrategies = getUniqueStrategies('backtest');
    if (existingStrategies.includes(newStrategy)) {
      toast.error("Strategy already exists");
      return;
    }
    
    try {
      // Create the new backtest strategy
      await createStrategy(newStrategy, 'backtest');
      
      // No need to manually update the list - the strategy is now stored persistently
      toast.success(`${newStrategy} backtest strategy added`);
      setNewStrategy("");
      setShowAddStrategyDialog(false);
      
      // Navigate to the new strategy page
      navigate(`/backtest-strategies/${encodeURIComponent(newStrategy)}`);
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
    
    const existingStrategies = getUniqueStrategies('backtest');
    if (existingStrategies.includes(duplicateName)) {
      toast.error("Strategy already exists");
      return;
    }
    
    try {
      // Create the duplicate strategy as a backtest strategy
      await createStrategy(duplicateName, 'backtest');
      
      // Update the strategy list immediately
      setStrategies(prev => [...prev, {
        name: duplicateName,
        winRate: 0,
        profit: 0,
        tradesCount: 0,
        lastTradeDate: null
      }]);
      
      toast.success(`Strategy duplicated as ${duplicateName}`);
      setDuplicateName("");
      setStrategyToDuplicate(null);
      setShowDuplicateDialog(false);
      
      // Navigate to the new strategy page
      navigate(`/backtest-strategies/${encodeURIComponent(duplicateName)}`);
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
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">Backtest Strategies</h1>
                  <Dialog open={showAddStrategyDialog} onOpenChange={setShowAddStrategyDialog}>
                    <DialogTrigger asChild>
                      <Button variant="glass" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Backtest Strategy
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
                      <DialogHeader>
                        <DialogTitle>Add New Backtest Strategy</DialogTitle>
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategies.map((strategy) => (
                  <StrategyCard 
                    key={strategy.name} 
                    strategy={strategy} 
                    onDuplicate={handleDuplicateDialogOpen} 
                  />
                ))}
                {strategies.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-black/5 rounded-lg p-8">
                    <p className="text-muted-foreground text-lg mb-4">
                      No backtest strategies found. Create your first backtest strategy to get started.
                    </p>
                    <Button variant="glass" onClick={() => setShowAddStrategyDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Backtest Strategy
                    </Button>
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
            <DialogTitle>Duplicate Backtest Strategy</DialogTitle>
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

export default BacktestStrategies;
