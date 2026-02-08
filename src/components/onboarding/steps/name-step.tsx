"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, ArrowRight } from "lucide-react";

interface NameStepProps {
  initialValue: string;
  onNext: (name: string) => void;
  onBack: () => void;
}

export function NameStep({ initialValue, onNext, onBack }: NameStepProps) {
  const [nickname, setNickname] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onNext(nickname.trim());
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
        <User className="w-10 h-10 text-[#CCFF00]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-light tracking-tight text-center mb-3"
      >
        What should we call you?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 text-center mb-8"
      >
        Pick a nickname that feels right. We'll use it throughout your
        experience.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="relative">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g., Alex, Chief, Boss..."
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all text-center"
          />
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-2">
          {["Boss", "Chief", "Champ", "Legend"].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setNickname(suggestion)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                nickname === suggestion
                  ? "bg-[#CCFF00] text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {suggestion}
            </button>
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
            disabled={!nickname.trim()}
            className="flex-1 bg-[#CCFF00] text-black px-6 py-4 rounded-xl font-bold hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
