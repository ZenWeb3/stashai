"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, RefreshCw, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  isLoading: boolean;
  error: React.ReactNode;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
}

export function OTPVerification({
  email,
  isLoading,
  error,
  onVerify,
  onResend,
  onBack,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const lastIndex = Math.min(index + digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      
      // Auto-submit if complete
      if (newOtp.every((d) => d !== "")) {
        onVerify(newOtp.join(""));
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((d) => d !== "")) {
      onVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      handleChange(0, pastedData);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    onResend();
    setResendCooldown(60); // 60 second cooldown
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl text-center">
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-[#CCFF00]/20 rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-black/50 rounded-full flex items-center justify-center border border-[#CCFF00]/30">
            <Mail className="w-8 h-8 text-[#CCFF00]" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-2">
          Enter Verification Code
        </h2>

        <p className="text-gray-400 text-sm mb-2">
          We sent a 6-digit code to
        </p>
        <p className="text-[#CCFF00] font-medium mb-8">{email}</p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {inputRefs.current[index] = el}}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 bg-white/5 text-white transition-all focus:outline-none ${
                digit
                  ? "border-[#CCFF00] bg-[#CCFF00]/10"
                  : "border-white/10 focus:border-[#CCFF00]/50"
              } disabled:opacity-50`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => onVerify(otp.join(""))}
          disabled={isLoading || otp.some((d) => !d)}
          className="w-full bg-[#CCFF00] text-black px-6 py-3.5 rounded-xl font-bold text-base hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={resendCooldown > 0 ? "animate-spin" : ""} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
        </button>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} />
            Back to signup
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          Check your inbox
        </div>
      </div>
    </motion.div>
  );
}