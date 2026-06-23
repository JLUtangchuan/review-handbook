---
id: qa-week01-attn-complexity
title: Attention O(n²)复杂度分析与优化
type: interview_qa
week: 1
topics:
- attention-arch
tags:
- name: 复杂度分析
  initial_weight: 1.3
- name: 面试高频
  initial_weight: 1.5
- name: 推理优化
  initial_weight: 1.2
difficulty: 4
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- fnd-week01-attention
- fnd-week10-kv-cache
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/69ad304c000000002202302a
  title: 手撕Attention
  saved_at: '2026-06-22'
question: Attention的复杂度分析？从O(n²)优化到O(n)的路线图？
---

# Attention O(n²)复杂度分析与优化

> **💡 问题**: Attention的复杂度分析？从O(n²)优化到O(n)的路线图？

## 来源
- [xiaohongshu] [手撕Attention](https://www.xiaohongshu.com/explore/69ad304c000000002202302a)

## 回答
**标准Attention复杂度**： - 计算量：O(n²·d)，其中n是序列长度，d是head维度 - 显存：O(n²)的Attention Matrix，成为长序列瓶颈 - 例如n=128K时，Attention Matrix需要128K² ≈ 16B个元素，FP16下约32GB
**优化路线图（按效果排序）**：
1. **KV Cache**（推理必备）：缓存历史K/V，避免重复计算已生成token的attention。将每步计算从O(n²·d)降到O(n·d)，但显存仍是O(n)
2. **MQA/GQA**（架构层面）：减少K/V head数，降低KV Cache显存n_head/group_ratio倍
3. **FlashAttention**（IO优化）：通过Tiling（分块计算）将O(n²)的HBM读写降到O(n²·d²/M)，利用SRAM做局部softmax。数学等价，且由于IO减少反而更快
4. **Sparse Attention**：只计算部分位置（sliding window + global tokens），如Mistral的SWA。复杂度O(n·w)，w是窗口大小
5. **Linear Attention**：用核函数替代softmax，Q(K^T V)先算K^T V，复杂度O(n·d²)。代表：Mamba/SSM、RWKV
6. **MLA**（DeepSeek）：将K/V压缩到低维latent空间，KV Cache从O(n·n_heads·d_head)降到O(n·d_latent)
**面试回答结构**： - 先分析瓶颈（计算vs显存） - 针对瓶颈选择合适的优化（prefill→FlashAttn，decode→KV Cache+GQA+MLA） - 说明trade-off（精度损失vs效率提升）


## 延伸思考
- FlashAttention的Tiling和Recomputation具体怎么实现的？
- Linear Attention为什么可以改变计算顺序？对精度的影响？
- 长序列推理（n>128K）时应该如何组合这些优化？

## 图片
![Attention优化全景](http://sns-webpic-qc.xhscdn.com/202606222256/360e082cd28a9ec0ba1d90a5659c6c50/spectrum/1040g34o31tdt5h1256105no6jgq08o4hiqdu920!nc_n_webp_mw_1)
*Attention优化全景*

## 相关笔记
- [[fnd-week01-attention]]
- [[fnd-week10-kv-cache]]
