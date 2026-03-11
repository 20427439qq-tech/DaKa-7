export type UserRole = "admin" | "jiwei" | "member";

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  password?: string;
  studentId?: number;
}

export type TaskKey =
  | "wakeUpAt8"
  | "focusOneHour"
  | "exercise30Min"
  | "read10Pages"
  | "learnNewSkill"
  | "noJunkFood";

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string;
  wakeUpAt8: boolean;
  focusOneHour: boolean;
  exercise30Min: boolean;
  read10Pages: boolean;
  learnNewSkill: boolean;
  noJunkFood: boolean;
  challengeNote: string;
  completedCount: number;
  completionRate: number;
  donationAmount: number;
  updatedAt: string;
  country?: string;
  cheers?: string[];
}

export interface TaskConfig {
  key: TaskKey;
  title: string;
  description: string;
}

export interface DonationDetail {
  name: string;
  reason: string;
  amount: number;
}

export interface DailyDonationHistory {
  date: string;
  amount: number;
  details: DonationDetail[];
}

export interface TeamStats {
  totalMembers: number;
  checkedInCount: number;
  notCheckedInCount: number;
  totalDonation: number;
  totalAccumulatedDonation: number;
  missingNoteCount: number;
  averageCompletionRate: number;
}

export interface PersonalStats {
  totalDays: number;
  totalDonation: number;
  averageRate: number;
  streakDays: number;
}
