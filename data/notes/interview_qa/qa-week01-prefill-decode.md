---
id: qa-week01-prefill-decode
title: Prefill vs Decode阶段的计算特征与优化策略
type: interview_qa
week: 1
topics:
- attention-arch
- kv-cache
tags:
- name: Prefill/Decode
  initial_weight: 1.4
- name: 推理优化
  initial_weight: 1.3
- name: 面试高频
  initial_weight: 1.5
difficulty: 4
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- qa-week01-attn-complexity
- fnd-week10-kv-cache
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6950e1de000000001e00e177
  title: MHA/MQA/GQA 一张图看懂
  saved_at: '2026-06-22'
question: Prefill vs Decode阶段的compute bound vs memory bound本质区别？
---

# Prefill vs Decode阶段的计算特征与优化策略

> **💡 问题**: Prefill vs Decode阶段的compute bound vs memory bound本质区别？

## 来源
- [xiaohongshu] [MHA/MQA/GQA 一张图看懂](https://www.xiaohongshu.com/explore/6950e1de000000001e00e177)

## 回答
LLM推理分为两个阶段，其计算特征完全不同：
**Prefill阶段（Compute Bound）**： - 一次性处理整个输入prompt（例如1024个token） - 需要计算全部token之间的Attention（O(n²·d)） - 瓶颈在GPU算力（FLOPS），不是显存带宽 - 优化方向：FlashAttention（减少IO）、并行计算、高效的矩阵乘法（Tiling） - 关键指标：TTFT（Time To First Token）
**Decode阶段（Memory Bound）**： - 逐个生成token，每步只处理一个新token - Attention计算量O(n·d)，很小 - 但需要读取完整的KV Cache（O(n)），瓶颈在显存带宽 - 优化方向：KV Cache压缩（GQA/MQA/MLA/量化）、显存带宽优化 - 关键指标：TPOT（Time Per Output Token）、吞吐量
**混合优化策略（vLLM/SGLang实践）**： - Prefill和Decode分离调度（Disaggregated Prefill） - Prefill用高算力GPU（A100），Decode用更多GPU分摊KV Cache带宽 - 对于长prompt：Chunked Prefill，分段prefill避免OOM
**面试回答要点**： - 能区分两个阶段的瓶颈（compute vs memory） - 能针对不同阶段提出优化（FlashAttn→Prefill, KV Cache优化→Decode） - 了解Disaggregated架构的价值


## 延伸思考
- Chunked Prefill如何平衡延迟和吞吐？
- Disaggregated Prefill的通信开销如何控制？
- 为什么Decode阶段不能简单地用FlashAttention加速？

## 相关笔记
- [[qa-week01-attn-complexity]]
- [[fnd-week10-kv-cache]]
