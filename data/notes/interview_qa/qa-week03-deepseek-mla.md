---
id: qa-week03-deepseek-mla
title: DeepSeek MLA如何将KV Cache压缩到极致
type: interview_qa
week: 3
topics:
- llm-architecture
- kv-cache
tags:
- name: MLA
  initial_weight: 1.6
- name: DeepSeek
  initial_weight: 1.5
- name: KV Cache
  initial_weight: 1.4
difficulty: 5
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- fnd-week03-deepseek
- fnd-week10-kv-cache
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6780a3370000000017038fce
  title: DeepSeek v3核心技术解读
  saved_at: '2026-06-22'
question: DeepSeek MLA（Multi-head Latent Attention）如何将KV Cache压缩到极致？
---

# DeepSeek MLA如何将KV Cache压缩到极致

> **💡 问题**: DeepSeek MLA（Multi-head Latent Attention）如何将KV Cache压缩到极致？

## 来源
- [xiaohongshu] [DeepSeek v3核心技术解读](https://www.xiaohongshu.com/explore/6780a3370000000017038fce)

## 回答
MLA通过将K/V投影到低维latent空间实现KV Cache极致压缩。
**标准MHA的KV Cache**： - 每层每token存储：n_heads × d_head × 2(K+V)个float - 例如LLaMA-70B: 64 heads × 128 d_head × 2 = 16384 floats/token/layer
**MLA的KV Cache压缩（三步压缩法）**：
Step 1 — Latent Down-Projection（压缩）：c_KV = W_down · h。将hidden_size(h)投影到极低维的latent空间(d_c，通常为512维)。这是核心压缩步骤。
Step 2 — Up-Projection for Attention（训练时）：K = W_uk · c_KV, V = W_uv · c_KV。从latent展开到完整的K/V用于attention计算。
Step 3 — Cache only Latent（推理时）：推理时只存储c_KV（1个latent向量，而非2×n_heads×d_head个向量）。每个token的KV Cache从 O(n_heads × d_head) 降为 O(d_c)。
**压缩比计算**： - 标准MHA per-token KV: n_heads × d_head × 2 - MLA per-token KV: d_c（仅一个latent向量） - 压缩比 ≈ 2×n_heads×d_head / d_c ≈ 10-20×
**为什么信息不丢失**： - Up-projection矩阵(learnable)学会从压缩的latent中恢复注意力所需的关键信息 - 低秩假设：K和V的信息冗余度很高，可以用低维latent表示 - 类似LoRA思路：实际信息秩远小于矩阵维度，低秩近似有效
**与RoPE的兼容性**： - 对Q单独施加RoPE（Q需要位置信息），K可选择是否加RoPE - DeepSeek方案：部分K维度保留RoPE，其余从latent生成
**面试回答要点**：先解释KV Cache瓶颈→MLA的压缩思想→低秩假设的合理性→具体实现


## 延伸思考
- MLA的低秩假设在什么情况下会失效？
- 为什么Q不需要压缩而K/V需要？
- MLA与GQA可以叠加使用吗？

## 图片
![MLA架构详解](http://sns-webpic-qc.xhscdn.com/202606222257/70109c49610b2ff5b68b4df3399e3c46/1040g2sg31cfa5ao3h0705o0frbig853t5piqm5o!nc_n_webp_mw_1)
*MLA架构详解*

## 相关笔记
- [[fnd-week03-deepseek]]
- [[fnd-week10-kv-cache]]
