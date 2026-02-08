"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  WelcomeStep,
  NameStep,
  IncomeStep,
  GoalsStep,
  CompleteStep,
} from "./steps";

export interface OnboardingData {
  nickname: string;
  incomeSources: string[];
  financialGoals: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => Promise<void>;
}

type Step = "welcome" | "name" | "income" | "goals" | "complete";

const steps: Step[] = ["welcome", "name", "income", "goals", "complete"];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    nickname: "",
    incomeSources: [],
    financialGoals: [],
  });

  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Progress Bar */}
      {currentStep !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-[#CCFF00] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Indicators */}
      {currentStep !== "welcome" && currentStep !== "complete" && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2">
            {steps.slice(1, -1).map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  steps.indexOf(step) <= currentIndex
                    ? "bg-[#CCFF00]"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {currentStep === "welcome" && (
            <WelcomeStep key="welcome" onNext={goToNext} />
          )}

          {currentStep === "name" && (
            <NameStep
              key="name"
              initialValue={data.nickname}
              onNext={(nickname) => {
                setData((prev) => ({ ...prev, nickname }));
                goToNext();
              }}
              onBack={goBack}
            />
          )}

          {currentStep === "income" && (
            <IncomeStep
              key="income"
              initialValue={data.incomeSources}
              onNext={(incomeSources) => {
                setData((prev) => ({ ...prev, incomeSources }));
                goToNext();
              }}
              onBack={goBack}
            />
          )}

          {currentStep === "goals" && (
            <GoalsStep
              key="goals"
              initialValue={data.financialGoals}
              onNext={(financialGoals) => {
                setData((prev) => ({ ...prev, financialGoals }));
                goToNext();
              }}
              onBack={goBack}
            />
          )}

          {currentStep === "complete" && (
            <CompleteStep
              key="complete"
              nickname={data.nickname}
              isLoading={isLoading}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
