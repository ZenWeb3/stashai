export interface ChatRequestInput {
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    message: string;
  }>;
}

export interface GoalWithProgress {
  name: string;
  target: number;
  current: number;
  progress: number;
  deadline: string | null;
}

export interface UserContext {
  totalIncome: number;
  incomeCount: number;
  goals: GoalWithProgress[];
  nickname?: string;
  incomeSources?: string[];
}

export const SECURITY_LIMITS = {
  MAX_INCOME_AMOUNT: 10000000, // 10 million naira
  MAX_GOAL_UPDATE: 5000000,
  MIN_AMOUNT: 0.01,
  MAX_ACTIONS_PER_MESSAGE: 3,
};
