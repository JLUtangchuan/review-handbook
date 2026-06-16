# 📚 复习手册 — Review Handbook

> 100天系统化算法岗面试准备 · 从机器人学到VLA模型 · 手机端随时刷题

## 这是什么？

复习手册是一个**静态Web知识管理工具**，帮助你系统化准备具身智能/算法岗面试。

- 🗺️ **100天学习路线图** — 15周的渐进式学习计划
- 📝 **结构化笔记** — 基础知识 + 面试问答 + 推荐论文
- 📱 **手机端优化** — GitHub Pages部署，随时随地刷题
- 🤖 **Claude Code Skill** — 主动检索小红书/知乎 + 自动总结成笔记

## 快速开始

### 本地预览
```bash
cd web
npm install
npx tsx scripts/prebuild.ts  # 复制数据文件
npm run dev                    # 启动开发服务器
```

### 部署到GitHub Pages
1. Fork或创建仓库 `review-handbook`
2. 在仓库 Settings → Pages 中启用GitHub Pages，source选择 `gh-pages` 分支
3. Push到 `main` 分支，GitHub Actions自动部署
4. 访问 `https://<your-username>.github.io/review-handbook/`

## 使用Claude Code Skill

### 冷启动：导入已有收藏

```bash
# Step 1: 导入小红书/知乎的点赞收藏
/review-handbook import --source zhihu
/review-handbook import --source xiaohongshu

# Step 2: 生成100天学习路线图
/review-handbook roadmap --role "具身智能算法工程师"
```

### 每日/每周：自动检索+整理

```bash
# 搜索当前周主题，自动检索两个平台并生成笔记
/review-handbook search

# 指定周数和内容类型
/review-handbook search --week 3 --type interview_qa

# 每日一键：检索→生成笔记→构建→push
/review-handbook daily
```

### 手动操作

```bash
# 手动添加某条帖子
/review-handbook add --source xiaohongshu --week 3 --type foundation

# 更新学习进度
/review-handbook progress --complete fnd-week01-kinematics --rating 4
/review-handbook progress --status
```

## 项目结构

```
review-handbook/
├── data/                 # 用户数据（YAML，Git版本控制）
│   ├── config.yaml       # 目标岗位配置
│   ├── topics.yaml       # 话题分类体系
│   ├── roadmap.yaml      # 100天学习路线图
│   ├── progress.yaml     # 学习进度追踪
│   └── notes/            # 结构化笔记
├── skill/                # Claude Code Skill
│   ├── SKILL.md          # Skill定义
│   └── scripts/          # Python工具脚本
├── web/                  # Next.js静态网站
│   └── src/app/          # 页面路由
└── .github/workflows/    # 自动部署
```

## 路线图预览

| 周 | 主题 | 重点内容 |
|---|------|---------|
| 1-2 | 机器人学基础 | 运动学、动力学、控制理论 |
| 3 | 深度学习回顾 | Backprop、Transformer、优化器 |
| 4 | 计算机视觉 | 3D感知、点云处理 |
| 5-6 | 强化学习 | RL基础、模仿学习、离线RL |
| 7-9 | VLA模型 | RT系列、OpenVLA、π0 |
| 10 | 3D感知 | NeRF、3D Gaussian Splatting |
| 11-12 | 操作与Sim-to-Real | 灵巧操作、域迁移 |
| 13 | ML系统设计 | 推理系统、分布式训练 |
| 14-15 | 综合复习 | 论文精读、模拟面试 |

## 技术栈

- **Next.js 16** + React 19 + TypeScript
- **TailwindCSS 4** — 暗色模式默认，移动端优先
- **Static Export** — 纯静态站点，部署在GitHub Pages
- **YAML** — 所有数据以YAML存储，方便编辑和Git diff

---

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
