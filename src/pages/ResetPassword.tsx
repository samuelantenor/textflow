import { useEffect, useState } from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import LoadingState from "@/components/auth/LoadingState";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token in the URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('Invalid or expired reset link');
      setLoading(false);
      return;
    }

    // Verify the session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
        setLoading(false);
        return;
      }
      setLoading(false);
    });
  }, [navigate]);

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