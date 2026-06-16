"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Note, UserTagPrefs } from "@/lib/types";
import { computeNoteWeight } from "@/lib/types";

// ============================================================
// SM-2 Spaced Repetition Algorithm (Anki-based)
// Ebbinghaus forgetting curve scheduling
// ============================================================

export type ReviewQuality = "forgot" | "hard" | "good" | "easy";
const Q_VALUES: Record<ReviewQuality, number> = { forgot: 0, hard: 1, good: 2, easy: 3 };

export interface ReviewRecord {
  noteId: string;
  lastReviewDate: string;       // YYYY-MM-DD
  nextReviewDate: string;       // YYYY-MM-DD
  interval: number;             // days until next review
  easeFactor: number;           // SM-2 ease (starts 2.5, min 1.3)
  repetitions: number;          // consecutive good reviews
  reviewCount: number;          // total reviews
  history: { date: string; quality: ReviewQuality }[];
}

const STORAGE_KEY = "rh_reviews";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

// SM-2 Algorithm
function sm2(
  quality: ReviewQuality,
  prevRecord?: ReviewRecord
): {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string;
} {
  const q = Q_VALUES[quality];
  let ef = prevRecord?.easeFactor ?? 2.5;
  let n = prevRecord?.repetitions ?? 0;
  let interval: number;

  if (q < 2) {
    // Forgot or hard: reset
    n = 0;
    interval = 1;
  } else {
    // Good or easy
    if (n === 0) {
      interval = 1;
    } else if (n === 1) {
      interval = 6;
    } else {
      interval = Math.round((prevRecord?.interval ?? 6) * ef);
    }
    n += 1;
  }

  // Update ease factor
  ef = ef + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02));
  ef = Math.max(1.3, ef);

  return {
    interval,
    easeFactor: Math.round(ef * 100) / 100,
    repetitions: n,
    nextReviewDate: addDays(today(), interval),
  };
}

// ============================================================
// Ebbinghaus Urgency: how urgently does this note need review?
// ============================================================

/**
 * Compute Ebbinghaus urgency factor.
 * - 0.3: just reviewed (due far in future)
 * - 1.0: due today
 * - 1.5: overdue by 50%
 * - 3.0: overdue by 3x
 * Max cap at 5.0
 */
export function ebbinghausUrgency(record?: ReviewRecord): number {
  if (!record) return 1.5; // Never reviewed → medium urgency

  const daysSince = daysBetween(record.lastReviewDate, today());
  const interval = record.interval || 1;

  if (interval <= 0) return 1.5;

  const ratio = daysSince / interval;
  return Math.min(5.0, Math.max(0.3, ratio));
}

// ============================================================
// Combined weight for sorting
// ============================================================

export function combinedWeight(
  note: Note,
  userPrefs: UserTagPrefs,
  reviewRecord?: ReviewRecord
): number {
  const tagW = computeNoteWeight(note, userPrefs);
  const urgency = ebbinghausUrgency(reviewRecord);
  return tagW * urgency;
}

// ============================================================
// ReviewContext
// ============================================================

interface ReviewContextValue {
  records: Record<string, ReviewRecord>;
  reviewNote: (noteId: string, quality: ReviewQuality) => void;
  getRecord: (noteId: string) => ReviewRecord | undefined;
  /** Sort notes by combined weight (tag × Ebbinghaus) */
  sortByCombinedWeight: (notes: Note[], userPrefs: UserTagPrefs) => Note[];
  /** Get notes due for review today */
  getDueNotes: (notes: Note[]) => Note[];
  /** Stats */
  dueToday: number;
  totalReviewed: number;
  averageEase: number;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

function loadRecords(): Record<string, ReviewRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRecords(records: Record<string, ReviewRecord>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage may be full
  }
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Record<string, ReviewRecord>>({});

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const reviewNote = useCallback((noteId: string, quality: ReviewQuality) => {
    setRecords((prev) => {
      const prevRecord = prev[noteId];
      const sm2Result = sm2(quality, prevRecord);

      const newRecord: ReviewRecord = {
        noteId,
        lastReviewDate: today(),
        nextReviewDate: sm2Result.nextReviewDate,
        interval: sm2Result.interval,
        easeFactor: sm2Result.easeFactor,
        repetitions: sm2Result.repetitions,
        reviewCount: (prevRecord?.reviewCount ?? 0) + 1,
        history: [
          ...(prevRecord?.history ?? []),
          { date: today(), quality },
        ],
      };

      const next = { ...prev, [noteId]: newRecord };
      saveRecords(next);
      return next;
    });
  }, []);

  const getRecord = useCallback(
    (noteId: string) => records[noteId],
    [records]
  );

  const sortByCombinedWeight = useCallback(
    (notes: Note[], userPrefs: UserTagPrefs): Note[] => {
      return [...notes].sort((a, b) => {
        const wa = combinedWeight(a, userPrefs, records[a.id]);
        const wb = combinedWeight(b, userPrefs, records[b.id]);
        return wb - wa;
      });
    },
    [records]
  );

  const getDueNotes = useCallback(
    (notes: Note[]): Note[] => {
      const todayStr = today();
      return notes.filter((n) => {
        const r = records[n.id];
        if (!r) return true; // Never reviewed → due
        return r.nextReviewDate <= todayStr;
      });
    },
    [records]
  );

  const stats = useMemo(() => {
    const all = Object.values(records);
    const todayStr = today();
    return {
      dueToday: all.filter((r) => r.nextReviewDate <= todayStr).length,
      totalReviewed: all.length,
      averageEase:
        all.length > 0
          ? Math.round(
              (all.reduce((s, r) => s + r.easeFactor, 0) / all.length) * 100
            ) / 100
          : 2.5,
    };
  }, [records]);

  const value = useMemo<ReviewContextValue>(
    () => ({
      records,
      reviewNote,
      getRecord,
      sortByCombinedWeight,
      getDueNotes,
      ...stats,
    }),
    [records, reviewNote, getRecord, sortByCombinedWeight, getDueNotes, stats]
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

export function useReview(): ReviewContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used within ReviewProvider");
  return ctx;
}
