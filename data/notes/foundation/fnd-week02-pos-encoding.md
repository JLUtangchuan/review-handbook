---
id: fnd-week02-pos-encoding
title: 旋转位置编码RoPE：从Sinusoidal到RoPE的完整推导
type: foundation
week: 2
topics:
- position-encoding
tags:
- name: RoPE
  initial_weight: 1.5
- name: 位置编码
  initial_weight: 1.3
- name: 面试高频
  initial_weight: 1.5
difficulty: 4
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- qa-week02-rope
- fnd-week02-activation
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/695b6e5c000000001a030087
  title: 面试必备：旋转位置编码 RoPE
  saved_at: '2026-06-22'
---

# 旋转位置编码RoPE：从Sinusoidal到RoPE的完整推导

## 来源
- [xiaohongshu] [面试必备：旋转位置编码 RoPE](https://www.xiaohongshu.com/explore/695b6e5c000000001a030087)

## 内容
**位置编码演进路线**： 1. Sinusoidal（Transformer原始论文）：固定正弦编码，PE(pos,2i)=sin(pos/10000^(2i/d))。优点是不需要学习参数，有一定外推能力；缺点是相对位置信息隐含、不够灵活 2. Learned Positional Embedding（BERT/GPT）：可学习的位置向量，优点是灵活；缺点是无法处理超过训练长度的序列 3. RoPE（Rotary Position Embedding，LLaMA/Qwen/DeepSeek）：通过旋转矩阵将位置信息融入Q/K向量。核心公式：q_m = R^m·q，k_n = R^n·k，attention score = q_m^T·k_n = q^T·R^{n-m}·k，只依赖相对位置(n-m) 4. ALiBi（Attention with Linear Biases）：直接在attention score上加线性衰减偏置，(i-j)·m，简单有效 5. NoPE：最新研究发现，足够大的模型可以不使用显式位置编码
**RoPE核心优点**： - 天然编码相对位置（attention score只依赖位置差） - 可以外推到训练时未见过的长度（通过NTK-aware scaling等方法） - 与线性attention兼容 - 代码实现简洁：构造旋转矩阵→对Q/K施加旋转


## 关键要点
- {'Sinusoidal': 'PE(pos,2i)=sin(pos/theta^(2i/d)), PE(pos,2i+1)=cos(pos/theta^(2i/d))'}
- {'RoPE旋转矩阵': '将d维向量拆成d/2对2D向量，每对用位置m的旋转角m·theta_i进行旋转'}
- {'RoPE的attention score内积': 'q^T·R^{n-m}·k，仅依赖相对位置差(n-m)'}
- {'实现核心': 'precompute cos/sin频率表 → 对Q、K分别施加旋转 → 计算attention'}
- {'NTK-aware外推': '调整base频率(10000→更大值)让高频rotation更稀疏，支持更长序列'}
- {'YaRN方法': '结合NTK-aware scaling + temperature tuning，是目前最优的RoPE外推方案'}
- {'ALiBi优势': '无额外参数、训练推理一致、天然支持任意长度'}

## 自测问题
- RoPE的数学推导：为什么旋转后内积只依赖相对位置？
- RoPE相比Sinusoidal PE的优势是什么？为什么大模型几乎都用RoPE？
- 如何将RoPE推广到超出训练长度的序列？NTK-aware scaling的原理？
- ALiBi为什么可以替代位置编码？其局限性是什么？

## 图片
![RoPE旋转位置编码原理图](http://sns-webpic-qc.xhscdn.com/202606222257/f6bf694b23b65e81c2cb3766df5c745f/spectrum/1040g0k031quvdpqb0m005opl5ifmbnrodc3emlo!nc_n_webp_mw_1)
*RoPE旋转位置编码原理图*

## 相关笔记
- [[qa-week02-rope]]
- [[fnd-week02-activation]]
