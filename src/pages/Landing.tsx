import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, ChartBar, Database, Shield } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Landing: React.FC = () => {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] font-sans">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium">TJ</span>
            </div>
            <span className="font-medium text-lg text-white">TradeJournal</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild variant="outline" className="border-white/10 bg-black/20 hover:bg-black/40 text-white">
                <Link to="/accounts">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-gray-400 hover:text-white hover:bg-black/20">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-white text-black hover:bg-gray-200">
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center">
        <div className="main-content py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-white">
                Data-Driven Trading Decisions
              </h1>
              <p className="text-lg text-gray-400">
                Track, analyze, and optimize your trading performance with institutional-grade analytics. 
                Take control of your capital with precise metrics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button size="lg" asChild className="bg-white text-black hover:bg-gray-200">
                    <Link to="/accounts">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild className="bg-white text-black hover:bg-gray-200">
                      <Link to="/register">Get Started</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="border-white/10 bg-black/20 hover:bg-black/40 text-white">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-black/40 rounded-xl p-8 border border-white/5 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1 p-4 bg-black/30 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-white font-medium">Performance Metrics</span>
                    <span className="text-xs text-gray-500">Track your progress</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 bg-black/30 rounded-lg">
                    <PieChart className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-white font-medium">Portfolio Analysis</span>
                    <span className="text-xs text-gray-500">Asset allocation</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 bg-black/30 rounded-lg">
                    <ChartBar className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-white font-medium">Risk Management</span>
                    <span className="text-xs text-gray-500">Drawdown control</span>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 bg-black/30 rounded-lg">
                    <Shield className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-white font-medium">Strategy Protection</span>
                    <span className="text-xs text-gray-500">Secure methodology</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-black/20 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Win rate</span>
                    <span className="text-xs text-gray-300">64.2%</span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400" style={{ width: '64.2%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1 mt-3">
                    <span className="text-xs text-gray-500">Profit factor</span>
                    <span className="text-xs text-gray-300">2.17</span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400" style={{ width: '72%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1 mt-3">
                    <span className="text-xs text-gray-500">Expectancy</span>
                    <span className="text-xs text-gray-300">1.4R</span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-black/20">
        <div className="main-content">
          <h2 className="text-3xl font-medium text-left mb-12 text-white">Institutional-Grade Analytics</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-black/30 rounded-xl border border-white/5">
              <Database className="h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">Data-Driven Insights</h3>
              <p className="text-gray-400 text-sm">Transform your trading data into actionable insights with detailed performance metrics.</p>
            </div>
            
            <div className="p-6 bg-black/30 rounded-xl border border-white/5">
              <ChartBar className="h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">Risk Assessment</h3>
              <p className="text-gray-400 text-sm">Understand your risk profile and optimize position sizing for maximum capital efficiency.</p>
            </div>
            
            <div className="p-6 bg-black/30 rounded-xl border border-white/5">
              <Shield className="h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">Strategy Validation</h3>
              <p className="text-gray-400 text-sm">Test and validate your trading strategies with robust statistical analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="main-content">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TradeJournal. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/login" className="text-sm text-gray-500 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm text-gray-500 hover:text-white transition-colors">
                Register
              </Link>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
