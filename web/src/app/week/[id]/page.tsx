import { getRoadmap, getNotesByWeek } from "@/lib/data-loader";
import { notFound } from "next/navigation";
import type { Note, NoteType, NoteImage } from "@/lib/types";
import NoteImageGallery from "./NoteImageGallery";

interface WeekPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  const roadmap = getRoadmap();
  return roadmap.weeks.map((w) => ({ id: String(w.week) }));
}

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
  // Safely extract tag names
  const tags = note.tags;
  const tagNames: string[] = [];
  if (Array.isArray(tags)) {
    for (const t of tags) {
      if (typeof t === "string") {
        tagNames.push(t);
      } else if (t && typeof t === "object" && "name" in t) {
        tagNames.push(String((t as { name: string }).name));
      }
    }
  }

  return (
    <div style={{
      background: "#171717",
      border: "1px solid #262626",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "1.2em" }}>{typeIcon[note.type] ?? "📝"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: "#ededed", marginBottom: "4px" }}>
            {note.title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
            <span style={{
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "4px",
              background: "rgba(59,130,246,0.1)",
              color: "#60a5fa",
            }}>
              {typeLabel[note.type] ?? note.type}
            </span>
            <span style={{ fontSize: "11px", color: "#737373" }}>
              {"⭐".repeat(note.difficulty)}
            </span>
            {note.status === "completed" && (
              <span style={{
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "4px",
                background: "rgba(34,197,94,0.1)",
                color: "#22c55e",
              }}>
                已完成
              </span>
            )}
          </div>
          {note.summary && (
            <p style={{
              fontSize: "13px",
              color: "#a3a3a3",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: "4px 0 0 0",
            }}>
              {note.summary.slice(0, 200)}
            </p>
          )}
          {tagNames.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
              {tagNames.slice(0, 5).map((tag: string) => (
                <span key={tag} style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "rgba(139,92,246,0.1)",
                  color: "#a78bfa",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <NoteImageGallery images={note.images} />
        </div>
      </div>
    </div>
  );
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { id } = await params;
  const weekNum = parseInt(id, 10);
  if (isNaN(weekNum)) notFound();

  const roadmap = getRoadmap();
  const weekPlan = roadmap.weeks.find((w) => w.week === weekNum);
  if (!weekPlan) notFound();

  const notes = getNotesByWeek(weekNum);
  const hasPrev = weekNum > 1;
  const hasNext = weekNum < roadmap.total_weeks;

  // Group notes by type
  const foundations = notes.filter((n) => n.type === "foundation");
  const interviewQa = notes.filter((n) => n.type === "interview_qa");
  const advanced = notes.filter((n) => n.type === "advanced");
  const coding = notes.filter((n) => n.type === "coding");
  const papers = notes.filter((n) => n.type === "paper");

  const totalNotes = notes.length;
  const completed = notes.filter((n) => n.status === "completed").length;

  const tabs = [
    { key: "foundations", label: "基础知识", icon: "📖", notes: foundations },
    { key: "interview_qa", label: "面试问答", icon: "💬", notes: interviewQa },
    { key: "advanced", label: "进阶知识", icon: "🚀", notes: advanced },
    { key: "coding", label: "Coding", icon: "💻", notes: coding },
    { key: "papers", label: "推荐论文", icon: "📄", notes: papers },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Week header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "99px",
            background: "#3b82f6",
            color: "#fff",
          }}>
            Week {weekNum} / {roadmap.total_weeks}
          </span>
          <span style={{ fontSize: "12px", color: "#737373" }}>
            {weekPlan.start_date.slice(5)} ~ {weekPlan.end_date.slice(5)}
          </span>
        </div>
        <h1 style={{ fontSize: "1.25em", fontWeight: 700, color: "#ededed", marginBottom: "12px" }}>
          {weekPlan.theme}
        </h1>
        {/* Progress bar */}
        <div style={{ height: "4px", background: "#262626", borderRadius: "2px", overflow: "hidden", marginBottom: "4px" }}>
          <div style={{
            height: "100%",
            width: totalNotes > 0 ? `${Math.round((completed / totalNotes) * 100)}%` : "0%",
            background: "#3b82f6",
            borderRadius: "2px",
          }} />
        </div>
        <span style={{ fontSize: "12px", color: "#737373" }}>
          完成 {completed}/{totalNotes} 项
        </span>
      </div>

      {/* Nav arrows */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        {hasPrev ? (
          <a href={`/week/${weekNum - 1}`} style={{
            fontSize: "12px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #262626",
            color: "#ededed",
            textDecoration: "none",
          }}>
            ← 上一周
          </a>
        ) : <span />}
        {hasNext ? (
          <a href={`/week/${weekNum + 1}`} style={{
            fontSize: "12px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #262626",
            color: "#ededed",
            textDecoration: "none",
          }}>
            下一周 →
          </a>
        ) : <span />}
      </div>

      {/* Tabs */}
      {tabs.filter((t) => t.notes.length > 0 || weekPlan.content[t.key as keyof typeof weekPlan.content]?.length > 0).map((tab) => (
        <div key={tab.key} style={{ marginBottom: "24px" }}>
          <h2 style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#a3a3a3",
            marginBottom: "8px",
            paddingBottom: "8px",
            borderBottom: "1px solid #262626",
          }}>
            {tab.icon} {tab.label}
            <span style={{ fontSize: "11px", marginLeft: "8px", color: "#737373" }}>
              {tab.notes.length} 条
            </span>
          </h2>
          {tab.notes.length > 0 ? (
            tab.notes.map((note) => <NoteCardInline key={note.id} note={note} />)
          ) : weekPlan.content[tab.key as keyof typeof weekPlan.content]?.length > 0 ? (
            <p style={{ fontSize: "13px", color: "#737373", textAlign: "center", padding: "24px" }}>
              待整理（{weekPlan.content[tab.key as keyof typeof weekPlan.content]?.length} 个占位）
            </p>
          ) : (
            <p style={{ fontSize: "13px", color: "#525252", textAlign: "center", padding: "24px" }}>
              本周暂无{tab.label}内容
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
