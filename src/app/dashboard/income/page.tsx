"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  Wallet,
  Trophy,
  Briefcase,
  Code,
  Bitcoin,
  Building,
  TrendingDown,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  notes: string | null;
  created_at: string;
}

const sourceConfig: Record<string, { icon: any; color: string; bg: string }> = {
  hackathon: { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  bounty: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
  freelance: { icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10" },
  crypto: { icon: Bitcoin, color: "text-orange-400", bg: "bg-orange-500/10" },
  salary: { icon: Building, color: "text-purple-400", bg: "bg-purple-500/10" },
  business: { icon: Wallet, color: "text-pink-400", bg: "bg-pink-500/10" },
  investment: {
    icon: TrendingUp,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  other: { icon: Code, color: "text-gray-400", bg: "bg-gray-500/10" },
};

const sourceLabels: Record<string, string> = {
  hackathon: "Hackathon",
  bounty: "Bounty",
  freelance: "Freelance",
  crypto: "Crypto",
  salary: "Salary",
  business: "Business",
  investment: "Investment",
  other: "Other",
};

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [userSources, setUserSources] = useState<string[]>([]);

  // Fetch user's preferred income sources from onboarding
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.data.user?.user_metadata?.income_sources) {
          setUserSources(data.data.user.user_metadata.income_sources);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch income with filters
  useEffect(() => {
    const fetchIncome = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        if (selectedSource) {
          params.set("source", selectedSource);
        }

        if (dateRange !== "all") {
          const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          params.set("start_date", startDate.toISOString().split("T")[0]);
        }

        const res = await fetch(`/api/income?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setIncomes(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch income:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncome();
  }, [selectedSource, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const count = incomes.length;
    const average = count > 0 ? total / count : 0;

    // Group by source
    const bySource = incomes.reduce(
      (acc, i) => {
        acc[i.source] = (acc[i.source] || 0) + Number(i.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Find top source
    const topSource = Object.entries(bySource).sort((a, b) => b[1] - a[1])[0];

    // This month vs last month
    const now = new Date();
    const thisMonth = incomes.filter((i) => {
      const d = new Date(i.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    const lastMonth = incomes.filter((i) => {
      const d = new Date(i.date);
      const lastM = new Date(now.getFullYear(), now.getMonth() - 1);
      return (
        d.getMonth() === lastM.getMonth() &&
        d.getFullYear() === lastM.getFullYear()
      );
    });

    const thisMonthTotal = thisMonth.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );
    const lastMonthTotal = lastMonth.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );
    const monthChange =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    return {
      total,
      count,
      average,
      bySource,
      topSource,
      thisMonthTotal,
      monthChange,
    };
  }, [incomes]);

  // Get all unique sources from income data
  const availableSources = useMemo(() => {
    const sources = new Set(incomes.map((i) => i.source));
    // Also include user's preferred sources from onboarding
    userSources.forEach((s) => sources.add(s));
    return Array.from(sources);
  }, [incomes, userSources]);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
              >
                <ArrowLeft size={20} className="text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Income</h1>
                <p className="text-gray-500 text-sm hidden sm:block">
                  Track and analyze your earnings
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters || selectedSource
                  ? "bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              {selectedSource && (
                <span className="w-2 h-2 bg-[#CCFF00] rounded-full" />
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-4">
                  {/* Date Range */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Time Period</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "7d", label: "7 days" },
                        { value: "30d", label: "30 days" },
                        { value: "90d", label: "90 days" },
                        { value: "all", label: "All time" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDateRange(option.value as any)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            dateRange === option.value
                              ? "bg-[#CCFF00] text-black font-medium"
                              : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Source</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSource(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          !selectedSource
                            ? "bg-[#CCFF00] text-black font-medium"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        All Sources
                      </button>
                      {availableSources.map((source) => {
                        const config =
                          sourceConfig[source] || sourceConfig.other;
                        const Icon = config.icon;
                        return (
                          <button
                            key={source}
                            onClick={() => setSelectedSource(source)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              selectedSource === source
                                ? "bg-[#CCFF00] text-black font-medium"
                                : `${config.bg} ${config.color} hover:opacity-80`
                            }`}
                          >
                            <Icon size={14} />
                            {sourceLabels[source] || source}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#CCFF00]/20 to-[#CCFF00]/5 border border-[#CCFF00]/30 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-[#CCFF00]" />
              <span className="text-xs text-gray-400">Total Income</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#CCFF00]">
              ₦{stats.total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.count} entries</p>
          </motion.div>

          {/* This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">This Month</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              ₦{stats.thisMonthTotal.toLocaleString()}
            </p>
            {stats.monthChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-xs mt-1 ${
                  stats.monthChange > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stats.monthChange > 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {Math.abs(stats.monthChange).toFixed(0)}% vs last month
              </div>
            )}
          </motion.div>

          {/* Average */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">Average</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              ₦
              {stats.average.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">per entry</p>
          </motion.div>

          {/* Top Source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Top Source</span>
            </div>
            {stats.topSource ? (
              <>
                <p className="text-xl sm:text-2xl font-bold capitalize">
                  {stats.topSource[0]}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ₦{stats.topSource[1].toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </motion.div>
        </div>

        {/* Source Breakdown */}
        {Object.keys(stats.bySource).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5"
          >
            <h3 className="text-sm font-medium mb-4">Income by Source</h3>
            <div className="space-y-3">
              {Object.entries(stats.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, amount]) => {
                  const config = sourceConfig[source] || sourceConfig.other;
                  const Icon = config.icon;
                  const percentage = (amount / stats.total) * 100;

                  return (
                    <div key={source}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}
                          >
                            <Icon size={16} className={config.color} />
                          </div>
                          <span className="text-sm capitalize">
                            {sourceLabels[source] || source}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            ₦{amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden ml-10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className={`h-full rounded-full ${config.bg.replace("/10", "")}`}
                          style={{
                            backgroundColor: config.color
                              .replace("text-", "")
                              .includes("400")
                              ? undefined
                              : undefined,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Income List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">
              Recent Entries
              {selectedSource && (
                <span className="ml-2 text-[#CCFF00]">
                  • {sourceLabels[selectedSource] || selectedSource}
                </span>
              )}
            </h3>
            {selectedSource && (
              <button
                onClick={() => setSelectedSource(null)}
                className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
              >
                <X size={12} />
                Clear filter
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : incomes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-400 mb-2">No income recorded</p>
              <p className="text-gray-500 text-sm mb-4">
                {selectedSource
                  ? `No ${sourceLabels[selectedSource] || selectedSource} income found`
                  : "Start by logging your first income"}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#CCFF00] text-black rounded-lg text-sm font-medium hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
              >
                <Plus size={16} />
                Log Income via Chat
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {incomes.map((income, index) => {
                const config =
                  sourceConfig[income.source] || sourceConfig.other;
                const Icon = config.icon;
                const date = new Date(income.date);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isYesterday =
                  date.toDateString() ===
                  new Date(Date.now() - 86400000).toDateString();

                return (
                  <motion.div
                    key={income.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-[#CCFF00]/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${config.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}
                      >
                        <Icon size={20} className={config.color} />
                      </div>
                      <div>
                        <p className="font-medium capitalize text-sm sm:text-base">
                          {sourceLabels[income.source] || income.source}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          {isToday
                            ? "Today"
                            : isYesterday
                              ? "Yesterday"
                              : date.toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                  year:
                                    date.getFullYear() !==
                                    new Date().getFullYear()
                                      ? "numeric"
                                      : undefined,
                                })}
                        </div>
                        {income.notes && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px] sm:max-w-[250px]">
                            {income.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-[#CCFF00]">
                      +₦{Number(income.amount).toLocaleString()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
