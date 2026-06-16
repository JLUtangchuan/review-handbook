"use client";

import type { InterestLevel } from "@/lib/types";
import { useWeight } from "./WeightContext";

interface InterestBarProps {
  /** Tag names from the note */
  tags: string[];
  /** Compact mode (smaller on cards) */
  compact?: boolean;
}

const OPTIONS: { level: InterestLevel; label: string; emoji: string }[] = [
  { level: "interested", label: "感兴趣", emoji: "👍" },
  { level: "neutral", label: "一般", emoji: "😐" },
  { level: "not_interested", label: "不感兴趣", emoji: "👎" },
];

export default function InterestBar({ tags, compact = false }: InterestBarProps) {
  const { getTagInterest, setTagInterest } = useWeight();

  if (!tags || tags.length === 0) return null;

  // Show per-tag interest controls
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-1.5" : "mt-2"}`}>
      {tags.map((tag) => {
        const current = getTagInterest(tag);
        return (
          <div
            key={tag}
            className={`inline-flex items-center rounded-lg overflow-hidden border ${
              current === "interested"
                ? "border-success/50 bg-success/5"
                : current === "not_interested"
                  ? "border-danger/30 bg-danger/5"
                  : "border-border bg-card"
            } ${compact ? "text-[10px]" : "text-xs"}`}
          >
            {/* Tag name */}
            <span
              className={`px-1.5 py-0.5 font-medium ${
                current === "not_interested" ? "opacity-40" : ""
              }`}
            >
              {tag}
            </span>
            {/* Interest buttons */}
            <div className="flex border-l border-border">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.level}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTagInterest(tag, opt.level);
                  }}
                  title={opt.label}
                  className={`px-1 py-0.5 transition-colors ${
                    current === opt.level
                      ? opt.level === "interested"
                        ? "bg-success/20 text-success"
                        : opt.level === "not_interested"
                          ? "bg-danger/20 text-danger"
                          : "bg-card-hover text-foreground"
                      : "text-muted hover:text-foreground hover:bg-card-hover"
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
