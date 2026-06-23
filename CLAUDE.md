# 复习手册 — Claude Code Project Guide

## Overview

复习手册 (Review Handbook) — hybrid web knowledge management for 100-day embodied AI interview prep.
Content pipeline: 小红书/知乎 → Claude Code Skill → YAML notes → Next.js app → GitHub Pages.

**Two modes:**
- **Dev mode** (`npm run dev`): Full Next.js server with API routes, admin panel for editing data. Reads/writes `data/` directly.
- **Static mode** (`npm run build:static`): Static export for GitHub Pages. No server, no admin panel.

## Usage Guide

### Local Dev Mode（本地动态模式）

启动本地开发服务器，支持浏览和编辑数据：

```bash
cd /home/chuan/workdir/review-handbook/web
unset NODE_ENV && npx next dev -p 3456 -H 0.0.0.0
```

打开 <http://localhost:3456>，右下角会出现 **⚙ 管理面板**，可以：
- 查看当前进度（第几周、第几天、连续打卡）
- **✅ 每日打卡**：标记今天为已完成
- **→ 前进一天**：手动推进 current_day

在每周详情页（Week 页面）点击笔记的完成按钮，笔记状态会自动写入 `data/notes/{type}/{id}.yaml`。

所有编辑直接写入 `data/` 目录下的 YAML 文件，这些文件是 git tracked 的。

### Push to GitHub（发布到线上）

```bash
cd /home/chuan/workdir/review-handbook
git add data/ web/
git commit -m "Update: Week X Day Y — 更新内容描述"
git push origin main
```

推送后 GitHub Actions 自动运行 `build:static` 构建静态站点，部署到 GitHub Pages。

线上地址（静态，只读，无管理面板）: <https://personal996.github.io/review-handbook/>

### Static Build（手动静态构建）

```bash
cd /home/chuan/workdir/review-handbook/web
npm run build:static   # 产出在 web/out/
```

构建过程：`build-static.sh` 临时隐藏 `src/app/api/`（静态导出不支持 API 路由）、替换为 `next.config.export.ts`、执行 `next build`、恢复原始文件。

### Skill Commands（Claude Code 内容生产）

```bash
/review-handbook search    # Weekly search（检索本周主题内容）
/review-handbook add       # Manual add（手动添加单条内容）
/review-handbook import    # Cold start import（冷启动批量导入）
/review-handbook daily     # Search + build + push（每日自动化）
```

## Project Structure

```
review-handbook/
├── data/                    # Source of truth (YAML) — read/write in dev, read-only in CI
│   ├── config.yaml          # Target role, model (deepseek-v4-flash)
│   ├── topics.yaml          # 7 main topics, 35 subtopics
│   ├── roadmap.yaml         # 15-week × 100-day plan
│   ├── progress.yaml        # Day/week tracking
│   └── notes/               # 5 types: foundation|interview_qa|advanced|coding|paper
│       └── NOTE: directory names MUST match NoteType exactly!
├── web/                     # Next.js 16 hybrid app
│   ├── next.config.ts       # Dev config (no export, supports API routes)
│   ├── next.config.export.ts  # Static build config (output: 'export')
│   ├── scripts/
│   │   ├── prebuild.ts      # [DEPRECATED] No longer needed; kept for reference
│   │   └── build-static.sh  # Static build wrapper (hides api/, swaps config, builds)
│   └── src/
│       ├── app/
│       │   ├── api/         # API routes (dev-mode only; hidden during static build)
│       │   │   ├── ping/    # Dev-mode detection
│       │   │   ├── progress/  # Progress read/write
│       │   │   └── notes/[id]/ # Note status mutations
│       │   ├── layout.tsx   # Root layout with NavBar + AdminPanel
│       │   ├── roadmap/     # 100-day plan overview
│       │   ├── week/[id]/   # Weekly detail with note cards
│       │   ├── notes/       # All notes browser
│       │   ├── cards/       # Spaced repetition card view
│       │   └── topics/      # Progress by topic
│       ├── components/      # UI: NavBar, NoteCard, NoteDetail, AdminPanel, etc.
│       └── lib/             # types.ts, data-loader.ts (hybrid read/write), utils.ts
├── skill/                   # Claude Code Skill
└── .github/workflows/       # GitHub Pages auto-deploy
```
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
images: [{url, caption}]    # 小红书图片 (xhscdn.com CDN)
summary: "Markdown 摘要"
key_points: ["要点"]
review_questions: ["自测"]
difficulty: 3              # 1-5
status: "completed"
recommendations: ["note-id"]
```

**Notes on data storage:**
- **笔记内容**：保存为 `data/notes/{type}/{id}.yaml`，含完整文本（title, summary, desc）
- **图片**：引用小红书 CDN URL（`xhscdn.com`），**不本地存储**。CDN URL 长期有效，但若图片变大可重新抓取
- **原始来源**：URL 保存于 `sources` 字段，可随时用 `xhs read` 重新获取

## Key Design Decisions

- **Hybrid Architecture**: Dev mode uses full Next.js server with API routes for data mutations. Static build uses `output: 'export'` with a wrapper script that temporarily hides API routes.
- **Pure Server Components**: Pages render server-side only. No client hydration issues. All inline styles (no Tailwind dependency for layout).
- **Data Directory**: Data-loader reads from `../../data/` (project root) in both dev and build. No more prebuild copy step.
- **Admin Panel**: Floating ⚙ button auto-detects dev mode via `/api/ping`. Shows progress controls in dev, hidden in static.
- **Sort weight = tag_interest × ebbinghaus_urgency**: SM-2 algorithm, localStorage persisted.
- **Images**: Stored as URLs in `images[]` field, rendered with lightbox in week/notes/cards pages.
- **NODE_ENV**: Must be unset before `npm run dev` (Tailwind v4 devDependencies issue).
- **prebuild**: Deprecated. Data-loader reads directly from `../../data/`. File kept for reference.

## Known Issues

1. **WSL→Windows Chrome CDP**: Can't connect to Windows Chrome remote debugging.
   `networkingMode=mirrored` doesn't resolve the port access issue.
   Try: close all Chrome → taskkill /f /im chrome.exe → start with `--remote-debugging-port=8555`
2. **YAML formatting**: `yaml.dump` may slightly reorder keys in written files. Content is preserved.
3. **API routes + static export**: The `build-static.sh` script temporarily moves `app/api/` to `.api.bak` (web root) during static builds. If the script is interrupted, run `scripts/build-static.sh` again to restore state, or manually: `mv web/.api.bak web/src/app/api` and `mv web/next.config.ts.bak web/next.config.ts`.
