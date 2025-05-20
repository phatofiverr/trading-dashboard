
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UserProfile } from '@/hooks/useAccountStore';

interface ProfileFriendsProps {
  friends: UserProfile[];
  isCurrentUser: boolean;
}

const ProfileFriends: React.FC<ProfileFriendsProps> = ({ friends, isCurrentUser }) => {
  return (
    <Card className="glass-effect border-white/5">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" /> 
            <span className="text-sm font-medium">Friends</span>
          </div>
          {isCurrentUser && (
            <Button variant="glass" size="sm" asChild className="h-8">
              <Link to="/profile?tab=friends">
                <UserPlus className="mr-1 h-4 w-4" />
                Find
              </Link>
            </Button>
          )}
        </div>

        {friends.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                to={`/profile/${friend.username}`}
                className="flex flex-col items-center p-1 hover:bg-black/20 rounded-md transition-colors"
              >
                <Avatar className="h-12 w-12 mb-1">
                  <AvatarImage src={friend.avatarUrl || ""} />
                  <AvatarFallback className="bg-black/30 text-xs">
                    {friend.displayName.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-center truncate w-full">
                  {friend.displayName}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-muted-foreground">
            {isCurrentUser 
              ? "You haven't added any friends yet." 
              : "This user hasn't added any friends."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileFriends;
