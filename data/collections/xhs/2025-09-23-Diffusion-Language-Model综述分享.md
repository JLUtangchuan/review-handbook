---
note_id: 68d2ac3f000000001301a28e
title: "Diffusion Language Model综述分享"
author: "Sherry"
source_url: https://www.xiaohongshu.com/explore/68d2ac3f000000001301a28e
platform: xiaohongshu
date: 2025-09-23
likes: 91
collects: 153
tags: ["多模态人工智能", "文献", "计算机视觉"]
topic: ""
subtopic: ""
status: pending
---

# Diffusion Language Model综述分享

> 作者: @Sherry | 👍 91 | ⭐ 153
> 来源: https://www.xiaohongshu.com/explore/68d2ac3f000000001301a28e

---

看到小红书对DLMs的分享还比较少，正好这几天在研究，就分享出来，发帖能够刺激我的学习欲。
题目：A Survey on Diffusion Language Models
地址：arxiv.org/pdf/2508.10875
	
[一R] AI两大支柱：AR LLMs和DLMs
现在人们研究DLMs，重点有以下几个：
1. 并行生成：可以在一次迭代中预测并生成多个token
2. 双向上下文：去噪的每一步，模型都能看到整个序列
3. 迭代精炼：生成是多步的，可以在后续步骤中修正早期步骤的错误，逐步提高生成质量
4. 可控性：可以通过Guidance来控制生成内容的风格，特别适合infilling任务
5. 跨模型统一建模：文本和图像都可以表示为token，并用相同扩散框架进行建模
	
[二R] DLMs的核心范式
可以大概分为三种：
1. Continuous DLMs：将离散token通过Embedding映射到连续的向量空间，在这个空间完成扩散和去噪
2. Discrete DLMs：直接在离散的token空间进行扩散
3. Hybrid AR-Duffision：结合AR和Diffusion，模型以Block为单位自回归，但每个Block内部，使用DIffusion
	
[点赞R]图1可以看到，在2025年以来，研究的重心落在了Discrete DLMs和Multimodal上。
[点赞R]图2是四种模型架构的训练和采样示意图（包括AR和上面提到的三种范式）
	
[三R] DLMs的预训练
1. 预训练：从预训练好的AR模型权重进行初始化，离散DLMs从AR LLMs初始化，连续DLMs从图像扩散模型初始化
2. SFT：与AR模型类似，对于离散DLMs，做法是prompt的token保持不掩码，对response token进行掩码，让模型学习条件生成
	
[四R] DLMs的后训练
现有的方法可以分为三类：
1. 并行化推理链：如DoT、DCoLT（具体参考原文）
2. 适配策略梯度方法：如diffu-GRPO等
3. 适配偏好优化方法：如VRPO等
	
[五R] DLMs的推理
主要聚焦于图3，简单来说聚焦于以下：
1. 并行解码
2. 解掩码
3. Guidance
4. KV Cache这些缓存技术
	
[六R] 多模态与统一架构
如熟知的LLaDA-V、MMaDA等
	
[七R] 未来挑战
1. 训练效率
2. 社区基础建设
3. 并行与性能平衡
	
感兴趣欢迎交流~
#多模态人工智能[话题]# #文献[话题]# #计算机视觉[话题]#


**标签**: #多模态人工智能 #文献 #计算机视觉

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232209/4e34beb6df961db0a1cd3cef18ca3676/spectrum/1040g34o31mosnlsd4u105p1dgv4kc3df4819c3g!nd_dft_wgth_webp_3)
*1146×840*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232209/a5b9e121bdf2fea8fb5b221afa4c4203/spectrum/1040g34o31mpdeit74s0g5p1dgv4kc3df6f4jvq0!nd_dft_wlteh_webp_3)
*1035×1233*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232209/834a56da7b5abeb091dfc65fa0b135e3/spectrum/1040g0k031mpdjuubl2005p1dgv4kc3df8piade0!nd_dft_wgth_webp_3)
*1353×773*

