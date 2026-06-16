# 复习手册 — Claude Code Skill

## Overview

This skill manages the "复习手册" (Review Handbook) knowledge base — a 100-day interview preparation system for embodied AI / algorithm engineer roles.

**Model**: Uses `deepseek-v4-flash` (from `data/config.yaml`). This model supports image reading, which is critical for 小红书 content (many posts are images with text overlay). When invoking this skill, Claude should use the model specified in config.yaml.

**Two-phase content pipeline:**
1. **冷启动（Cold Start）**: Import existing liked/collected posts from 小红书 & 知乎 to bootstrap the knowledge base
2. **每周检索（Weekly Search）**: Actively search both platforms based on each week's learning theme, retrieve relevant posts, summarize into structured notes

**Content Types** (5 categories):
| Type | Key | Description |
|------|-----|-------------|
| 📖 基础知识 | `foundation` | Core concepts, theories, fundamentals |
| 💬 面试问答 | `interview_qa` | Interview questions with model answers |
| 🚀 进阶知识 | `advanced` | Deep dives, architecture analysis, cutting-edge |
| 💻 Coding | `coding` | Algorithm implementations, leetcode, code walkthrough |
| 📄 推荐论文 | `paper` | Must-read papers with summaries and key takeaways |

**Tag Weight System**:
- Each note's tags have `initial_weight` (0.5 ~ 2.0) set by the skill based on relevance/importance
- Users can tap 👍 感兴趣 / 😐 一般 / 👎 不感兴趣 on each tag in the mobile UI
- Notes are sorted by combined weight: `sum(tag.initial_weight × user_preference_multiplier)`
- User preferences stored in browser localStorage

## When to Use

Invoke this skill when the user:
- Needs to bootstrap from existing collections (`import`)
- Wants to search & fetch content for the current week's topics (`search`)
- Has a specific post to add manually (`add`)
- Needs to generate or update the learning roadmap (`roadmap`)
- Wants to update study progress (`progress`)
- Mentions "复习手册", "review-handbook", or any command

## Project Structure

```
review-handbook/
├── data/
│   ├── config.yaml          # Target role, focus areas
│   ├── topics.yaml          # Topic taxonomy (7 parent, 35+ subtopics)
│   ├── roadmap.yaml         # 15-week / 100-day learning plan
│   ├── progress.yaml        # Study progress tracking
│   ├── notes/               # Individual study notes
│   │   ├── foundations/
│   │   ├── interview-qa/
│   │   └── papers/
│   └── collections/         # Raw source indexes
│       ├── xiaohongshu.yaml
│       └── zhihu.yaml
├── skill/                   # This skill
│   ├── SKILL.md
│   └── scripts/
└── web/                     # Next.js static site
```

---

## Commands

### 1. `/review-handbook import` — 冷启动：导入已有收藏

Import the user's existing liked/collected posts from 小红书 or 知乎 to bootstrap the knowledge base. This is the **first step** when setting up the project.

**Usage:**
```
/review-handbook import --source <xiaohongshu|zhihu>
```

**Cold Start Workflow:**

#### Phase A: Collect User Data
1. **Ask the user** to provide their existing collections. Two methods:

   **Method 1 — Platform Export (preferred for 知乎):**
   - 知乎: Settings → Account Security → Data Export → 导出收藏(answer/question/article)
   - User downloads JSON, pastes into chat or provides file path

   **Method 2 — Manual Collection List:**
   - User opens 小红书/知乎 app, goes to their likes/collections
   - For each post, user copies: URL + title (and optionally brief notes)
   - Paste as a list into chat

   **Method 3 — Screenshot Dump:**
   - User scrolls through their collections and takes screenshots
   - Claude extracts text via vision, identifies posts by title/URL patterns

2. **Parse and index** all collected posts:
   - Extract URL, title, platform, saved date
   - Write index to `data/collections/{platform}.yaml`
   - Report: total posts found, topic distribution, coverage gaps

