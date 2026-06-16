// ============================================================
// 复习手册 — Utility Functions
// ============================================================

/**
 * Format a date string (YYYY-MM-DD) to Chinese display format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * Format date range for display
 */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayStr(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/**
 * Calculate days between two date strings
 */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Convert difficulty number to label
 */
export function difficultyLabel(d: number): string {
  const labels: Record<number, string> = {
    1: "入门",
    2: "基础",
    3: "中等",
    4: "较难",
    5: "困难",
  };
  return labels[d] ?? "未知";
}

/**
 * Convert difficulty to color class
 */
export function difficultyColor(d: number): string {
  const colors: Record<number, string> = {
    1: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    2: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    4: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    5: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[d] ?? colors[3];
}

/**
 * Note type display label
 */
export function noteTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    foundation: "基础知识",
    interview_qa: "面试问答",
    advanced: "进阶知识",
    coding: "Coding",
    paper: "推荐论文",
  };
  return labels[type] ?? type;
}

/**
 * Note type icon
 */
export function noteTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    foundation: "📖",
    interview_qa: "💬",
    advanced: "🚀",
    coding: "💻",
    paper: "📄",
  };
  return icons[type] ?? "📝";
}

/**
 * Platform display name
 */
export function platformLabel(platform: string): string {
  const labels: Record<string, string> = {
    xiaohongshu: "小红书",
    zhihu: "知乎",
    other: "其他",
  };
  return labels[platform] ?? platform;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

/**
 * Generate a slug from text (for note IDs)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
