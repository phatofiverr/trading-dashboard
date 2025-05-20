import React from 'react';
import FirestoreSyncButton from '@/components/FirestoreSyncButton';

// Empty component since we're removing the top bar
const AppTopbar: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <FirestoreSyncButton variant="outline" size="sm" className="bg-black/20 border-white/10" />
    </div>
  );
};

export default AppTopbar;
