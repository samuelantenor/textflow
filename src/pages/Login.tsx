import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from "@/components/auth/AuthForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t, i18n } = useTranslation(['auth']);
  const navigate = useNavigate();
  const { isLoading, authError, setAuthError, checkUserAndRedirect } = useAuthRedirect();
  const [view, setView] = useState<'sign_in' | 'forgot_password' | 'update_password'>('sign_in');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check URL for error parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error === 'access_denied' && errorDescription) {
      setAuthError(errorDescription.replace(/\+/g, ' '));
      toast({
        variant: "destructive",
        title: t('auth:resetPassword.errors.invalidToken'),
        description: t('auth:resetPassword.errors.emailNotFound'),
      });
      setView('sign_in');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Check if we're in a password reset flow
    const hash = window.location.hash;
    if (hash && hash.includes('#access_token') && hash.includes('type=recovery')) {
      setView('update_password');
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error checking session:", error.message);
        setAuthError(error.message);
        return;
      }
      
      if (session && view !== 'update_password') {
        checkUserAndRedirect(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
        setAuthError(null);
      } else if (event === 'SIGNED_IN') {
        if (hash && hash.includes('type=recovery')) {
          setView('update_password');
        } else if (session) {
          setIsSettingUp(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await checkUserAndRedirect(session);
          } catch (error) {
            console.error('Error during account setup:', error);
            toast({
              variant: "destructive",
              title: t('auth:login.errors.invalidCredentials'),
              description: t('auth:login.errors.generic'),
            });
          } finally {
            setIsSettingUp(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthError(null);
        setView('sign_in');
      } else if (event === 'USER_UPDATED') {
        setAuthError(null);
        await supabase.auth.signOut();
        toast({
          title: t('auth:updatePassword.success'),
          description: t('auth:login.subtitle'),
        });
        setView('sign_in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserAndRedirect, setAuthError, toast, t]);

  if (isLoading || isSettingUp) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-center"
        >
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">{t('auth:login.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-300"
          >
            {t('auth:login.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-2"
          >
            {t('auth:login.subtitle')}
          </motion.p>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-500 text-sm text-center"
          >
            {authError}
          </motion.div>
        )}

        {view === 'forgot_password' ? (
          <ForgotPasswordForm onBack={() => setView('sign_in')} />
        ) : view === 'update_password' ? (
          <UpdatePasswordForm />
        ) : (
          <>
            <AuthForm
              mode="sign_in"
              showToggle={false}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6 space-y-4"
            >
              <button
                onClick={() => setView('forgot_password')}
                className="text-gray-400 hover:text-white text-sm block w-full"
              >
                {t('auth:login.forgotPassword')}
              </button>
              <p className="text-gray-400">
                {t('auth:login.noAccount')}{' '}
                <Link to={`/${i18n.language}/signup`} className="text-red-400 hover:text-red-300">
                  {t('auth:login.signUpLink')}
                </Link>
              </p>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Animated Background Elements */}
      <motion.div
        className="fixed top-40 left-10 w-20 h-20 bg-red-500/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed bottom-20 right-10 w-32 h-32 bg-red-400/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

export default Login;