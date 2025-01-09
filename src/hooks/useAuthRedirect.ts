import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserAndRedirect = async (session) => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
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

      // Only navigate if we still have a valid session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        navigate("/dashboard", { replace: true });
      } else {
        // If session is no longer valid, show error
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please sign in again.",
        });
      }
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

  return {
    isLoading,
    setIsLoading,
    authError,
    setAuthError,
    checkUserAndRedirect
  };
};