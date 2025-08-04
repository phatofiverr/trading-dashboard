
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User } from 'lucide-react';
import { UserProfile } from '@/hooks/useAccountStore';
import { cn } from '@/lib/utils';

interface MiniProfileProps {
  user: UserProfile | null;
  className?: string;
}


const MiniProfile: React.FC<MiniProfileProps> = ({ user, className }) => {

  if (!user) {
    return <div className="h-16 glass-effect bg-black/5 border-0 rounded-lg mb-6"></div>;
  }

  return (
    <Link 
      to="/profile"
      className={cn(
        "block w-full glass-effect bg-black/5 border-0 p-4 rounded-lg transition-all hover:bg-black/10 mb-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Profile Icon */}
        <div className="h-12 w-12 glass-effect bg-black/10 border-0 rounded-lg flex items-center justify-center">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        
        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-sm font-medium">{user.displayName}</h3>
          {user.location && (
            <div className="flex items-center text-xs text-muted-foreground">
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
