---
id: fnd-week02-activation
title: SwiGLU/GELU/GeGLU/SiLU激活函数全景
type: foundation
week: 2
topics:
- activation-functions
tags:
- name: SwiGLU
  initial_weight: 1.5
- name: 激活函数
  initial_weight: 1.2
- name: GELU
  initial_weight: 1.1
difficulty: 3
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- qa-week02-swiglu
- fnd-week02-norm
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6921761f000000001f0061d8
  title: 大模型激活函数为什么是swiGLU？
  saved_at: '2026-06-22'
---

# SwiGLU/GELU/GeGLU/SiLU激活函数全景

## 来源
- [xiaohongshu] [大模型激活函数为什么是swiGLU？](https://www.xiaohongshu.com/explore/6921761f000000001f0061d8)

## 内容
大模型FFN中激活函数的演进：ReLU → GELU → SiLU(Swish) → SwiGLU → GeGLU
**GLU（Gated Linear Unit）家族**： GLU = (x·W₁ + b₁) ⊗ σ(x·W₂ + b₂)，即输入通过两个线性变换，一个做激活后与另一个逐元素相乘（门控）。不同GLU变体的区别在于激活函数σ的选择。
- **SwiGLU**（LLaMA/Qwen/DeepSeek）：σ = SiLU(Swish) = x·σ(x)。门控用Swish代替sigmoid，平滑可导，梯度流动更好 - **GeGLU**：σ = GELU = x·Φ(x)（Φ是标准正态CDF），理论上更接近ReLU的统计特性 - **ReGLU**：σ = ReLU，最简单但非平滑 - **为什么用GLU**：相比标准FFN（2个权重矩阵），GLU用3个权重矩阵但保持参数量不变（通过调整hidden_dim），引入了门控机制使模型能选择性传递信息
**为什么SwiGLU优于ReLU**： 1. 平滑性：处处可导，优化更稳定 2. 非单调：允许小的负值通过，防止神经元"死亡" 3. 门控机制：动态控制信息流，增强表达能力 4. 实证结果：LLaMA论文中SwiGLU在perplexity上显著优于ReLU 5. 梯度：SiLU的梯度在正值区域保持较大值，缓解梯度消失


## 关键要点
- SwiGLU = Swish(xW_gate) ⊗ (xW_up)，然后down_proj
- GLU参数量计算：3×d_model×d_ff（vs 标准FFN的2×d_model×d_ff），通过调整d_ff保持总参数量一致
- {'GELU': 'x·Φ(x) ≈ 0.5x(1+tanh(√(2/π)(x+0.044715x³)))'}
- {'SiLU/Swish': 'x·σ(x)，与GELU形状相似但计算更简单'}
- {'LLaMA中实际使用': 'SwiGLU + d_ff = 8/3 × d_model（补偿3个权重矩阵）'}
- 对比：ReLU(d_ff=4d) vs SwiGLU(d_ff≈2.7d)，参数量等效

## 自测问题
- SwiGLU的门控机制为什么有效？从梯度和表达能力的角度分析
- GeGLU vs SwiGLU vs ReGLU的对比，为什么SwiGLU最流行？
- FFN中用GLU后参数量如何保持与标准FFN一致？

## 图片
![SwiGLU激活函数原理图](http://sns-webpic-qc.xhscdn.com/202606222257/fd92c98c779ae534ffbe50ebf2b58a4f/1040g2sg31p6brbn6jcgg5nvg187g8477mc261m8!nc_n_webp_mw_1)
*SwiGLU激活函数原理图*

## 相关笔记
- [[qa-week02-swiglu]]
- [[fnd-week02-norm]]
