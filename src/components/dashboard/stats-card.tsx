"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "lime" | "blue" | "purple" | "orange";
}

const colorClasses = {
  lime: {
    bg: "bg-[#CCFF00]/10",
    border: "border-[#CCFF00]/30",
    text: "text-[#CCFF00]",
    icon: "text-[#CCFF00]",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    icon: "text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    icon: "text-purple-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    icon: "text-orange-400",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "lime",
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} border ${colors.border} rounded-2xl p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border}`}>
          <Icon size={20} className={colors.icon} />
        </div>
        {trend && (
          <div
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}