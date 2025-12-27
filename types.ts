
export type Priority = 'low' | 'medium' | 'high';
export type GoalCategory = 'personal' | 'career' | 'health' | 'fitness' | 'learning' | 'finance' | 'other';
export type Timeframe = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type TransactionType = 'expense' | 'income';
export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected';
export type ProjectStatus = 'active' | 'completed' | 'pending';

export interface ChecklistItem {
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  timeframe: Timeframe;
  deadline: string | null;
  checklistItems: ChecklistItem[];
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  goalId: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface LearningLog {
  id: string;
  topic: string;
  details: string;
  resource: string;
  timeSpent: number; // minutes
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  completions: string[]; // Array of date strings (YYYY-MM-DD)
}

export interface Reminder {
  id: string;
  text: string;
  time: string; // ISO String
  type: 'system' | 'custom' | 'deadline';
  priority: Priority;
  notified: boolean;
  dismissed: boolean;
  link?: string; // Optional link to a module (e.g., 'tasks')
  relatedId?: string; // ID of the related source object (Task, Goal, etc.)
}

export interface JobApplication {
  id: string;
  role: string;
  company: string;
  status: ApplicationStatus;
  date: string;
  link?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  deadline?: string;
  value?: number;
}

// Portfolio Types
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-100
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface UserProfile {
  name: string;
  title: string;
  avatar?: string;
}

// Islam Module Types
export type HifzStatus = 'new' | 'weak' | 'good' | 'strong' | 'mastered';
export type AzkarCategory = 'morning' | 'evening' | 'sleep' | 'prayer' | 'general';

export interface HifzItem {
  id: string;
  surahName: string;
  juzNumber?: number;
  status: HifzStatus;
  lastRevised: string;
}

export interface QuranProgress {
  currentJuz: number;
  currentPage: number;
  totalKhatams: number;
  lastReadDate: string;
}

export interface AzkarItem {
  id: string;
  text: string;
  category: AzkarCategory;
  count: number; // Current count for today
  target: number; // Target count (e.g. 33, 100, 1)
  completed: boolean;
}

export interface TasbihWidget {
  id: string;
  label: string;
  count: number;
  target: number;
}

export interface PrayerTracker {
  date: string; // YYYY-MM-DD
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface IslamData {
  quran: QuranProgress;
  hifz: HifzItem[];
  dailyAzkar: AzkarItem[];
  tasbihs: TasbihWidget[];
  prayerTracker: PrayerTracker; // Current day state
  prayerHistory: PrayerTracker[]; // History of previous days
}

export interface AppData {
  profile: UserProfile;
  tasks: Task[];
  goals: Goal[];
  learnings: LearningLog[];
  health: {
    habits: Habit[];
    workouts: any[];
    weight: any[];
    energy: any[];
  };
  finance: {
    transactions: Transaction[];
    budgets: any[];
    savings: any[];
  };
  reminders: Reminder[];
  settings: {
    theme: 'dark' | 'light';
  };
  career: { 
    applications: JobApplication[];
    interviews: any[];
    goals: any[];
  };
  freelance: { 
    projects: Project[];
    clients: any[];
    timeEntries: any[];
  };
  portfolio: { 
    items: PortfolioItem[];
    certifications: Certification[];
    skills: Skill[];
    links: SocialLink[];
  };
  islam: IslamData;
}

export type ModuleType = 'dashboard' | 'goals' | 'tasks' | 'calendar' | 'learning' | 'health' | 'finance' | 'achievements' | 'career' | 'freelance' | 'portfolio' | 'settings' | 'islam' | 'notifications';
