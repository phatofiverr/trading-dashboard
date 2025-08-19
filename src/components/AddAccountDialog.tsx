import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccountsStore } from '@/hooks/useAccountsStore';

interface AddAccountDialogProps {
  trigger?: React.ReactNode;
  onAccountAdded?: () => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ 
  trigger, 
  onAccountAdded 
}) => {
  const navigate = useNavigate();
  const { accounts, addAccount } = useAccountsStore();
  const [showDialog, setShowDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    currency: 'USD',
    initialBalance: 0,
  });

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

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
      balance: parseFloat(newAccount.initialBalance.toString()), // Set balance to initial balance at creation
      initialBalance: parseFloat(newAccount.initialBalance.toString()),
    });
    
    // Reset form and close dialog
    setNewAccount({ name: '', currency: 'USD', initialBalance: 0 });
    setShowDialog(false);
    
    // Call the callback if provided
    if (onAccountAdded) {
      onAccountAdded();
    }
    
    // Navigate to the new account - only if createdAccount is defined
    if (createdAccount && typeof createdAccount === 'object' && 'id' in createdAccount) {
      navigate(`/accounts/${createdAccount.id}`);
    }
  };

  const handleCancel = () => {
    setNewAccount({ name: '', currency: 'USD', initialBalance: 0 });
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/40 hover:text-white/60 cursor-pointer rounded-md hover:bg-white/5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Account</span>
          </div>
        )}
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
              onChange={(e) => setNewAccount({ ...newAccount, initialBalance: parseFloat(e.target.value) })}
              placeholder="10000"
              className="bg-black/20 border-white/10"
            />
            <p className="text-xs text-muted-foreground">Current balance will be calculated automatically from your trades</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleAddAccount}>Add Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
