---
note_id: 69ae88a9000000002800a879
title: "UniDrive-WM：统一的自动驾驶世界模型"
author: "AI智沿前线"
source_url: https://www.xiaohongshu.com/explore/69ae88a9000000002800a879
platform: xiaohongshu
date: 2026-03-09
likes: 37
collects: 41
tags: ["科研日常", "文献阅读", "世界模型", "自动驾驶", "智驾", "大模型"]
topic: ""
subtopic: ""
status: pending
---

# UniDrive-WM：统一的自动驾驶世界模型

> 作者: @AI智沿前线 | 👍 37 | ⭐ 41
> 来源: https://www.xiaohongshu.com/explore/69ae88a9000000002800a879

---

论文：https://arxiv.org/pdf/2601.04453
项目主页：https://unidrive-wm.github.io/UniDrive-WM/
代码暂未开源。
这篇论文提出UniDrive-WM，一个面向自动驾驶的统一世界模型，由博世研究院与华盛顿大学等机构联合提出。该工作针对现有自动驾驶方法将感知、预测与规划模块割裂处理的问题，创新性地构建了一个基于视觉语言模型（VLM）的统一架构，能够同时完成驾驶场景理解、轨迹规划以及轨迹条件驱动的未来图像生成三项核心任务。
论文的核心思想是将多视角图像、时序历史信息与感知特征通过QT-Former编码器映射到大语言模型的推理空间，由VLM进行高层语义理解与指令遵循。在此基础上，轨迹规划器学习从语义推理空间到数值动作空间的可微映射，输出未来轨迹的潜在分布。该轨迹进一步作为条件信号，驱动图像生成模块预测符合规划意图的未来帧。作者探索了两种生成范式：其一是基于离散视觉token的自回归解码，通过扩展VLM码本实现视觉内容的序列生成；其二是结合自回归与扩散模型的连续表示方法，利用流匹配目标在潜在空间进行特征对齐，再通过预训练解码器重建像素。两种方案各有优势，离散方法推理高效，连续方法在高分辨率生成与几何一致性上表现更佳。
实验方面，作者在具有挑战性的Bench2Drive闭环基准上进行评估。结果显示，UniDrive-WM在轨迹规划的L2误差上降低5.9%，碰撞率下降9.2%，同时生成的未来图像在FID指标上达到先进水平。消融实验进一步验证了未来图像预测作为辅助监督信号能够有效反哺规划与感知模块，形成推理、动作与生成之间的双向信息流动。此外，模型在视觉问答任务上也展现出良好的场景理解与因果推理能力。
该工作的主要贡献在于首次将VLM的语义推理能力、轨迹规划的决策能力与生成式世界模型的想象能力有机融合于单一端到端框架中，打破了传统流水线中视觉几何信息经文本抽象造成的瓶颈。通过联合优化，模型能够以视觉化方式"想象"执行某条轨迹后将看到的场景，从而为规划提供更丰富的前瞻依据。这一思路为构建具备因果推理与安全约束能力的下一代自动驾驶世界模型提供了新方向。未来工作可进一步拓展至长时程交互场景与更复杂的多智能体环境。#科研日常[话题]# #文献阅读[话题]# #世界模型[话题]# #自动驾驶[话题]# #智驾[话题]# #大模型[话题]#


**标签**: #科研日常 #文献阅读 #世界模型 #自动驾驶 #智驾 #大模型

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232207/19595005bca84def9f1f202b942fdb39/spectrum/1040g0k031tg48g26l6105q2ag5i7aju30cc6ko8!nd_dft_wgth_webp_3)
*2022×885*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232207/89dd60e58fcd046f923fb13af767a4ff/spectrum/1040g0k031tg48g26l6005q2ag5i7aju3lv27oig!nd_dft_wgth_webp_3)
*2151×576*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232207/1cce2eebf9b9c03193cea0ab0b87f9a8/spectrum/1040g0k031tg48g26l60g5q2ag5i7aju3boh8qv8!nd_dft_wgth_webp_3)
*1992×1293*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232207/47c1351cb5ad34380e8cae1513d4a730/spectrum/1040g0k031tg48g26l61g5q2ag5i7aju37k01aig!nd_dft_wgth_webp_3)
*2052×744*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232207/39e0be87d9ea190859745b69d23d577e/spectrum/1040g0k031tg48g26l6205q2ag5i7aju3g5kj180!nd_dft_wgth_webp_3)
*2049×1053*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232207/307e2902162724a46812d91f2366b84b/spectrum/1040g0k031tg48g26l62g5q2ag5i7aju3q8ojr40!nd_dft_wgth_webp_3)
*2058×513*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232207/53ec333ed76376da40dd8637e9a3252b/spectrum/1040g0k031tg48g26l6305q2ag5i7aju3jl8ojpg!nd_dft_wgth_webp_3)
*2081×720*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232207/53d141194426f0bd5d4029c278be6125/spectrum/1040g0k031tg48g26l63g5q2ag5i7aju3vmo2880!nd_dft_wlteh_webp_3)
*780×1165*

![图片9](http://sns-webpic-qc.xhscdn.com/202606232207/7cde07f099504230b208e7544ff34f63/spectrum/1040g0k031tg48g26l6405q2ag5i7aju3lbo0ht0!nd_dft_wlteh_webp_3)
*738×1218*

![图片10](http://sns-webpic-qc.xhscdn.com/202606232207/522dcde3a0b3ed9a437db4910d66d976/spectrum/1040g0k031tg48g26l64g5q2ag5i7aju36ukq8l8!nd_dft_wgth_webp_3)
*1513×914*

![图片11](http://sns-webpic-qc.xhscdn.com/202606232207/6fc2e97f6b7b4911823a07a029897b2d/spectrum/1040g0k031tg48g26l6505q2ag5i7aju39kd9u6o!nd_dft_wlteh_webp_3)
*1062×1262*

