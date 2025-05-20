import { db, auth } from '@/config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  deleteDoc,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  CollectionReference,
  Query
} from 'firebase/firestore';
import { TradingAccount } from '@/hooks/useAccountsStore';
import { Strategy } from '@/hooks/slices/types';
import { Trade } from '@/types/Trade';

// Collection references
const ACCOUNTS_COLLECTION = 'tradingAccounts';
const STRATEGIES_COLLECTION = 'strategies';
const TRADES_COLLECTION = 'trades';
const USERS_COLLECTION = 'users';

/**
 * Ensures the current user is authenticated
 * @returns The current user ID or throws an error if not authenticated
 */
const ensureAuthenticated = (): string => {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.uid) {
    throw new Error('User not authenticated');
  }
  return currentUser.uid;
};

// ===================== ACCOUNT FUNCTIONS =====================

/**
 * Saves a trading account to Firestore
 * @param account The account to save
 * @returns The account with Firestore ID
 */
export const saveAccount = async (account: TradingAccount): Promise<TradingAccount> => {
  const userId = ensureAuthenticated();
  
  // Create a reference to the user's accounts collection
  const userAccountsRef = collection(db, USERS_COLLECTION, userId, ACCOUNTS_COLLECTION);
  
  // If account has an ID, update existing document, otherwise create new
  if (account.id) {
    const accountRef = doc(userAccountsRef, account.id);
    await setDoc(accountRef, {
      ...account,
      updatedAt: serverTimestamp(),
      userId
    }, { merge: true });
    return account;
  } else {
    // Create new account with generated ID
    const newAccountRef = doc(userAccountsRef);
    const newAccount = {
      ...account,
      id: newAccountRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId
    };
    await setDoc(newAccountRef, newAccount);
    return {
      ...account,
      id: newAccountRef.id
    };
  }
};

/**
 * Fetches all trading accounts for the current user
 * @returns Array of user's trading accounts
 */
export const fetchAccounts = async (): Promise<TradingAccount[]> => {
  const userId = ensureAuthenticated();
  
  const userAccountsRef = collection(db, USERS_COLLECTION, userId, ACCOUNTS_COLLECTION);
  const accountsSnapshot = await getDocs(userAccountsRef);
  
  const accounts: TradingAccount[] = [];
  accountsSnapshot.forEach(doc => {
    const data = doc.data();
    accounts.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
    } as TradingAccount);
  });
  
  return accounts;
};

/**
 * Deletes a trading account
 * @param accountId The ID of the account to delete
 */
export const deleteAccount = async (accountId: string): Promise<void> => {
  const userId = ensureAuthenticated();
  
  const accountRef = doc(db, USERS_COLLECTION, userId, ACCOUNTS_COLLECTION, accountId);
  await deleteDoc(accountRef);
};

// ===================== STRATEGY FUNCTIONS =====================

/**
 * Saves a trading strategy to Firestore
 * @param strategy The strategy to save
 * @returns The strategy with Firestore ID
 */
export const saveStrategy = async (strategy: Strategy): Promise<Strategy> => {
  const userId = ensureAuthenticated();
  
  // Create a reference to the user's strategies collection
  const userStrategiesRef = collection(db, USERS_COLLECTION, userId, STRATEGIES_COLLECTION);
  
  // If strategy has an ID, update existing document, otherwise create new
  if (strategy.id) {
    const strategyRef = doc(userStrategiesRef, strategy.id);
    await setDoc(strategyRef, {
      ...strategy,
      updatedAt: serverTimestamp(),
      userId
    }, { merge: true });
    return strategy;
  } else {
    // Create new strategy with generated ID
    const newStrategyRef = doc(userStrategiesRef);
    const newStrategy = {
      ...strategy,
      id: newStrategyRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId
    };
    await setDoc(newStrategyRef, newStrategy);
    return {
      ...strategy,
      id: newStrategyRef.id
    };
  }
};

/**
 * Fetches all strategies for the current user, optionally filtered by type
 * @param type Optional strategy type filter ('live' or 'backtest')
 * @returns Array of user's strategies
 */
export const fetchStrategies = async (type?: 'live' | 'backtest'): Promise<Strategy[]> => {
  const userId = ensureAuthenticated();
  
  const userStrategiesRef = collection(db, USERS_COLLECTION, userId, STRATEGIES_COLLECTION);
  
  // Create a query based on type if provided
  let strategiesQuery: CollectionReference | Query = userStrategiesRef;
  if (type) {
    strategiesQuery = query(userStrategiesRef, where('type', '==', type));
  }
  
  const strategiesSnapshot = await getDocs(strategiesQuery);
  
  const strategies: Strategy[] = [];
  strategiesSnapshot.forEach(doc => {
    const data = doc.data();
    strategies.push({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
    } as Strategy);
  });
  
  return strategies;
};

