"use client";
import { motion } from "framer-motion";
import { Target, Calendar, TrendingUp } from "lucide-react";

interface GoalCardProps {
  name: string;
  current: number;
  target: number;
  deadline?: string | null;
  onAddFunds?: () => void;
}

export function GoalCard({ name, current, target, deadline, onAddFunds }: GoalCardProps) {
  const progress = Math.min(Math.round((current / target) * 100), 100);
  const isCompleted = progress >= 100;
  const remaining = Math.max(target - current, 0);

  // Format deadline
  const formatDeadline = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/5 border rounded-2xl p-5 transition-all hover:border-[#CCFF00]/30 ${
        isCompleted ? "border-green-500/30" : "border-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCompleted
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-[#CCFF00]/10 border border-[#CCFF00]/30"
            }`}
          >
            <Target
              size={20}
              className={isCompleted ? "text-green-400" : "text-[#CCFF00]"}
            />
          </div>
          <div>
            <h3 className="font-semibold text-white">{name}</h3>
            {deadline && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                {formatDeadline(deadline)}
              </div>
            )}
          </div>
        </div>

        {isCompleted && (
          <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
            ✓ Completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className={isCompleted ? "text-green-400" : "text-[#CCFF00]"}>
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isCompleted
                ? "bg-green-500"
                : "bg-linear-to-r from-[#CCFF00] to-[#CCFF00]/70"
            }`}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-500">Saved</p>
          <p className="text-lg font-bold text-white">
            ₦{current.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Target</p>
          <p className="text-sm text-gray-400">₦{target.toLocaleString()}</p>
        </div>
      </div>

      {/* Remaining */}
      {!isCompleted && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp size={12} />
            ₦{remaining.toLocaleString()} to go
          </div>
          {onAddFunds && (
            <button
              onClick={onAddFunds}
              className="text-xs text-[#CCFF00] hover:underline font-medium"
            >
              + Add funds
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}