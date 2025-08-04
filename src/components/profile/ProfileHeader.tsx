import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin, Edit, User, Twitter, Linkedin, Github } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

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
    twitter?: string;
    linkedin?: string;
    github?: string;
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
    twitter: user?.socialLinks?.twitter || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
  });

  if (!user) return null;
  
  
  const updateSocialLinks = async (links: {twitter: string, linkedin: string, github: string}) => {
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
            {user.socialLinks?.twitter && (
              <a 
                href={user.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-white p-2 bg-white/5 rounded-full"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {user.socialLinks?.linkedin && (
              <a 
                href={user.socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-white p-2 bg-white/5 rounded-full"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {user.socialLinks?.github && (
              <a 
                href={user.socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-white p-2 bg-white/5 rounded-full"
              >
                <Github className="h-4 w-4" />
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
                <Twitter className="h-4 w-4" />
                <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
              </div>
              <Input
                id="twitter"
                placeholder="https://twitter.com/yourusername"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
              </div>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourusername"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <label htmlFor="github" className="text-sm font-medium">GitHub</label>
              </div>
              <Input
                id="github"
                placeholder="https://github.com/yourusername"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
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
