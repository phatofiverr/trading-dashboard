import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin, Edit, Camera, Twitter, Linkedin, Github } from 'lucide-react';
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
  avatarUrl: string | null;
  coverUrl: string | null;
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
  onDeleteCoverImage?: () => void;
  onDeleteProfileImage?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onAddFriend, 
  onMessage, 
  onDeleteCoverImage,
  onDeleteProfileImage
}) => {
  const { currentUser } = useAuth();
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false);
  const [showCoverImageDialog, setShowCoverImageDialog] = useState(false);
  const [showSocialLinksDialog, setShowSocialLinksDialog] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    twitter: user?.socialLinks?.twitter || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
  });

  if (!user) return null;
  
  const updateProfileImage = async (imageUrl: string) => {
    if (!currentUser?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        avatarUrl: imageUrl,
        updatedAt: new Date().toISOString()
      });
      
      toast.success("Profile picture updated successfully");
      
      // Update state instead of reloading the page
      if (onDeleteProfileImage && imageUrl === '') {
        onDeleteProfileImage();
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Failed to update profile picture");
      
      // If document doesn't exist, try to create it
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          avatarUrl: imageUrl,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
        toast.success("Profile picture updated successfully");
        
        // Update state instead of reloading the page
        if (onDeleteProfileImage && imageUrl === '') {
          onDeleteProfileImage();
        }
      } catch (createError) {
        console.error("Error creating user document:", createError);
        toast.error("Failed to create user profile");
      }
    }
  };
  
  const updateCoverImage = async (imageUrl: string) => {
    if (!currentUser?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        coverUrl: imageUrl,
        updatedAt: new Date().toISOString()
      });
      
      toast.success("Cover photo updated successfully");
      
      // Update state instead of reloading the page
      if (onDeleteCoverImage && imageUrl === '') {
        onDeleteCoverImage();
      }
    } catch (error) {
      console.error("Error updating cover image:", error);
      toast.error("Failed to update cover photo");
      
      // If document doesn't exist, try to create it
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          coverUrl: imageUrl,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
        toast.success("Cover photo updated successfully");
        
        // Update state instead of reloading the page
        if (onDeleteCoverImage && imageUrl === '') {
          onDeleteCoverImage();
        }
      } catch (createError) {
        console.error("Error creating user document:", createError);
        toast.error("Failed to create user profile");
      }
    }
  };
  
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
  
  const handleProfileImageSubmit = () => {
    updateProfileImage(profileImageUrl);
    setShowProfileImageDialog(false);
    setProfileImageUrl('');
  };

  const handleCoverImageSubmit = () => {
    updateCoverImage(coverImageUrl);
    setShowCoverImageDialog(false);
    setCoverImageUrl('');
  };

  const handleSocialLinksSubmit = () => {
    updateSocialLinks(socialLinks);
    setShowSocialLinksDialog(false);
  };

  const handleDeleteProfileImage = () => {
    if (onDeleteProfileImage) {
      onDeleteProfileImage();
    } else {
      updateProfileImage('');
    }
    toast.success("Profile picture removed");
  };

  const handleDeleteCoverImage = () => {
    if (onDeleteCoverImage) {
      onDeleteCoverImage();
    } else {
      updateCoverImage('');
    }
    toast.success("Cover photo removed");
  };
  
  return (
    <div className="relative pt-12">
      {/* Cover Photo */}
      <div 
        className="h-60 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 overflow-hidden relative"
        onClick={() => user.isCurrentUser && setShowCoverImageDialog(true)}
      >
        {user.coverUrl && (
          <img 
            src={user.coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        {user.isCurrentUser && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity cursor-pointer">
            <Camera className="h-8 w-8 text-white/80" />
          </div>
        )}
      </div>
      
      {/* Profile Info Overlay */}
      <div className="relative px-6 pb-6 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-24">
        {/* Profile Picture */}
        <div className="relative mt-4">
          <div 
            className="h-36 w-36 overflow-hidden bg-black/20 flex items-center justify-center relative rounded-md shadow-md"
            onClick={() => user.isCurrentUser && setShowProfileImageDialog(true)}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl">
                {user.displayName.split(' ').map(n => n[0]).join('') || 'JD'}
              </span>
            )}
            {user.isCurrentUser && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white/80" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-2 mt-14 md:mt-6">
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

      {/* Profile Image Dialog */}
      <Dialog open={showProfileImageDialog} onOpenChange={setShowProfileImageDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter image URL"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="bg-black/20 border-white/10"
            />
            <div className="text-xs text-muted-foreground mt-2">
              Enter a valid image URL to update your profile picture.
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {user.avatarUrl && (
              <Button variant="outline" className="border-destructive text-destructive" 
                onClick={handleDeleteProfileImage}>Delete Current</Button>
            )}
            <div>
              <Button variant="outline" onClick={() => setShowProfileImageDialog(false)} className="mr-2">Cancel</Button>
              <Button variant="glass" onClick={handleProfileImageSubmit}>Update</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cover Image Dialog */}
      <Dialog open={showCoverImageDialog} onOpenChange={setShowCoverImageDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
          <DialogHeader>
            <DialogTitle>Update Cover Photo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="bg-black/20 border-white/10"
            />
            <div className="text-xs text-muted-foreground mt-2">
              Enter a valid image URL to update your cover photo.
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {user.coverUrl && (
              <Button variant="outline" className="border-destructive text-destructive" 
                onClick={handleDeleteCoverImage}>Delete Current</Button>
            )}
            <div>
              <Button variant="outline" onClick={() => setShowCoverImageDialog(false)} className="mr-2">Cancel</Button>
              <Button variant="glass" onClick={handleCoverImageSubmit}>Update</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
