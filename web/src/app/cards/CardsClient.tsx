"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Note } from "@/lib/types";
import { difficultyColor, difficultyLabel, noteTypeIcon, noteTypeLabel } from "@/lib/utils";
import { useWeight } from "@/components/WeightContext";
import { useReview, type ReviewQuality } from "@/components/ReviewContext";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import InterestBar from "@/components/InterestBar";
import { CircularProgress } from "@/components/ProgressBar";

const QUALITY_OPTIONS: { key: ReviewQuality; label: string; emoji: string; color: string }[] = [
  { key: "forgot", label: "忘记", emoji: "😰", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { key: "hard", label: "模糊", emoji: "🤔", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { key: "good", label: "记得", emoji: "😊", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { key: "easy", label: "简单", emoji: "😎", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
];

export default function CardsClient({ notes }: { notes: Note[] }) {
  const { prefs } = useWeight();
  const { records, reviewNote, sortByCombinedWeight, dueToday, totalReviewed } = useReview();

  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);

  // Sort by combined weight (tag × Ebbinghaus)
  const sortedNotes = useMemo(
    () => sortByCombinedWeight(notes, prefs),
    [notes, sortByCombinedWeight, prefs]
  );

  const currentNote = sortedNotes[index] ?? null;
  const tagNames = currentNote?.tags?.map((tw) => tw.name) ?? [];
  const record = currentNote ? records[currentNote.id] : undefined;

  // Navigate
  const goNext = useCallback(() => {
    setFlipped(false);
    setReviewComplete(false);
    if (index < sortedNotes.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0); // Loop back
    }
  }, [index, sortedNotes.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setReviewComplete(false);
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  // Handle review
  const handleReview = useCallback(
    (quality: ReviewQuality) => {
      if (!currentNote) return;
      reviewNote(currentNote.id, quality);
      setReviewComplete(true);
      // Auto-advance after short delay
      setTimeout(goNext, 600);
    },
    [currentNote, reviewNote, goNext]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === "1") handleReview("forgot");
      if (e.key === "2") handleReview("hard");
      if (e.key === "3") handleReview("good");
      if (e.key === "4") handleReview("easy");
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleReview, goNext, goPrev]);

  if (sortedNotes.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-muted">暂无笔记可复习</p>
        <p className="text-xs text-muted mt-2">
          先用 /review-handbook search 添加一些笔记
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-3 text-xs text-muted">
        <span>
          {index + 1} / {sortedNotes.length}
        </span>
        <span>🔥 待复习 {dueToday} · 已复习 {totalReviewed}</span>
        <button
          onClick={() => setIndex(Math.floor(Math.random() * sortedNotes.length))}
          className="px-2 py-1 rounded bg-card border border-border hover:bg-card-hover"
        >
          🎲 随机
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col">
        <div
          onClick={() => setFlipped(!flipped)}
          className="flex-1 rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 flex flex-col overflow-hidden"
          style={{ minHeight: "360px" }}
        >
          {/* Card header: always visible */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{noteTypeIcon(currentNote.type)}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-card-hover text-muted">
                {noteTypeLabel(currentNote.type)}
              </span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${difficultyColor(
                  currentNote.difficulty
                )}`}
              >
                {difficultyLabel(currentNote.difficulty)}
              </span>
            </div>
            <span className="text-[11px] text-muted">Week {currentNote.week}</span>
          </div>

          {/* Card body: front or back */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {!flipped ? (
              /* Front: question/title + summary preview */
              <div>
                <h2 className="text-lg font-bold mb-3">
                  {currentNote.type === "interview_qa" && currentNote.question
                    ? currentNote.question
                    : currentNote.title}
                </h2>
                {currentNote.summary && (
                  <div className="text-sm text-muted leading-relaxed line-clamp-6">
                    <MarkdownRenderer content={currentNote.summary.slice(0, 300)} />
                  </div>
                )}
                {currentNote.type === "coding" && currentNote.code_snippet && (
                  <div className="mt-3 text-xs text-muted italic">
                    💻 包含代码实现 — 点击翻转查看
                  </div>
                )}
                <p className="text-xs text-muted/50 mt-4 text-center">
                  点击翻转查看详情
                </p>
              </div>
            ) : (
              /* Back: full content */
              <div>
                <h2 className="text-lg font-bold mb-3">{currentNote.title}</h2>

                {currentNote.type === "interview_qa" && currentNote.question && (
                  <div className="mb-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary mb-1">💡 问题</p>
                    <p className="text-sm font-medium">{currentNote.question}</p>
                  </div>
                )}

                {/* Summary/Answer */}
                <div className="text-sm leading-relaxed">
                  <MarkdownRenderer
                    content={
                      currentNote.summary ||
                      currentNote.answer ||
                      currentNote.code_snippet ||
                      ""
                    }
                  />
                </div>

                {/* Key points */}
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

                {/* Review status */}
                {record && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted mb-1">
                      📅 复习 {record.reviewCount} 次 · 下次复习 {record.nextReviewDate}
                      · 间隔 {record.interval} 天 · EF {record.easeFactor}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags + Interest */}
          <div className="px-5 py-3 border-t border-border shrink-0">
            <InterestBar tags={tagNames} compact />
          </div>
        </div>
      </div>

      {/* Review buttons */}
      <div className={`mt-4 transition-opacity ${reviewComplete ? "opacity-50" : ""}`}>
        <p className="text-xs text-muted text-center mb-2">
          {flipped ? "评价你的记忆程度" : "翻转卡片后评价"}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleReview(opt.key)}
              disabled={reviewComplete}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors ${opt.color}`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span>{opt.label}</span>
              <span className="text-[10px] opacity-60">{opt.key === "forgot" ? "键1" : opt.key === "hard" ? "键2" : opt.key === "good" ? "键3" : "键4"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between mt-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← 上一张
        </button>
        <span className="text-xs text-muted self-center">
          {flipped ? "背面 · 点击翻回" : "正面 · 点击翻转"}
        </span>
        <button
          onClick={goNext}
          className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-foreground"
        >
          下一张 →
        </button>
      </div>
    </div>
  );
}
