"use client";

import type { Note } from "@/lib/types";
import { difficultyColor, difficultyLabel, platformLabel, noteTypeIcon, noteTypeLabel } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";
import InterestBar from "./InterestBar";

interface NoteDetailProps {
  note: Note;
  onClose: () => void;
  onMarkComplete?: (noteId: string, rating: number) => void;
  isCompleted?: boolean;
}

export default function NoteDetail({
  note,
  onClose,
  onMarkComplete,
  isCompleted = false,
}: NoteDetailProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background md:bg-black/60 md:pt-12 overflow-y-auto">
      <div className="min-h-full md:min-h-0 md:max-w-2xl md:mx-auto bg-surface md:rounded-t-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 z-10">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-card-hover text-foreground"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span>{noteTypeIcon(note.type)}</span>
              <span className="text-xs text-muted">{noteTypeLabel(note.type)}</span>
            </div>
          </div>
          {onMarkComplete && (
            <button
              onClick={() => onMarkComplete(note.id, isCompleted ? 0 : note.rating || 3)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isCompleted
                  ? "bg-success/10 text-success"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {isCompleted ? "✓ 已完成" : "标记完成"}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-24 md:pb-8">
          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-3">{note.title}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColor(note.difficulty)}`}>
              {difficultyLabel(note.difficulty)}
            </span>
            <span className="text-xs text-muted">Week {note.week}</span>
            {note.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-0.5 rounded bg-card hover:bg-card-hover text-primary-light transition-colors"
              >
                {platformLabel(s.platform)} 来源
              </a>
            ))}
          </div>

          {/* Tags with weights */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {note.tags.map((tw) => (
                <span
                  key={tw.name}
                  className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent"
                  title={`初始权重: ${tw.initial_weight}`}
                >
                  {tw.name}
                  {tw.initial_weight !== 1.0 && (
                    <span className="ml-0.5 opacity-60">
                      ×{tw.initial_weight}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Interest Bar */}
          <div className="mb-3">
            <InterestBar
              tags={note.tags?.map((tw) => tw.name) ?? []}
            />
          </div>

          {/* Recommendations */}
          {note.recommendations && note.recommendations.length > 0 && (
            <section className="mb-4 p-3 rounded-xl bg-accent/5 border border-accent/20">
              <h2 className="text-xs font-semibold text-accent mb-1.5">
                🔗 推荐阅读
              </h2>
              <div className="flex flex-wrap gap-1">
                {note.recommendations.map((recId) => (
                  <span
                    key={recId}
                    className="text-[11px] px-2 py-0.5 rounded bg-accent/10 text-accent"
                  >
                    {recId}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Summary / Answer — main content */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
              {note.type === "interview_qa" ? "回答" : "摘要"}
            </h2>
            <div className="text-sm leading-relaxed text-foreground/90">
              <MarkdownRenderer content={note.summary || note.answer || ""} />
            </div>
          </section>

          {/* Question (for interview_qa type) */}
          {note.type === "interview_qa" && note.question && (
            <section className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h2 className="text-sm font-semibold text-primary mb-2">💡 面试问题</h2>
              <p className="text-sm font-medium text-foreground">{note.question}</p>
            </section>
          )}

          {/* Key Points */}
          {note.key_points && note.key_points.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                关键要点
              </h2>
              <ul className="space-y-1.5">
                {note.key_points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/80">
                    <span className="text-primary mt-0.5 shrink-0">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Review Questions */}
          {note.review_questions && note.review_questions.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                自测问题
              </h2>
              <div className="space-y-2">
                {note.review_questions.map((q, i) => (
                  <details key={i} className="group">
                    <summary className="text-sm text-foreground/80 cursor-pointer hover:text-foreground list-none flex items-center gap-2">
                      <span className="text-xs text-muted group-open:hidden">▶</span>
                      <span className="text-xs text-muted hidden group-open:inline">▼</span>
                      <span>{q}</span>
                    </summary>
                    <div className="mt-1 ml-5 text-sm text-muted italic">
                      思考并尝试回答，然后查阅相关资料验证。
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Follow-up (for interview_qa) */}
          {note.follow_up && note.follow_up.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                追问方向
              </h2>
              <ul className="space-y-1">
                {note.follow_up.map((fu, i) => (
                  <li key={i} className="text-sm text-foreground/70 flex gap-2">
                    <span className="text-accent">→</span>
                    {fu}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
