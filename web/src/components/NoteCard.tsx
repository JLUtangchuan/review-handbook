"use client";

import type { Note } from "@/lib/types";
import { difficultyColor, difficultyLabel, noteTypeIcon, platformLabel } from "@/lib/utils";
import { useReview, ebbinghausUrgency } from "./ReviewContext";
import InterestBar from "./InterestBar";

interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  compact?: boolean;
}

function UrgencyDot({ urgency }: { urgency: number }) {
  if (urgency >= 2.0) {
    return <span className="w-2 h-2 rounded-full bg-red-500" title="急需复习" />;
  }
  if (urgency >= 1.0) {
    return <span className="w-2 h-2 rounded-full bg-yellow-500" title="待复习" />;
  }
  if (urgency >= 0.5) {
    return <span className="w-2 h-2 rounded-full bg-blue-500" title="近期已复习" />;
  }
  return <span className="w-2 h-2 rounded-full bg-green-500" title="记忆牢固" />;
}

export default function NoteCard({ note, onSelect, compact = false }: NoteCardProps) {
  const tagNames = note.tags?.map((t) => t.name) ?? [];
  const { getRecord } = useReview();
  const record = getRecord(note.id);
  const urgency = ebbinghausUrgency(record);

  return (
    <div
      onClick={() => onSelect(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(note); }}
      className={`w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-card-hover transition-colors cursor-pointer ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type icon + urgency dot */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-xl mt-0.5">{noteTypeIcon(note.type)}</span>
          {record && <UrgencyDot urgency={urgency} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold text-foreground leading-snug ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {note.title}
            </h3>
            {record && (
              <span className="text-[10px] text-muted shrink-0">
                {record.reviewCount}次
              </span>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(
                note.difficulty
              )}`}
            >
              {difficultyLabel(note.difficulty)}
            </span>

            {note.status === "completed" && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">
                已完成
              </span>
            )}
            {note.status === "in_progress" && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                进行中
              </span>
            )}

            <span className="text-[11px] text-muted">
              {note.sources.map((s) => platformLabel(s.platform)).join(" · ")}
            </span>

            {note.recommendations && note.recommendations.length > 0 && (
              <span className="text-[11px] text-accent">
                🔗 {note.recommendations.length} 推荐
              </span>
            )}
          </div>

          {/* Summary preview (non-compact mode) */}
          {!compact && note.summary && (
            <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
              {note.summary}
            </p>
          )}

          {/* InterestBar: per-tag weight controls */}
          <div onClick={(e) => e.stopPropagation()}>
            <InterestBar tags={tagNames} compact={compact} />
          </div>
        </div>

        {/* Chevron */}
        <span className="text-muted text-sm mt-1 shrink-0">›</span>
      </div>
    </div>
  );
}
