---
note_id: 6833fce000000000200280fe
title: "Raw2Drive：首个端到端自动驾驶RL框架"
author: "🎃量子智心"
source_url: https://www.xiaohongshu.com/explore/6833fce000000000200280fe
platform: xiaohongshu
date: 2025-05-26
likes: 43
collects: 67
tags: ["LLM", "RAG", "agent", "multimodal", "大模型", "检索增强", "多模态", "长文本"]
topic: ""
subtopic: ""
status: pending
---

# Raw2Drive：首个端到端自动驾驶RL框架

> 作者: @🎃量子智心 | 👍 43 | ⭐ 67
> 来源: https://www.xiaohongshu.com/explore/6833fce000000000200280fe

---

📊arXiv 23-May-2025 Agent相关论文(21/37)
🏠更多论文见主页/合集
🌐arXiv ID: arXiv:2505.16394
📚论文标题: Raw2Drive: Reinforcement Learning with Aligned World Models for End-to-End Autonomous Driving (in CARLA v2)
🔍 问题背景：传统强化学习（RL）在端到端自动驾驶（E2E-AD）中的应用面临训练难度高和收敛性差的问题。尽管模仿学习（IL）在学术界和工业界仍占主流，但其在处理未见过的情况时表现不佳，存在因果混淆和分布偏移等问题。
💡 研究动机：为了克服这些挑战，研究团队提出了Raw2Drive，这是一种基于双流模型的强化学习方法。该方法通过利用特权信息训练世界模型，并将其与原始传感器数据的世界模型对齐，从而有效指导原始传感器策略的学习。
🚀 方法简介：Raw2Drive首先使用特权信息训练一个辅助的世界模型和神经规划器。随后，通过设计的引导机制，训练一个基于原始传感器数据的世界模型，确保其与特权世界模型在预测未来状态时保持一致。最终，利用特权世界模型中的先验知识，有效地指导原始传感器策略的训练。
📊 实验设计：在CARLA v2和Bench2Drive两个基准数据集上进行了实验，评估了模型在复杂驾驶场景中的性能。实验结果表明，Raw2Drive在多个指标上均达到了最先进的水平，显著超越了现有的模仿学习方法。
	
﻿#LLM[话题]#﻿ ﻿#RAG[话题]#﻿ ﻿#agent[话题]#﻿ ﻿#multimodal[话题]#﻿ ﻿#大模型[话题]#﻿ ﻿#检索增强[话题]#﻿ ﻿#多模态[话题]#﻿ ﻿#长文本[话题]#﻿


**标签**: #LLM #RAG #agent #multimodal #大模型 #检索增强 #多模态 #长文本

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232210/4e46447919e91c6efdf3ab8f937a80c2/spectrum/1040g0k031hueqdi0k2005p6onn0g9t25j04ml98!nd_dft_wlteh_webp_3)
*1224×1584*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232210/306888c0bc0f6900026dbdd12af3b46a/spectrum/1040g0k031hueqdi0k20g5p6onn0g9t25e0lqopg!nd_dft_wlteh_webp_3)
*800×1200*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232210/f81e48cdc2ae6b96f095223f09b7070b/spectrum/1040g0k031hueqdi0k2105p6onn0g9t25fv9l7f0!nd_dft_wgth_webp_3)
*1191×882*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232210/db587dff0769dcab12951f60afa931ba/spectrum/1040g0k031hueqdi0k21g5p6onn0g9t25a9vk4mo!nd_dft_wgth_webp_3)
*1179×321*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232210/65c301f3039d4300e88765088df8f772/spectrum/1040g0k031hueqdi0k2205p6onn0g9t2503bj28o!nd_dft_wgth_webp_3)
*1191×618*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232210/439406cf6cf9df1524fd0c3c6f1063d0/spectrum/1040g0k031hueqdi0k22g5p6onn0g9t25uk4o6ro!nd_dft_wgth_webp_3)
*1182×354*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232210/3a7a8bae4c82736dfd2af100429083cc/spectrum/1040g0k031hueqdi0k2305p6onn0g9t254tjpj40!nd_dft_wgth_webp_3)
*1200×639*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232210/46e278780441010168b682e0af695b8c/spectrum/1040g0k031hueqdi0k23g5p6onn0g9t25tpqou50!nd_dft_wgth_webp_3)
*1200×555*

![图片9](http://sns-webpic-qc.xhscdn.com/202606232210/b65ebbf1976722bf8a7b911cfb5f46bd/spectrum/1040g0k031hueqdi0k2405p6onn0g9t2540oqp1g!nd_dft_wgth_webp_3)
*1197×528*

![图片10](http://sns-webpic-qc.xhscdn.com/202606232210/c04ad6ee529e898b3801e0ee61bfba7d/spectrum/1040g0k031hueqdi0k24g5p6onn0g9t254ahh15g!nd_dft_wgth_webp_3)
*1200×333*

![图片11](http://sns-webpic-qc.xhscdn.com/202606232210/2e0fcc591027661fb162aadde2804651/spectrum/1040g0k031hueqdi0k2505p6onn0g9t256vkhcvo!nd_dft_wgth_webp_3)
*1188×297*

![图片12](http://sns-webpic-qc.xhscdn.com/202606232210/aa15d8d11a551cf9a2646d2535e1f370/spectrum/1040g0k031hueqdi0k25g5p6onn0g9t25h4dimt8!nd_dft_wgth_webp_3)
*1182×246*

![图片13](http://sns-webpic-qc.xhscdn.com/202606232210/c0e876c84b0abc36836418fa97ddee89/spectrum/1040g0k031hueqdi0k2605p6onn0g9t253d400s0!nd_dft_wgth_webp_3)
*1182×384*

![图片14](http://sns-webpic-qc.xhscdn.com/202606232210/c0ea044100a927ade86ceab16d4bd557/spectrum/1040g0k031hueqdi0k26g5p6onn0g9t25624b55o!nd_dft_wgth_webp_3)
*540×195*

![图片15](http://sns-webpic-qc.xhscdn.com/202606232210/9b0aa9f0b007d3e98124b1edbe465bdb/spectrum/1040g0k031hueqdkok2005p6onn0g9t254poct1o!nd_dft_wgth_webp_3)
*588×189*

![图片16](http://sns-webpic-qc.xhscdn.com/202606232210/e08208820ce8af5115f35ecd633d2e7d/spectrum/1040g0k031hueqdkok20g5p6onn0g9t25iad8a1g!nd_dft_wgth_webp_3)
*708×147*

![图片17](http://sns-webpic-qc.xhscdn.com/202606232210/f7f7728affc0e6770cc5a00cae47caea/spectrum/1040g0k031hueqdkok2105p6onn0g9t2531f7flo!nd_dft_wgth_webp_3)
*477×156*

![图片18](http://sns-webpic-qc.xhscdn.com/202606232210/9b9ccbada958358e35f6a956c86eca87/spectrum/1040g0k031hueqdkok21g5p6onn0g9t25scl4etg!nd_dft_wgth_webp_3)
*651×120*

