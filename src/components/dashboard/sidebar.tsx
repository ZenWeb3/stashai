"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
}

interface SidebarProps {
  user: any;
  stats: {
    totalIncome?: number;
    totalSaved?: number;
    availableBalance?: number;
    activeGoals?: number;
    goals?: Goal[];
  } | null;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Chat", href: "/dashboard" },
  { icon: TrendingUp, label: "Income", href: "/dashboard/income" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({
  user,
  stats,
  onLogout,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  const nickname =
    user?.user_metadata?.nickname ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "User";

  const email = user?.email || "";

  /** 🔑 Sync sidebar width globally */
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "80px" : "280px",
    );
  }, [isCollapsed]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="
        fixed top-0 left-0 z-40
        h-screen
        bg-black/40 backdrop-blur-xl
        border-r border-white/10
        flex flex-col
      "
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="
          absolute -right-3 top-8
          w-6 h-6
          bg-[#CCFF00]
          rounded-full
          flex items-center justify-center
          text-black
          hover:scale-110
          transition
          z-50
        "
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-full flex items-center justify-center border border-[#CCFF00]/30">
          <Zap className="w-5 h-5 text-[#CCFF00] fill-[#CCFF00]" />
        </div>
      </div>

      {/* User */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div
          className={`bg-white/5 rounded-xl p-4 border border-white/10 ${
            isCollapsed ? "flex justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CCFF00]/20 rounded-full flex items-center justify-center">
              <User size={20} className="text-[#CCFF00]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="font-medium text-sm text-white">{nickname}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                  {email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {!isCollapsed && stats && (
        <div className="px-4 mb-4 space-y-2 flex-shrink-0">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-gray-500">30-Day Income</p>
            <p className="text-sm font-bold text-[#CCFF00]">
              ₦{stats.totalIncome?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-[#CCFF00]/5 rounded-lg p-3 border border-[#CCFF00]/20">
            <p className="text-xs text-gray-500">Available</p>
            <p className="text-sm font-bold text-white">
              ₦
              {(
                (stats.totalIncome || 0) - (stats.totalSaved || 0)
              ).toLocaleString()}
            </p>
          </div>

          <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
            <p className="text-xs text-gray-500">Total Saved</p>
            <p className="text-sm font-bold text-green-400">
              ₦{stats.totalSaved?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}

      {/* Goals */}
      {!isCollapsed && stats?.goals?.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Active Goals
          </p>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {stats.goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-white truncate max-w-[130px]">
                    {goal.name}
                  </p>
                  <span className="text-[10px] font-bold text-[#CCFF00]">
                    {goal.progress}%
                  </span>
                </div>

                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#CCFF00]"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <p className="text-[10px] text-gray-500 mt-1">
                  ₦{goal.current_amount.toLocaleString()} / ₦
                  {goal.target_amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
