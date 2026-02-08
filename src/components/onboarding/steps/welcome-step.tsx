"use client";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-lg mx-auto"
    >
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
        className="relative mx-auto w-28 h-28 mb-8"
      >
        <div className="absolute inset-0 bg-[#CCFF00]/20 rounded-full animate-ping" />
        <div className="absolute inset-2 bg-[#CCFF00]/10 rounded-full animate-pulse" />
        <div className="relative w-full h-full bg-black/50 rounded-full flex items-center justify-center border-2 border-[#CCFF00]/50">
          <Zap className="w-12 h-12 text-[#CCFF00] fill-[#CCFF00]" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl sm:text-5xl font-light tracking-tight mb-4"
      >
        Welcome to <span className="text-[#CCFF00] font-medium">StashAI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-400 text-lg mb-8"
      >
        Your AI-powered financial companion for building wealth, one stash at a
        time.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
      >
        <p className="text-sm text-gray-300">
          Let's personalize your experience. This will only take a minute.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onNext}
        className="bg-[#CCFF00] text-black px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto"
      >
        Let's Go <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
}
