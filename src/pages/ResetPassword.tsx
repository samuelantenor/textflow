import { useEffect, useState } from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import LoadingState from "@/components/auth/LoadingState";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the session to check if we're authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        // If no session, check if we have a recovery token in the URL
        if (!session) {
          const hash = window.location.hash;
          if (!hash || !hash.includes('access_token')) {
            setError('Invalid or expired reset link. Please request a new password reset.');
            toast({
              variant: "destructive",
              title: "Invalid Reset Link",
              description: "The password reset link is invalid or has expired. Please request a new one.",
            });
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error in password reset:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    handlePasswordReset();
  }, [navigate, toast]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AuthContainer
      title="Reset Your Password"
      description="Enter your new password below"
      error={error}
    >
      <UpdatePasswordForm />
    </AuthContainer>
  );
};

export default ResetPassword;