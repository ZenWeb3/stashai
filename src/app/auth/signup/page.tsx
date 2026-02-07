"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WaitingState, VerifiedState } from "@/components";

type AuthState = "form" | "waiting" | "verified";

export default function SignupPage() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");
  const [authState, setAuthState] = useState<AuthState>("form");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setAuthState("verified");
    }

    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setAuthState("form");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
        }),
      });

      console.log("Response status:", res.status); // Debug

      const data = await res.json();
      console.log("Response data:", data); // Debug

      if (data.success) {
        if (data.data?.emailConfirmationRequired) {
          setAuthState("waiting");
        } else if (data.data?.session) {
          window.location.href = "/dashboard";
        }
      } else {
        if (data.code === "EMAIL_EXISTS") {
          setError(
            <>
              An account with this email already exists.{" "}
              <Link href="/auth/signin" className="text-[#CCFF00] underline">
                Sign in instead
              </Link>
            </>,
          );
        } else {
          setError(data.error || "Signup failed. Please try again.");
        }
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to resend email");
      }
    } catch (err) {
      setError("Failed to resend confirmation email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    if (name === "password") {
      let score = 0;
      if (value.length >= 8) score++;
      if (value.length >= 12) score++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^a-zA-Z0-9]/.test(value)) score++;

      if (score >= 4) setPasswordStrength("strong");
      else if (score >= 2) setPasswordStrength("medium");
      else setPasswordStrength("weak");
    }
  };

  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== "";
  const passwordLength = formData.password.length >= 8;

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background */}
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
        <AnimatePresence mode="wait">
          {/* WAITING STATE */}
          {authState === "waiting" && (
            <WaitingState
              email={formData.email}
              isLoading={isLoading}
              error={error}
              onResendEmail={handleResendEmail}
              onBack={() => {
                setAuthState("form");
                setError("");
              }}
            />
          )}

          {/* VERIFIED STATE */}
          {authState === "verified" && <VerifiedState />}

          {/* FORM STATE */}
          {authState === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-3">
                    Create Account
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Start managing your money like a pro
                  </p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
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
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all"
                      />
                    </div>
                    {formData.password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1">
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength === "weak"
                                ? "bg-red-500"
                                : passwordStrength === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-[#CCFF00]"
                            }`}
                          />
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength === "medium"
                                ? "bg-yellow-500"
                                : passwordStrength === "strong"
                                  ? "bg-[#CCFF00]"
                                  : "bg-white/10"
                            }`}
                          />
                          <div
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength === "strong"
                                ? "bg-[#CCFF00]"
                                : "bg-white/10"
                            }`}
                          />
                        </div>
                        <p
                          className={`text-xs ${
                            passwordStrength === "weak"
                              ? "text-red-400"
                              : passwordStrength === "medium"
                                ? "text-yellow-400"
                                : "text-[#CCFF00]"
                          }`}
                        >
                          {passwordStrength === "weak" &&
                            "Weak — add numbers, symbols, uppercase"}
                          {passwordStrength === "medium" &&
                            "Medium — getting better!"}
                          {passwordStrength === "strong" && "Strong password ✓"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all"
                      />
                      {formData.confirmPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {passwordsMatch ? (
                            <Check size={18} className="text-[#CCFF00]" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-white/10 bg-white/5 text-[#CCFF00] focus:ring-[#CCFF00]/50"
                      />
                      <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !agreedToTerms ||
                      !passwordsMatch ||
                      !passwordLength
                    }
                    className="w-full bg-[#CCFF00] text-black px-6 py-3.5 rounded-lg font-bold text-base hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-[#CCFF00] hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
