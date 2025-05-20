
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileBioProps {
  bio: string;
  tradingExperience?: string;
  specializations?: string[];
  hideIcons?: boolean;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ 
  bio, 
  tradingExperience, 
  specializations = [],
  hideIcons = false
}) => {
  return (
    <Card className="bg-black/10 backdrop-blur-sm border-0 shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <p className="whitespace-pre-wrap">{bio}</p>
          </div>
          
          {tradingExperience && (
            <div className="pt-3">
              <p className="text-sm font-medium mb-1 text-muted-foreground">Trading Experience</p>
              <p>{tradingExperience}</p>
            </div>
          )}
          
          {specializations && specializations.length > 0 && (
            <div className="pt-1">
              <p className="text-sm font-medium mb-2 text-muted-foreground">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/5 hover:bg-white/10">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileBio;