/**
 * Deletes a strategy
 * @param strategyId The ID of the strategy to delete
 */
export const deleteStrategy = async (strategyId: string): Promise<void> => {
  const userId = ensureAuthenticated();
  
  const strategyRef = doc(db, USERS_COLLECTION, userId, STRATEGIES_COLLECTION, strategyId);
  await deleteDoc(strategyRef);
};

// ===================== TRADE FUNCTIONS =====================

/**
 * Saves a trade to Firestore
 * @param trade The trade to save
 * @returns The trade with Firestore ID
 */
export const saveTrade = async (trade: Trade): Promise<Trade> => {
  const userId = ensureAuthenticated();
  
  // Create a reference to the user's trades collection
  const userTradesRef = collection(db, USERS_COLLECTION, userId, TRADES_COLLECTION);
  
  // If trade has an ID, update existing document, otherwise create new
  if (trade.id) {
    const tradeRef = doc(userTradesRef, trade.id);
    await setDoc(tradeRef, {
      ...trade,
      updatedAt: serverTimestamp(),
      userId
    }, { merge: true });
    return trade;
  } else {
    // Create new trade with generated ID
    const newTradeRef = doc(userTradesRef);
    const newTrade = {
      ...trade,
      id: newTradeRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId
    };
    await setDoc(newTradeRef, newTrade);
    return {
      ...trade,
      id: newTradeRef.id
    };
  }
};

/**
 * Fetches all trades for the current user, optionally filtered by strategy and/or account
 * @param strategyId Optional strategy ID filter
 * @param accountId Optional account ID filter
 * @param strategyType Optional strategy type filter ('live' or 'backtest')
 * @returns Array of filtered trades
 */
export const fetchTrades = async (
  strategyId?: string, 
  accountId?: string,
  strategyType?: 'live' | 'backtest'
): Promise<Trade[]> => {
  const userId = ensureAuthenticated();
  
  const userTradesRef = collection(db, USERS_COLLECTION, userId, TRADES_COLLECTION);
  
  // Build query based on filters
  let tradesQuery: CollectionReference | Query = userTradesRef;
  
  const queryFilters = [];
  if (strategyId) {
    queryFilters.push(where('strategyId', '==', strategyId));
  }
  
  if (accountId) {
    queryFilters.push(where('accountId', '==', accountId));
  }
  
  if (strategyType) {
    // For backtest strategies, look for trades with 'backtest' tag
    if (strategyType === 'backtest') {
      queryFilters.push(where('tags', 'array-contains', 'backtest'));
    } else {
      // For live trades, check that 'backtest' tag is not present
      // This is more complex and might need a different approach in Firestore
      // For now, we'll filter these client-side
    }
  }
  
  if (queryFilters.length > 0) {
    // For simple queries (only one filter)
    if (queryFilters.length === 1) {
      tradesQuery = query(userTradesRef, queryFilters[0]);
    } 
    // For compound queries, we need to use composite indexes
    // This might require setting up proper indexes in Firestore
  }
  
  const tradesSnapshot = await getDocs(tradesQuery);
  
  const trades: Trade[] = [];
  tradesSnapshot.forEach(doc => {
    const data = doc.data();
    const trade = {
      ...data,
      id: doc.id,
      entryTime: data.entryTime?.toDate().toISOString() || null,
      exitTime: data.exitTime?.toDate().toISOString() || null,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
    } as Trade;
    
    // Client-side filtering for live trades if needed
    if (strategyType === 'live' && trade.tags?.includes('backtest')) {
      return;
    }
    
    trades.push(trade);
  });
  
  return trades;
};

/**
 * Syncs the user's local data to Firestore
 * @param accounts Array of trading accounts to sync
 * @param strategies Array of strategies to sync
 * @param trades Array of trades to sync
 */
export const syncDataToFirestore = async (
  accounts: TradingAccount[],
  strategies: Strategy[],
  trades: Trade[]
): Promise<void> => {
  try {
    const userId = ensureAuthenticated();
    
    // Create batch processing for efficiency
    const promises: Promise<any>[] = [];
    
    // Sync accounts
    accounts.forEach(account => {
      promises.push(saveAccount(account));
    });
    
    // Sync strategies
    strategies.forEach(strategy => {
      promises.push(saveStrategy(strategy));
    });
    
    // Sync trades
    trades.forEach(trade => {
      promises.push(saveTrade(trade));
    });
    
    // Wait for all operations to complete
    await Promise.all(promises);
    
    console.log('Data synced to Firestore successfully');
  } catch (error) {
    console.error('Error syncing data to Firestore:', error);
    throw error;
  }
};

export default {
  saveAccount,
  fetchAccounts,
  deleteAccount,
  saveStrategy,
  fetchStrategies,
  deleteStrategy,
  saveTrade,
  fetchTrades,
  syncDataToFirestore
}; 