#### Phase B: Process into Notes
3. For each collected post (or top-priority ones first):
   - Use WebFetch to retrieve content (fallback: ask user to paste)
   - **Analyze** and extract:
     - Content type (foundation / interview_qa / paper)
     - Relevant topics (match against `data/topics.yaml`)
     - Difficulty level (1-5)
     - Key points (3-7 bullet points)
     - Summary (~200 words)
     - Review questions (2-4 self-test questions)
   - Generate `note_id` from title (slugify)
   - Write note to `data/notes/{type}/{note_id}.yaml`

4. **Map to roadmap**: Match each note to the best-fitting week based on topic overlap. Add note reference to `data/roadmap.yaml`.

5. Report summary:
   - Total posts collected → notes created
   - Week coverage (which weeks have content, which are empty)
   - Topic coverage heatmap

---

### 2. `/review-handbook search` — 每周主动检索

Search 小红书 and 知乎 for the current week's learning themes, retrieve and summarize posts into structured notes. This is the **core daily/weekly command**.

**Usage:**
```
/review-handbook search [--week <N>] [--platform <xiaohongshu|zhihu|all>]
                         [--type <foundation|interview_qa|paper|all>]
                         [--max-results <N>]
```

If `--week` is not specified, uses `progress.current_week` from `progress.yaml`.

**Search Workflow:**

#### Step 1: Read Weekly Context
Read `data/roadmap.yaml` for the target week:
- Week theme (e.g., "机器人学基础：运动学与坐标变换")
- Topics (e.g., `["kinematics", "motion-planning", "ros"]`)
- Existing content slots (to avoid duplicates)

#### Step 2: Construct Search Queries
For each topic, generate **3 types of search queries** in parallel:

| Content Type | Query Pattern (知乎) | Query Pattern (小红书) |
|---|---|---|
| **基础知识** | `site:zhihu.com {topic_name} 入门 详解 原理` | `site:xiaohongshu.com {topic_name} 学习笔记 总结` |
| **面试问答** | `site:zhihu.com {topic_name} 面试题 手写` | `site:xiaohongshu.com {topic_name} 面试 面经 算法岗` |
| **推荐论文** | `site:zhihu.com {topic_name} 论文解读 必读` | `site:xiaohongshu.com {topic_name} 论文 精读` |

Example for Week 1 topic "kinematics":
- 基础: `site:zhihu.com 机器人运动学 DH参数 详解`
- 面试: `site:zhihu.com 机器人 逆运动学 面试题`
- 论文: `site:zhihu.com 运动规划 RRT* 论文解读`
- 小红书: `site:xiaohongshu.com 机器人运动学 学习笔记`

Use **WebSearch** tool for all queries. The `site:` operator helps target the specific platform.

#### Step 3: Fetch and Filter
For each search result (top ~5-8 per query):
1. Use **WebFetch** to retrieve the full page content
2. Filter out:
   - Paywalled content
   - Low-quality / too-short posts
   - Posts already indexed in `collections/{platform}.yaml`
   - Irrelevant content (doesn't match the week's topics)
3. Prioritize:
   - High engagement (likes/comments)
   - Comprehensive content (>1000 words)
   - Recent posts (last 1-2 years)
   - Official/verified authors

#### Step 4: Analyze and Create Notes
For each selected post, follow the same analysis pipeline as `add`:
- Extract title, key points, difficulty, topics
- Generate summary and review questions
- Write note YAML to `data/notes/{type}/{note_id}.yaml`
- Add reference to `data/roadmap.yaml` in the target week
- Record source in `data/collections/{platform}.yaml`

#### Step 5: Report
```
📊 Week 3 检索完成
  搜索话题: ["deep-learning-basics", "optimization", "transformers"]
  搜索查询: 9 个 (知乎×6 + 小红书×3)
  获取结果: 45 条
  筛选通过: 12 条
  新建笔记:
    📖 基础知识 (4): Backprop推导, 激活函数对比, ...
    💬 面试问答 (5): BatchNorm vs LayerNorm, Attention手写, ...
    📄 推荐论文 (3): Attention Is All You Need, ...
  已跳过重复: 3 条
  💡 建议: 运行 /review-handbook progress --status 查看当前进度
```

