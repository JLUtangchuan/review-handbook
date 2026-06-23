---
note_id: 684f7f86000000002102ca4d
title: "ReCogDrive：融合RL的三阶段VLA训练框架"
author: "Richard 学 AI"
source_url: https://www.xiaohongshu.com/explore/684f7f86000000002102ca4d
platform: xiaohongshu
date: 2025-06-16
likes: 39
collects: 37
tags: ["自动驾驶", "大模型", "强化学习", "ReCogDrive", "DiffusionPlanner", "端到端控制", "VLM"]
topic: ""
subtopic: ""
status: pending
---

# ReCogDrive：融合RL的三阶段VLA训练框架

> 作者: @Richard 学 AI | 👍 39 | ⭐ 37
> 来源: https://www.xiaohongshu.com/explore/684f7f86000000002102ca4d

---

今天推荐一篇来自华中科技大学 & 小米EV团队的端到端自动驾驶研究：
《ReCogDrive: A Reinforced Cognitive Framework for End-to-End Autonomous Driving》
论文地址：arXiv:2506.08052
🧩背景问题：大模型+自动驾驶，真能驾驭复杂现实？
当前端到端自动驾驶模型（如 UniAD、VAD）在开环 benchmark 表现优异，但一到真实道路环境——特别是长尾复杂场景（拥堵路口、遮挡物体等），性能大幅下降。
近期很多工作引入 VLMs（视觉-语言大模型），比如 DriveVLM、GPT-Driver、EMMA，试图利用大模型的世界知识来增强泛化能力，但存在三大痛点：
1）预训练数据与驾驶场景差异大，认知错位；
2）语言输出难以转化为精确轨迹；
3）模仿学习固化专家行为，泛化不足、容错性差。
🔧ReCogDrive：认知+扩散+强化的三合一系统
ReCogDrive 提出一个新范式，将 VLMs 的“认知力”与扩散模型的“生成力”结合，再用强化学习进行“安全微调”。整个系统分三步走：
1️⃣ 构建310万条高质量驾驶问答数据集
涵盖场景理解、动作解释、物体识别，训练出适配驾驶任务的多模态大模型。
2️⃣ 引入Diffusion Planner
将语言表征转化为连续轨迹，避免文本生成轨迹“失真”问题，输出更加平滑可控。
3️⃣ 强化学习微调（RL+NAVSIM）
在高保真仿真器中，用碰撞、安全、舒适度评分反馈对规划器进行强化训练，实现轨迹的主动探索+安全优化。
📊实验结果：性能领先，结构合理
-在NAVSIM benchmark 上，ReCogDrive 取得 89.6 PDMS，
-比现有 SOTA 高出 +5.6，即使只用前视摄像头，也超越了融合激光雷达的方案！
-消融实验也验证：问答预训练、扩散轨迹、RL微调，三者缺一不可。
-不仅生成轨迹平稳，还能输出驾驶解释与场景理解结果，增强可解释性。
✨总结一句话：
ReCogDrive 是当前最系统地将认知大模型、扩散生成、强化学习融合到自动驾驶中的工作之一，突破了从“听得懂”到“做得好”的关键瓶颈。
﻿#自动驾驶[话题]#﻿ ﻿#大模型[话题]#﻿ ﻿#强化学习[话题]#﻿ ﻿#ReCogDrive[话题]#﻿ ﻿#DiffusionPlanner[话题]#﻿ ﻿#端到端控制[话题]#﻿ ﻿#VLM[话题]#﻿


**标签**: #自动驾驶 #大模型 #强化学习 #ReCogDrive #DiffusionPlanner #端到端控制 #VLM

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232210/52b658fcd3f4ca028e6e655adea25b8c/spectrum/1040g0k031ipag7gg0s005o45ip70bii19jekkc8!nd_dft_wgth_webp_3)
*1518×1260*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232210/ecb3007c3911d2ee5c172657656d2628/spectrum/1040g0k031ipag7gg0s0g5o45ip70bii123h5lm0!nd_dft_wgth_webp_3)
*1554×1048*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232210/f5f1de66aebf0864f019a5a2508b116d/spectrum/1040g0k031ipag7gg0s105o45ip70bii1j1qc8l8!nd_dft_wgth_webp_3)
*1128×916*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232210/9c63a195190bcd3e9ddea75d5dc24906/spectrum/1040g0k031ipag7gg0s1g5o45ip70bii18t288bg!nd_dft_wgth_webp_3)
*1112×606*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232210/4f20baa03ab4174643b6233ec8a72e0a/spectrum/1040g0k031ipag7gg0s205o45ip70bii1g1buj3o!nd_dft_wgth_webp_3)
*1096×472*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232210/ce6cd6ee58119661d9d351d77dbe374a/spectrum/1040g0k031ipag7gg0s2g5o45ip70bii1seceb3o!nd_dft_wgth_webp_3)
*1098×638*

