
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ContactDialog } from '@/components/ContactDialog';
import { useQuery } from '@tanstack/react-query';

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation(['landing', 'common']);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Fetch current subscription status
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubscription = async (priceId: string, planType: string) => {
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

      // Check if user is already subscribed to this plan
      if (subscription?.plan_type === planType && subscription?.status === 'active') {
        toast({
          title: "Already subscribed",
          description: `You are already subscribed to the ${planType} plan`,
          variant: "destructive",
        });
        navigate('/billing');
        return;
      }

      console.log('Creating checkout session with priceId:', priceId);

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
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  const pricingPlans = [
    {
      name: t('pricing.plans.starter.name'),
      price: t('pricing.plans.starter.price'),
      period: t('pricing.plans.starter.period'),
      features: t('pricing.plans.starter.features', { returnObjects: true }) as string[],
      priceId: 'price_1Qp2e8B4RWKZ2dNz9TmEjEM9', // Starter plan price ID
      messageLimit: '1,000',
      planType: 'paid_starter'
    },
    {
      name: t('pricing.plans.professional.name'),
      price: t('pricing.plans.professional.price'),
      period: t('pricing.plans.professional.period'),
      popular: true,
      features: t('pricing.plans.professional.features', { returnObjects: true }) as string[],
      priceId: 'price_1Qp2e8B4RWKZ2dNzE3i3i37m', // Professional plan price ID
      messageLimit: '10,000',
      planType: 'paid_pro'
    },
    {
      name: t('pricing.plans.enterprise.name'),
      price: t('pricing.plans.enterprise.price'),
      period: t('pricing.plans.enterprise.period'),
      features: t('pricing.plans.enterprise.features', { returnObjects: true }) as string[],
      priceId: 'price_enterprise',
      messageLimit: 'Unlimited',
      planType: 'enterprise'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('pricing.title')}</h2>
            <p className="text-gray-400">{t('pricing.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border ${
                  plan.popular ? 'border-red-500' : 'border-gray-800'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      {t('pricing.plans.professional.popular')}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Up to {plan.messageLimit} messages/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <ArrowRight className="w-5 h-5 text-red-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.name === t('pricing.plans.enterprise.name') ? (
                  <Button
                    onClick={() => setIsContactOpen(true)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg"
                  >
                    {t('common:buttons.contactUs')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscription(plan.priceId, plan.planType)}
                    className={`w-full ${
                      plan.popular ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
                    } text-white py-4 rounded-lg`}
                  >
                    {t('common:buttons.getStarted')}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
    </div>
  );
};

export default PricingPage;
