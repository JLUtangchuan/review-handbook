# 复习手册 — 设计文档

## 项目概述

复习手册（Review Handbook）是一个静态 Web 知识管理系统，面向具身智能/算法岗的 100 天系统化面试准备。核心思路：通过 Claude Code Skill 从小红书、知乎自动检索面试相关内容，总结为结构化笔记，在手机上随时刷题复习。

## 架构设计

```
┌─────────────────────────────────────────────────┐
│                 数据层 (YAML)                     │
│  config.yaml  topics.yaml  roadmap.yaml          │
│  progress.yaml  notes/*.yaml                     │
│  collections/{xiaohongshu,zhihu}.yaml            │
└──────────────────┬──────────────────────────────┘
                   │ prebuild.ts 复制
                   ▼
┌─────────────────────────────────────────────────┐
│            Next.js 16 静态站点                    │
│  Server Components → 构建时读取 YAML → 静态 HTML  │
│  output: 'export' → GitHub Pages                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│             Claude Code Skill                    │
│  import → search → add → daily                  │
│  WebSearch + WebFetch + Browser MCP              │
└─────────────────────────────────────────────────┘
```

### 技术选型

| 层 | 技术 | 理由 |
|---|------|------|
| Web | Next.js 16 + React 19 + TypeScript | 静态导出，GitHub Pages 原生支持 |
| CSS | TailwindCSS 4 | 暗色模式默认，移动端优先，运行时零开销 |
| 数据 | YAML | 比 JSON 更适合中文编辑，Git diff 友好 |
| Skill | Python + SKILL.md | 确定性 I/O 用 Python，内容分析用 Claude |
| 部署 | GitHub Actions → gh-pages | Push 自动部署 |

### 为什么用纯 Server Components？

早期版本使用 Client Components 做交互，但浏览器 hydration 失败导致页面空白。改为 Server Components + inline styles 后所有页面 100% 可靠渲染。后续交互功能（兴趣按钮、进度标记）通过 localStorage + 渐进增强加回。

## 数据模型

### Note（笔记）— 核心实体

```yaml
id: "fnd-week01-kinematics"
title: "机器人正逆运动学与DH参数法"
type: "foundation"  # foundation|interview_qa|advanced|coding|paper
week: 1
topics: ["kinematics"]
tags:
  - name: "运动学"
    initial_weight: 1.5   # 0.5~2.0
  - name: "DH参数"
    initial_weight: 1.2
sources:
  - platform: "zhihu"
    url: "https://..."
    title: "原帖标题"
images:                    # 小红书图片
  - url: "https://..."
    caption: "图示说明"
summary: "内容摘要..."
key_points: ["要点1", "要点2"]
review_questions: ["自测问题1?"]
difficulty: 3             # 1-5
recommendations: ["note-id"]  # 推荐阅读
```

### 5 种笔记类型

| 类型 | 英文 Key | 内容特征 |
|------|---------|---------|
| 基础知识 | `foundation` | 核心概念、理论原理、入门教程 |
| 面试问答 | `interview_qa` | 真题 + 模型答案 + 追问方向 |
| 进阶知识 | `advanced` | 架构剖析、前沿技术、深度分析 |
| Coding | `coding` | 算法实现、代码走读、LeetCode |
| 推荐论文 | `paper` | 必读论文 + 摘要 + 关键发现 |

## 排序算法

笔记在列表中按**组合权重**降序排列：

```
combined_weight = tag_interest_weight × ebbinghaus_urgency
```

### 标签兴趣权重

用户在手机端对每条笔记的标签点击 👍感兴趣 / 😐一般 / 👎不感兴趣：

```
tag_weight = Σ(tag.initial_weight × user_preference_multiplier)
multiplier: 感兴趣=2.0, 一般=1.0, 不感兴趣=0.3
```

### 艾宾浩斯遗忘曲线（SM-2 算法）

| 评价 | 效果 |
|------|------|
| 忘记 😰 | 间隔重置为 1 天，EF 降低 |
| 模糊 🤔 | 间隔重置为 1 天 |
| 记得 😊 | 间隔 × EaseFactor |
| 简单 😎 | 间隔 × EaseFactor × 1.3 |

```
ebbinghaus_urgency = daysSinceReview / scheduledInterval
范围: 0.3（刚复习，牢固）~ 5.0（严重逾期）
```

## 页面路由

| 路由 | 页面 | 交互 |
|------|------|------|
| `/roadmap` | 100天时间线 | 周卡片点击进入详情 |
| `/week/[1-15]` | 周详情 | 5 个 Tab，图片灯箱 |
| `/notes` | 笔记库 | 搜索+筛选，权重排序 |
| `/cards` | 卡片学习 | 点击翻转，4 级评价 |
| `/topics` | 话题进度 | 7 大话题展开树 |

## Skill 工作流

```
冷启动: import → 用户提供收藏 → 批量生成笔记
每周:   search → WebSearch 两个平台 → 筛选 → 总结 → 写 YAML
每日:   daily  → search + build + git push 一键完成
```

### 内容获取分层

| 层级 | 方法 | 可靠性 |
|------|------|--------|
| WebSearch | 搜知乎/小红书 | 知乎 ✅ 小红书 ❌ |
| WebFetch | 抓取全文 | 知乎 403 小红书 403 |
| Chrome CDP | 浏览器自动化 | 待配置 |
| 手动粘贴 | 用户复制文字 | 100% |

## 缺陷与改进方向

1. **Chrome 连接**：WSL2→Windows CDP 端口通信问题未解决，影响小红书内容获取
2. **Client Components**：目前全量 SSR，后续需逐步恢复交互（兴趣按钮、进度标记）
3. **离线支持**：可加入 Service Worker 实现离线刷题
4. **部署自动化**：当前需要手动 `git push`，可配置 GitHub Actions
