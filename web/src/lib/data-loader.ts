// ============================================================
// 复习手册 — Hybrid Data Loader
// Dev mode: reads/writes directly from ../../data/ (project root)
// Static build: reads from ../../data/ (same path, CI checkout)
// API routes call mutation functions for UI edits
// ============================================================

import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import type {
  UserConfig,
  TopicTree,
  Roadmap,
  Progress,
  Note,
  NoteType,
} from "./types";

function resolveDataDir(): string {
  // Canonical location: project root data/ (relative to web/)
  const projectRoot = path.resolve(process.cwd(), "..", "data");
  if (fs.existsSync(projectRoot)) return projectRoot;
  // Fallback: web/src/data/ (from prebuild.ts, for backward compat)
  const localCopy = path.join(process.cwd(), "src", "data");
  if (fs.existsSync(localCopy)) return localCopy;
  throw new Error(
    "data/ directory not found. Expected at " + projectRoot + " or " + localCopy + ". " +
    "Run next from the web/ directory."
  );
}

const DATA_DIR = resolveDataDir();

function readYaml<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.load(raw) as T;
}

function writeYaml(filename: string, data: unknown): void {
  const filePath = path.join(DATA_DIR, filename);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const yamlStr = yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
  fs.writeFileSync(filePath, yamlStr, "utf-8");
}

// ---- Cache (loaded once at module init in server context) ----

let _config: UserConfig | null = null;
let _topics: TopicTree | null = null;
let _roadmap: Roadmap | null = null;
let _progress: Progress | null = null;
let _notes: Note[] | null = null;
let _notesMap: Map<string, Note> | null = null;

// ---- Config ----

export function getConfig(): UserConfig {
  if (!_config) {
    _config = readYaml<UserConfig>("config.yaml");
  }
  return _config;
}

// ---- Topics ----

export function getTopics(): TopicTree {
  if (!_topics) {
    _topics = readYaml<TopicTree>("topics.yaml");
  }
  return _topics;
}

// ---- Roadmap ----

export function getRoadmap(): Roadmap {
  if (!_roadmap) {
    _roadmap = readYaml<Roadmap>("roadmap.yaml");
  }
  return _roadmap;
}

// ---- Progress ----

export function getProgress(): Progress {
  if (!_progress) {
    _progress = readYaml<Progress>("progress.yaml");
  }
  return _progress;
}

// ---- Notes (with backward compat migration) ----

/** Migrate old string[] tags to TagWeight[] */
function migrateTags(tags: unknown): { name: string; initial_weight: number }[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => {
    if (typeof t === "string") {
      return { name: t, initial_weight: 1.0 };
    }
    if (typeof t === "object" && t !== null && "name" in t) {
      return {
        name: String((t as Record<string, unknown>).name),
        initial_weight: Number((t as Record<string, unknown>).initial_weight) || 1.0,
      };
    }
    return { name: String(t), initial_weight: 1.0 };
  });
}

function migrateNote(raw: Record<string, unknown>): Note {
  return {
    ...raw,
    tags: migrateTags(raw.tags),
    recommendations: (raw.recommendations as string[]) ?? [],
    code_snippet: (raw.code_snippet as string) ?? undefined,
    images: (raw.images as Note["images"]) ?? [],
  } as unknown as Note;
}

