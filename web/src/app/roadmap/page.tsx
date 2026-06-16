import { getRoadmap, getProgress, getWeekCompletion } from "@/lib/data-loader";

export default function RoadmapPage() {
  const roadmap = getRoadmap();
  const progress = getProgress();

  const weekProgress = roadmap.weeks.map((w) => ({
    ...w,
    completion: getWeekCompletion(w.week),
  }));

  const totalNotes = roadmap.weeks.reduce(
    (sum, w) =>
      sum +
      w.content.foundations.length +
      w.content.interview_qa.length +
      w.content.advanced.length +
      w.content.coding.length +
      w.content.papers.length,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "#ededed" }}>学习路线图</h1>
      <p className="text-sm mb-4" style={{ color: "#737373" }}>
        {roadmap.role} · {roadmap.total_days}天计划 · {totalNotes} 条笔记
      </p>

      {/* Current progress summary */}
      <div style={{
        background: "#171717",
        border: "1px solid #262626",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "24px",
      }}>
        <div className="text-sm" style={{ color: "#ededed" }}>
          当前第 <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: "1.2em" }}>{progress.current_week}</span> 周
          &nbsp;·&nbsp; 连续打卡 {progress.streak.current} 天
          &nbsp;·&nbsp; 已完成 {progress.completed_days.length}/{roadmap.total_days} 天
        </div>
        {/* Simple progress bar */}
        <div style={{
          marginTop: "8px",
          height: "6px",
          background: "#262626",
          borderRadius: "3px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${Math.round((progress.completed_days.length / roadmap.total_days) * 100)}%`,
            background: "#3b82f6",
            borderRadius: "3px",
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      {/* Weeks list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {weekProgress.map((week) => {
          const pct = week.completion.percentage;
          const isCurrent = week.week === progress.current_week;
          const isPast = week.week < progress.current_week;

          return (
            <a
              key={week.week}
              href={`/week/${week.week}`}
              style={{
                display: "block",
                background: isCurrent ? "rgba(59,130,246,0.1)" : "#171717",
                border: isCurrent ? "1px solid rgba(59,130,246,0.5)" : "1px solid #262626",
                borderRadius: "16px",
                padding: "16px",
                color: "#ededed",
                textDecoration: "none",
                opacity: isPast ? 0.7 : 1,
                transition: "background 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: isCurrent ? "#3b82f6" : isPast ? "rgba(34,197,94,0.2)" : "#262626",
                      color: isCurrent ? "#fff" : isPast ? "#22c55e" : "#737373",
                    }}>
                      {isPast ? "✓" : isCurrent ? "进行中" : `Week ${week.week}`}
                    </span>
                    <span style={{ fontSize: "12px", color: "#737373" }}>
                      {week.start_date.slice(5)} ~ {week.end_date.slice(5)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: "8px", color: isCurrent ? "#3b82f6" : "#ededed" }}>
                    {week.theme}
                  </div>
                  {/* Mini progress */}
                  <div style={{
                    height: "4px",
                    background: "#262626",
                    borderRadius: "2px",
                    overflow: "hidden",
                    marginBottom: "4px",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct >= 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : pct > 0 ? "#eab308" : "#262626",
                      borderRadius: "2px",
                    }} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#737373" }}>
                    📖 {week.content.foundations.length} 基础&nbsp;
                    💬 {week.content.interview_qa.length} 问答&nbsp;
                    🚀 {week.content.advanced.length} 进阶&nbsp;
                    💻 {week.content.coding.length} 代码&nbsp;
                    📄 {week.content.papers.length} 论文&nbsp;
                    · {week.completion.completed}/{week.completion.total} 完成
                  </div>
                </div>
                <span style={{ color: "#737373", fontSize: "18px" }}>›</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
