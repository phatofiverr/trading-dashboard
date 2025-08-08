import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AccountCard = ({ account }: { account: any }) => {
  const { trades } = useTradeStore();
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Calculate total profit from all trades for this account
  const accountTrades = trades.filter(trade => trade.accountId === account.id);
  const totalTradeProfit = accountTrades.reduce((sum, trade) => {
    const tradeProfit = trade.profit !== undefined ? trade.profit : trade.rMultiple;
    return sum + tradeProfit;
  }, 0);
  
  // Calculate current balance and profit
  const currentBalance = account.initialBalance + totalTradeProfit;
  const profit = totalTradeProfit;
  const profitPercentage = account.initialBalance > 0 ? (profit / account.initialBalance) * 100 : 0;
  
  return (
    <Card className="glass-effect bg-black/5 border-0 overflow-hidden transition-all hover:bg-black/10">
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{account.name}</h3>
            <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
              {profit >= 0 ? "+" : ""}{formatCurrency(profit, account.currency)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(currentBalance, account.currency)} balance
            </div>
            
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <span className="mr-1">Change:</span>
              <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
                {profitPercentage >= 0 ? "+" : ""}{profitPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="minimal" size="sm" asChild className="w-full">
              <Link to={`/accounts/${account.id}`}>
                View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Accounts: React.FC = () => {
  const { accounts, addAccount } = useAccountsStore();
  const { fetchTrades } = useTradeStore();
  const navigate = useNavigate();
  
  // Fetch all trades when component mounts to ensure balance calculations are accurate
  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);
  const [showAddAccountDialog, setShowAddAccountDialog] = React.useState(false);
  const [newAccount, setNewAccount] = React.useState({
    name: '',
    currency: 'USD',
    balance: 10000,
    initialBalance: 10000,
  });

  const handleAddAccount = () => {
    if (!newAccount.name) {
      toast.error("Account name is required");
      return;
    }
    
    if (accounts.some(acc => acc.name === newAccount.name)) {
      toast.error("Account already exists");
      return;
    }
    
    // Create the account
    const createdAccount = addAccount({
      name: newAccount.name,
      currency: newAccount.currency,
      balance: parseFloat(newAccount.balance.toString()),
      initialBalance: parseFloat(newAccount.initialBalance.toString()),
    });
    
    // Reset form and close dialog
    setNewAccount({ name: '', currency: 'USD', balance: 10000, initialBalance: 10000 });
    setShowAddAccountDialog(false);
    
    // Navigate to the new account
    if (createdAccount && typeof createdAccount === 'object' && 'id' in createdAccount) {
      navigate(`/accounts/${createdAccount.id}`);
    }
  };

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "BTC", "ETH"];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Trading Accounts</h1>
                <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
                  <DialogTrigger asChild>
                    <Button variant="glass" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Account
                    </Button>
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
                      <div className="space-y-2">
                        <label htmlFor="initialBalance" className="text-sm font-medium">Initial Balance</label>
                        <Input
                          id="initialBalance"
                          type="number"
                          value={newAccount.initialBalance}
                          onChange={(e) => setNewAccount({ ...newAccount, initialBalance: parseFloat(e.target.value), balance: parseFloat(e.target.value) })}
                          placeholder="10000"
                          className="bg-black/20 border-white/10"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>Cancel</Button>
                      <Button variant="glass" onClick={handleAddAccount}>Create Account</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {accounts.length === 0 ? (
                <div className="bg-black/5 rounded-lg p-8 text-center">
                  <p className="text-lg text-center mb-4">No trading accounts yet</p>
                  <Button variant="glass" onClick={() => setShowAddAccountDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first account
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Accounts;
