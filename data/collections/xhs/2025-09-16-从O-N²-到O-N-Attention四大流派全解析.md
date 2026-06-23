---
note_id: 68c8f5cd000000001400933a
title: "从O(N²)到O(N)！Attention四大流派全解析"
author: "Lancer"
source_url: https://www.xiaohongshu.com/explore/68c8f5cd000000001400933a
platform: xiaohongshu
date: 2025-09-16
likes: 692
collects: 1282
tags: ["大模型", "LLM", "注意力", "注意力机制", "Attention", "FlashAttention", "线性注意力"]
topic: ""
subtopic: ""
status: pending
---

# 从O(N²)到O(N)！Attention四大流派全解析

> 作者: @Lancer | 👍 692 | ⭐ 1282
> 来源: https://www.xiaohongshu.com/explore/68c8f5cd000000001400933a

---

标准的自注意力是Transformer架构中具有O(N²)时间/空间复杂度的组件。随着大模型处理的序列长度N（如长文本、高分辨率视频）不断增长，这个二次方开销已成为性能瓶颈。清华等团队在A Survey of Efficient Attention Methods: Hardware-efficient, Sparse, Compact, and Linear Attention中对现有的优化方案进行详尽的总结，从硬件优化到架构升级划分为四大流派。四大流派从不同维度切入，旨在解决这个核心矛盾，但它们的首要优化目标各有侧重。
1. 硬件高效注意力 (Hardware-efficient Attention)
核心优化目标：最大化硬件利用率，将瓶颈从“内存”转移到“计算”。
这类方法不改变Attention的数学公式，而是通过极致的工程优化，让计算过程与GPU/TPU等现代硬件的特性（如Tensor Core、共享内存、异步流水线）深度协同。一句话总结：榨干硬件潜力，让Attention跑得更快，不浪费任何一个时钟周期和内存带宽。
	
2. 紧凑注意力 (Compact Attention)
核心优化目标：大幅降低推理阶段KV缓存的内存占用，而不增加计算量。
这类方法的精髓在于解耦：“存储KV”和“计算KV”（。它们对存储在内存中的KV进行压缩（如权重共享、低秩分解），但在计算Attention时，会将其展开回原始大小。
代表方法如GQA（分组查询注意力）和MLA（多头潜在注意力），通过巧妙的权重共享或低秩投影，将KV缓存从 O(Nhd) 压缩到 O(Nhkvd) 或 O(Nr)，显存占用直降数倍。
	
3. 稀疏注意力 (Sparse Attention)
核心优化目标：直接减少计算量（FLOPs）和内存访问量，通过只计算“重要”的部分。
这个优化基于一个核心观察：经过Softmax后，注意力矩阵 P 是天然稀疏的，大量元素趋近于0。计算这些≈0的位置是巨大的浪费。
这类方法通过引入一个稀疏掩码 M（元素为0或-∞），有选择地跳过非关键的计算。通过稀疏模式（如只关注最近的L个token），减少需要加载的历史KV缓存大小，降低I/O。
	
4. 线性注意力 (Linear Attention)
核心优化目标：从根本上将时间/空间复杂度从O(N²)降至O(N)，实现算法层面的革命。
这是最激进的一类方法，它重构了Attention的计算范式，核心是移除或近似Softmax函数，使得计算可以重排，将复杂度从O(N²)干到O(N)
#大模型[话题]# #LLM[话题]# #注意力[话题]# #注意力机制[话题]# #Attention[话题]# #FlashAttention[话题]# #线性注意力[话题]#


**标签**: #大模型 #LLM #注意力 #注意力机制 #Attention #FlashAttention #线性注意力

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232209/b7c700f900cfc7d18a256a5e45dfbfc7/spectrum/1040g34o31mfu61mg4s005oa7tjh0k497987kd7o!nd_dft_wlteh_webp_3)
*1440×2400*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232209/6e4d7f23bb27a7cfcba305d2b9867743/spectrum/1040g34o31mfu61mg4s0g5oa7tjh0k497dgoq9so!nd_dft_wlteh_webp_3)
*1440×2400*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232209/835ad8af597c79ca90009815c3a145c6/spectrum/1040g34o31mfu61mg4s105oa7tjh0k497b8fs30o!nd_dft_wlteh_webp_3)
*1440×2400*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232209/e391e20900b27dbb7eaf083d4499176a/spectrum/1040g34o31mfu61mg4s1g5oa7tjh0k497deud3dg!nd_dft_wlteh_webp_3)
*1440×2400*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232209/4ccc2b3616df6a660db1a580b51a93bf/spectrum/1040g34o31mfu61mg4s205oa7tjh0k4970sinti8!nd_dft_wlteh_webp_3)
*1440×2400*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232209/bf5d61e5fdafab93becbd7d348c2016b/spectrum/1040g34o31mfu61mg4s2g5oa7tjh0k4977a3bpa0!nd_dft_wlteh_webp_3)
*1440×2400*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232209/ebf61b7d1b81e86008fdd997790f5830/spectrum/1040g34o31mfu61mg4s305oa7tjh0k4974d6stfg!nd_dft_wlteh_webp_3)
*1440×2400*

