"use client";
import React, { useState } from 'react';
import { ArrowRight, Zap, Target, MessageSquare, TrendingUp, Check, Menu, X, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">StashAI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition">How It Works</a>
              <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition">
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-slate-300 hover:text-white">Features</a>
              <a href="#how-it-works" className="block text-slate-300 hover:text-white">How It Works</a>
              <button className="w-full px-4 py-2 bg-violet-600 rounded-lg font-medium">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> AI-Powered Financial Coach
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent leading-tight">
            Stop Guessing.<br />Start Growing.
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 mb-12 leading-relaxed">
            The AI money coach built for hustlers with inconsistent income. Track earnings, chat with AI, and actually hit your goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition shadow-lg shadow-violet-500/25">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-lg transition">
              Watch Demo
            </button>
          </div>

          <p className="text-slate-500 text-sm">Free forever. No credit card required.</p>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-3xl"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">This Month Earned</div>
                  <div className="text-3xl font-bold text-green-400">$3,240</div>
                  <div className="text-green-400 text-sm mt-1">+32% from last month</div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">Active Goals</div>
                  <div className="text-3xl font-bold">3</div>
                  <div className="text-violet-400 text-sm mt-1">$1,840 total progress</div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <div className="text-slate-400 text-sm mb-2">AI Insights</div>
                  <div className="text-3xl font-bold text-violet-400">12</div>
                  <div className="text-slate-400 text-sm mt-1">Personalized tips this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Traditional budgeting apps <span className="text-red-400">don't work</span> for hustlers
          </h2>
          <p className="text-xl text-slate-400">
            Your income isn’t a steady paycheck. Hackathons, bounties, freelance gigs—your earnings are unpredictable, and that’s okay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: "📅", title: "Monthly budgets fail", desc: "Planning by month breaks down when income changes weekly." },
            { icon: "🤖", title: "Generic advice doesn't help", desc: "Cookie-cutter tips don’t fit your unique earning patterns." },
            { icon: "💸", title: "Missing crypto & bounties", desc: "Traditional apps ignore Web3 and non-traditional income." }
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:border-violet-500/50 transition">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Built for your <span className="text-violet-400">hustle</span></h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Track earnings by source, chat with AI that knows your patterns, and actually hit your savings goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Income Source Tracking */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-violet-500/50 transition">
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Income Source Tracking</h3>
            <p className="text-slate-400 mb-6">Track every dollar by source—hackathons, bounties, freelance, crypto. Works with any payment method. Manual entry takes 30 seconds.</p>
            <ul className="space-y-2 text-slate-300">
              {["Filter by source & date", "Visual analytics", "Monthly trends", "Smart allocation tips"].map((feature, i) => (
                <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />{feature}</li>
              ))}
            </ul>
          </div>

          {/* AI Coach */}
          <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/30 rounded-2xl p-8 transform lg:scale-105 shadow-2xl shadow-violet-500/10">
            <div className="w-12 h-12 bg-violet-500/20 border border-violet-500/40 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-violet-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4">AI Money Coach</h3>
            <p className="text-slate-300 mb-6">
              Chat with Claude AI that has full context of YOUR financial history. Get real advice based on your earning patterns.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-violet-500/20">
              <p className="text-sm text-slate-400 mb-2">You:</p>
              <p className="text-white mb-3">"Can I afford a $300 monitor?"</p>
              <p className="text-sm text-slate-400 mb-2">AI:</p>
              <p className="text-violet-200">Yes, but wait until Friday's bounty clears.</p>
            </div>
          </div>

          {/* Goal Tracking */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 hover:border-violet-500/50 transition">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Smart Goal Tracking</h3>
            <p className="text-slate-400 mb-6">Set savings goals and let AI break them into achievable steps. Visual progress with milestone celebrations.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">How it works</h2>
          <p className="text-xl text-slate-400">Three simple steps to better money decisions</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { step: "1", title: "Log Your Income", desc: "Add earnings in 30 seconds. Tag the source: hackathon, bounty, freelance, crypto, or other." },
            { step: "2", title: "Ask the AI", desc: "Chat with Claude about spending decisions, goal planning, or money questions." },
            { step: "3", title: "Hit Your Goals", desc: "Set savings goals and watch the AI break them down into actionable steps." }
          ].map((item, i) => (
            <div key={i} className="relative text-center">
              <div className="text-6xl font-bold text-violet-500/10 mb-4">{item.step}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-400 text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to stop guessing and start growing?</h2>
          <p className="text-xl text-slate-400 mb-8">Join hundreds of hustlers making smarter money decisions with AI.</p>
          <button className="px-10 py-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg font-semibold text-xl flex items-center justify-center gap-2 mx-auto transition shadow-lg shadow-violet-500/25">
            Get Started Free <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">StashAI</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 StashAI. Built with ❤️ for hustlers. Powered by Claude AI.</p>
        </div>
      </footer>
    </div>
  );
}
