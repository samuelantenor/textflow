import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, MessageSquare, Users, BarChart3, Layers, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// ... existing code ...

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

      {/* ... existing code ... */}
