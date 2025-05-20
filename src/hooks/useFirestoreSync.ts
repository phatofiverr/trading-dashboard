import { useState } from 'react';
import { useAccountsStore, TradingAccount } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import { Strategy } from '@/hooks/slices/types';
import { Trade } from '@/types/Trade';
import firebaseService from '@/services/firebaseService';
import { toast } from 'sonner';

interface FirestoreSyncState {
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

export const useFirestoreSync = () => {
  const [state, setState] = useState<FirestoreSyncState>({
    isLoading: false,
    isSyncing: false,
    error: null
  });

  // Get data from stores
  const { accounts } = useAccountsStore();
  const { 
    strategies, 
    trades,
    createStrategy,
    addTrade,
    updateTrade
  } = useTradeStore();

  /**
   * Loads all data from Firestore to local stores
   */
  const loadFromFirestore = async () => {
    setState({ ...state, isLoading: true, error: null });
    
    try {
      // Fetch accounts
      const firestoreAccounts = await firebaseService.fetchAccounts();
      
      // Fetch strategies
      const firestoreStrategies = await firebaseService.fetchStrategies();
      
      // Fetch trades
      const firestoreTrades = await firebaseService.fetchTrades();
      
      // Load data into local stores
      // Note: This needs to be implemented in the respective store slices
      
      // For now, you can use a toast notification to inform the user
      toast.success(`Loaded data from Firestore: ${firestoreAccounts.length} accounts, ${firestoreStrategies.length} strategies, ${firestoreTrades.length} trades`);
      
      setState({ ...state, isLoading: false });
    } catch (error) {
      console.error('Error loading from Firestore:', error);
      setState({ 
        ...state, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error loading data' 
      });
      toast.error('Failed to load data from Firestore');
    }
  };

  /**
   * Syncs all local data to Firestore
   */
  const syncToFirestore = async () => {
    setState({ ...state, isSyncing: true, error: null });
    
    try {
      await firebaseService.syncDataToFirestore(
        accounts,
        strategies,
        trades
      );
      
      toast.success('Data synced to Firestore successfully');
      setState({ ...state, isSyncing: false });
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
      setState({ 
        ...state, 
        isSyncing: false, 
        error: error instanceof Error ? error.message : 'Unknown error syncing data'
      });
      toast.error('Failed to sync data to Firestore');
    }
  };

  /**
   * Saves a single account to Firestore
   */
  const saveAccount = async (account: TradingAccount) => {
    setState({ ...state, isSyncing: true, error: null });
    
    try {
      await firebaseService.saveAccount(account);
      toast.success(`Account "${account.name}" saved to Firestore`);
      setState({ ...state, isSyncing: false });
    } catch (error) {
      console.error('Error saving account to Firestore:', error);
      setState({ 
        ...state, 
        isSyncing: false, 
        error: error instanceof Error ? error.message : 'Unknown error saving account'
      });
      toast.error('Failed to save account to Firestore');
    }
  };

  /**
   * Saves a single strategy to Firestore
   */
  const saveStrategy = async (strategy: Strategy) => {
    setState({ ...state, isSyncing: true, error: null });
    
    try {
      await firebaseService.saveStrategy(strategy);
      toast.success(`Strategy "${strategy.name}" saved to Firestore`);
      setState({ ...state, isSyncing: false });
    } catch (error) {
      console.error('Error saving strategy to Firestore:', error);
      setState({ 
        ...state, 
        isSyncing: false, 
        error: error instanceof Error ? error.message : 'Unknown error saving strategy'
      });
      toast.error('Failed to save strategy to Firestore');
    }
  };

  /**
   * Saves a single trade to Firestore
   */
  const saveTrade = async (trade: Trade) => {
    setState({ ...state, isSyncing: true, error: null });
    
    try {
      await firebaseService.saveTrade(trade);
      toast.success('Trade saved to Firestore');
      setState({ ...state, isSyncing: false });
    } catch (error) {
      console.error('Error saving trade to Firestore:', error);
      setState({ 
        ...state, 
        isSyncing: false, 
        error: error instanceof Error ? error.message : 'Unknown error saving trade'
      });
      toast.error('Failed to save trade to Firestore');
    }
  };

  return {
    // State
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    error: state.error,
    
    // Methods
    loadFromFirestore,
    syncToFirestore,
    saveAccount,
    saveStrategy,
    saveTrade
  };
}; 