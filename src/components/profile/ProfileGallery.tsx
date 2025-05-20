
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Image, Trash2, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface ProfileGalleryProps {
  images: GalleryImage[];
  onAddImage?: (url: string, alt: string) => void;
  onDeleteImage?: (id: string) => void;
  isCurrentUser?: boolean;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({ 
  images, 
  onAddImage,
  onDeleteImage,
  isCurrentUser = false
}) => {
  const [showAddImageDialog, setShowAddImageDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  
  // Limit to 6 images
  const displayImages = images.slice(0, 6);
  const canAddMore = displayImages.length < 6;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("Image URL cannot be empty");
      return;
    }

    if (onAddImage) {
      onAddImage(newImageUrl, newImageAlt || 'Gallery image');
      setNewImageUrl('');
      setNewImageAlt('');
      setShowAddImageDialog(false);
      toast.success("Image added to gallery");
    }
  };
  
  const handleDeleteImage = (image: GalleryImage) => {
    if (onDeleteImage) {
      onDeleteImage(image.id);
    } else {
      toast.success(`Deleted image: ${image.alt}`);
    }
  };

  return (
    <Card className="bg-black/10 backdrop-blur-sm border-0 shadow-sm">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayImages.map((image) => (
            <div 
              key={image.id} 
              className="relative overflow-hidden rounded-md bg-black/10 group h-40 flex items-center justify-center"
            >
              <img
                src={image.url}
                alt={image.alt}
                className="max-h-full max-w-full object-contain"
              />
              
              {isCurrentUser && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="h-7 w-7 bg-black/60 border-white/10 text-white hover:bg-black/80"
                    onClick={() => handleDeleteImage(image)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {/* Add image placeholder - only show if less than 6 images */}
          {isCurrentUser && canAddMore && (
            <div 
              className="overflow-hidden rounded-md bg-black/10 cursor-pointer hover:bg-black/20 transition-colors h-40 flex flex-col items-center justify-center"
              onClick={() => setShowAddImageDialog(true)}
            >
              <Plus className="h-8 w-8 mb-2 opacity-60" />
              <span className="text-xs opacity-60">Add photo</span>
            </div>
          )}
          
          {/* Show placeholder if no images */}
          {displayImages.length === 0 && !isCurrentUser && (
            <div className="overflow-hidden rounded-md bg-black/10 h-40 flex flex-col items-center justify-center">
              <Image className="h-8 w-8 mb-2 opacity-60" />
              <span className="text-xs opacity-60">No images</span>
            </div>
          )}
        </div>

        {/* Add Image Dialog */}
        <Dialog open={showAddImageDialog} onOpenChange={setShowAddImageDialog}>
          <DialogContent className="bg-black/80 backdrop-blur-md border-white/5">
            <DialogHeader>
              <DialogTitle>Add Photo to Gallery</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="text-sm font-medium">Image URL</label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="bg-black/20 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="imageAlt" className="text-sm font-medium">Image Description</label>
                <Input
                  id="imageAlt"
                  placeholder="Trading setup"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                  className="bg-black/20 border-white/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddImageDialog(false)}>Cancel</Button>
              <Button variant="glass" onClick={handleAddImage}>Add Image</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProfileGallery;
