
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index: React.FC = () => {
  // Redirect to the profile page instead of strategies
  return <Navigate to="/profile" replace />;
};

export default Index;
