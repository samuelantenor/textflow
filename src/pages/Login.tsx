import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthContainer from "@/components/auth/AuthContainer";
import LoadingState from "@/components/auth/LoadingState";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Login = () => {
  const { isLoading, authError, setAuthError, checkUserAndRedirect } = useAuthRedirect();
  const [view, setView] = useState<'sign_in' | 'update_password'>('sign_in');

  useEffect(() => {
    // Check if we're in a password reset flow
    const hash = window.location.hash;
    if (hash && hash.includes('#access_token') && hash.includes('type=recovery')) {
      setView('update_password');
      return;
    }
    
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error checking session:", error.message);
        setAuthError(error.message);
        return;
      }
      
      if (session && view !== 'update_password') {
        console.log("Found existing session, checking user status...");
        checkUserAndRedirect(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
        setAuthError(null);
      } else if (event === 'SIGNED_IN' && session) {
        // Only redirect if it's not a password recovery flow
        if (view !== 'update_password') {
          checkUserAndRedirect(session);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthError(null);
        setView('sign_in');
      } else if (event === 'USER_UPDATED') {
        setAuthError(null);
        // After password is updated, redirect to dashboard
        if (session) {
          checkUserAndRedirect(session);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [view, checkUserAndRedirect, setAuthError]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <AuthContainer
      title={view === 'update_password' ? 'Reset Your Password' : 'Welcome to FlowText'}
      description={view === 'update_password' 
        ? 'Please enter your new password below'
        : 'Sign in to manage your campaigns'}
      error={authError}
    >
      <Auth
        supabaseClient={supabase}
        view={view}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#000000',
                brandAccent: '#666666',
                inputText: '#ffffff',
                inputBackground: '#1a1a1a',
                inputPlaceholder: '#666666',
              },
            },
          },
          className: {
            input: 'text-white',
            label: 'text-white',
          },
        }}
        theme="dark"
        providers={[]}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
            },
            update_password: {
              password_label: 'New Password',
              button_label: 'Update Password',
            },
          },
        }}
      />
    </AuthContainer>
  );
};

export default Login;