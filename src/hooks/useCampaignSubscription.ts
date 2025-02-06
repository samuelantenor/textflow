
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const setupSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const channel = supabase
          .channel('campaign-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'campaigns',
              filter: `user_id=eq.${session.user.id}`
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up campaign subscription:', error);
      }
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [queryClient]);
};
