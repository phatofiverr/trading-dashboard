import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin, Edit, User } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { RiDiscordFill } from "@remixicon/react";

interface UserProfile {
  id: string;
  uid: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  memberSince: string;
  isCurrentUser: boolean;
  friends: string[];
  tradingExperience?: string;
  specializations?: string[];
  socialLinks?: {
    discord?: string;
  };
}

interface ProfileHeaderProps {
  user: UserProfile | null;
  onAddFriend: () => void;
  onMessage: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onAddFriend, 
  onMessage
}) => {
  const { currentUser } = useAuth();
  const [showSocialLinksDialog, setShowSocialLinksDialog] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    discord: user?.socialLinks?.discord || '',
  });

  if (!user) return null;
  
  
  const updateSocialLinks = async (links: {discord: string}) => {
    if (!currentUser?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        socialLinks: links,
        updatedAt: new Date().toISOString()
      });
      
      toast.success("Social links updated successfully");
      
      // Don't reload the page, let React handle the state update
      setSocialLinks(links);
    } catch (error) {
      console.error("Error updating social links:", error);
      toast.error("Failed to update social links");
      
      // If document doesn't exist, try to create it
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          socialLinks: links,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
        toast.success("Social links updated successfully");
        
        // Don't reload the page, let React handle the state update
        setSocialLinks(links);
      } catch (createError) {
        console.error("Error creating user document:", createError);
        toast.error("Failed to create user profile");
      }
    }
  };
  
  const handleSocialLinksSubmit = () => {
    updateSocialLinks(socialLinks);
    setShowSocialLinksDialog(false);
  };
  
  return (
    <div className="glass-effect bg-black/5 border-0 p-6">
      {/* Profile Info */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Profile Icon */}
        <div className="h-24 w-24 glass-effect bg-black/10 border-0 rounded-lg flex items-center justify-center">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            {user.isCurrentUser && (
              <Button size="sm" variant="outline" asChild className="ml-2 bg-black/20 border-white/10">
                <Link to="/profile/edit">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {user.location || 'No location set'}
            </span>
          </div>
        </div>
        
        {/* Social Links */}
        <div>
          <div className="flex space-x-2">
            {user.socialLinks?.discord && (
              <a 
                href={user.socialLinks.discord} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-white p-2 bg-white/5 rounded-full"
              >
                <RiDiscordFill className="h-4 w-4" />
              </a>
            )}
            {user.isCurrentUser && (
              <button 
                onClick={() => setShowSocialLinksDialog(true)}
                className="text-muted-foreground hover:text-white p-2 bg-white/5 rounded-full"
              >
                <Edit className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {!user.isCurrentUser && (
            <div className="flex space-x-2 mt-2">
              <Button onClick={onMessage} variant="minimal" size="sm" className="bg-black/20 border-white/10">
                <MessageCircle className="mr-1 h-4 w-4" />
                <span>Message</span>
              </Button>
            </div>
          )}
        </div>
      </div>


      {/* Social Links Dialog */}
      <Dialog open={showSocialLinksDialog} onOpenChange={setShowSocialLinksDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle>Update Social Links</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RiDiscordFill className="h-4 w-4" />
                <label htmlFor="discord" className="text-sm font-medium">Discord</label>
              </div>
              <Input
                id="discord"
                placeholder="https://discord.gg/your-server"
                value={socialLinks.discord}
                onChange={(e) => setSocialLinks({...socialLinks, discord: e.target.value})}
                className="bg-black/20 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSocialLinksDialog(false)} className="mr-2">Cancel</Button>
            <Button variant="glass" onClick={handleSocialLinksSubmit}>Save Links</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
