"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Send,
  User,
  Bot,
  Menu,
  X,
  Plus,
  TrendingUp,
  Wallet,
  Target,
  Settings,
  LogOut,
  Paperclip,
  Sparkles,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface DashboardStats {
  totalIncome: number;
  incomeCount: number;
  totalSaved: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  savingsRate: number;
  recentIncome: any[];
  topSource: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hey! 👋 I'm your StashAI assistant. I can see your financial data and help you make smarter decisions. What would you like to work on today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user & dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (!userData.success) {
          router.push("/auth/signin");
          return;
        }
        setUser(userData.data);

        // Fetch dashboard stats
        const statsRes = await fetch("/api/dashboard");
        const statsData = await statsRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputMessage.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    content: inputMessage,
    sender: "user",
    timestamp: new Date(),
  };

  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  const currentInput = inputMessage;
  setInputMessage("");
  setIsTyping(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: currentInput,
        conversationHistory: updatedMessages.slice(1).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          message: m.content,
        })),
      }),
    });

    const data = await res.json();
    console.log("Chat response:", data); // Debug log

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content:
        data.data?.message ||  // ✅ Correct path
        data.error ||          // Show error if exists
        "I'm having trouble processing that. Can you try again?",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Sorry, I couldn't connect to the server. Please try again.",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};

  const quickActions = [
    {
      icon: TrendingUp,
      label: "Log Income",
      action: "I want to log new income",
    },
    {
      icon: Wallet,
      label: "Check Budget",
      action: "Show me my spending breakdown",
    },
    {
      icon: Target,
      label: "View Goals",
      action: "How are my savings goals progressing?",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="text-[#CCFF00] w-10 h-10 fill-[#CCFF00] animate-pulse" />
          <p className="text-gray-400 text-sm">Loading your stash...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex font-sans relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed lg:relative w-80 h-full bg-black/80 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="text-[#CCFF00] w-6 h-6 fill-[#CCFF00]" />
                    <span className="font-bold tracking-tighter text-xl">
                      StashAI
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <button className="w-full bg-[#CCFF00] text-black px-4 py-3 rounded-xl font-semibold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all flex items-center justify-center gap-2">
                  <Plus size={18} />
                  New Conversation
                </button>
              </div>

              {/* Stats Cards in Sidebar */}
              {stats && (
                <div className="p-4 space-y-3">
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-wider px-2">
                    Your Stash
                  </div>

                  <div className="bg-gradient-to-br from-[#CCFF00]/20 to-[#CCFF00]/5 border border-[#CCFF00]/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[#CCFF00] mb-1">
                      <DollarSign size={16} />
                      <span className="text-xs uppercase tracking-wider">
                        30-Day Income
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.totalIncome)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.incomeCount} transactions
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <PiggyBank size={16} />
                      <span className="text-xs uppercase tracking-wider">
                        Total Saved
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.totalSaved)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight size={12} className="text-green-400" />
                      <span className="text-xs text-green-400">
                        {stats.savingsRate}% savings rate
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Target size={16} />
                      <span className="text-xs uppercase tracking-wider">
                        Goals
                      </span>
                    </div>
                    <p className="text-xl font-bold">
                      {stats.activeGoalsCount}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.completedGoalsCount} completed
                    </p>
                  </div>
                </div>
              )}

              {/* User Profile & Settings */}
              <div className="mt-auto p-4 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-3 px-3 py-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#CCFF00]/20 flex items-center justify-center">
                    <User size={20} className="text-[#CCFF00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500">Free Plan</p>
                  </div>
                </div>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">
                  <Settings size={18} className="text-gray-400" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#CCFF00]/50 flex items-center justify-center">
                <Bot size={18} className="text-black" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Stash AI</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400">Ready to help</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Stats Bar - Desktop */}
          {stats && (
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Income</p>
                <p className="text-sm font-semibold text-[#CCFF00]">
                  {formatCurrency(stats.totalIncome)}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Saved</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(stats.totalSaved)}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Goals</p>
                <p className="text-sm font-semibold">
                  {stats.activeGoalsCount}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 font-mono text-[10px] text-gray-600 uppercase tracking-wider">
            <Sparkles size={12} className="text-[#CCFF00]" />
            <span className="hidden sm:inline">Powered by Claude</span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#CCFF00]/50 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-black" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-[70%] ${message.sender === "user" ? "order-1" : ""}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-[#CCFF00] text-black rounded-br-md"
                        : "bg-white/5 border border-white/10 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <div
                    className={`text-[10px] text-gray-500 mt-1 px-1 ${message.sender === "user" ? "text-right" : ""}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#CCFF00]/50 flex items-center justify-center">
                <Bot size={16} className="text-black" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full bg-[#CCFF00]/60 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[#CCFF00]/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[#CCFF00]/60 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-4 sm:px-6 pb-4">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputMessage(action.action);
                    inputRef.current?.focus();
                  }}
                  className="bg-white/5 hover:bg-[#CCFF00]/10 border border-white/10 hover:border-[#CCFF00]/30 rounded-xl p-3 sm:p-4 flex flex-col items-center gap-2 transition-all group"
                >
                  <action.icon
                    size={20}
                    className="text-gray-400 group-hover:text-[#CCFF00] transition-colors"
                  />
                  <span className="text-xs sm:text-sm font-medium text-center">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-4 sm:p-6">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors hidden sm:block"
                title="Attach file"
              >
                <Paperclip size={20} className="text-gray-400" />
              </button>

              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-[#CCFF00] text-black p-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="text-[10px] text-gray-600 mt-3 text-center">
              StashAI may make mistakes. Verify important financial decisions.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
