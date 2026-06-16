import { getNotes, getTopics } from "@/lib/data-loader";
import type { Note } from "@/lib/types";
import NoteImageGallery from "@/app/week/[id]/NoteImageGallery";

const typeLabel: Record<string, string> = {
  foundation: "基础知识",
  interview_qa: "面试问答",
  advanced: "进阶知识",
  coding: "Coding",
  paper: "推荐论文",
};

const typeIcon: Record<string, string> = {
  foundation: "📖",
  interview_qa: "💬",
  advanced: "🚀",
  coding: "💻",
  paper: "📄",
};

function NoteCardInline({ note }: { note: Note }) {
  const tagNames = note.tags?.map((t: { name: string }) => t.name) ?? [];
  return (
    <div style={{
      background: "#171717",
      border: "1px solid #262626",
      borderRadius: "12px",
      padding: "12px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <span style={{ fontSize: "1.1em", flexShrink: 0 }}>{typeIcon[note.type] ?? "📝"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#ededed", marginBottom: "4px" }}>
            {note.title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <span style={{
              fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
              background: "rgba(59,130,246,0.1)", color: "#60a5fa",
            }}>
              {typeLabel[note.type] ?? note.type}
            </span>
            <span style={{ fontSize: "10px", color: "#737373" }}>
              {"⭐".repeat(note.difficulty)} · Week {note.week}
            </span>
            {note.status === "completed" && (
              <span style={{
                fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                background: "rgba(34,197,94,0.1)", color: "#22c55e",
              }}>
                已完成
              </span>
            )}
          </div>
          {tagNames.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
              {tagNames.slice(0, 4).map((tag: string) => (
                <span key={tag} style={{
                  fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
                  background: "rgba(139,92,246,0.1)", color: "#a78bfa",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <NoteImageGallery images={note.images} maxPreview={2} />
        </div>
        <span style={{ color: "#525252", fontSize: "16px" }}>›</span>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const notes = getNotes();
  const topics = getTopics();

  // Build topic lookup
  const topicMap = new Map<string, string>();
  for (const t of topics.topics) {
    topicMap.set(t.id, t.name);
    for (const st of t.subtopics) {
      topicMap.set(st.id, st.name);
    }
  }

  // Count by type
  const typeCounts: Record<string, number> = {};
  for (const n of notes) {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 style={{ fontSize: "1.5em", fontWeight: 700, color: "#ededed", marginBottom: "4px" }}>
        笔记库
      </h1>
      <p style={{ fontSize: "13px", color: "#737373", marginBottom: "16px" }}>
        {notes.length} 条笔记 · 搜索、筛选、复习
      </p>

      {/* Type filters */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", overflow: "auto" }}>
        {[{ label: "全部", key: "all", count: notes.length },
          { label: "基础知识", key: "foundation", count: typeCounts.foundation || 0 },
          { label: "面试问答", key: "interview_qa", count: typeCounts.interview_qa || 0 },
          { label: "进阶知识", key: "advanced", count: typeCounts.advanced || 0 },
          { label: "Coding", key: "coding", count: typeCounts.coding || 0 },
          { label: "推荐论文", key: "paper", count: typeCounts.paper || 0 },
        ].map((f) => (
          <span key={f.key} style={{
            fontSize: "11px",
            padding: "6px 12px",
            borderRadius: "99px",
            background: f.key === "all" ? "#3b82f6" : "#171717",
            border: f.key === "all" ? "none" : "1px solid #262626",
            color: f.key === "all" ? "#fff" : "#a3a3a3",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}>
            {f.label} {f.count}
          </span>
        ))}
      </div>

      {/* Notes list */}
      {notes.map((note) => (
        <NoteCardInline key={note.id} note={note} />
      ))}
    </div>
  );
}
