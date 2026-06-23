---
note_id: 689c3260000000001b023360
title: "VLA_survey"
author: "AI椰青"
source_url: https://www.xiaohongshu.com/explore/689c3260000000001b023360
platform: xiaohongshu
date: 2025-08-13
likes: 29
collects: 52
tags: []
topic: ""
subtopic: ""
status: pending
---

# VLA_survey

> 作者: @AI椰青 | 👍 29 | ⭐ 52
> 来源: https://www.xiaohongshu.com/explore/689c3260000000001b023360

---

. 挑战
数据问题：VLA模型需要大量的多模态数据（视觉、语言和动作对齐数据），然而这类数据集目前在规模和多样性上仍然存在不足。视觉语言数据集虽然庞大，但缺乏具体的动作标签，而机器人示范数据集常常语言变异性不足，且任务分布狭窄，限制了模型的泛化能力。
机器人体现差异：不同机器人拥有不同的运动学结构、传感器布局和物理配置。VLA模型在跨机器人平台的迁移上面临较大困难，因为每种机器人在动作空间和感知空间上有很大差异。
计算和训练成本：VLA模型通常涉及大规模的计算资源，尤其是当需要处理高维的视觉、语言和动作模态时。
VLA模型的架构演进
早期CNN架构：最初，VLA模型采用卷积神经网络（CNN）与多层感知器（MLP）来提取视觉和语言特征，但此类架构在处理多模态融合和扩展性上存在一定瓶颈。CLIPort是早期的典型模型，它结合了CLIP和Transporter Network进行物体操作任务的学习。
Transformer模型：为了解决CNN架构的不足，越来越多的研究转向了基于Transformer的序列模型。例如，Google DeepMind的Gato模型便采用了Transformer来进行图像和语言的联合编码，并通过解码器生成机器人动作。然而，这些模型的任务集较为有限。
RT系列与VLM结合：随着VLA任务复杂度的提高，模型架构逐步转向结合预训练VLM作为骨干的Transformer模型。例如，RT-1和RT-2通过将大规模的视觉语言预训练模型与机器人数据进行联合微调，推动了VLA在实际任务中的应用，尤其是对于多机器人训练的数据集支持，提高了模型的通用性。
训练策略与学习方法
监督学习：大多数VLA模型采用监督学习策略，其中，基于大规模的视觉、语言和动作对齐数据进行训练。通过利用大规模预训练的VLM作为基础，VLA模型能够更好地泛化到机器人领域。在初步预训练阶段，VLA模型主要通过模仿学习来对机器人任务进行微调，以提高任务表现。
强化学习（RL）：为了应对模仿学习的局限性（如对新行为的适应能力差和需要大量示范数据），越来越多的研究开始采用强化学习对VLA模型进行微调。例如，iRe-VLA通过结合在线强化学习和监督微调，提高了任务成功率。此外，RL还被应用于低级控制任务中，VLA模型作为高层策略生成指令，RL用于低级控制生成更精确的动作。


## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232210/b16b2a30cbea559a1275dd6cc4745b6c/spectrum/1040g34o31l47agh1jq105p2ie6c527nlkp763uo!nd_dft_wlteh_webp_3)
*919×1176*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232210/7982ec60e60ed7aca60466bbbe394fef/spectrum/1040g34o31l47a6br2a105p2ie6c527nlb3pmhpg!nd_dft_wgth_webp_3)
*1231×791*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232210/c6107e5c9b241fa045b5d3bb8b133df0/spectrum/1040g0k031l47akmk36005p2ie6c527nljl5dsvg!nd_dft_wgth_webp_3)
*1269×833*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232210/882f668ffe45bbdd6ae37e72ab74a682/spectrum/1040g0k031l47apkikk005p2ie6c527nlh9sthv8!nd_dft_wgth_webp_3)
*1288×682*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232210/b1ebdeb41f9b7863ee80efe901a24fa7/spectrum/1040g0k031l47c2754k005p2ie6c527nltttmnvg!nd_dft_wgth_webp_3)
*1172×996*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232210/a471643a7cf23c4e82205377fbd11d69/spectrum/1040g0k031l47c5ckjq005p2ie6c527nlqi0re40!nd_dft_wgth_webp_3)
*1259×599*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232210/f3f0ec5fcc19b26e7ba5f376d5032865/spectrum/1040g34o31l47c841kk105p2ie6c527nlmj0vtfo!nd_dft_wgth_webp_3)
*1224×556*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232210/7bbf2e2d29102e852351ccc265efde33/spectrum/1040g0k031l47cajq3q005p2ie6c527nlfgr0joo!nd_dft_wgth_webp_3)
*631×463*

![图片9](http://sns-webpic-qc.xhscdn.com/202606232210/b7acf8b7eab3982b810390551aa237c6/spectrum/1040g34o31l47cdiakk0g5p2ie6c527nliqvjtso!nd_dft_wgth_webp_3)
*1280×813*

![图片10](http://sns-webpic-qc.xhscdn.com/202606232210/0b288a4c65aa13442fd7685f77b743ee/spectrum/1040g34o31l47cgkljq005p2ie6c527nlrnf4d80!nd_dft_wgth_webp_3)
*1263×456*

![图片11](http://sns-webpic-qc.xhscdn.com/202606232210/d541cf7aded083bcfa5dc20a4314f20e/spectrum/1040g0k031l47cir92g005p2ie6c527nlpsopag8!nd_dft_wgth_webp_3)
*1264×682*

