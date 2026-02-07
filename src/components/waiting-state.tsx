"use client";
import React from "react";
import { motion } from "framer-motion";
import { MailCheck, RefreshCw, Loader2 } from "lucide-react";

interface WaitingStateProps {
  email: string;
  isLoading: boolean;
  error: React.ReactNode;
  onResendEmail: () => void;
  onBack: () => void;
}

export function WaitingState({
  email,
  isLoading,
  error,
  onResendEmail,
  onBack,
}: WaitingStateProps) {
  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
        {/* Animated Mail Icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-[#CCFF00]/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-[#CCFF00]/10 rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-black/50 rounded-full flex items-center justify-center border border-[#CCFF00]/30">
            <MailCheck className="w-10 h-10 text-[#CCFF00]" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-3">
          Check Your Email
        </h2>

        <p className="text-gray-400 mb-2">We've sent a confirmation link to</p>
        <p className="text-[#CCFF00] font-medium mb-6">{email}</p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300">
            Click the link in your email to verify your account. The link will
            expire in 24 hours.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={onResendEmail}
          disabled={isLoading}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RefreshCw size={16} />
              Resend Confirmation Email
            </>
          )}
        </button>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-3">
            Didn't receive the email? Check your spam folder.
          </p>
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to signup
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          Waiting for confirmation
        </div>
      </div>
    </motion.div>
  );
}
