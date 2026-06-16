// ============================================================
// 复习手册 — TypeScript Type Definitions
// ============================================================

// --- config.yaml ---
export interface UserConfig {
  target_role: string;
  roles: Record<string, RoleConfig>;
  language: string;
  start_date: string;
  model?: string; // Claude model for the skill (e.g., "deepseek-v4-flash")
}

export interface RoleConfig {
  focus_areas: string[];
}

// --- topics.yaml ---
export interface TopicTree {
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  icon?: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  name: string;
}

// --- roadmap.yaml ---
export interface Roadmap {
  role: string;
  start_date: string;
  total_days: number;
  total_weeks: number;
  weeks: WeekPlan[];
}

export interface WeekPlan {
  week: number;
  theme: string;
  start_date: string;
  end_date: string;
  day_range: [number, number];
  topics: string[];
  content: WeekContent;
}

export interface WeekContent {
  foundations: ContentRef[];
  interview_qa: ContentRef[];
  advanced: ContentRef[];
  coding: ContentRef[];
  papers: ContentRef[];
}

export interface ContentRef {
  note_id: string;
  title?: string;
  question?: string;
  topics: string[];
  arxiv_id?: string;
  leetcode_id?: string; // for coding type
}

// --- Note Types ---
// 基础知识 | 面试问答 | 进阶知识 | Coding | 推荐论文
export type NoteType = "foundation" | "interview_qa" | "advanced" | "coding" | "paper";

// --- Tag with initial weight ---
export interface TagWeight {
  name: string;
  initial_weight: number; // 0.5 ~ 2.0, default 1.0
}

// --- User tag preferences (stored in localStorage) ---
// Key: tag name, Value: user preference multiplier
// "感兴趣" = 2.0, "一般" = 1.0, "不感兴趣" = 0.3
export type UserTagPrefs = Record<string, number>;

export type InterestLevel = "interested" | "neutral" | "not_interested";
export const INTEREST_WEIGHTS: Record<InterestLevel, number> = {
  interested: 2.0,
  neutral: 1.0,
  not_interested: 0.3,
};

// --- Individual Note (notes/{type}/{id}.yaml) ---
export interface Note {
  id: string;
  title: string;
  type: NoteType;
  week: number;
  topics: string[];
  tags: TagWeight[]; // Changed from string[] to TagWeight[]
  sources: NoteSource[];
  images?: NoteImage[];    // images from the source post (especially 小红书)
  summary?: string;
  key_points?: string[];
  question?: string;
  answer?: string;
  code_snippet?: string; // for coding type
  follow_up?: string[];
  review_questions?: string[];
  difficulty: number; // 1-5
  status: NoteStatus;
  rating: number; // user self-rating 1-5
  // Recommendations: related note IDs
  recommendations?: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteImage {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export type NoteStatus = "pending" | "in_progress" | "completed";

export interface NoteSource {
  platform: "xiaohongshu" | "zhihu" | "other";
  url: string;
  title: string;
  saved_at: string;
}

// --- progress.yaml ---
export interface Progress {
  current_week: number;
  current_day: number;
  total_days: number;
  completed_days: number[];
  completed_items: Record<string, CompletedItem>;
  weekly_notes: Record<string, string>;
  streak: Streak;
}

export interface CompletedItem {
  completed_at: string;
  rating: number;
}

export interface Streak {
  current: number;
  longest: number;
}

// --- Weight computation ---

/** Compute combined weight for a note given user tag preferences */
export function computeNoteWeight(note: Note, userPrefs: UserTagPrefs): number {
  if (!note.tags || note.tags.length === 0) return 1.0;
  return note.tags.reduce((sum, tw) => {
    const userMult = userPrefs[tw.name] ?? 1.0;
    return sum + tw.initial_weight * userMult;
  }, 0);
}

/** Compute normalized weight (0..1) for display */
export function normalizedWeight(weight: number, maxWeight: number): number {
  if (maxWeight <= 0) return 0.5;
  return Math.min(1, Math.max(0, weight / maxWeight));
}

// --- Derived / UI types ---

export interface WeekProgress {
  week: number;
  total: number;
  completed: number;
  percentage: number;
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  totalNotes: number;
  completedNotes: number;
  averageDifficulty: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// --- Saved state (localStorage) ---
export interface SavedState {
  completedItems: Record<string, CompletedItem>;
  tagPreferences: UserTagPrefs;
  currentWeek: number;
  currentDay: number;
}