/** Parse YAML frontmatter from a markdown string */
function parseFrontmatter(md: string): Record<string, unknown> | null {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    const parsed = yaml.load(match[1]);
    return (parsed as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}

function loadAllNotes(): Note[] {
  const notesDir = path.join(DATA_DIR, "notes");
  const notes: Note[] = [];
  const types: NoteType[] = ["foundation", "interview_qa", "advanced", "coding", "paper"];

  for (const type of types) {
    const typeDir = path.join(notesDir, type);
    if (!fs.existsSync(typeDir)) continue;
    // Read .md files (new format) and .yaml/.yml (legacy)
    const mdFiles = fs.readdirSync(typeDir).filter((f) => f.endsWith(".md"));
    const yamlFiles = fs.readdirSync(typeDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

    // MD files: parse frontmatter
    for (const file of mdFiles) {
      const raw = fs.readFileSync(path.join(typeDir, file), "utf-8");
      const fm = parseFrontmatter(raw);
      if (fm) {
        const note = migrateNote(fm);
        notes.push(note);
      }
    }

    // YAML files: legacy format
    for (const file of yamlFiles) {
      const raw = readYaml<Record<string, unknown>>(`notes/${type}/${file}`);
      const note = migrateNote(raw);
      notes.push(note);
    }
  }

  return notes;
}

export function getNotes(): Note[] {
  if (!_notes) {
    _notes = loadAllNotes();
  }
  return _notes;
}

export function getNotesMap(): Map<string, Note> {
  if (!_notesMap) {
    const notes = getNotes();
    _notesMap = new Map(notes.map((n) => [n.id, n]));
  }
  return _notesMap;
}

export function getNoteById(id: string): Note | undefined {
  return getNotesMap().get(id);
}

export function getNotesByWeek(week: number): Note[] {
  return getNotes().filter((n) => n.week === week);
}

export function getNotesByTopic(topicId: string): Note[] {
  return getNotes().filter((n) => n.topics.includes(topicId));
}

export function getNotesByType(type: NoteType): Note[] {
  return getNotes().filter((n) => n.type === type);
}

// ---- Resolve ContentRef to Note (with week context fallback) ----

export function resolveNoteRef(
  noteId: string,
  fallbackWeek: number
): Note | undefined {
  const note = getNoteById(noteId);
  if (note) return note;
  // If note not found (not yet written), return undefined
  return undefined;
}

// ---- Week Progress Calculations ----

export function getWeekCompletion(week: number): {
  total: number;
  completed: number;
  percentage: number;
} {
  const notes = getNotesByWeek(week);
  const total = notes.length;
  const completed = notes.filter((n) => n.status === "completed").length;
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getOverallProgress(): {
  totalNotes: number;
  completedNotes: number;
  percentage: number;
} {
  const notes = getNotes();
  const total = notes.length;
  const completed = notes.filter((n) => n.status === "completed").length;
  return {
    totalNotes: total,
    completedNotes: completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

// ---- Day/Week Calculation ----

export function getCurrentDay(): number {
  const config = getConfig();
  const start = new Date(config.start_date);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff + 1);
}

export function getCurrentWeek(): number {
  return Math.ceil(getCurrentDay() / 7);
}

// ---- Streak Computation ----

function computeStreak(
  completedDays: number[]
): { current: number; longest: number } {
  if (completedDays.length === 0) return { current: 0, longest: 0 };
  const sorted = [...completedDays].sort((a, b) => a - b);

  // Longest streak
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak (from today backwards)
  const today = getCurrentDay();
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const expectedDay = today - (sorted.length - 1 - i);
    if (sorted[i] === expectedDay) {
      current++;
    } else if (i === sorted.length - 1 && sorted[i] === today) {
      current = 1;
    } else {
      break;
    }
  }

  // Simpler current streak: count backwards from today
  let currentSimple = 0;
  const set = new Set(sorted);
  for (let d = today; d >= 1; d--) {
    if (set.has(d)) {
      currentSimple++;
    } else {
      break;
    }
  }

  return { current: currentSimple, longest };
}

// ---- Cache Control ----

export function reloadData(): void {
  _config = null;
  _topics = null;
  _roadmap = null;
  _progress = null;
  _notes = null;
  _notesMap = null;
}

// ---- Progress Mutations (dev mode / API routes) ----

export function updateProgress(updates: Partial<Progress>): Progress {
  const progress = getProgress();
  Object.assign(progress, updates);
  writeYaml("progress.yaml", progress);
  _progress = progress;
  return progress;
}

export function markDayComplete(
  day: number
): { day: number; streak: { current: number; longest: number } } {
  const progress = getProgress();
  if (!progress.completed_days.includes(day)) {
    progress.completed_days.push(day);
    progress.completed_days.sort((a, b) => a - b);
  }
  progress.current_day = day + 1;
  progress.streak = computeStreak(progress.completed_days);
  writeYaml("progress.yaml", progress);
  _progress = progress;
  return { day, streak: progress.streak };
}

// ---- Topics Mutations (dev mode / API routes) ----

export function updateTopics(topics: import("./types").Topic[]): import("./types").TopicTree {
  const tree = { topics };
  writeYaml("topics.yaml", tree);
  _topics = tree;
  return tree;
}

// ---- Note Mutations (dev mode / API routes) ----

/** Serialize a Note object back to Markdown with YAML frontmatter */
function noteToMarkdown(note: Note): string {
  // Build frontmatter (metadata only)
  const fm: Record<string, unknown> = {};
  const fmKeys = ["id", "title", "type", "week", "topics", "tags", "difficulty",
    "status", "rating", "created_at", "updated_at", "recommendations"];
  for (const k of fmKeys) {
    if (k in (note as unknown as Record<string, unknown>)) {
      fm[k] = (note as unknown as Record<string, unknown>)[k];
    }
  }
  if (note.sources) fm["sources"] = note.sources;
  if (note.question) fm["question"] = note.question;
  if (note.code_snippet) fm["code_snippet"] = note.code_snippet;

  const yamlStr = yaml.dump(fm, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false });

  // Build body
  const body: string[] = [];
  body.push(`# ${note.title}`);
  body.push("");
  if (note.question) { body.push(`> **💡 问题**: ${note.question}`); body.push(""); }
  if (note.sources && note.sources.length > 0) {
    body.push("## 来源");
    for (const s of note.sources) body.push(`- [${s.platform}] [${s.title}](${s.url})`);
    body.push("");
  }
  if (note.summary) { body.push("## 内容"); body.push(note.summary); body.push(""); }
  if (note.answer) { body.push("## 回答"); body.push(note.answer); body.push(""); }
  if (note.key_points && note.key_points.length > 0) {
    body.push("## 关键要点");
    for (const kp of note.key_points) body.push(`- ${kp}`);
    body.push("");
  }
  if (note.review_questions && note.review_questions.length > 0) {
    body.push("## 自测问题");
    for (const q of note.review_questions) body.push(`- ${q}`);
    body.push("");
  }
  if (note.images && note.images.length > 0) {
    body.push("## 图片");
    for (const img of note.images) {
      if (img.url) body.push(`![${img.caption || ""}](${img.url})`);
    }
    body.push("");
  }
  if (note.recommendations && note.recommendations.length > 0) {
    body.push("## 相关笔记");
    for (const r of note.recommendations) body.push(`- [[${r}]]`);
    body.push("");
  }

  return `---\n${yamlStr.trim()}\n---\n\n${body.join("\n")}`;
}

export function updateNoteField(
  noteId: string,
  fields: Partial<Pick<Note, "status" | "rating">>
): Note {
  const note = getNoteById(noteId);
  if (!note) throw new Error(`Note not found: ${noteId}`);

  Object.assign(note, fields);
  note.updated_at = new Date().toISOString().split("T")[0];

  const filePath = path.join(DATA_DIR, "notes", note.type, `${note.id}.md`);
  const md = noteToMarkdown(note);
  fs.writeFileSync(filePath, md, "utf-8");

  // Update in-memory cache
  if (_notesMap) _notesMap.set(noteId, note);
  if (_notes) {
    const idx = _notes.findIndex((n) => n.id === noteId);
    if (idx >= 0) _notes[idx] = note;
  }

  return note;
}
