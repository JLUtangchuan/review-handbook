"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Note } from "@/lib/types";
import { difficultyColor, difficultyLabel, noteTypeIcon, noteTypeLabel } from "@/lib/utils";
import { useWeight } from "@/components/WeightContext";
import { useReview, type ReviewQuality } from "@/components/ReviewContext";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import InterestBar from "@/components/InterestBar";

const QUALITY_OPTIONS: { key: ReviewQuality; label: string; emoji: string; color: string; bg: string }[] = [
  { key: "forgot", label: "忘记", emoji: "😰", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  { key: "hard",   label: "模糊", emoji: "🤔", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  { key: "good",   label: "记得", emoji: "😊", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  { key: "easy",   label: "简单", emoji: "😎", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
];

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function CardsClient({ notes }: { notes: Note[] }) {
  const { prefs } = useWeight();
  const { records, reviewNote, sortByCombinedWeight, getDueNotes, dueToday, totalReviewed } = useReview();

  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(false);

  // Only show due notes, sorted by combined weight (tag interest × Ebbinghaus urgency)
  const dueNotes = useMemo(() => {
    const due = getDueNotes(notes);
    return sortByCombinedWeight(due, prefs);
  }, [notes, getDueNotes, sortByCombinedWeight, prefs]);

  const currentNote = dueNotes[index] ?? null;
  const tagNames = currentNote?.tags?.map((tw) => tw.name) ?? [];
  const record = currentNote ? records[currentNote.id] : undefined;

  // Urgency badge
  const urgencyBadge = useMemo(() => {
    if (!record) return { text: "🆕 新卡片", color: "#a78bfa" };
    const next = new Date(record.nextReviewDate);
    const now = new Date();
    const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
    if (days < 0) return { text: `⚠️ 逾期 ${Math.abs(days)} 天`, color: "#ef4444" };
    if (days === 0) return { text: "📌 今日复习", color: "#3b82f6" };
    if (days <= 3) return { text: `⏳ ${days} 天后`, color: "#eab308" };
    return { text: `✅ ${days} 天后`, color: "#22c55e" };
  }, [record]);

  // Advance to next card
  const advance = useCallback(() => {
    setSliding(true);
    setTimeout(() => {
      setFlipped(false);
      if (index < dueNotes.length - 1) {
        setIndex(index + 1);
      } else {
        setIndex(0);
      }
      setSliding(false);
    }, 280);
  }, [index, dueNotes.length]);

  // Handle review
  const handleReview = useCallback(
    (quality: ReviewQuality) => {
      if (!currentNote) return;
      reviewNote(currentNote.id, quality);
      advance();
    },
    [currentNote, reviewNote, advance]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); return; }
      const map: Record<string, ReviewQuality> = { "1": "forgot", "2": "hard", "3": "good", "4": "easy" };
      if (map[e.key]) handleReview(map[e.key]);
      if (e.key === "ArrowRight") advance();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleReview, advance]);

  // Stats
  const avgEase = useMemo(() => {
    const vals = Object.values(records);
    if (!vals.length) return 2.5;
    return Math.round(vals.reduce((s, r) => s + r.easeFactor, 0) / vals.length * 100) / 100;
  }, [records]);

  const reviewedToday = useMemo(() => {
    const td = todayStr();
    return Object.values(records).filter((r) => r.lastReviewDate === td).length;
  }, [records]);

  // -- Empty state --
  if (notes.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-muted">暂无笔记</p>
        <p className="text-xs text-muted mt-2">先用 /review-handbook search 添加笔记</p>
      </div>
    );
  }

  if (dueNotes.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <p className="text-foreground font-semibold text-lg mb-2">今日复习完成！</p>
        <p className="text-sm text-muted mb-6">
          已复习 {totalReviewed} 次 · avg ease {avgEase} · {notes.length} 张卡片
        </p>
        <button
          onClick={() => {
            // Force-show all notes as due
            setIndex(0);
          }}
          className="px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm hover:bg-primary/20"
        >
          🔄 浏览全部卡片
        </button>
      </div>
    );
  }

  const pct = Math.round(((index + 1) / dueNotes.length) * 100);

  return (
    <div className="max-w-lg mx-auto px-4 py-4 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header stats */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted mb-1">
          <span>{index + 1} / {dueNotes.length} 张待复习</span>
          <span>🔥 {dueToday} 待复习 · ✅ {reviewedToday} 今日已评</span>
        </div>
        <div className="h-1 rounded-full bg-card-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col">
        <div
          onClick={() => setFlipped(!flipped)}
          className="flex-1 rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 flex flex-col overflow-hidden relative"
          style={{
            minHeight: "380px",
            opacity: sliding ? 0 : 1,
            transform: sliding ? "translateX(-30px)" : "translateX(0)",
          }}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{noteTypeIcon(currentNote.type)}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-card-hover text-muted">
                {noteTypeLabel(currentNote.type)}
              </span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(currentNote.difficulty)}`}>
                {difficultyLabel(currentNote.difficulty)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {record && (
                <span className="text-[11px] text-muted">
                  复习{record.reviewCount}次 · 间隔{record.interval}d
                </span>
              )}
              <span
                className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                style={{ color: urgencyBadge.color, background: `${urgencyBadge.color}15` }}
              >
                {urgencyBadge.text}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {!flipped ? (
              /* Front */
              <div className="flex flex-col items-center justify-center min-h-[240px] text-center">
                <h2 className="text-lg font-bold mb-4">
                  {currentNote.type === "interview_qa" && currentNote.question
                    ? currentNote.question
                    : currentNote.title}
                </h2>
                {currentNote.summary && (
                  <div className="text-sm text-muted leading-relaxed line-clamp-4 max-w-md">
                    {currentNote.summary.slice(0, 250)}
                  </div>
                )}
                {currentNote.type === "coding" && currentNote.code_snippet && (
                  <div className="mt-3 text-xs text-muted italic">💻 含代码 — 点击翻转查看</div>
                )}
                <p className="text-xs text-muted/40 mt-6">点击翻转 · 空格翻面 · 1-4 评分</p>
              </div>
            ) : (
              /* Back */
              <div>
                <h2 className="text-lg font-bold mb-3">{currentNote.title}</h2>

                {currentNote.type === "interview_qa" && currentNote.question && (
                  <div className="mb-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary mb-1">💡 问题</p>
                    <p className="text-sm font-medium">{currentNote.question}</p>
                  </div>
                )}

                <div className="text-sm leading-relaxed">
                  <MarkdownRenderer content={currentNote.summary || currentNote.answer || ""} />
                </div>

                {currentNote.code_snippet && (
                  <div className="mt-3 text-xs text-muted italic">
                    💻 代码实现已包含
                  </div>
                )}

                {currentNote.key_points && currentNote.key_points.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted mb-2">📌 关键要点</p>
                    <ul className="space-y-1">
                      {currentNote.key_points.map((kp, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-primary shrink-0">▸</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentNote.review_questions && currentNote.review_questions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted mb-2">❓ 自测问题</p>
                    {currentNote.review_questions.map((q, i) => (
                      <p key={i} className="text-xs text-primary/80 mb-1 pl-3 border-l-2 border-primary/20">
                        {q}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interest bar */}
          <div className="px-5 py-3 border-t border-border shrink-0">
            <InterestBar tags={tagNames} compact />
          </div>
        </div>
      </div>

      {/* Review buttons */}
      <div className="mt-4">
        <p className="text-xs text-muted text-center mb-2">
          {flipped ? "评价记忆程度（可按键 1-4）" : "翻转卡片后评价"}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={(e) => { e.stopPropagation(); handleReview(opt.key); }}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-colors duration-150"
              style={{
                color: opt.color,
                background: opt.bg,
                borderColor: `${opt.color}30`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = `${opt.color}22`; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = opt.bg; }}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span>{opt.label}</span>
              <span className="text-[10px] opacity-50">
                键 {QUALITY_OPTIONS.indexOf(opt) + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Review history info */}
      {record && (
        <div className="mt-3 text-center text-[11px] text-muted/60">
          EF {record.easeFactor} · 下次 {record.nextReviewDate}
        </div>
      )}
    </div>
  );
}
