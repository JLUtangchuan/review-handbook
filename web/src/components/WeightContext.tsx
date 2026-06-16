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
import type { Note, UserTagPrefs, InterestLevel } from "@/lib/types";
import { INTEREST_WEIGHTS, computeNoteWeight } from "@/lib/types";

const STORAGE_KEY = "rh_tag_prefs";

interface WeightContextValue {
  /** User tag preferences */
  prefs: UserTagPrefs;
  /** Set interest level for a tag */
  setTagInterest: (tagName: string, level: InterestLevel) => void;
  /** Get interest level for a tag */
  getTagInterest: (tagName: string) => InterestLevel;
  /** Sort notes by computed weight (descending) */
  sortByWeight: (notes: Note[]) => Note[];
  /** Compute weight for a single note */
  noteWeight: (note: Note) => number;
  /** Max weight among current notes (for normalization) */
  maxWeight: number;
  /** Set max weight reference */
  setMaxWeight: (w: number) => void;
}

const WeightContext = createContext<WeightContextValue | null>(null);

function loadPrefs(): UserTagPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: UserTagPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage full or disabled
  }
}

export function WeightProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserTagPrefs>({});
  const [maxWeight, setMaxWeight] = useState(5.0);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const setTagInterest = useCallback(
    (tagName: string, level: InterestLevel) => {
      setPrefs((prev) => {
        const next = { ...prev, [tagName]: INTEREST_WEIGHTS[level] };
        savePrefs(next);
        return next;
      });
    },
    []
  );

  const getTagInterest = useCallback(
    (tagName: string): InterestLevel => {
      const w = prefs[tagName];
      if (w === undefined || w === 1.0) return "neutral";
      if (w >= 2.0) return "interested";
      return "not_interested";
    },
    [prefs]
  );

  const noteWeight = useCallback(
    (note: Note) => computeNoteWeight(note, prefs),
    [prefs]
  );

  const sortByWeight = useCallback(
    (notes: Note[]): Note[] => {
      return [...notes].sort((a, b) => {
        const w = computeNoteWeight(b, prefs) - computeNoteWeight(a, prefs);
        if (Math.abs(w) > 0.001) return w > 0 ? 1 : -1;
        // Tiebreak: higher difficulty first
        return b.difficulty - a.difficulty;
      });
    },
    [prefs]
  );

  const value = useMemo<WeightContextValue>(
    () => ({
      prefs,
      setTagInterest,
      getTagInterest,
      sortByWeight,
      noteWeight,
      maxWeight,
      setMaxWeight,
    }),
    [prefs, setTagInterest, getTagInterest, sortByWeight, noteWeight, maxWeight]
  );

  return (
    <WeightContext.Provider value={value}>{children}</WeightContext.Provider>
  );
}

export function useWeight(): WeightContextValue {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight must be used within WeightProvider");
  return ctx;
}
