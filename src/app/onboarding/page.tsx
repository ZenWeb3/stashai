"use client";
import { OnboardingFlow, OnboardingData } from "@/components/onboarding";

export default function OnboardingPage() {
  const handleComplete = async (data: OnboardingData) => {
    const res = await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to save onboarding data");
    }
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
