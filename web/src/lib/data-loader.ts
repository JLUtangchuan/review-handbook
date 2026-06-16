// ============================================================
// 复习手册 — Build-time Data Loader
// Reads YAML files from src/data/ at build time (copied from ../../data/)
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

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readYaml<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.load(raw) as T;
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

function loadAllNotes(): Note[] {
  const notesDir = path.join(DATA_DIR, "notes");
  const notes: Note[] = [];
  const types: NoteType[] = ["foundation", "interview_qa", "advanced", "coding", "paper"];

  for (const type of types) {
    const typeDir = path.join(notesDir, type);
    if (!fs.existsSync(typeDir)) continue;
    const files = fs.readdirSync(typeDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
    for (const file of files) {
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
