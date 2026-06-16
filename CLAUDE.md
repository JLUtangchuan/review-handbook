# 复习手册 — Claude Code Project Guide

## Overview

复习手册 (Review Handbook) — static web knowledge management for 100-day embodied AI interview prep.
Content pipeline: 小红书/知乎 → Claude Code Skill → YAML notes → Next.js static site → GitHub Pages.

## Quick Commands

```bash
# Dev server (MUST unset NODE_ENV first!)
cd /home/chuan/workdir/review-handbook/web
unset NODE_ENV && npx next dev -p 3456 -H 0.0.0.0 &

# Build
npx tsx scripts/prebuild.ts && npm run build

# Skill
/review-handbook search    # Weekly search
/review-handbook add       # Manual add
/review-handbook import    # Cold start import
/review-handbook daily     # Search + build + push
```

## Project Structure

```
review-handbook/
├── data/                    # Source of truth (YAML)
│   ├── config.yaml          # Target role, model (deepseek-v4-flash)
│   ├── topics.yaml          # 7 main topics, 35 subtopics
│   ├── roadmap.yaml         # 15-week × 100-day plan
│   ├── progress.yaml        # Day/week tracking
│   └── notes/               # 5 types: foundation|interview_qa|advanced|coding|paper
│       └── NOTE: directory names MUST match NoteType exactly!
├── web/                     # Next.js 16 static site
│   ├── next.config.ts       # output: 'export', basePath: '/review-handbook'
│   ├── scripts/prebuild.ts  # Copies data/ → web/src/data/ before build
│   └── src/
│       ├── app/             # Pages: roadmap, week/[id], notes, cards, topics
│       ├── components/      # UI: NavBar, NoteCard, NoteDetail, InterestBar, etc.
│       └── lib/             # types.ts, data-loader.ts, utils.ts
├── skill/                   # Claude Code Skill
│   ├── SKILL.md             # Full workflow documentation
│   └── scripts/             # Python helpers
└── .github/workflows/       # GitHub Pages auto-deploy
```

## Data Model

### Note Types (exact string match required for directories!)
- `foundation` → `data/notes/foundation/`
- `interview_qa` → `data/notes/interview_qa/`
- `advanced` → `data/notes/advanced/`
- `coding` → `data/notes/coding/`
- `paper` → `data/notes/papers/`

### Note Schema
```yaml
id: "type-weekNN-slug"
title: "标题"
type: "foundation"
week: 1
topics: ["topic-id"]
tags:
  - name: "标签"
    initial_weight: 1.5    # 0.5~2.0
sources: [{platform, url, title, saved_at}]
images: [{url, caption}]    # 小红书图片
summary: "Markdown 摘要"
key_points: ["要点"]
review_questions: ["自测"]
difficulty: 3              # 1-5
status: "completed"
recommendations: ["note-id"]
```

## Key Design Decisions

- **Pure Server Components**: Pages render server-side only. No client hydration issues.
  All inline styles (no Tailwind dependency for layout).
- **Sort weight = tag_interest × ebbinghaus_urgency**: SM-2 algorithm, localStorage persisted.
- **Images**: Stored as URLs in `images[]` field, rendered with lightbox in week/notes/cards pages.
- **NODE_ENV**: Must be unset before `npm run dev` (Tailwind v4 devDependencies issue).
- **prebuild**: Must run from `web/` directory (uses relative paths).

## Known Issues

1. **WSL→Windows Chrome CDP**: Can't connect to Windows Chrome remote debugging.
   `networkingMode=mirrored` doesn't resolve the port access issue.
   Try: close all Chrome → taskkill /f /im chrome.exe → start with `--remote-debugging-port=8555`
