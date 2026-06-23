---
title: "Trajectory Prediction/Plan方法"
author: "Schulz King"
source_url: https://zhuanlan.zhihu.com/p/1956066494489272861
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Trajectory Prediction/Plan方法

> 作者: Schulz King | 来源: https://zhuanlan.zhihu.com/p/1956066494489272861

---

1. Anchor-Based
1.1. 核心思想
预定义若干 轨迹模板（anchors），网络只需预测：
每个 anchor 的 概率/confidence
对 anchor 的 偏移量（微调轨迹）
将连续轨迹预测问题 离散化，降低训练难度。
1.2. 推理流程
选取 top-k anchor(概率最高)
将 anchor+偏移量 → 最终轨迹
多模态轨迹 = top-k anchor 对应轨迹
1.3. 典型代表
MultiPath：Multiple Probabilistic Anchor Trajectory Hypotheses for Behavior Prediction (CoRL 2019)
VADv2: End-to-End Vectorized Autonomous Driving via Probabilistic Planning (arXiv 2024)
1.3.1. MultiPath
1.3.2. VADv2
2. Query-Based
2.1. 核心思想
将轨迹预测转化为 从 query points 到轨迹概率分布 的问题。
Query = 潜在未来位置或特征 embedding
网络预测每个 query 对应的轨迹可能性或轨迹调整。
2.2. 推理流程
构建 queries（future points / agent embedding）
网络预测每个 query 的轨迹或概率
选择 top-k query → 对应轨迹输出
可直接处理多模态
2.3. 典型代表
QCNet：Query-centric trajectory prediction (CVPR2023)
MTR：Motion transformer with global intention localization and local movement refinement (NeurIPS 2022)
2.3.1. QCNet

通过K个 anchor-free mode queries 生成 K 条proposed trajectories，将其作为 anchor trajectories 进行 refinement。

2.3.2. MTR
3. Goal-Based / Target-Driven
3.1. 核心思想
先预测未来目标点（goal / anchor point），再规划轨迹到该目标。
将轨迹预测拆成两步：
预测未来位置分布（多模态 goal）
回归完整轨迹（通过目标点生成轨迹）
3.2. 推理流程
预测未来目标点分布（Top-k）
对每个目标点生成轨迹（基于运动模型或网络回归）
输出多模态轨迹
3.3. 典型代表
Tnt: Target-driven trajectory prediction (CVPR2021)
3.3.1. TNT

采样的Target会learning一个offset。

4. 总结
特性	Anchor-Based	Query-Centric	Goal-Based / Target-Driven
核心思想	离散轨迹模板 + 偏移	Query → 轨迹概率分布	先预测目标点，再生成轨迹
Anchor / Query	人工设计 anchor	Learned queries	Goal point = learned anchor
多模态	top-k anchor	top-k query	top-k goal
泛化能力	中等	高	高，依赖 goal prediction
训练复杂度	低中	高	中
推理依赖	Anchor + offset	Queries	Goal + trajectory regression
优势	稳定，可解释	灵活，泛化强	高精度，多模态自然
劣势	Anchor 覆盖有限	计算量大	Goal 错误影响轨迹


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/4469da312f91164bfc32b26235c31211_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-82da00ea8d1da592975a2984eaed14ef_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-a7ed44e2e8011a688a4e8ef4ff1ee64d_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-f68a46a38715e8628decbfb6c2e3be65_1440w.jpg)

![图片](https://picx.zhimg.com/v2-ec2131f8c2a8d49e2800a0faa0483bf7_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-51a5e859718dec0e7e50439ae45ddbc9_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/4469da312f91164bfc32b26235c31211_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-5d11ce4f5cbc3d9f002b4b1d00ceb139.webp)

![图片](https://picx.zhimg.com/v2-ac07bd9c4d5e98e6f03d9433043eb079_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-b54ea64574737aaf06ccf00775d7cb2c_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

![图片](https://picx.zhimg.com/v2-22dfe7094375e34e38695123acd219db_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-324a494c5d9dc225f71ed53b5d0f5e0d_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-2b0cb70251065a10ba75c128e80168fd_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-00aa9b1e9212ee8e41706e0d2eb2084e_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-0757e5f5cf33bd5e19af25ece4d6e832_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-f2745a8eb22cc8909062468bb75bfeca_250x0.jpg?source=172ae18b)

