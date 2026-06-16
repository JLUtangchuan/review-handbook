"use client";

import type { Roadmap, Progress, WeekPlan, WeekProgress } from "@/lib/types";
import { CircularProgress, LinearProgress } from "@/components/ProgressBar";
import { formatDate, formatDateRange } from "@/lib/utils";
import Link from "next/link";

interface WeekWithProgress extends WeekPlan {
  completion: { total: number; completed: number; percentage: number };
}

interface RoadmapClientProps {
  roadmap: Roadmap;
  progress: Progress;
  weekProgress: WeekWithProgress[];
  totalNotes: number;
}

export default function RoadmapClient({
  roadmap,
  progress,
  weekProgress,
  totalNotes,
}: RoadmapClientProps) {
  const currentWeek = progress.current_week;
  const completedDays = progress.completed_days.length;
  const overallPct = Math.round((completedDays / roadmap.total_days) * 100);

  // Check if a week is current
  const isCurrentWeek = (week: number) => week === currentWeek;
  const isPastWeek = (week: number) => week < currentWeek;
  const isFutureWeek = (week: number) => week > currentWeek;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">学习路线图</h1>
        <p className="text-sm text-muted">
          {roadmap.role} · {roadmap.total_days}天计划
        </p>
      </div>

      {/* Progress Overview Card */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center gap-5">
          <CircularProgress
            percentage={overallPct}
            size={100}
            strokeWidth={6}
            label={`${completedDays}`}
            sublabel={`/ ${roadmap.total_days} 天`}
          />
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">
                连续打卡{" "}
                <span className="text-primary font-bold text-lg">
                  {progress.streak.current}
                </span>{" "}
                天
              </div>
              <div className="text-xs text-muted">
                最长连续 {progress.streak.longest} 天
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">
                当前：第 {currentWeek} 周 ·{" "}
                {formatDate(roadmap.weeks[currentWeek - 1]?.start_date || roadmap.start_date)} 开始
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <LinearProgress percentage={overallPct} />
        </div>
      </div>

      {/* Weeks Timeline */}
      <div className="space-y-3">
        {weekProgress.map((week, idx) => {
          const past = isPastWeek(week.week);
          const current = isCurrentWeek(week.week);

          return (
            <Link
              key={week.week}
              href={`/week/${week.week}`}
              className={`block rounded-2xl border transition-colors ${
                current
                  ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                  : past
                    ? "border-border bg-card hover:bg-card-hover opacity-70"
                    : "border-border bg-card hover:bg-card-hover"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Week header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          current
                            ? "bg-primary text-white"
                            : past
                              ? "bg-success/20 text-success"
                              : "bg-card-hover text-muted"
                        }`}
                      >
                        {past ? "✓" : current ? "进行中" : `Week ${week.week}`}
                      </span>
                      <span className="text-sm text-muted">
                        {formatDateRange(week.start_date, week.end_date)}
                      </span>
                    </div>

                    {/* Theme */}
                    <h3
                      className={`font-semibold mb-2 ${
                        current ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {week.theme}
                    </h3>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <LinearProgress
                        percentage={week.completion.percentage}
                        showLabel={week.completion.total > 0}
                        height={4}
                      />
                    </div>

                    {/* Content counts */}
                    <div className="flex gap-3 text-xs text-muted">
                      <span>
                        📖 {week.content.foundations.length} 基础
                      </span>
                      <span>
                        💬 {week.content.interview_qa.length} 问答
                      </span>
                      <span>
                        📄 {week.content.papers.length} 论文
                      </span>
                      <span>
                        {week.completion.completed}/{week.completion.total}{" "}
                        完成
                      </span>
                    </div>
                  </div>

                  <span className="text-muted text-lg mt-1">›</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
