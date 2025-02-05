import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Shield, Lock, Users, Check, Star, MessageSquare, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stats = [
  { number: "99.9%", label: "Uptime" },
  { number: "10M+", label: "Messages Sent" },
  { number: "50K+", label: "Active Users" },
  { number: "120+", label: "Countries" }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 1,000 messages/month",
      "Basic encryption",
      "2 team members",
      "Email support"
    ]
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    popular: true,
    features: [
      "Unlimited messages",
      "Advanced encryption",
      "Unlimited team members",
      "Priority support",
      "Custom branding",
      "API access"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    features: [
      "Everything in Pro",
      "Dedicated server",
      "24/7 phone support",
      "SLA guarantee",
      "Custom features"
    ]
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-300 mb-6">
                Welcome to TextFlow
              </h1>
            </motion.div>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Where privacy and freedom come first. Send messages securely and maintain control over your communications.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg text-lg group">
                  Get Started
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="px-8 py-6 rounded-lg text-lg hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Animated Floating Elements */}
        <motion.div
          className="absolute top-40 left-10 w-20 h-20 bg-red-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-red-400/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/30">
        <motion.div 
          className="max-w-7xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-4xl font-bold text-red-400 mb-2">{stat.number}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/50">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose TextFlow?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Experience the next generation of secure messaging with our cutting-edge features.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-red-500/50 transition-colors"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your data, your rules</h3>
              <p className="text-gray-400">End-to-end encryption ensures your messages stay private and secure.</p>
            </motion.div>
            <motion.div 
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-red-500/50 transition-colors"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Lock className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Security by design</h3>
              <p className="text-gray-400">Built with privacy-first principles and state-of-the-art security.</p>
            </motion.div>
            <motion.div 
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-red-500/50 transition-colors"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Users className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Community driven</h3>
              <p className="text-gray-400">Join thousands of users who value their privacy and freedom.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Choose the plan that best fits your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border ${
                  plan.popular ? 'border-red-500' : 'border-gray-800'
                } relative`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
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
                      <Check className="w-5 h-5 text-red-500 mr-2" />
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
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-black/30">
        <motion.div 
          className="max-w-7xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Trusted by Industry Leaders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center opacity-50">
            {/* Replace with actual company logos */}
            <div className="h-12 bg-gray-800 rounded-lg"></div>
            <div className="h-12 bg-gray-800 rounded-lg"></div>
            <div className="h-12 bg-gray-800 rounded-lg"></div>
            <div className="h-12 bg-gray-800 rounded-lg"></div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to take control of your communications?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join TextFlow today and experience secure messaging like never before.
            Start your journey to privacy-first communication.
          </p>
          <Link to="/signup">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg text-lg group">
              Start Messaging Securely
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
