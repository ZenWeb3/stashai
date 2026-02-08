"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Target, ArrowRight, Check } from "lucide-react";

interface GoalsStepProps {
  initialValue: string[];
  onNext: (goals: string[]) => void;
  onBack: () => void;
}

const financialGoals = [
  { id: "emergency", label: "Build Emergency Fund", emoji: "🛡️" },
  { id: "save", label: "Save More Money", emoji: "💰" },
  { id: "invest", label: "Start Investing", emoji: "📈" },
  { id: "debt", label: "Pay Off Debt", emoji: "💳" },
  { id: "track", label: "Track My Spending", emoji: "📊" },
  { id: "budget", label: "Stick to a Budget", emoji: "🎯" },
  { id: "passive", label: "Build Passive Income", emoji: "🏖️" },
  { id: "retire", label: "Plan for Retirement", emoji: "🌴" },
];

export function GoalsStep({ initialValue, onNext, onBack }: GoalsStepProps) {
  const [selected, setSelected] = useState<string[]>(initialValue);

  const toggleGoal = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length > 0) {
      onNext(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-20 h-20 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#CCFF00]/30"
      >
        <Target className="w-10 h-10 text-[#CCFF00]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-light tracking-tight text-center mb-3"
      >
        What are your financial goals?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 text-center mb-8"
      >
        Select what matters most to you right now.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-3">
          {financialGoals.map((goal, index) => (
            <motion.button
              key={goal.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => toggleGoal(goal.id)}
              className={`relative p-4 rounded-xl border transition-all text-left ${
                selected.includes(goal.id)
                  ? "bg-[#CCFF00]/10 border-[#CCFF00] text-white"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {selected.includes(goal.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#CCFF00] rounded-full flex items-center justify-center">
                  <Check size={12} className="text-black" />
                </div>
              )}
              <span className="text-2xl mb-2 block">{goal.emoji}</span>
              <span className="text-sm font-medium">{goal.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 rounded-xl font-medium transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={selected.length === 0}
            className="flex-1 bg-[#CCFF00] text-black px-6 py-4 rounded-xl font-bold hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
