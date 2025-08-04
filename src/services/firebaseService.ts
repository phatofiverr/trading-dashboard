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

/**
 * Removes undefined values from an object to prevent Firestore errors
 * @param obj The object to clean
 * @returns A new object with undefined values removed
 */
const removeUndefinedValues = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }
  
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null) {
        cleaned[key] = removeUndefinedValues(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

/**
 * Safely converts Firestore timestamp to ISO string
 * @param timestamp The Firestore timestamp (could be various formats)
 * @returns ISO string or null if conversion fails
 */
const safeTimestampToISO = (timestamp: any): string | null => {
  if (!timestamp) return null;
  
  try {
    // If it's already a string, return it
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    // If it has toDate method (Firestore Timestamp)
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    
    // If it has seconds and nanoseconds (Firestore Timestamp object)
    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    
    // If it's a Date object
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    
    // Try to parse as Date
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    return null;
  } catch (error) {
    return null;
  }
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
  
  // Clean the account data to remove undefined values
  const cleanedAccount = removeUndefinedValues(account);
  
  // If account has an ID, update existing document, otherwise create new
  if (cleanedAccount.id) {
    const accountRef = doc(userAccountsRef, cleanedAccount.id);
    const updateData = removeUndefinedValues({
      ...cleanedAccount,
      updatedAt: serverTimestamp(),
      userId
    });
    await setDoc(accountRef, updateData, { merge: true });
    return account;
  } else {
    // Create new account with generated ID
    const newAccountRef = doc(userAccountsRef);
    const newAccount = removeUndefinedValues({
      ...cleanedAccount,
      id: newAccountRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId
    });
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
      createdAt: safeTimestampToISO(data.createdAt) || new Date().toISOString(),
      updatedAt: safeTimestampToISO(data.updatedAt) || new Date().toISOString()
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
  
  // Clean the strategy data to remove undefined values
  const cleanedStrategy = removeUndefinedValues(strategy);
  
  // If strategy has an ID, update existing document, otherwise create new
  if (cleanedStrategy.id) {
    const strategyRef = doc(userStrategiesRef, cleanedStrategy.id);
    const updateData = removeUndefinedValues({
      ...cleanedStrategy,
      updatedAt: serverTimestamp(),
      userId
    });
    await setDoc(strategyRef, updateData, { merge: true });
    return strategy;
  } else {
    // Create new strategy with generated ID
    const newStrategyRef = doc(userStrategiesRef);
    const newStrategy = removeUndefinedValues({
      ...cleanedStrategy,
      id: newStrategyRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId
    });
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
      createdAt: safeTimestampToISO(data.createdAt) || new Date().toISOString()
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
  
  const userTradesRef = collection(db, USERS_COLLECTION, userId, TRADES_COLLECTION);
  
  try {
    const cleanedTrade = removeUndefinedValues(trade);
    
    if (cleanedTrade.id) {
      const tradeRef = doc(userTradesRef, cleanedTrade.id);
      const updateData = removeUndefinedValues({
        ...cleanedTrade,
        updatedAt: serverTimestamp(),
        userId
      });
      await setDoc(tradeRef, updateData, { merge: true });
      return trade;
    } else {
      const newTradeRef = doc(userTradesRef);
      const newTrade = removeUndefinedValues({
        ...cleanedTrade,
        id: newTradeRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId
      });
      await setDoc(newTradeRef, newTrade);
      return {
        ...trade,
        id: newTradeRef.id
      };
    }
  } catch (error) {
    throw error;
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
      entryTime: safeTimestampToISO(data.entryTime),
      exitTime: safeTimestampToISO(data.exitTime),
      createdAt: safeTimestampToISO(data.createdAt) || new Date().toISOString(),
      updatedAt: safeTimestampToISO(data.updatedAt) || new Date().toISOString()
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
 * Deletes a trade from Firestore
 * @param tradeId The ID of the trade to delete
 */
export const deleteTrade = async (tradeId: string): Promise<void> => {
  const userId = ensureAuthenticated();
  
  const tradeRef = doc(db, USERS_COLLECTION, userId, TRADES_COLLECTION, tradeId);
  await deleteDoc(tradeRef);
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
    
  } catch (error) {
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
  deleteTrade,
  syncDataToFirestore
}; 