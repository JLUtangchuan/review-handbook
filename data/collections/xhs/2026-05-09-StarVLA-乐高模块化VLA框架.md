---
note_id: 69ff144d000000003601ea82
title: "StarVLA：乐高模块化VLA框架"
author: "AI PaperDaily"
source_url: https://www.xiaohongshu.com/explore/69ff144d000000003601ea82
platform: xiaohongshu
date: 2026-05-09
likes: 40
collects: 46
tags: ["大模型"]
topic: ""
subtopic: ""
status: pending
---

# StarVLA：乐高模块化VLA框架

> 作者: @AI PaperDaily | 👍 40 | ⭐ 46
> 来源: https://www.xiaohongshu.com/explore/69ff144d000000003601ea82

---

今天给大家带来港科大冯诺依曼研究所推出的StarVLA，一款乐高式模块化开源代码库，专门解决视觉-语言-动作(VLA)模型研发架构碎片化、代码不兼容、评测难对比复现的行业痛点。
	
🔑关键方法
1️⃣ 骨干-动作头分离架构，支持Qwen-VL等VLM骨干、Cosmos等世界模型骨干自由替换，四大动作解码范式可即插即用
2️⃣ 复用式训练体系，把跨具身学习、多模态联合训练做成通用配置，适配所有VLA模型范式
	
💡核心创新
1️⃣ 提出通用VLA统一范式，打破VLM类与世界模型类VLA的壁垒，归为同一策略框架下的变体
2️⃣ 服务端-客户端统一评测接口，集成LIBERO、RoboTwin等5大主流基准，仿真和真机部署无需改代码
	
📊实验效果
✅ 在LIBERO基准上，仅30K训练步数就超越多数主流模型，远超OpenVLA-OFT等方法的训练效率
✅ SimplerEnv、RoboCasa-GR1、RoboTwin 2.0等多基准中，VLM与世界模型双骨干均能打出顶尖性能
✅ 单模型跨多基准跨机器人具身联合训练，通用策略性能优于单独专项训练模型
	
论文：StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing
	
欢迎投稿！欢迎合作！#大模型[话题]#


**标签**: #大模型

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232206/ea5ade5dff9fbdd210638cac8e9359c0/spectrum/1040g34o31vupem1u1m105p07d6ok4ld9ikv46rg!nd_dft_wlteh_webp_3)
*1587×2245*

