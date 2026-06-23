"use client";

import { useState, useEffect, useCallback } from "react";
import type { Topic, Subtopic } from "@/lib/types";

// Simple slugify for generating IDs from names
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[（(]/g, "-")
    .replace(/[）)]/g, "")
    .replace(/[\/\s]+/g, "-")
    .replace(/[^a-z0-9一-鿿-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Common emoji options for topic icons
const ICON_OPTIONS = ["🤖", "👁️", "🧠", "🎮", "🔄", "⚙️", "📐", "🔬", "💡", "📊", "🗣️", "🦾"];

export default function AdminPage() {
  const [available, setAvailable] = useState(false);
  const [checked, setChecked] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Editing state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingSubtopicKey, setEditingSubtopicKey] = useState<string | null>(null); // "topicId:subId"
  const [editTopicName, setEditTopicName] = useState("");
  const [editSubtopicName, setEditSubtopicName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [showNewTopic, setShowNewTopic] = useState(false);

  // Detect dev mode
  useEffect(() => {
    let cancelled = false;
    fetch("/api/ping")
      .then((r) => { if (!cancelled && r.ok) setAvailable(true); })
      .catch(() => { if (!cancelled) setAvailable(false); })
      .finally(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, []);

  // Load topics
  useEffect(() => {
    if (!available) return;
    (async () => {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
          setExpandedTopics(new Set((data.topics || []).map((t: Topic) => t.id)));
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [available]);

  const flash = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // --- Save ---
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });
      if (res.ok) {
        flash("✓ 已保存到 topics.yaml");
      } else {
        const err = await res.json();
        flash("✗ 保存失败: " + (err.error || "unknown"));
      }
    } catch {
      flash("✗ 网络错误");
    }
    setSaving(false);
  }, [topics]);

  // --- Topic operations ---
  const startEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditTopicName(topic.name);
  };

  const saveEditTopic = () => {
    if (!editingTopicId || !editTopicName.trim()) return;
    setTopics((prev) =>
      prev.map((t) => (t.id === editingTopicId ? { ...t, name: editTopicName.trim() } : t))
    );
    setEditingTopicId(null);
  };

  const changeTopicIcon = (topicId: string, icon: string) => {
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, icon } : t)));
  };

  const deleteTopic = (topicId: string) => {
    const name = topics.find((t) => t.id === topicId)?.name || topicId;
    if (!confirm(`删除主题 "${name}" 及其所有子主题？`)) return;
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const addTopic = () => {
    if (!newTopicName.trim()) return;
    const id = slugify(newTopicName.trim()) || "topic-" + Date.now();
    const newTopic: Topic = {
      id,
      name: newTopicName.trim(),
      icon: "📌",
      subtopics: [],
    };
    setTopics((prev) => [...prev, newTopic]);
    setExpandedTopics((prev) => new Set(prev).add(id));
    setNewTopicName("");
    setShowNewTopic(false);
  };

  // --- Subtopic operations ---
  const startEditSubtopic = (topicId: string, sub: Subtopic) => {
    setEditingSubtopicKey(`${topicId}:${sub.id}`);
    setEditSubtopicName(sub.name);
  };

  const saveEditSubtopic = (topicId: string, subId: string) => {
    if (!editSubtopicName.trim()) return;
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        return {
          ...t,
          subtopics: t.subtopics.map((s) =>
            s.id === subId ? { ...s, name: editSubtopicName.trim() } : s
          ),
        };
      })
    );
    setEditingSubtopicKey(null);
  };

  const deleteSubtopic = (topicId: string, subId: string) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        return { ...t, subtopics: t.subtopics.filter((s) => s.id !== subId) };
      })
    );
  };

  const addSubtopic = (topicId: string) => {
    const name = newSubName[topicId]?.trim();
    if (!name) return;
    const id = slugify(name) || "sub-" + Date.now();
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const newSub: Subtopic = { id, name };
        return { ...t, subtopics: [...t.subtopics, newSub] };
      })
    );
    setNewSubName((prev) => ({ ...prev, [topicId]: "" }));
  };

  // --- Counts ---
  const totalSubtopics = topics.reduce((sum, t) => sum + t.subtopics.length, 0);

  // Hide in static mode
  if (!checked) return null;
  if (!available) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p style={{ color: "#525252" }}>管理页面仅在本地开发模式下可用</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p style={{ color: "#737373" }}>加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5em", fontWeight: 700, color: "#ededed", marginBottom: "4px" }}>
            📚 学习主题管理
          </h1>
          <p style={{ fontSize: "13px", color: "#737373" }}>
            {topics.length} 个主题 · {totalSubtopics} 个子主题
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: saving ? "#1e40af" : "#3b82f6",
            color: "#fff",
            fontWeight: 600,
            fontSize: "13px",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "保存中..." : "💾 保存"}
        </button>
      </div>

      {statusMsg && (
        <div style={{
          padding: "10px 14px",
          borderRadius: "10px",
          background: statusMsg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${statusMsg.startsWith("✓") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: statusMsg.startsWith("✓") ? "#22c55e" : "#ef4444",
          fontSize: "13px",
          marginBottom: "12px",
        }}>
          {statusMsg}
        </div>
      )}

      {/* Topic list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {topics.map((topic) => {
          const isExpanded = expandedTopics.has(topic.id);
          const isEditing = editingTopicId === topic.id;

          return (
            <div key={topic.id} style={{
              background: "#171717",
              border: "1px solid #262626",
              borderRadius: "14px",
              overflow: "hidden",
            }}>
              {/* Topic header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
                cursor: "pointer",
              }}
                onClick={() => {
                  if (!isEditing) {
                    setExpandedTopics((prev) => {
                      const next = new Set(prev);
                      if (next.has(topic.id)) next.delete(topic.id);
                      else next.add(topic.id);
                      return next;
                    });
                  }
                }}
              >
                {/* Icon picker */}
                <span
                  style={{ fontSize: "1.4em", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = ICON_OPTIONS.indexOf(topic.icon || "📌");
                    const next = ICON_OPTIONS[(currentIdx + 1) % ICON_OPTIONS.length];
                    changeTopicIcon(topic.id, next);
                  }}
                  title="点击切换图标"
                >
                  {topic.icon || "📌"}
                </span>

                {/* Name */}
                {isEditing ? (
                  <input
                    value={editTopicName}
                    onChange={(e) => setEditTopicName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEditTopic();
                      if (e.key === "Escape") setEditingTopicId(null);
                    }}
                    onBlur={saveEditTopic}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      background: "#0d0d0d",
                      border: "1px solid #3b82f6",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      color: "#ededed",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, fontWeight: 600, color: "#ededed", fontSize: "14px" }}>
                    {topic.name}
                    <span style={{ fontSize: "11px", color: "#525252", marginLeft: "8px" }}>
                      {topic.subtopics.length} 个子主题
                    </span>
                  </span>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => isEditing ? saveEditTopic() : startEditTopic(topic)}
                    style={btnSm(isEditing ? "#22c55e" : "#737373")}
                  >
                    {isEditing ? "✓" : "✎"}
                  </button>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    style={btnSm("#ef4444")}
                    title="删除主题"
                  >
                    ✕
                  </button>
                  <span style={{ color: "#525252", fontSize: "16px", lineHeight: "28px" }}>
                    {isExpanded ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {/* Subtopics list */}
              {isExpanded && (
                <div style={{
                  borderTop: "1px solid #262626",
                  padding: "8px 16px 12px 52px",
                }}>
                  {topic.subtopics.map((sub) => {
                    const editKey = `${topic.id}:${sub.id}`;
                    const isEditingSub = editingSubtopicKey === editKey;
                    return (
                      <div key={sub.id} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 0",
                      }}>
                        <span style={{ color: "#525252", fontSize: "11px" }}>├</span>
                        {isEditingSub ? (
                          <input
                            value={editSubtopicName}
                            onChange={(e) => setEditSubtopicName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditSubtopic(topic.id, sub.id);
                              if (e.key === "Escape") setEditingSubtopicKey(null);
                            }}
                            onBlur={() => saveEditSubtopic(topic.id, sub.id)}
                            autoFocus
                            style={{
                              flex: 1,
                              background: "#0d0d0d",
                              border: "1px solid #3b82f6",
                              borderRadius: "6px",
                              padding: "3px 8px",
                              color: "#ededed",
                              fontSize: "13px",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <span style={{ flex: 1, color: "#a3a3a3", fontSize: "13px" }}>
                            {sub.name}
                            <code style={{
                              marginLeft: "6px",
                              fontSize: "10px",
                              color: "#525252",
                              background: "#0d0d0d",
                              padding: "1px 4px",
                              borderRadius: "3px",
                            }}>
                              {sub.id}
                            </code>
                          </span>
                        )}
                        <button
                          onClick={() => isEditingSub ? saveEditSubtopic(topic.id, sub.id) : startEditSubtopic(topic.id, sub)}
                          style={btnSmXs(isEditingSub ? "#22c55e" : "#525252")}
                        >
                          {isEditingSub ? "✓" : "✎"}
                        </button>
                        <button
                          onClick={() => deleteSubtopic(topic.id, sub.id)}
                          style={btnSmXs("#ef4444")}
                          title="删除子主题"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {/* Add subtopic row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", marginTop: "4px" }}>
                    <span style={{ color: "#525252", fontSize: "11px" }}>├</span>
                    <input
                      value={newSubName[topic.id] || ""}
                      onChange={(e) => setNewSubName((prev) => ({ ...prev, [topic.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addSubtopic(topic.id);
                      }}
                      placeholder="+ 新子主题名称"
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "1px dashed #333",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        color: "#a3a3a3",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => addSubtopic(topic.id)}
                      style={{
                        ...btnSmXs("#3b82f6"),
                        opacity: (newSubName[topic.id] || "").trim() ? 1 : 0.4,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add topic */}
      <div style={{ marginTop: "12px" }}>
        {showNewTopic ? (
          <div style={{
            background: "#171717",
            border: "1px dashed #3b82f6",
            borderRadius: "14px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{ fontSize: "1.4em" }}>📌</span>
            <input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTopic();
                if (e.key === "Escape") { setShowNewTopic(false); setNewTopicName(""); }
              }}
              placeholder="新主题名称"
              autoFocus
              style={{
                flex: 1,
                background: "#0d0d0d",
                border: "1px solid #3b82f6",
                borderRadius: "6px",
                padding: "6px 10px",
                color: "#ededed",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button onClick={addTopic} style={btnSm("#3b82f6")}>✓</button>
            <button onClick={() => { setShowNewTopic(false); setNewTopicName(""); }} style={btnSm("#525252")}>✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewTopic(true)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "14px",
              border: "1px dashed #333",
              background: "transparent",
              color: "#525252",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            + 添加新主题
          </button>
        )}
      </div>

      {/* Bottom save */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 32px",
            borderRadius: "10px",
            border: "none",
            background: saving ? "#1e40af" : "#3b82f6",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          💾 保存到 topics.yaml
        </button>
        <p style={{ fontSize: "11px", color: "#525252", marginTop: "8px" }}>
          点击图标切换 emoji · 点击 ✎ 编辑名称 · Enter 确认 · 修改后记得保存
        </p>
      </div>
    </div>
  );
}

// Tiny button styles
const btnSm = (color: string) => ({
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  border: "none",
  background: "transparent",
  color,
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const);

const btnSmXs = (color: string) => ({
  width: "24px",
  height: "24px",
  borderRadius: "5px",
  border: "none",
  background: "transparent",
  color,
  fontSize: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const);
