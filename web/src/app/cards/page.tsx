import { getNotes } from "@/lib/data-loader";
import type { Note } from "@/lib/types";
import NoteImageGallery from "@/app/week/[id]/NoteImageGallery";

const typeLabel: Record<string, string> = {
  foundation: "基础知识",
  interview_qa: "面试问答",
  advanced: "进阶知识",
  coding: "Coding",
  paper: "推荐论文",
};

export default function CardsPage() {
  const notes = getNotes();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 style={{ fontSize: "1.5em", fontWeight: 700, color: "#ededed", marginBottom: "4px" }}>
        🃏 卡片学习
      </h1>
      <p style={{ fontSize: "13px", color: "#737373", marginBottom: "16px" }}>
        {notes.length} 张卡片 · 点击翻转 · 评价记忆程度
      </p>

      {/* Stats */}
      <div style={{
        background: "#171717",
        border: "1px solid #262626",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "1.8em", fontWeight: 700, color: "#3b82f6" }}>{notes.length}</div>
            <div style={{ fontSize: "12px", color: "#737373" }}>总卡片</div>
          </div>
          <div>
            <div style={{ fontSize: "1.8em", fontWeight: 700, color: "#22c55e" }}>
              {notes.filter((n) => n.status === "completed").length}
            </div>
            <div style={{ fontSize: "12px", color: "#737373" }}>已完成</div>
          </div>
          <div>
            <div style={{ fontSize: "1.8em", fontWeight: 700, color: "#eab308" }}>
              {notes.filter((n) => n.status !== "completed").length}
            </div>
            <div style={{ fontSize: "12px", color: "#737373" }}>待学习</div>
          </div>
        </div>
      </div>

      {/* Card previews (static, non-interactive for now) */}
      <p style={{ fontSize: "13px", color: "#737373", marginBottom: "12px" }}>
        所有卡片预览（交互功能开发中）：
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {notes.map((note, idx) => {
          const tagNames = note.tags?.map((t: { name: string }) => t.name) ?? [];
          return (
            <div key={note.id} style={{
              background: "#171717",
              border: "1px solid #262626",
              borderRadius: "16px",
              padding: "16px",
              minHeight: "140px",
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "#737373", padding: "2px 8px", borderRadius: "4px", background: "#0d0d0d" }}>
                  {typeLabel[note.type] ?? note.type}
                </span>
                <span style={{ fontSize: "11px", color: "#525252" }}>
                  {idx + 1}/{notes.length} · Week {note.week}
                </span>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontWeight: 600, color: "#ededed", textAlign: "center", fontSize: "15px" }}>
                  {note.title}
                </p>
              </div>
              {tagNames.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center", marginTop: "8px" }}>
                  {tagNames.slice(0, 3).map((tag: string) => (
                    <span key={tag} style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "99px",
                      background: "rgba(139,92,246,0.1)", color: "#a78bfa",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <NoteImageGallery images={note.images} maxPreview={1} />
            </div>
          );
        })}
      </div>

      {/* Review buttons placeholder */}
      <div style={{
        marginTop: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
      }}>
        {[
          { emoji: "😰", label: "忘记", color: "#ef4444" },
          { emoji: "🤔", label: "模糊", color: "#eab308" },
          { emoji: "😊", label: "记得", color: "#22c55e" },
          { emoji: "😎", label: "简单", color: "#3b82f6" },
        ].map((btn) => (
          <div key={btn.label} style={{
            textAlign: "center",
            padding: "10px",
            borderRadius: "12px",
            border: `1px solid ${btn.color}30`,
            background: `${btn.color}10`,
            color: btn.color,
            fontSize: "12px",
          }}>
            <div style={{ fontSize: "1.3em" }}>{btn.emoji}</div>
            <div>{btn.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
