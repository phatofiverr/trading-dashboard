import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmailVerificationBanner from './EmailVerificationBanner';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/login'
}) => {
  const { currentUser, loading } = useAuth();

  // Add debugging output
  useEffect(() => {
    console.log('PrivateRoute - Auth state:', { 
      isAuthenticated: !!currentUser, 
      loading, 
      uid: currentUser?.uid 
    });
  }, [currentUser, loading]);

  if (loading) {
    // You could render a loading spinner here
    return (
      <div className="flex justify-center items-center h-screen bg-trading-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trading-accent1"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('PrivateRoute - Redirecting to:', redirectTo);
    return <Navigate to={redirectTo} />;
  }

  return (
    <>
      {!currentUser.emailVerified && <EmailVerificationBanner />}
      {children}
    </>
  );
};

export default PrivateRoute; 