"use client";

import { useState, useMemo } from "react";
import type { Note, TopicTree, Topic, Subtopic } from "@/lib/types";
import NoteCard from "@/components/NoteCard";
import NoteDetail from "@/components/NoteDetail";
import { LinearProgress } from "@/components/ProgressBar";

interface TopicsClientProps {
  topics: TopicTree;
  notes: Note[];
}

export default function TopicsClient({ topics, notes }: TopicsClientProps) {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Compute topic stats
  const topicStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; completed: number; topicName: string; avgDifficulty: number }
    > = {};

    for (const topic of topics.topics) {
      const allIds = [topic.id, ...topic.subtopics.map((s) => s.id)];

      // For parent topic, count notes matching any subtopic or the topic itself
      const topicNotes = notes.filter((n) =>
        n.topics.some((t) => allIds.includes(t))
      );
      const completed = topicNotes.filter((n) => n.status === "completed").length;
      const avgDiff =
        topicNotes.length > 0
          ? Math.round(
              (topicNotes.reduce((sum, n) => sum + n.difficulty, 0) /
                topicNotes.length) *
                10
            ) / 10
          : 0;

      stats[topic.id] = {
        total: topicNotes.length,
        completed,
        topicName: topic.name,
        avgDifficulty: avgDiff,
      };

      // For each subtopic
      for (const st of topic.subtopics) {
        const stNotes = notes.filter((n) => n.topics.includes(st.id));
        const stCompleted = stNotes.filter(
          (n) => n.status === "completed"
        ).length;
        const stAvgDiff =
          stNotes.length > 0
            ? Math.round(
                (stNotes.reduce((sum, n) => sum + n.difficulty, 0) /
                  stNotes.length) *
                  10
              ) / 10
            : 0;

        stats[st.id] = {
          total: stNotes.length,
          completed: stCompleted,
          topicName: st.name,
          avgDifficulty: stAvgDiff,
        };
      }
    }

    return stats;
  }, [topics, notes]);

  // Notes for selected topic
  const selectedNotes = useMemo(() => {
    if (!selectedTopicId) return [];
    // Collect all subtopic IDs if this is a parent topic
    const topic = topics.topics.find((t) => t.id === selectedTopicId);
    const ids = topic
      ? [topic.id, ...topic.subtopics.map((s) => s.id)]
      : [selectedTopicId];

    return notes.filter((n) => n.topics.some((t) => ids.includes(t)));
  }, [selectedTopicId, topics, notes]);

  const selectedStats = selectedTopicId
    ? topicStats[selectedTopicId]
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">学习进度</h1>
      <p className="text-sm text-muted mb-4">按话题查看学习覆盖情况</p>

      {/* Topic Tree */}
      <div className="space-y-2 mb-6">
        {topics.topics.map((topic) => {
          const stats = topicStats[topic.id];
          const pct =
            stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0;
          const isExpanded = expandedTopic === topic.id;
          const isSelected = selectedTopicId === topic.id;

          return (
            <div key={topic.id}>
              {/* Parent topic */}
              <div
                className={`rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card hover:bg-card-hover"
                }`}
              >
                <div
                  className="p-4"
                  onClick={() => {
                    setExpandedTopic(isExpanded ? null : topic.id);
                    setSelectedTopicId(topic.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{topic.icon || "📌"}</span>
                      <h3 className="font-semibold text-sm">{topic.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">
                        {stats.completed}/{stats.total}
                      </span>
                      <span
                        className={`text-xs transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        ›
                      </span>
                    </div>
                  </div>
                  <LinearProgress percentage={pct} height={4} showLabel={false} />
                  {stats.total > 0 && (
                    <div className="flex gap-3 mt-1.5 text-[11px] text-muted">
                      <span>完成 {pct}%</span>
                      <span>难度 ≈ {stats.avgDifficulty}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtopics (expanded) */}
              {isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-border/50 pl-3">
                  {topic.subtopics.map((st) => {
                    const stStats = topicStats[st.id];
                    const stPct =
                      stStats.total > 0
                        ? Math.round(
                            (stStats.completed / stStats.total) * 100
                          )
                        : 0;
                    const isStSelected = selectedTopicId === st.id;

                    return (
                      <button
                        key={st.id}
                        onClick={() => setSelectedTopicId(st.id)}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                          isStSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-card-hover text-foreground/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{st.name}</span>
                          <span className="text-xs text-muted">
                            {stStats.completed}/{stStats.total}
                          </span>
                        </div>
                        {stStats.total > 0 && (
                          <div className="mt-1">
                            <LinearProgress
                              percentage={stPct}
                              height={3}
                              showLabel={false}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected topic detail */}
      {selectedTopicId && selectedStats && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">
              相关笔记
              {selectedStats && (
                <span className="text-sm text-muted font-normal ml-2">
                  {selectedStats.completed}/{selectedStats.total} 完成
                </span>
              )}
            </h2>
          </div>

          <div className="space-y-2">
            {selectedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onSelect={setSelectedNote}
                compact
              />
            ))}
            {selectedNotes.length === 0 && (
              <p className="text-sm text-muted text-center py-6">
                该话题暂无笔记
              </p>
            )}
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetail
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
}
