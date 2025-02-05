import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, MessageSquare, Users, BarChart3, Layers, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Navigation items
const navItems = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Business", href: "#business" },
];

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  popularLabel?: string;
}

export default function LandingPage() {
  const { t, i18n } = useTranslation(['common', 'landing']);
  const currentLang = i18n.language;

  const productFeatures = [
    {
      icon: MessageSquare,
      name: t('landing:features.smsCampaigns.title'),
      description: t('landing:features.smsCampaigns.description')
    },
    {
      icon: Users,
      name: t('landing:features.contactLists.title'),
      description: t('landing:features.contactLists.description')
    },
    {
      icon: BarChart3,
      name: t('landing:features.analytics.title'),
      description: t('landing:features.analytics.description')
    },
    {
      icon: Target,
      name: t('landing:features.targeting.title'),
      description: t('landing:features.targeting.description')
    }
  ];

  const stats = [
    { number: t('landing:stats.smsDelivered.number'), label: t('landing:stats.smsDelivered.label') },
    { number: t('landing:stats.openRate.number'), label: t('landing:stats.openRate.label') },
    { number: t('landing:stats.activeUsers.number'), label: t('landing:stats.activeUsers.label') },
    { number: t('landing:stats.roi.number'), label: t('landing:stats.roi.label') }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: t('landing:mainFeatures.bulkSms.title'),
      description: t('landing:mainFeatures.bulkSms.description')
    },
    {
      icon: Users,
      title: t('landing:mainFeatures.contactManagement.title'),
      description: t('landing:mainFeatures.contactManagement.description')
    },
    {
      icon: BarChart3,
      title: t('landing:mainFeatures.advancedAnalytics.title'),
      description: t('landing:mainFeatures.advancedAnalytics.description')
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: t('landing:pricing.plans.starter.name'),
      price: t('landing:pricing.plans.starter.price'),
      period: t('landing:pricing.plans.starter.period'),
      features: t('landing:pricing.plans.starter.features', { returnObjects: true }) as string[]
    },
    {
      name: t('landing:pricing.plans.professional.name'),
      price: t('landing:pricing.plans.professional.price'),
      period: t('landing:pricing.plans.professional.period'),
      popular: true,
      popularLabel: t('landing:pricing.plans.professional.popular'),
      features: t('landing:pricing.plans.professional.features', { returnObjects: true }) as string[]
    },
    {
      name: t('landing:pricing.plans.enterprise.name'),
      price: t('landing:pricing.plans.enterprise.price'),
      period: t('landing:pricing.plans.enterprise.period'),
      features: t('landing:pricing.plans.enterprise.features', { returnObjects: true }) as string[]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to={`/${currentLang}`} className="text-2xl font-bold text-white">
                FlowText
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link to={`/${currentLang}/login`}>
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  {t('common:navigation.signIn')}
                </Button>
              </Link>
              <Link to={`/${currentLang}/signup`}>
                <Button className="bg-red-600 hover:bg-red-700">
                  {t('common:navigation.createAccount')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm font-medium text-red-400"
          >
            {t('landing:hero.tagline')}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {t('landing:hero.title.welcome')}
            <br />
            {t('landing:hero.title.where')} <span className="text-red-400">{t('landing:hero.title.engagement')}</span>
            <br />
            {t('landing:hero.title.comeFirst')}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16"
          >
            {productFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-red-500/50 transition-colors"
              >
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <feature.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{feature.name}</h3>
                <p className="text-gray-400 text-xs">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Link to={`/${currentLang}/signup`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg text-lg">
                {t('common:navigation.createAccount')}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-red-500/50 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing:pricing.title')}
            </h2>
            <p className="text-gray-400">{t('landing:pricing.subtitle')}</p>
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
                      {plan.popularLabel}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <ArrowRight className="w-5 h-5 text-red-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={`/${currentLang}/signup`} className="block">
                  <Button className={`w-full ${
                    plan.popular ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
                  } text-white py-4 rounded-lg`}>
                    {t('common:buttons.getStarted')}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('landing:cta.title')}
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            {t('landing:cta.description')}
          </p>
          <Link to={`/${currentLang}/signup`}>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg text-lg">
              {t('common:navigation.createAccount')}
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </motion.div>
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
      </section>
    </div>
  );
}