
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from "sonner";

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
  deleteAccount: (id: string) => void;
  selectAccount: (id: string | null) => void;
  getAccountById: (id: string) => TradingAccount | undefined;
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

        toast.success(`Account ${newAccount.name} created successfully`);
        return newAccount;
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map(account =>
            account.id === id
              ? { ...account, ...updates, updatedAt: new Date().toISOString() }
              : account
          ),
        }));
        toast.success("Account updated successfully");
      },

      deleteAccount: (id) => {
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
    }),
    {
      name: 'trading-accounts-storage',
    }
  )
);
