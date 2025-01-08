import React from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscription = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to subscribe to a plan",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Notice",
        description: "You are already subscribed!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your needs
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Basic Plan */}
          <div className="relative bg-card rounded-2xl p-8 border border-primary/20 hover:border-primary/50 transition-all duration-300">
            <div className="absolute -top-4 left-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 mt-4">Basic Plan</h3>
            <div className="mb-8">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-2" />
                <span>Up to 1000 messages per month</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-2" />
                <span>Unlimited campaigns</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-primary mr-2" />
                <span>Basic analytics</span>
              </li>
            </ul>
            <Button
              onClick={() => handleSubscription('price_1QdghTB4RWKZ2dNzpWlSvqmr')}
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;