import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AuthContainer from "@/components/auth/AuthContainer";
import LoadingState from "@/components/auth/LoadingState";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t, i18n } = useTranslation(['auth']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError(t('auth:resetPassword.errors.invalidToken'));
        toast({
          variant: "destructive",
          title: t('auth:resetPassword.errors.invalidToken'),
          description: t('auth:resetPassword.errors.emailNotFound'),
        });
        setTimeout(() => {
          navigate(`/${i18n.language}/login`);
        }, 3000);
      }
      
      setLoading(false);
    };

    checkSession();
  }, [navigate, toast, t, i18n.language]);

  if (loading) {
    return <LoadingState message={t('auth:resetPassword.loading')} />;
  }

  return (
    <AuthContainer
      title={t('auth:resetPassword.title')}
      description={t('auth:resetPassword.subtitle')}
      error={error}
    >
      <UpdatePasswordForm />
    </AuthContainer>
  );
};

export default ResetPassword;