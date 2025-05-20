
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const FindFriends: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Find Friends</h2>
      <Button variant="minimal" className="flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        <span>Find Friends</span>
      </Button>
    </div>
  );
};

export default FindFriends;
