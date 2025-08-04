
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from "sonner";
import firebaseService from '@/services/firebaseService';

// Define account types
export interface TradingAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  initialBalance: number;
  createdAt: string;
  updatedAt: string;
}

// Define the store state
interface AccountsState {
  accounts: TradingAccount[];
  selectedAccountId: string | null;
  isLoading: boolean;

  // Actions
  addAccount: (account: Omit<TradingAccount, 'id' | 'createdAt' | 'updatedAt'>) => TradingAccount;
  updateAccount: (id: string, updates: Partial<TradingAccount>) => void;
  renameAccount: (id: string, newName: string) => boolean;
  deleteAccount: (id: string) => void;
  selectAccount: (id: string | null) => void;
  getAccountById: (id: string) => TradingAccount | undefined;
  
  // Auto-sync helpers
  autoSyncAccount: (account: TradingAccount) => Promise<void>;
  loadAccountsFromFirebase: () => Promise<void>;
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccountId: null,
      isLoading: false,

      addAccount: (accountData) => {
        const now = new Date().toISOString();
        const newAccount: TradingAccount = {
          ...accountData,
          id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          accounts: [...state.accounts, newAccount],
          selectedAccountId: newAccount.id, // Auto-select the new account
        }));

        // Auto-sync to Firestore
        get().autoSyncAccount(newAccount);

        toast.success(`Account ${newAccount.name} created successfully`);
        return newAccount;
      },

      updateAccount: (id, updates) => {
        let updatedAccount: TradingAccount | null = null;
        
        set((state) => ({
          accounts: state.accounts.map(account => {
            if (account.id === id) {
              updatedAccount = { ...account, ...updates, updatedAt: new Date().toISOString() };
              return updatedAccount;
            }
            return account;
          }),
        }));
        
        // Auto-sync to Firestore
        if (updatedAccount) {
          get().autoSyncAccount(updatedAccount);
        }
        
        toast.success("Account updated successfully");
      },

      renameAccount: (id, newName) => {
        const { accounts } = get();
        
        if (!newName || newName.trim() === "") {
          toast.error("Account name cannot be empty");
          return false;
        }

        // Check if new name already exists
        if (accounts.some(account => account.name === newName && account.id !== id)) {
          toast.error(`Account "${newName}" already exists`);
          return false;
        }

        // Find the account
        const account = accounts.find(acc => acc.id === id);
        if (!account) {
          toast.error("Account not found");
          return false;
        }

        const oldName = account.name;
        let updatedAccount: TradingAccount | null = null;
        
        // Update the account name
        set((state) => ({
          accounts: state.accounts.map(account => {
            if (account.id === id) {
              updatedAccount = { ...account, name: newName, updatedAt: new Date().toISOString() };
              return updatedAccount;
            }
            return account;
          }),
        }));

        // Auto-sync to Firestore
        if (updatedAccount) {
          get().autoSyncAccount(updatedAccount);
        }

        toast.success(`Account renamed from "${oldName}" to "${newName}"`);
        return true;
      },

      deleteAccount: (id) => {
        // Delete from Firestore first
        firebaseService.deleteAccount(id).catch(error => {
          console.error('Failed to delete account from Firestore:', error);
        });
        
        set((state) => ({
          accounts: state.accounts.filter(account => account.id !== id),
          selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
        }));
        toast.success("Account deleted successfully");
      },

      selectAccount: (id) => {
        set({ selectedAccountId: id });
      },

      getAccountById: (id) => {
        return get().accounts.find(account => account.id === id);
      },

      // Auto-sync helper function
      autoSyncAccount: async (account) => {
        try {
          await firebaseService.saveAccount(account);
        } catch (error) {
          console.error('Failed to auto-sync account to Firestore:', error);
          // Don't show toast for auto-sync failures to avoid spam
        }
      },

      // Load accounts from Firebase
      loadAccountsFromFirebase: async () => {
        try {
          set({ isLoading: true });
          const accounts = await firebaseService.fetchAccounts();
          set({ accounts, isLoading: false });
        } catch (error) {
          console.error('Failed to load accounts from Firebase:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'trading-accounts-storage',
    }
  )
);
