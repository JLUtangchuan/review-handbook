import { getTopics, getNotes } from "@/lib/data-loader";

export default function TopicsPage() {
  const topics = getTopics();
  const notes = getNotes();

  // Compute per-topic stats
  const topicStats: Record<string, { total: number; completed: number; name: string }> = {};
  for (const topic of topics.topics) {
    const allIds = [topic.id, ...topic.subtopics.map((s) => s.id)];
    const topicNotes = notes.filter((n) => n.topics.some((t: string) => allIds.includes(t)));
    topicStats[topic.id] = {
      total: topicNotes.length,
      completed: topicNotes.filter((n) => n.status === "completed").length,
      name: topic.name,
    };
    for (const st of topic.subtopics) {
      const stNotes = notes.filter((n) => n.topics.includes(st.id));
      topicStats[st.id] = {
        total: stNotes.length,
        completed: stNotes.filter((n) => n.status === "completed").length,
        name: st.name,
      };
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 style={{ fontSize: "1.5em", fontWeight: 700, color: "#ededed", marginBottom: "4px" }}>
        学习进度
      </h1>
      <p style={{ fontSize: "13px", color: "#737373", marginBottom: "16px" }}>
        按话题查看学习覆盖情况 · {notes.length} 条笔记
      </p>

      {topics.topics.map((topic) => {
        const stats = topicStats[topic.id];
        const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        return (
          <div key={topic.id} style={{ marginBottom: "12px" }}>
            {/* Parent topic */}
            <div style={{
              background: "#171717",
              border: "1px solid #262626",
              borderRadius: "12px",
              padding: "16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2em" }}>{topic.icon || "📌"}</span>
                  <span style={{ fontWeight: 600, color: "#ededed" }}>{topic.name}</span>
                </div>
                <span style={{ fontSize: "12px", color: "#737373" }}>
                  {stats.completed}/{stats.total} 完成 · {pct}%
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: "4px", background: "#262626", borderRadius: "2px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: pct >= 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : pct > 0 ? "#eab308" : "#262626",
                  borderRadius: "2px",
                }} />
              </div>
              {/* Subtopics */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {topic.subtopics.map((st) => {
                  const stStats = topicStats[st.id];
                  return (
                    <span key={st.id} style={{
                      fontSize: "11px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: "#0d0d0d",
                      border: "1px solid #262626",
                      color: "#a3a3a3",
                    }}>
                      {st.name}
                      {stStats.total > 0 && (
                        <span style={{ marginLeft: "4px", color: "#60a5fa" }}>
                          {stStats.completed}/{stStats.total}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
