import React, { useState, useEffect } from 'react';
import { Info, Mail, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerificationPopup: React.FC = () => {
  const { currentUser, sendVerificationEmail, checkEmailVerified } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(currentUser?.emailVerified || false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Show popup after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!currentUser || isVerified || !isOpen) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent. Please check your inbox.');
      // Close popup after sending
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsVerifying(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        setIsOpen(false);
      } else {
        toast.error('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      toast.error('Failed to check verification status.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-md bg-black/80 backdrop-blur-md text-white rounded-lg shadow-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-400" />
            <h3 className="font-medium">Email Verification</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-white/70 mb-4">
            Please verify your email <span className="text-white font-medium">{currentUser.email}</span> to access all features.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckVerification}
              disabled={isVerifying}
              className="flex-1 flex items-center justify-center gap-1 bg-transparent border-white/10 hover:bg-white/10 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              {isVerifying ? "Checking..." : "I've Verified"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSendVerification}
              disabled={isSending}
              className="flex-1 flex items-center justify-center gap-1 bg-amber-500/80 hover:bg-amber-500"
            >
              <Mail className="h-4 w-4" />
              {isSending ? "Sending..." : "Resend Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPopup; 