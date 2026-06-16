"use client";

import { useState, useMemo } from "react";
import type { Note, TopicTree, NoteType } from "@/lib/types";
import { noteTypeLabel } from "@/lib/utils";
import NoteCard from "@/components/NoteCard";
import NoteDetail from "@/components/NoteDetail";
import SearchBar from "@/components/SearchBar";
import { useWeight } from "@/components/WeightContext";
import { useReview } from "@/components/ReviewContext";

interface NotesClientProps {
  notes: Note[];
  topics: TopicTree;
}

const typeFilters: { value: NoteType | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "foundation", label: "基础知识" },
  { value: "interview_qa", label: "面试问答" },
  { value: "advanced", label: "进阶知识" },
  { value: "coding", label: "Coding" },
  { value: "paper", label: "推荐论文" },
];

export default function NotesClient({ notes, topics }: NotesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { prefs } = useWeight();
  const { sortByCombinedWeight } = useReview();

  // Flatten topics for filter dropdown
  const allTopics = useMemo(() => {
    const result: { id: string; name: string }[] = [];
    for (const topic of topics.topics) {
      result.push({ id: topic.id, name: topic.name });
      for (const st of topic.subtopics) {
        result.push({ id: st.id, name: `  ${st.name}` });
      }
    }
    return result;
  }, [topics]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Type filter
      if (typeFilter !== "all" && note.type !== typeFilter) return false;

      // Topic filter
      if (selectedTopic !== "all" && !note.topics.includes(selectedTopic))
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tagNames = note.tags?.map((tw) => tw.name) ?? [];
        const searchText = [
          note.title,
          note.summary || "",
          note.question || "",
          note.answer || "",
          ...tagNames,
          ...(note.key_points || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!searchText.includes(q)) return false;
      }

      return true;
    });
  }, [notes, typeFilter, selectedTopic, searchQuery]);

  // Sort by combined weight (tag interest × Ebbinghaus urgency)
  const sortedNotes = useMemo(
    () => sortByCombinedWeight(filteredNotes, prefs),
    [filteredNotes, sortByCombinedWeight, prefs]
  );

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length };
    for (const note of notes) {
      counts[note.type] = (counts[note.type] || 0) + 1;
    }
    return counts;
  }, [notes]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">笔记库</h1>
      <p className="text-sm text-muted mb-4">
        {notes.length} 条笔记 · 搜索、筛选、复习
      </p>

      {/* Search */}
      <div className="mb-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索笔记标题、内容、标签..."
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {typeFilters.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTypeFilter(tf.value)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
              typeFilter === tf.value
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            {tf.label}
            <span className="ml-1 opacity-70">
              {typeCounts[tf.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Topic filter */}
      <div className="mb-4">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">全部话题</option>
          {allTopics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted mb-3">
        {sortedNotes.length} 条结果 · 按权重排序
        {searchQuery && ` · 搜索"${searchQuery}"`}
      </p>

      {/* Note list */}
      <div className="space-y-2">
        {sortedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onSelect={setSelectedNote}
            compact
          />
        ))}
        {sortedNotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted text-sm">没有找到匹配的笔记</p>
            <p className="text-muted text-xs mt-1">
              试试其他关键词或筛选条件
            </p>
          </div>
        )}
      </div>

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
