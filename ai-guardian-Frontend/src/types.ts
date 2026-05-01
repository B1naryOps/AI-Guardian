export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  vigilance_score?: number;
  xp?: number;
  level?: string;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  content: string;
  score: number;
  classification: 'Safe' | 'Suspicious' | 'Dangerous';
  explanation: string;
  created_at: string;
}

export interface UserStats {
  total_analyses: number;
  threats_detected: number;
  danger_rate: number;
}
