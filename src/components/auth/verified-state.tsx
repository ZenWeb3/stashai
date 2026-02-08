"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, LogIn } from "lucide-react";
import Link from "next/link";

export function VerifiedState() {
  return (
    <motion.div
      key="verified"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
        {/* Success Icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-[#CCFF00]/20 rounded-full" />
          <div className="relative w-full h-full bg-[#CCFF00]/10 rounded-full flex items-center justify-center border-2 border-[#CCFF00]">
            <CheckCircle className="w-12 h-12 text-[#CCFF00]" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-3">
          Email Verified!
        </h2>

        <p className="text-gray-400 mb-8">
          Your account has been verified successfully. You can now sign in to
          start managing your finances.
        </p>

        <Link
          href="/auth/signin"
          className="w-full bg-[#CCFF00] text-black px-6 py-3.5 rounded-lg font-bold text-base hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <LogIn size={18} />
          Sign In Now
        </Link>
      </div>

      <div className="mt-6 text-center">
        <div className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
          Account Ready
        </div>
      </div>
    </motion.div>
  );
}
