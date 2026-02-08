"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface CompleteStepProps {
  nickname: string;
  isLoading: boolean;
  onComplete: () => void;
}

export function CompleteStep({
  nickname,
  isLoading,
  onComplete,
}: CompleteStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-lg mx-auto"
    >
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative mx-auto w-28 h-28 mb-8"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-linear-to-r from-[#CCFF00]/20 via-transparent to-[#CCFF00]/20 rounded-full"
        />
        <div className="relative w-full h-full bg-[#CCFF00]/10 rounded-full flex items-center justify-center border-2 border-[#CCFF00]">
          <Sparkles className="w-12 h-12 text-[#CCFF00]" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl sm:text-4xl font-light tracking-tight mb-3"
      >
        You're all set,{" "}
        <span className="text-[#CCFF00] font-medium">{nickname}</span>!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 text-lg mb-8"
      >
        Your personalized financial dashboard is ready. Let's start building
        your stash!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#CCFF00]/20 rounded-full flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <p className="text-sm text-gray-300">
            <span className="text-[#CCFF00]">AI Assistant</span> — Chat to track
            income & manage goals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#CCFF00]/20 rounded-full flex items-center justify-center">
            <span className="text-sm">📊</span>
          </div>
          <p className="text-sm text-gray-300">
            <span className="text-[#CCFF00]">Smart Insights</span> —
            Personalized financial advice
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#CCFF00]/20 rounded-full flex items-center justify-center">
            <span className="text-sm">🎯</span>
          </div>
          <p className="text-sm text-gray-300">
            <span className="text-[#CCFF00]">Goal Tracking</span> — Watch your
            progress grow
          </p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onComplete}
        disabled={isLoading}
        className="bg-[#CCFF00] text-black px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            Enter Dashboard <ArrowRight size={20} />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
