import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AuthContainer from "@/components/auth/AuthContainer";
import LoadingState from "@/components/auth/LoadingState";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError("Invalid or expired reset link. Please request a new password reset.");
        toast({
          variant: "destructive",
          title: "Invalid Reset Link",
          description: "Please request a new password reset link.",
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
      
      setLoading(false);
    };

    checkSession();
  }, [navigate, toast]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AuthContainer
      title="Reset Password"
      description="Enter your new password"
      error={error}
    >
      <UpdatePasswordForm />
    </AuthContainer>
  );
};

export default ResetPassword;