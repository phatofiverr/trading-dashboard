
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  avatarUrl: string | null;
  coverUrl: string | null;
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
  updateProfileImage: (imageUrl: string) => void;
  updateCoverImage: (imageUrl: string) => void;
  updateSocialLinks: (links: UserProfile['socialLinks']) => void;
  
  // Friend management
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (userId: string) => void;
  
  // User search
  searchUsers: (query: string) => void;
  
  // Mock data initialization (would be replaced by API calls in a real app)
  initializeMockData: () => void;
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

      updateProfileImage: (imageUrl) => {
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, avatarUrl: imageUrl } : null
        }));
        toast.success("Profile picture updated successfully");
      },

      updateCoverImage: (imageUrl) => {
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, coverUrl: imageUrl } : null
        }));
        toast.success("Cover photo updated successfully");
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
            avatarUrl: null,
            coverUrl: null,
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
            avatarUrl: null,
            coverUrl: null,
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
            avatarUrl: null,
            coverUrl: null,
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
      
      initializeMockData: () => {
        const mockCurrentUser: UserProfile = {
          id: 'current-user',
          username: 'john_doe',
          displayName: 'John Doe',
          email: 'john.doe@example.com',
          bio: 'Passionate trader specializing in price action strategies with 3 years of market experience.',
          location: 'New York, USA',
          avatarUrl: null,
          coverUrl: null,
          memberSince: '2023-01-01',
          isCurrentUser: true,
          friends: [],
          tradingExperience: '3 years',
          specializations: ['EUR/USD', 'BTC/USD', 'Gold', 'S&P 500'],
          socialLinks: {
            twitter: '',
            linkedin: '',
            github: '',
          }
        };
        
        // Only set if not already initialized
        if (!get().currentUser) {
          set({ 
            currentUser: mockCurrentUser,
            friends: [],
            friendRequests: []
          });
        }
      }
    }),
    { name: 'account-storage' }
  )
);

// Add toast import
import { toast } from "sonner";
