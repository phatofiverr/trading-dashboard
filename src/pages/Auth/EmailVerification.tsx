import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const EmailVerification: React.FC = () => {
  const { currentUser, sendVerificationEmail, checkEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // If no user or already verified, redirect to dashboard
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (currentUser.emailVerified) {
      setIsVerified(true);
    }
  }, [currentUser, navigate]);

  const handleSendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to send verification email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast.error('Your email is not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status.');
    } finally {
      setChecking(false);
    }
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background/70 to-background">
      <Card className="w-full max-w-md border-border/30 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-left">Verify Your Email</CardTitle>
          <CardDescription className="text-left">
            We need to verify your email address to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-green-500/20 p-3 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">Email Verified!</h3>
              <p className="text-muted-foreground text-center mb-6">
                Your email address has been successfully verified.
              </p>
              <Button asChild>
                <Link to="/accounts">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm">
                  We've sent a verification email to{" "}
                  <span className="font-medium">{currentUser.email}</span>. 
                  Please check your inbox and click on the verification link.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={handleCheckVerification}
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      I've Verified My Email
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSendVerificationEmail}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild className="text-gray-400 hover:text-white hover:bg-black/20">
            <Link to="/login" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerification; 