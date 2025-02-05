import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, MessageSquare, Users, BarChart3, Layers, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// Navigation items
const navItems = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Business", href: "#business" },
];

const productFeatures = [
  {
    icon: MessageSquare,
    name: "SMS Campaigns",
    description: "Send bulk messages with personalization"
  },
  {
    icon: Users,
    name: "Contact Lists",
    description: "Manage and segment your audience"
  },
  {
    icon: BarChart3,
    name: "Analytics",
    description: "Track and optimize performance"
  },
  {
    icon: Target,
    name: "Targeting",
    description: "Reach the right audience"
  }
];

const stats = [
  { number: "10M+", label: "SMS Delivered" },
  { number: "98%", label: "Open Rate" },
  { number: "5K+", label: "Active Users" },
  { number: "2x", label: "Avg. ROI" }
];

const features = [
  {
    icon: MessageSquare,
    title: "Bulk SMS Campaigns",
    description: "Send personalized messages to thousands of customers with our powerful campaign builder."
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Organize and segment your audience for targeted messaging and better engagement."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track delivery rates, engagement, and ROI with detailed campaign reporting."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    features: [
      "Up to 1,000 SMS/month",
      "Basic personalization",
      "Contact list management",
      "Email support"
    ]
  },
  {
    name: "Professional",
    price: "$99",
    period: "per month",
    popular: true,
    features: [
      "Up to 10,000 SMS/month",
      "Advanced personalization",
      "List segmentation",
      "Campaign analytics",
      "Priority support",
      
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    features: [
      "Unlimited SMS",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced analytics",
      "Custom features"
    ]
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-white">
                FlowText
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-red-600 hover:bg-red-700">
                  Create free account
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
            Turn Texts into Sales with Powerful SMS Marketing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Welcome to FlowText
            <br />
            where <span className="text-red-400">engagement and results</span>
            <br />
            come first
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
            <Link to="/signup">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg text-lg">
                Create free account
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Choose the plan that best fits your messaging needs</p>
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
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
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
                <Link to="/signup" className="block">
                  <Button className={`w-full ${
                    plan.popular ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
                  } text-white py-4 rounded-lg`}>
                    Get Started
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
            Ready to transform your customer engagement?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of businesses using FlowText to drive growth through SMS marketing.
          </p>
          <Link to="/signup">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg text-lg">
              Create free account
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
