export interface User {
  id: string;
  email: string;
  full_name?: string;
  currency?: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

export type IncomeSource =
  | "hackathon"
  | "bounty"
  | "freelance"
  | "crypto"
  | "other";

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  source: IncomeSource;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomeInput {
  amount: number;
  source: IncomeSource;
  date: string;
  notes?: string;
}

export interface UpdateIncomeInput {
  amount?: number;
  source?: IncomeSource;
  date?: string;
  notes?: string;
}

export type GoalStatus = "active" | "completed" | "paused";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
}

export interface UpdateGoalInput {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  status?: GoalStatus;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  role: ChatRole;
  timestamp: string;
  created_at: string;
}

export interface SendMessageInput {
  message: string;
}

export interface ChatResponse {
  message: string;
  role: "assistant";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface IncomeStats {
  total: number;
  average: number;
  bySource: {
    source: IncomeSource;
    amount: number;
  }[];
}

export interface GoalProgress {
  id: string;
  name: string;
  progress: number; // percentage
  remaining: number;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  metadata?: {
    full_name?: string;
    avatar_url?: string;
    preferences?: {
      currency?: string;
      notifications_enabled?: boolean;
    };
  };
}

export interface UserStats {
  total_income: number;
  total_goals: number;
  account_age_days: number;
  last_activity: string;
}

export interface UserResponse {
  profile: UserProfile;
  stats: UserStats;
}

export interface UpdateUserInput {
  full_name?: string;
  avatar_url?: string;
  preferences?: {
    currency?: string;
    notifications_enabled?: boolean;
  };
}
