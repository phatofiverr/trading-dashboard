import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const PasswordReset: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background/70 to-background">
      <Card className="w-full max-w-md border-border/30 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-left">Reset Password</CardTitle>
          <CardDescription className="text-left">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/50 text-red-700">
              {error}
            </div>
          )}
          
          {isSuccess ? (
            <div className="p-4 rounded-md bg-green-500/10 border border-green-500/50 text-green-700">
              <p className="mb-4">We've sent a password reset link to <strong>{email}</strong></p>
              <p>Kindly check your inbox and spam folder for the password reset email, and follow the instructions to complete the process</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
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

export default PasswordReset; 