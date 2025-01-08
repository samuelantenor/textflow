import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSubscriptionAndRedirect = async (session) => {
      if (!session) return;
      
      setIsLoading(true);
      try {
        // Check subscription status
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        // If subscription exists and was previously paid but is now canceled
        if (subscription?.has_been_paid && subscription.status !== 'active') {
          toast({
            title: "Subscription Status",
            description: "Your subscription has been cancelled. You have been moved to the free tier.",
            duration: 5000,
          });
        }

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify subscription status",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error checking session:", error.message);
        toast({
          variant: "destructive",
          title: "Session Error",
          description: error.message,
        });
        return;
      }
      
      if (session) {
        checkSubscriptionAndRedirect(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSubscriptionAndRedirect(session);
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
          <p className="text-muted-foreground">Verifying subscription status...</p>
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