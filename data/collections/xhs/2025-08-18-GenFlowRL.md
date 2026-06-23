---
note_id: 68a285b2000000001b01f3d1
title: "GenFlowRL"
author: "AI椰青"
source_url: https://www.xiaohongshu.com/explore/68a285b2000000001b01f3d1
platform: xiaohongshu
date: 2025-08-18
likes: 59
collects: 74
tags: []
topic: ""
subtopic: ""
status: pending
---

# GenFlowRL

> 作者: @AI椰青 | 👍 59 | ⭐ 74
> 来源: https://www.xiaohongshu.com/explore/68a285b2000000001b01f3d1

---

GENFLOWRL是一个基于生成物体中心流和RL的机器人操作框架，旨在通过流派奖励建模提升任务的泛化能力和鲁棒性。该框架的核心创新在于使用物体中心流，即物体关键点的2D轨迹，来改善机器人操作的细节学习，特别是在需要精细操作的任务中。
首先，物体中心流生成是通过调整预训练的视频生成模型来实现的。传统的视频生成方法通常会受到视频质量差、噪声和伪影的影响，而物体中心流通过捕捉物体运动的关键点轨迹，提供了一种低维度、有效的表示方式。与完整视频帧相比，物体中心流剔除了不相关的细节，集中在操控相关的特征，避免了生成视频中的模糊和不准确问题。该流表示包括物体在图像空间中的关键点坐标及其时序变化，极大地简化了操作过程中的环境交互建模。
其次，奖励建模采用了δ-flow，这是对物体中心流的进一步压缩和优化表示，旨在消除生成过程中的噪声。δ-flow通过统计物体关键点的运动轨迹，从而精确表示物体的动态变化。通过这种方式，框架能够提供更精细的奖励信号，帮助强化学习系统在多变和复杂的环境中保持稳定性。为了进一步增强鲁棒性，GENFLOWRL结合了基于流的稠密奖励和基于环境状态的稀疏奖励。物体流奖励用于提供目标动作的引导，而环境反馈奖励则确保机器人在执行任务时能够适应环境中的变化。
在策略设计上，GENFLOWRL采用了一种创新的低维度流表示作为策略的输入，通过结合3D物体位置信息，增强了机器人的空间感知能力。这种方式使得机器人能够有效地从生成的物体流中学习未来的运动模式，从而提高其在复杂任务中的表现。
GENFLOWRL的有效性通过在10个操作任务中的实验得到了验证。这些任务包括了多种不同类型的操作，如物体搬运、浇水、开关等，同时还考虑了不同的机器人平台和任务环境。通过与传统的视频引导RL方法和基于流的模仿学习方法进行对比，GENFLOWRL在多个任务上表现出明显的优越性，特别是在需要精细接触操作的任务中，如折叠和转动任务。相比于流派模仿学习，GENFLOWRL在使用环境反馈的同时，还能利用生成的物体流信息，从而更有效地引导RL训练，并增强了策略的鲁棒性和泛化能力。


## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232209/6b8af97c2b61f617ab8f06546d868e44/spectrum/1040g0k031lad06tvks005p2ie6c527nln2d8ds0!nd_dft_wlteh_webp_3)
*1189×1384*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232209/c61d86422e0a3d37f2c48ad541214f34/spectrum/1040g34o31lad0et3l00g5p2ie6c527nl9c8r3vg!nd_dft_wgth_webp_3)
*1532×694*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232209/3779e7668bd4dce697c309ba47223b54/spectrum/1040g0k031lad0lujks005p2ie6c527nlal0isio!nd_dft_wgth_webp_3)
*1528×956*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232209/9309e874bb3d14599ba0b685a1e7c4b7/spectrum/1040g0k031lad0rlcku005p2ie6c527nlssds638!nd_dft_wlteh_webp_3)
*794×826*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232209/d937999113538687035977e37671c037/spectrum/1040g34o31lad12384s105p2ie6c527nl16r55l0!nd_dft_wgth_webp_3)
*1510×1109*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232209/1ce6f4700d39dee853c079228cd8d4ab/spectrum/1040g34o31lad18n352105p2ie6c527nltk3otu0!nd_dft_wlteh_webp_3)
*1402×1647*

