"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { WeekPlan, Note, NoteType } from "@/lib/types";
import { formatDateRange, noteTypeIcon } from "@/lib/utils";
import ContentTabs, { type TabKey } from "@/components/ContentTabs";
import NoteCard from "@/components/NoteCard";
import NoteDetail from "@/components/NoteDetail";
import SwipeContainer from "@/components/SwipeContainer";
import { LinearProgress } from "@/components/ProgressBar";
import { useWeight } from "@/components/WeightContext";
import { useReview } from "@/components/ReviewContext";

interface WeekClientProps {
  weekPlan: WeekPlan;
  notes: Note[];
  weekNum: number;
  hasPrev: boolean;
  hasNext: boolean;
  totalWeeks: number;
}

// Map TabKey to NoteType
const tabToType: Record<TabKey, NoteType> = {
  foundations: "foundation",
  interview_qa: "interview_qa",
  advanced: "advanced",
  coding: "coding",
  papers: "paper",
};

// Map NoteType to content field in WeekPlan
const typeToContentKey: Record<NoteType, keyof WeekPlan["content"]> = {
  foundation: "foundations",
  interview_qa: "interview_qa",
  advanced: "advanced",
  coding: "coding",
  paper: "papers",
};

export default function WeekClient({
  weekPlan,
  notes,
  weekNum,
  hasPrev,
  hasNext,
  totalWeeks,
}: WeekClientProps) {
  const router = useRouter();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [completedNotes, setCompletedNotes] = useState<Set<string>>(
    new Set(notes.filter((n) => n.status === "completed").map((n) => n.id))
  );
  const { prefs } = useWeight();
  const { sortByCombinedWeight } = useReview();

  const handleSwipeLeft = useCallback(() => {
    if (hasNext) router.push(`/week/${weekNum + 1}`);
  }, [hasNext, weekNum, router]);

  const handleSwipeRight = useCallback(() => {
    if (hasPrev) router.push(`/week/${weekNum - 1}`);
  }, [hasPrev, weekNum, router]);

  const handleMarkComplete = useCallback((noteId: string, rating: number) => {
    setCompletedNotes((prev) => {
      const next = new Set(prev);
      const wasComplete = next.has(noteId);
      if (wasComplete) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      if (typeof window !== "undefined") {
        const saved = JSON.parse(localStorage.getItem("rh_completed") || "{}");
        if (next.has(noteId)) {
          saved[noteId] = { completed_at: new Date().toISOString().split("T")[0], rating };
        } else {
          delete saved[noteId];
        }
        localStorage.setItem("rh_completed", JSON.stringify(saved));
      }

      // Fire-and-forget API call to persist to data/ YAML (dev mode only)
      const newStatus = wasComplete ? "pending" : "completed";
      fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, rating }),
      }).catch(() => {
        // API unavailable (static/production mode) — silently ignore
      });

      return next;
    });
  }, []);

  const noteMap = useMemo(() => Object.fromEntries(notes.map((n) => [n.id, n])), [notes]);

  // Count notes per type
  const counts: Record<TabKey, number> = {
    foundations: notes.filter((n) => n.type === "foundation").length,
    interview_qa: notes.filter((n) => n.type === "interview_qa").length,
    advanced: notes.filter((n) => n.type === "advanced").length,
    coding: notes.filter((n) => n.type === "coding").length,
    papers: notes.filter((n) => n.type === "paper").length,
  };

  const totalNotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalCompleted = notes.filter((n) => completedNotes.has(n.id)).length;
  const completionPct = totalNotes > 0 ? Math.round((totalCompleted / totalNotes) * 100) : 0;

  const resolveNote = (noteId: string): Note | undefined => noteMap[noteId];

  const renderNoteList = (
    noteRefs: { note_id: string; title?: string; question?: string; topics: string[] }[],
    type: NoteType
  ) => {
    // Resolve notes from refs
    const resolved = noteRefs
      .map((ref) => {
        const note = resolveNote(ref.note_id);
        if (!note) return null;
        return {
          ...note,
          status: completedNotes.has(note.id) ? ("completed" as const) : note.status,
        };
      })
      .filter((n): n is Note => n !== null);

    // Sort resolved notes by weight
    const sorted = sortByCombinedWeight(resolved, prefs);

    // Add placeholders for unresolved refs
    const renderedIds = new Set(sorted.map((n) => n.id));
    const placeholders = noteRefs.filter((ref) => !renderedIds.has(ref.note_id));

    return (
      <div className="space-y-2">
        {sorted.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onSelect={setSelectedNote}
          />
        ))}
        {placeholders.map((ref) => (
          <div
            key={ref.note_id}
            className="p-4 rounded-xl border border-dashed border-border bg-card/50"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5 shrink-0 opacity-50">
                {noteTypeIcon(type)}
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted">
                  {ref.title || ref.question || ref.note_id}
                </h3>
                <span className="text-[11px] text-muted">待整理</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to get content refs for a tab
  const getContentForTab = (tab: TabKey) => {
    const type = tabToType[tab];
    const key = typeToContentKey[type];
    return weekPlan.content[key] ?? [];
  };

  return (
    <SwipeContainer
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      hasLeft={hasNext}
      hasRight={hasPrev}
    >
      {/* Week header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary text-white">
              Week {weekNum}
            </span>
            <span className="text-xs text-muted">/ {totalWeeks}</span>
          </div>
          <span className="text-xs text-muted">
            {formatDateRange(weekPlan.start_date, weekPlan.end_date)}
          </span>
        </div>
        <h1 className="text-xl font-bold mb-3">{weekPlan.theme}</h1>
        <div className="mb-2">
          <LinearProgress percentage={completionPct} height={4} />
        </div>
        <p className="text-xs text-muted">
          完成 {totalCompleted}/{totalNotes} 项
        </p>
      </div>

      {/* Week navigation arrows */}
      <div className="flex justify-between mb-4">
        <button
          onClick={handleSwipeRight}
          disabled={!hasPrev}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            hasPrev
              ? "border-border hover:bg-card-hover text-foreground"
              : "border-border text-muted opacity-30 cursor-not-allowed"
          }`}
        >
          ← 上一周
        </button>
        <span className="text-xs text-muted self-center">左右滑动切换</span>
        <button
          onClick={handleSwipeLeft}
          disabled={!hasNext}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            hasNext
              ? "border-border hover:bg-card-hover text-foreground"
              : "border-border text-muted opacity-30 cursor-not-allowed"
          }`}
        >
          下一周 →
        </button>
      </div>

      {/* Content Tabs */}
      <ContentTabs defaultTab="foundations" counts={counts}>
        {(activeTab) => {
          const type = tabToType[activeTab];
          const refs = getContentForTab(activeTab);
          const emptyLabels: Record<string, string> = {
            foundations: "本周暂无基础知识内容",
            interview_qa: "本周暂无面试问答内容",
            advanced: "本周暂无进阶知识内容",
            coding: "本周暂无Coding题目",
            papers: "本周暂无推荐论文",
          };

          if (refs.length === 0) {
            return (
              <p className="text-sm text-muted text-center py-8">
                {emptyLabels[activeTab] ?? "本周暂无内容"}
              </p>
            );
          }

          return renderNoteList(refs, type);
        }}
      </ContentTabs>

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetail
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onMarkComplete={handleMarkComplete}
          isCompleted={completedNotes.has(selectedNote.id)}
        />
      )}
    </SwipeContainer>
  );
}
