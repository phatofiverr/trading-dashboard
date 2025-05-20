import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    tradingExperience: '',
    specializations: ''
  });
  
  // Fetch user profile data from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            displayName: currentUser.displayName || '',
            username: userData.username || '',
            email: currentUser.email || '',
            bio: userData.bio || '',
            location: userData.location || '',
            tradingExperience: userData.tradingExperience || '',
            specializations: (userData.specializations || []).join(', ')
          });
        } else {
          // If no user document exists yet, initialize with Firebase auth data
          setFormData({
            displayName: currentUser.displayName || '',
            username: '',
            email: currentUser.email || '',
            bio: '',
            location: '',
            tradingExperience: '',
            specializations: ''
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data");
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!currentUser?.uid) {
        throw new Error("User not authenticated");
      }
      
      // Update display name in Firebase Auth
      await updateUserProfile(formData.displayName);
      
      // Process specializations
      const specializations = formData.specializations
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');
      
      // Update user profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      const userData = {
        displayName: formData.displayName,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        tradingExperience: formData.tradingExperience,
        specializations,
        updatedAt: new Date().toISOString()
      };
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, {
          ...userData,
          uid: currentUser.uid,
          createdAt: new Date().toISOString(),
          memberSince: new Date().toISOString(),
          friends: [],
          avatarUrl: null,
          coverUrl: null,
          isCurrentUser: true
        });
      }
      
      toast.success("Profile updated successfully");
      navigate('/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const goBack = () => {
    navigate('/profile');
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-trading-bg flex items-center justify-center">
        <Card className="w-96 glass-effect border-white/5">
          <CardContent className="p-6">
            <div className="text-center">Loading user data...</div>
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
            <div className="container mx-auto">
              <div className="p-4">
                <Button 
                  variant="outline" 
                  onClick={goBack}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
                
                <Card className="glass-effect border-white/5 max-w-3xl mx-auto">
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="bg-black/20 border-white/10"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="bg-black/20 border-white/10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-black/20 border-white/10"
                          disabled
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed. Contact support if needed.
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="bg-black/20 border-white/10"
                          placeholder="City, Country"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="bg-black/20 border-white/10 min-h-24"
                          placeholder="Tell others about yourself..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tradingExperience">Trading Experience</Label>
                        <Input
                          id="tradingExperience"
                          name="tradingExperience"
                          value={formData.tradingExperience}
                          onChange={handleInputChange}
                          className="bg-black/20 border-white/10"
                          placeholder="e.g. 3 years"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specializations">
                          Specializations (comma separated)
                        </Label>
                        <Input
                          id="specializations"
                          name="specializations"
                          value={formData.specializations}
                          onChange={handleInputChange}
                          className="bg-black/20 border-white/10"
                          placeholder="e.g. Forex, Crypto, Stocks"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Separate specializations with commas
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" onClick={goBack} className="mr-2">
                      Cancel
                    </Button>
                    <Button variant="glass" onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfileEditPage;
