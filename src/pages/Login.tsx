import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import AuthContainer from "@/components/auth/AuthContainer";
import LoadingState from "@/components/auth/LoadingState";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useToast } from "@/hooks/use-toast";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

const Login = () => {
  const { isLoading, authError, setAuthError, checkUserAndRedirect } = useAuthRedirect();
  const [view, setView] = useState<'sign_in' | 'forgot_password' | 'update_password'>('sign_in');
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
        title: "Password Reset Error",
        description: "The reset link has expired. Please request a new password reset.",
      });
      setView('sign_in');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

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
      
      // Only redirect to dashboard if we're not in password reset flow
      if (session && view !== 'update_password') {
        console.log("Found existing session, checking user status...");
        checkUserAndRedirect(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
        setAuthError(null);
      } else if (event === 'SIGNED_IN') {
        // If it's a recovery flow, don't redirect
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          setView('update_password');
        } else if (session) {
          checkUserAndRedirect(session);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthError(null);
        setView('sign_in');
      } else if (event === 'USER_UPDATED') {
        setAuthError(null);
        // After password is updated, sign out the user
        await supabase.auth.signOut();
        toast({
          title: "Password Updated",
          description: "Please sign in with your new password.",
        });
        setView('sign_in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserAndRedirect, setAuthError, toast]);

  if (isLoading) {
    return <LoadingState />;
  }

  const getContent = () => {
    switch (view) {
      case 'forgot_password':
        return (
          <AuthContainer
            title="Reset Password"
            description="Enter your email to receive a password reset link"
            error={authError}
          >
            <ForgotPasswordForm onBack={() => setView('sign_in')} />
          </AuthContainer>
        );
      case 'update_password':
        return (
          <AuthContainer
            title="Set New Password"
            description="Enter your new password"
            error={authError}
          >
            <UpdatePasswordForm />
          </AuthContainer>
        );
      default:
        return (
          <AuthContainer
            title="Welcome to FlowText"
            description="Sign in to manage your campaigns"
            error={authError}
          >
            <Auth
              supabaseClient={supabase}
              view="sign_in"
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
                    button_label: 'Sign In',
                    password_input_placeholder: 'Your password',
                    email_input_placeholder: 'Your email',
                    link_text: "Don't have an account? Sign up",
                  },
                },
              }}
              redirectTo={`${window.location.origin}/dashboard`}
            />
          </AuthContainer>
        );
    }
  };

  return getContent();
};

export default Login;
