
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { UserProfile } from '@/hooks/useAccountStore';
import { cn } from '@/lib/utils';

interface MiniProfileProps {
  user: UserProfile | null;
  className?: string;
}

// Helper function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (http://www.w3.org/TR/AERT#color-contrast)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if color is light (brightness > 128)
  return brightness > 128;
};

// Function to detect dominant color from an image
const getDominantColor = async (imageUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Get average color of the image (simplified approach)
        let r = 0, g = 0, b = 0;
        
        // Sample points in the image
        const sampleSize = 10;
        const stepX = Math.floor(canvas.width / sampleSize);
        const stepY = Math.floor(canvas.height / sampleSize);
        
        let count = 0;
        for (let x = 0; x < sampleSize; x++) {
          for (let y = 0; y < sampleSize; y++) {
            const i = 4 * (y * stepY * canvas.width + x * stepX);
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        // Get average
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Convert to hex
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        resolve(hex);
      } catch (error) {
        console.error('Error getting dominant color:', error);
        resolve(null);
      }
    };
    
    img.onerror = () => {
      console.error('Error loading image for color detection');
      resolve(null);
    };
  });
};

const MiniProfile: React.FC<MiniProfileProps> = ({ user, className }) => {
  const [textColor, setTextColor] = useState<string>('text-white');
  
  useEffect(() => {
    const detectTextColor = async () => {
      if (user?.coverUrl) {
        try {
          const dominantColor = await getDominantColor(user.coverUrl);
          if (dominantColor) {
            setTextColor(isLightColor(dominantColor) ? 'text-gray-800' : 'text-white');
          } else {
            setTextColor('text-white'); // Default to white if detection fails
          }
        } catch (error) {
          console.error('Error detecting text color:', error);
          setTextColor('text-white'); // Default to white if error occurs
        }
      } else {
        // Default for gradient backgrounds
        setTextColor('text-white');
      }
    };
    
    detectTextColor();
  }, [user?.coverUrl]);

  if (!user) {
    return <div className="h-32 bg-black/20"></div>;
  }

  return (
    <Link 
      to="/profile"
      className={cn(
        "block relative w-full overflow-hidden transition-all hover:opacity-90 mb-6", // Added margin-bottom (mb-6)
        className
      )}
    >
      {/* Cover Image */}
      <div 
        className="h-28 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 pt-3" // Added pt-3 for top padding
        style={user.coverUrl ? { backgroundImage: `url(${user.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      />
      
      {/* Profile Image and Info */}
      <div className="absolute bottom-3 left-4 flex items-end gap-3">
        {/* Square Profile Image */}
        <div className="h-16 w-16 border-2 border-background bg-black/20 overflow-hidden">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.displayName} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg">
              {user.displayName.split(' ').map(n => n?.[0]).join('') || 'JD'}
            </div>
          )}
        </div>
        
        {/* User Info with dynamic text color */}
        <div className="pb-1">
          <h3 className={`text-sm font-medium ${textColor}`}>{user.displayName}</h3>
          {user.location && (
            <div className={`flex items-center text-xs ${textColor} opacity-60`}>
              <MapPin className="h-3 w-3 mr-1" />
              <span>{user.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MiniProfile;
