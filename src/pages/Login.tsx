import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndRedirect = async (session) => {
      if (!session) return;
      
      setIsLoading(true);
      try {
        // First, verify the user still exists in the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.log("User profile not found, signing out...");
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account not found",
            description: "Your account no longer exists. Please create a new account.",
          });
          return;
        }

        // Check subscription status
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Subscription check error:", error);
          throw error;
        }

        if (subscription?.has_been_paid && subscription.status !== 'active') {
          toast({
            title: "Subscription Status",
            description: "Your subscription has been cancelled. You have been moved to the free tier.",
            duration: 5000,
          });
        }

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Error checking user status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify account status. Please try again.",
          duration: 5000,
        });
        await supabase.auth.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error checking session:", error.message);
        setAuthError(error.message);
        return;
      }
      
      if (session) {
        console.log("Found existing session, checking user status...");
        checkUserAndRedirect(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' && session) {
        checkUserAndRedirect(session);
      } else if (event === 'SIGNED_OUT') {
        setAuthError(null);
      } else if (event === 'USER_UPDATED') {
        setAuthError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md space-y-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to FlowText</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage your campaigns</p>
        </div>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        <div className="bg-card p-6 rounded-lg shadow-lg border">
          <Auth
            supabaseClient={supabase}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Login;