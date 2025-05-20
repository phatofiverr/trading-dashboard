
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background/70 to-background">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
