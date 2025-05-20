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
            avatarUrl: data.avatarUrl || null,
            coverUrl: data.coverUrl || null,
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
            avatarUrl: null,
            coverUrl: null,
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
            console.log("Created new user profile for:", currentUser.uid);
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
  
  const handleUpdateProfileImage = async (imageUrl: string) => {
    if (!currentUser?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        avatarUrl: imageUrl,
        updatedAt: new Date().toISOString()
      });
      
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          avatarUrl: imageUrl
        });
      }
      
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Failed to update profile picture");
    }
  };
  
  const handleUpdateCoverImage = async (imageUrl: string) => {
    if (!currentUser?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        coverUrl: imageUrl,
        updatedAt: new Date().toISOString()
      });
      
      if (profileUser) {
        setProfileUser({
          ...profileUser,
          coverUrl: imageUrl
        });
      }
      
      toast.success("Cover photo updated successfully");
    } catch (error) {
      console.error("Error updating cover image:", error);
      toast.error("Failed to update cover photo");
    }
  };
  
  // If profile not loaded yet
  if (loading) {
    return (
      <div className="min-h-screen bg-trading-bg flex items-center justify-center">
        <Card className="w-96 glass-effect border-white/5">
          <CardContent className="p-6">
            <div className="text-center">Loading profile data...</div>
          </CardContent>
        </Card>
      </div>
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
                  onDeleteCoverImage={() => handleUpdateCoverImage('')}
                  onDeleteProfileImage={() => handleUpdateProfileImage('')}
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
