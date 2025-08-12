import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTradeStore } from "@/hooks/useTradeStore";
import { toast } from "sonner";
import AppSidebar from "@/components/AppSidebar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileGallery from "@/components/profile/ProfileGallery";
import ProfileStrategies from "@/components/profile/ProfileStrategies";
import ProfileFriends from "@/components/profile/ProfileFriends";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface UserProfile {
  uid: string;
  id: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  memberSince: string;
  isCurrentUser: boolean;
  friends: string[]; // Array of friend user IDs
  tradingExperience?: string;
  specializations?: string[];
  socialLinks?: {
    discord?: string;
  };
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { currentUser } = useAuth();
  const { fetchAllStrategyPerformance } = useTradeStore();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch user profile data from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData: UserProfile;
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            uid: currentUser.uid,
            id: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            email: currentUser.email || '',
            username: data.username || 'user',
            bio: data.bio || '',
            location: data.location || '',
            memberSince: data.createdAt || new Date().toISOString(),
            isCurrentUser: true,
            friends: data.friends || [],
            tradingExperience: data.tradingExperience || '',
            specializations: data.specializations || [],
            socialLinks: data.socialLinks || {}
          };
        } else {
          // Create a basic profile if none exists
          userData = {
            uid: currentUser.uid,
            id: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            email: currentUser.email || '',
            username: currentUser.email?.split('@')[0] || 'user',
            bio: '',
            location: '',
            memberSince: new Date().toISOString(),
            isCurrentUser: true,
            friends: [],
            tradingExperience: '',
            specializations: []
          };
          
          // Save the basic profile to Firestore using setDoc instead of updateDoc
          try {
            await setDoc(userDocRef, {
              ...userData,
              createdAt: userData.memberSince,
              updatedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error("Error creating user document:", error);
            // Continue anyway, don't let this error disrupt the user experience
          }
        }
        
        setProfileUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data");
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  // Load strategies
  useEffect(() => {
    const loadStrategies = () => {
      const data = fetchAllStrategyPerformance();
      setStrategies(data);
    };
    
    loadStrategies();
  }, [fetchAllStrategyPerformance]);
  
  const handleAddFriend = () => {
    toast.info("Friend request feature coming soon!");
  };
  
  const handleMessage = () => {
    toast.info("Messaging feature coming soon!");
  };
  
  const handleAddImage = (url: string, alt: string) => {
    const newImage: GalleryImage = {
      id: `gallery-${Date.now()}`,
      url,
      alt
    };
    setGalleryImages([...galleryImages, newImage]);
    toast.success("Image added successfully");
  };
  
  const handleDeleteImage = (id: string) => {
    setGalleryImages(galleryImages.filter(img => img.id !== id));
    toast.success("Image deleted successfully");
  };
  
  
  // If profile not loaded yet
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-trading-bg flex w-full">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-auto">
              <div className="main-content">
                <div className="bg-black/5">
                  {/* Profile Header Skeleton */}
                  <div className="relative h-48 bg-gradient-to-r from-white/5 to-white/10 animate-pulse">
                    <div className="absolute bottom-4 left-4 flex items-end space-x-4">
                      <div className="w-24 h-24 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="space-y-2 pb-2">
                        <div className="h-6 w-40 bg-white/20 rounded animate-pulse"></div>
                        <div className="h-4 w-32 bg-white/15 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit Button Skeleton */}
                  <div className="px-4 py-2 flex justify-end">
                    <div className="h-8 w-28 bg-white/10 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Main Content Grid Skeleton */}
                  <div className="p-4 md:p-5 grid gap-5 md:grid-cols-3">
                    {/* Left Column - Bio & Friends */}
                    <div className="md:col-span-1 space-y-5">
                      {/* Bio Card Skeleton */}
                      <div className="bg-white/5 rounded-lg p-4 space-y-4">
                        <div className="h-5 w-20 bg-white/20 rounded animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                          <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
                          <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse"></div>
                        </div>
                        <div className="pt-2 space-y-2">
                          <div className="h-4 w-32 bg-white/15 rounded animate-pulse"></div>
                          <div className="flex gap-2">
                            <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse"></div>
                            <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Friends Card Skeleton */}
                      <div className="bg-white/5 rounded-lg p-4 space-y-4">
                        <div className="h-5 w-16 bg-white/20 rounded animate-pulse"></div>
                        <div className="grid grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="text-center space-y-2">
                              <div className="w-12 h-12 bg-white/10 rounded-full mx-auto animate-pulse"></div>
                              <div className="h-3 w-full bg-white/10 rounded animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Gallery & Strategies */}
                    <div className="md:col-span-2 space-y-5">
                      {/* Gallery Card Skeleton */}
                      <div className="bg-white/5 rounded-lg p-4 space-y-4">
                        <div className="h-5 w-16 bg-white/20 rounded animate-pulse"></div>
                        <div className="grid grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/10 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Strategies Card Skeleton */}
                      <div className="bg-white/5 rounded-lg p-4 space-y-4">
                        <div className="h-5 w-24 bg-white/20 rounded animate-pulse"></div>
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded">
                              <div className="w-10 h-10 bg-white/10 rounded animate-pulse"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-white/15 rounded animate-pulse"></div>
                                <div className="h-3 w-48 bg-white/10 rounded animate-pulse"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-trading-bg flex items-center justify-center">
        <Card className="w-96 glass-effect border-white/5">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">User profile not found or not authenticated.</p>
              <Button asChild variant="glass">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-trading-bg flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="main-content">
              <div className="bg-black/5">
                <ProfileHeader 
                  user={profileUser} 
                  onAddFriend={handleAddFriend} 
                  onMessage={handleMessage}
                />
                
                <div className="px-4 py-2 flex justify-end">
                  <Button size="sm" variant="outline" asChild className="bg-black/20 border-white/10">
                    <Link to="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
                
                <div className="p-4 md:p-5 grid gap-5 md:grid-cols-3">
                  <div className="md:col-span-1 space-y-5">
                    <ProfileBio 
                      bio={profileUser.bio || "No bio provided yet."}
                      tradingExperience={profileUser.tradingExperience || "Not specified"}
                      specializations={profileUser.specializations || []}
                      hideIcons={true}
                    />
                    
                    <ProfileFriends 
                      friends={friends} 
                      isCurrentUser={profileUser.isCurrentUser} 
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-5">
                    <ProfileGallery 
                      images={galleryImages} 
                      isCurrentUser={profileUser.isCurrentUser}
                      onAddImage={handleAddImage}
                      onDeleteImage={handleDeleteImage}
                    />
                    
                    <ProfileStrategies 
                      strategies={strategies} 
                      isCurrentUser={profileUser.isCurrentUser}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;
