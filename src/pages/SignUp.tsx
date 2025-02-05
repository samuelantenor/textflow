import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from "@/components/auth/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SignUp = () => {
  const { t, i18n } = useTranslation(['auth']);
  const { isLoading, authError, setAuthError, checkUserAndRedirect } = useAuthRedirect();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error checking session:", error.message);
        setAuthError(error.message);
        return;
      }
      
      if (session) {
        checkUserAndRedirect(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsSettingUp(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await checkUserAndRedirect(session);
        } catch (error) {
          console.error('Error during account setup:', error);
          toast({
            variant: "destructive",
            title: t('auth:signup.errors.generic'),
            description: t('auth:signup.errors.setupFailed'),
          });
        } finally {
          setIsSettingUp(false);
        }
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
          <p className="text-lg">{t('auth:signup.loading')}</p>
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
            {t('auth:signup.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-2"
          >
            {t('auth:signup.subtitle')}
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

        <AuthForm
          mode="sign_up"
          onToggleMode={() => {}}
          showToggle={false}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-gray-400">
            {t('auth:signup.haveAccount')}{' '}
            <Link to={`/${i18n.language}/login`} className="text-red-400 hover:text-red-300">
              {t('auth:signup.signInLink')}
            </Link>
          </p>
        </motion.div>
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
};

export default SignUp; 