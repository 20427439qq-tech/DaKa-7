export type UserRole = "admin" | "jiwei" | "member";

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  password?: string;
  studentId?: number;
  country?: string;
  mustChangePassword?: boolean;
}

export type TaskType = "checkbox" | "image" | "audio" | "file" | "text";

export interface CheckinTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  order: number;
  deadline?: string;
}

export interface HomeworkAnalysis {
  readability: number;
  logic: number;
  philosophy: number;
  reflection: number;
  total: number;
  feedback?: string;
  wordCount?: number;
  uploadTime?: string;
  metadata?: {
    studentId: string;
    bookName: string;
    homeworkNumber: string;
    homeworkDate: string;
    firstLine: string;
  };
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string;
  taskValues: Record<string, any>; // taskId -> value (boolean, string for URL/text)
  challengeNote: string;
  completedCount: number;
  completionRate: number;
  donationAmount: number;
  updatedAt: string;
  country?: string;
  cheers?: string[];
  homeworkAnalysis?: HomeworkAnalysis;
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
  history: DailyCheckin[];
}