---

### 3. `/review-handbook add` — 手动添加单条内容

Manually add a specific post. Use this when the user has a specific post they want to process right away, or when WebFetch is blocked.

**Usage:**
```
/review-handbook add --source <xiaohongshu|zhihu> [--week <N>] [--type <foundation|interview_qa|paper>]
```

**Workflow:**
1. Ask user to paste the post text (or URL)
2. If URL provided, attempt WebFetch
3. Analyze and extract structured content (same as search pipeline)
4. Write note and update roadmap/collections
5. Report what was created

---

### 4. `/review-handbook roadmap` — 生成/更新路线图

Generate or update the 100-day learning roadmap based on target role.

**Usage:**
```
/review-handbook roadmap [--role "具身智能算法工程师"] [--update]
```

**Workflow:**
1. Read `data/config.yaml` for target role and focus areas
2. Read `data/topics.yaml` for topic taxonomy
3. Generate a 15-week plan with themes, topics, date ranges, empty content slots
4. If `--update`, preserve existing content references
5. Write to `data/roadmap.yaml`

---

### 5. `/review-handbook progress` — 追踪学习进度

Manage study progress tracking.

**Usage:**
```
/review-handbook progress [--complete <note_id> --rating <1-5>]
                          [--note "本周总结..."]
                          [--status]
```

---

### 6. `/review-handbook daily` — 每日自动化流程

Run the full daily pipeline: search → create notes → rebuild → commit → push.

**Usage:**
```
/review-handbook daily
```

**Workflow:**
1. Read current week and day from `progress.yaml`
2. Run `search` for the current week's topics (limited to 3-5 results per type to control volume)
3. Create notes for new content
4. Run `cd web && npx tsx scripts/prebuild.ts && npm run build` to rebuild the static site
5. If in a git repo with remote configured:
   - `git add data/ web/out/`
   - `git commit -m "Daily: Week X Day Y — 新增 N 条笔记"`
   - `git push`
6. Update progress: mark day as completed
7. Report summary

This command is designed to be run once per day. Can also be automated via cron:
```
0 9 * * * cd /path/to/review-handbook && claude run "/review-handbook daily"
```

---

## Content Acquisition Strategy (Updated)

### Cold Start Phase (Day 0)
1. **Platform data export** — User exports 知乎 collections as JSON, provides 小红书 screenshot list
2. **Bulk import** — `/review-handbook import` processes everything, creates note index
3. **Roadmap generation** — `/review-handbook roadmap` generates the 100-day plan
4. **Initial mapping** — Notes auto-assigned to matching weeks by topic overlap

### Weekly Active Search Phase (Days 1-100)
1. **Read weekly theme** — Extract topics from `roadmap.yaml`
2. **Multi-platform search** — WebSearch + WebFetch on 知乎 & 小红书
3. **Quality filter** — Remove noise, prioritize high-engagement content
4. **Structured extraction** — Summarize each post into the note schema
5. **Auto-assign** — Notes placed in the correct week and content type slot

### Fallback Tiers (when WebFetch fails)
- **Tier 1**: WebSearch → user clicks link → user pastes text
- **Tier 2**: Screenshot → Claude Vision extracts text
- **Tier 3**: User manually finds and pastes content

---

## Tips
- The `daily` command is designed to run once per day — it keeps the knowledge base growing steadily
- Run `search` multiple times per week for the same topics to find the best content
- Notes can be manually edited in YAML files — the skill reads and preserves manual changes
- After adding content, the web app needs rebuild: `cd web && npx tsx scripts/prebuild.ts && npm run build`
- For GitHub Pages auto-deploy, push changes to main branch — the GitHub Actions workflow handles the rest
