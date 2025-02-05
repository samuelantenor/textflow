import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, BarChart3, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 group">
              <MessageSquare className="h-6 w-6 text-primary-500 fill-current transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                FlowText
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button>Create free account</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                Turn Texts into Sales with Powerful SMS Marketing
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                Where engagement and results come first. Join thousands of businesses using FlowText to drive growth through SMS marketing.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full">
                    Create free account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-500">
              Everything you need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful SMS Marketing Tools
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              All the tools you need to connect with your customers and grow your business through SMS marketing.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {[
                {
                  name: 'SMS Campaigns',
                  description: 'Send bulk messages with personalization',
                  icon: MessageSquare,
                },
                {
                  name: 'Contact Lists',
                  description: 'Manage and segment your audience',
                  icon: Users,
                },
                {
                  name: 'Analytics',
                  description: 'Track and optimize performance',
                  icon: BarChart3,
                },
                {
                  name: 'Targeting',
                  description: 'Reach the right audience',
                  icon: Target,
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                      <feature.icon
                        className="h-6 w-6 text-primary-500"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your customer engagement?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-400">
            Join thousands of businesses using FlowText to drive growth through SMS marketing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/signup">
              <Button size="lg" className="rounded-full">
                Create free account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
