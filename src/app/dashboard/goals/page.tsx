"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Calendar, TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("/api/goals");
        const data = await res.json();
        if (data.success) {
          setGoals(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Goals</h1>
        <p className="text-gray-400 text-sm">Track your savings goals</p>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No goals yet</p>
          <p className="text-gray-500 text-sm">
            Chat with StashAI to create a savings goal
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal, index) => {
            const progress = Math.round(
              (goal.current_amount / goal.target_amount) * 100,
            );
            const isCompleted = goal.status === "completed";

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 border rounded-2xl p-5 ${
                  isCompleted ? "border-green-500/30" : "border-white/10"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCompleted ? "bg-green-500/10" : "bg-[#CCFF00]/10"
                      }`}
                    >
                      <Target
                        size={20}
                        className={
                          isCompleted ? "text-green-400" : "text-[#CCFF00]"
                        }
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{goal.name}</h3>
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {isCompleted && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">
                      ✓ Done
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span
                      className={
                        isCompleted ? "text-green-400" : "text-[#CCFF00]"
                      }
                    >
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        isCompleted ? "bg-green-500" : "bg-[#CCFF00]"
                      }`}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Saved</p>
                    <p className="text-lg font-bold">
                      ₦{goal.current_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="text-sm text-gray-400">
                      ₦{goal.target_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Remaining */}
                {!isCompleted && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp size={12} />₦
                    {(
                      goal.target_amount - goal.current_amount
                    ).toLocaleString()}{" "}
                    to go
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
