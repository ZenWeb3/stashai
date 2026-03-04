
"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for verification success
    if (searchParams.get("verified") === "true") {
      setSuccessMessage("Email verified! You can now sign in.");
    }

    // Check for errors
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(circle at center, black 40%, transparent 90%)",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="text-[#CCFF00] w-5 h-5 fill-[#CCFF00]" />
          <span className="font-bold tracking-tighter text-xl">StashAI</span>
        </Link>
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-3">
                Welcome Back
              </h1>
              <p className="text-gray-400 text-sm">
                Sign in to continue growing your stash
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-lg p-3 text-sm text-[#CCFF00] flex items-center gap-2">
                <CheckCircle size={18} />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#CCFF00] text-black px-6 py-3.5 rounded-lg font-bold text-base hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-[#CCFF00] hover:underline font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <div className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              Secured & Encrypted
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
