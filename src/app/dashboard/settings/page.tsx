"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Bell,
  Shield,
  Trash2,
  ArrowLeft,
  Briefcase,
  Target,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const incomeSourceLabels: Record<string, string> = {
  freelance: "💻 Freelancing",
  hackathon: "🏆 Hackathons",
  bounty: "🎯 Bounties",
  crypto: "🪙 Crypto/Web3",
  salary: "💼 Salary/Job",
  business: "🏪 Business",
  investments: "📈 Investments",
  other: "✨ Other",
};

const goalLabels: Record<string, string> = {
  emergency: "🛡️ Emergency Fund",
  save: "💰 Save More",
  invest: "📈 Investing",
  debt: "💳 Pay Off Debt",
  track: "📊 Track Spending",
  budget: "🎯 Budget",
  passive: "🏖️ Passive Income",
  retire: "🌴 Retirement",
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        console.log("User data:", data); // Debug
        if (data.success) {
          setUser(data.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
      </div>
    );
  }

  const nickname = user?.user_metadata?.nickname || "Not set";
  const fullName = user?.user_metadata?.full_name || "Not set";
  const email = user?.email || "Not set";
  const incomeSources = user?.user_metadata?.income_sources || [];
  const financialGoals = user?.user_metadata?.financial_goals || [];
  const onboardingCompleted = user?.user_metadata?.onboarding_completed;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
              <p className="text-gray-500 text-sm hidden sm:block">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto space-y-4">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-xl flex items-center justify-center">
                <User size={20} className="text-[#CCFF00]" />
              </div>
              <h2 className="font-semibold">Profile</h2>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#CCFF00]/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-[#CCFF00]">
                  {nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-lg">{nickname}</p>
                <p className="text-sm text-gray-500">{fullName}</p>
              </div>
            </div>

            <div className="grid gap-4 pt-2">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-400">Email</span>
                </div>
                <span className="text-sm">{email}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-400">Onboarding</span>
                </div>
                <span className={`text-sm ${onboardingCompleted ? "text-green-400" : "text-yellow-400"}`}>
                  {onboardingCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Income Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold">Income Sources</h2>
                <p className="text-xs text-gray-500">From your onboarding</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {incomeSources.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {incomeSources.map((source: string) => (
                  <span
                    key={source}
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm"
                  >
                    {incomeSourceLabels[source] || source}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No income sources set</p>
            )}
          </div>
        </motion.div>

        {/* Financial Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold">Financial Goals</h2>
                <p className="text-xs text-gray-500">What you're working towards</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {financialGoals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {financialGoals.map((goal: string) => (
                  <span
                    key={goal}
                    className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-sm"
                  >
                    {goalLabels[goal] || goal}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No financial goals set</p>
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-orange-400" />
              </div>
              <h2 className="font-semibold">Notifications</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-green-400" />
              </div>
              <h2 className="font-semibold">Security</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-red-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h2 className="font-semibold text-red-400">Danger Zone</h2>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}