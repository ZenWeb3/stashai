import { SECURITY_LIMITS } from "./types";
import type { IncomeSource } from "@/types";

export function validateAmount(
  amount: number,
  maxLimit: number,
  context: string,
): string | null {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `${context}: Amount must be a valid number`;
  }
  if (amount < SECURITY_LIMITS.MIN_AMOUNT) {
    return `${context}: Amount must be at least ₦${SECURITY_LIMITS.MIN_AMOUNT}`;
  }
  if (amount > maxLimit) {
    return `${context}: Amount cannot exceed ₦${maxLimit.toLocaleString()}`;
  }
  return null;
}

export function validateSource(source: string): source is IncomeSource {
  const validSources: IncomeSource[] = [
    "hackathon",
    "bounty",
    "freelance",
    "crypto",
    "salary",
    "business",
    "investment",
    "other",
  ];
  return validSources.includes(source as IncomeSource);
}

export function validateDate(dateStr: string): string | null {
  if (!dateStr) return new Date().toISOString().split("T")[0];

  const date = new Date(dateStr);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (isNaN(date.getTime()) || date > today || date < oneYearAgo) return null;
  return dateStr;
}
