import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';

// Lazy load page components
const LiveTradingStrategies = lazy(() => import('./pages/LiveTradingStrategies'));
const StrategyPage = lazy(() => import('./pages/StrategyPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
const Accounts = lazy(() => import('./pages/Accounts')); // Use the correct component names
const AccountDetail = lazy(() => import('./pages/AccountDetail')); // Use the correct component names
const Settings = lazy(() => import('./pages/Settings')); // Use the correct component names
const DemonFinder = lazy(() => import('./pages/DemonFinder'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Landing = lazy(() => import('./pages/Landing'));
const PasswordReset = lazy(() => import('./pages/Auth/PasswordReset'));
const EmailVerification = lazy(() => import('./pages/Auth/EmailVerification'));

// Route with conditional redirect based on auth state
const HomeRoute = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/accounts" replace /> : <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="min-h-screen bg-trading-bg flex items-center justify-center">Loading...</div>}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* Default Route - Conditional Redirect */}
            <Route path="/" element={<HomeRoute />} />
            
            {/* Protected Routes */}
            <Route path="/strategies" element={
              <PrivateRoute>
                <LiveTradingStrategies />
              </PrivateRoute>
            } />
            <Route path="/strategies/:strategyId" element={
              <PrivateRoute>
                <StrategyPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/profile/edit" element={
              <PrivateRoute>
                <ProfileEditPage />
              </PrivateRoute>
            } />
            <Route path="/accounts" element={
              <PrivateRoute>
                <Accounts />
              </PrivateRoute>
            } />
            <Route path="/accounts/:accountId" element={
              <PrivateRoute>
                <AccountDetail />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/demon-finder" element={
              <PrivateRoute>
                <DemonFinder />
              </PrivateRoute>
            } />
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" richColors closeButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
