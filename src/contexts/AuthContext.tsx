import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAccountsStore } from '@/hooks/useAccountsStore';
import { useTradeStore } from '@/hooks/useTradeStore';
import firebaseService from '@/services/firebaseService';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  syncData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user document in Firestore
  const createUserDocument = async (user: User) => {
    if (!user.uid) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          username: user.email?.split('@')[0] || 'user',
          bio: '',
          location: '',
          avatarUrl: null,
          coverUrl: null,
          memberSince: new Date().toISOString(),
          friends: [],
          tradingExperience: '',
          specializations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update lastLogin time
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString()
        });
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    // Set persistence to LOCAL (default is SESSION)
    await setPersistence(auth, browserLocalPersistence);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
      await createUserDocument(userCredential.user);
    }
    
    return userCredential;
  };

  // Login function
  const login = async (email: string, password: string) => {
    // Set persistence to LOCAL (default is SESSION)
    await setPersistence(auth, browserLocalPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Create or update user document
    if (userCredential.user) {
      await createUserDocument(userCredential.user);
    }
    
    return userCredential;
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };
  
  // Reset password
  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };
  
  // Update profile
  const updateUserProfile = async (displayName: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      
      // Update Firestore document as well
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { displayName, updatedAt: new Date().toISOString() });
      } catch (error) {
        // Silent error handling
      }
      
      return;
    }
    throw new Error('No user is signed in');
  };
  
  // Send verification email
  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
    throw new Error('No user is signed in');
  };
  
  // Check if email is verified (refreshes the user token first)
  const checkEmailVerified = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  // Sync data from local stores to Firestore
  const syncData = async () => {
    if (!currentUser) {
      throw new Error('No user is signed in');
    }

    try {
      // Get store access (this will need to be setup properly)
      const accounts = useAccountsStore.getState().accounts;
      const { strategies, trades } = useTradeStore.getState();
      
      // Sync data to Firestore
      await firebaseService.syncDataToFirestore(accounts, strategies, trades);
      toast.success("Data synced to Firestore successfully");
    } catch (error) {
      toast.error("Failed to sync data to Firestore");
      throw error;
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      if (user) {
        // Create user document when auth state changes
        await createUserDocument(user);
        
        // Load user data from Firebase after authentication
        try {
          
          // Load accounts
          await useAccountsStore.getState().loadAccountsFromFirebase();
          
          // Load strategies
          await useTradeStore.getState().loadStrategiesFromFirebase();
          
          // Load trades
          const trades = await firebaseService.fetchTrades();
          useTradeStore.getState().setTrades(trades);
          
        } catch (error) {
          // Don't show error toast - let the app fall back to IndexedDB
        }
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    sendVerificationEmail,
    checkEmailVerified,
    syncData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 