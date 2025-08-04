
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  location: string;
  memberSince: string;
  isCurrentUser: boolean;
  friends: string[]; // Array of friend user IDs
  tradingExperience?: string;
  specializations?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface AccountState {
  currentUser: UserProfile | null;
  friends: UserProfile[];
  friendRequests: FriendRequest[];
  searchResults: UserProfile[];
  
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateProfileImage: () => void;
  updateCoverImage: () => void;
  updateSocialLinks: (links: UserProfile['socialLinks']) => void;
  
  // Friend management
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (userId: string) => void;
  
  // User search
  searchUsers: (query: string) => void;
  
  // Firebase data synchronization
  setCurrentUserFromFirebase: (userId: string, userData: any) => void;
  loadUserFromFirebase: (userId: string) => Promise<void>;
  clearPersistedData: () => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      friends: [],
      friendRequests: [],
      searchResults: [],
      
      updateProfile: (updates) => {
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
        }));
      },

      updateProfileImage: () => {
        // Profile image functionality removed
        toast.info("Profile images have been disabled");
      },

      updateCoverImage: () => {
        // Cover image functionality removed  
        toast.info("Cover photos have been disabled");
      },

      updateSocialLinks: (links) => {
        set((state) => ({
          currentUser: state.currentUser ? { 
            ...state.currentUser, 
            socialLinks: { ...state.currentUser.socialLinks, ...links } 
          } : null
        }));
        toast.success("Social links updated successfully");
      },
      
      sendFriendRequest: (userId) => {
        const { currentUser, friendRequests } = get();
        if (!currentUser) return;
        
        const newRequest: FriendRequest = {
          id: `fr-${Date.now()}`,
          fromUserId: currentUser.id,
          toUserId: userId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        set({ friendRequests: [...friendRequests, newRequest] });
      },
      
      acceptFriendRequest: (requestId) => {
        const { friendRequests, friends, currentUser } = get();
        if (!currentUser) return;
        
        const request = friendRequests.find(r => r.id === requestId);
        if (!request) return;
        
        // Find the requesting user in search results
        const { searchResults } = get();
        const requester = searchResults.find(u => u.id === request.fromUserId);
        
        if (requester) {
          // Add to friends
          set({
            friends: [...friends, requester],
            friendRequests: friendRequests.filter(r => r.id !== requestId),
            currentUser: {
              ...currentUser,
              friends: [...currentUser.friends, requester.id]
            }
          });
        }
      },
      
      rejectFriendRequest: (requestId) => {
        const { friendRequests } = get();
        set({
          friendRequests: friendRequests.filter(r => r.id !== requestId)
        });
      },
      
      removeFriend: (userId) => {
        const { friends, currentUser } = get();
        if (!currentUser) return;
        
        set({
          friends: friends.filter(f => f.id !== userId),
          currentUser: {
            ...currentUser,
            friends: currentUser.friends.filter(id => id !== userId)
          }
        });
      },
      
      searchUsers: (query) => {
        // In a real app, this would call an API
        // For now, just filter mock data
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }
        
        const mockUsers: UserProfile[] = [
          {
            id: 'user1',
            username: 'trader_joe',
            displayName: 'Joe Smith',
            email: 'joe@example.com',
            bio: 'Professional trader specializing in forex',
            location: 'New York, USA',
            memberSince: '2023-01-15',
            isCurrentUser: false,
            friends: [],
            tradingExperience: '5+ years',
            specializations: ['EUR/USD', 'GBP/JPY', 'Gold'],
            socialLinks: {
              twitter: 'https://twitter.com/trader_joe',
              linkedin: 'https://linkedin.com/in/traderj',
            }
          },
          {
            id: 'user2',
            username: 'crypto_sarah',
            displayName: 'Sarah Wilson',
            email: 'sarah@example.com',
            bio: 'Cryptocurrency enthusiast and day trader',
            location: 'London, UK',
            memberSince: '2023-03-22',
            isCurrentUser: false,
            friends: [],
            tradingExperience: '3 years',
            specializations: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
            socialLinks: {
              twitter: 'https://twitter.com/crypto_sarah',
              github: 'https://github.com/sarahcrypto',
            }
          },
          {
            id: 'user3',
            username: 'stock_master',
            displayName: 'Mike Johnson',
            email: 'mike@example.com',
            bio: 'Stock market analyst with 10+ years experience',
            location: 'Toronto, Canada',
            memberSince: '2022-11-05',
            isCurrentUser: false,
            friends: [],
            tradingExperience: '10+ years',
            specializations: ['AAPL', 'MSFT', 'TSLA', 'S&P 500'],
            socialLinks: {
              linkedin: 'https://linkedin.com/in/mikej',
            }
          }
        ];
        
        const results = mockUsers.filter(user => 
          user.displayName.toLowerCase().includes(query.toLowerCase()) || 
          user.username.toLowerCase().includes(query.toLowerCase())
        );
        
        set({ searchResults: results });
      },
      
      setCurrentUserFromFirebase: (userId: string, userData: any) => {
        const userProfile: UserProfile = {
          id: userId,
          username: userData.username || userData.email?.split('@')[0] || 'user',
          displayName: userData.displayName || userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          bio: userData.bio || '',
          location: userData.location || '',
          memberSince: userData.memberSince || new Date().toISOString(),
          isCurrentUser: true,
          friends: userData.friends || [],
          tradingExperience: userData.tradingExperience || '',
          specializations: userData.specializations || [],
          socialLinks: userData.socialLinks || {
            twitter: '',
            linkedin: '',
            github: '',
          }
        };
        
        set({ currentUser: userProfile });
      },

      loadUserFromFirebase: async (userId: string) => {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            get().setCurrentUserFromFirebase(userId, userData);
          } else {
            console.warn("User document not found in Firestore:", userId);
          }
        } catch (error) {
          console.error("Error loading user from Firebase:", error);
        }
      },

      // Clear persisted mock data
      clearPersistedData: () => {
        set({ currentUser: null, friends: [], friendRequests: [], searchResults: [] });
      }
    }),
    { name: 'account-storage' }
  )
);

// Add toast import
import { toast } from "sonner";
