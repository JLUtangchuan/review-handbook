---
id: qa-week01-transformer-interview
title: "Transformer架构通用面试问答集"
type: interview_qa
week: 1
topics: ["attention-arch", "transformer-arch"]
tags:
- name: "Transformer"
  initial_weight: 1.8
- name: "面试高频"
  initial_weight: 1.8
- name: "LLaMA"
  initial_weight: 1.3
difficulty: 3
status: pending
rating: 0
created_at: "2026-06-24"
updated_at: "2026-06-24"
sources:
- platform: zhihu
  url: "https://www.zhihu.com/column/c_1747590116120698880"
  title: "百面LLM专栏"
  saved_at: "2026-06-24"
recommendations: ["fnd-week01-attention", "fnd-week01-transformer-block"]
---

# Transformer架构通用面试问答集

> 来源: 百面LLM专栏

---

## Q1: Llama模型结构是怎样的？与原始Transformer的区别？

LLaMA结构特点：
- **Pre-RMSNorm**：每个Sublayer前归一化
- **RoPE位置编码**：对Q/K施加旋转
- **SwiGLU激活**：FFN使用门控激活
- **无Bias**：Q/K/V/O投影和FFN都不使用bias项
- **GQA**（LLaMA-2/3）：分组查询注意力

与原始Transformer的主要区别：Post-LN→Pre-LN, ReLU→SwiGLU, Sinusoidal PE→RoPE, MHA→GQA。

---

## Q2: Prefill和Decode阶段的区别？

| 维度 | Prefill | Decode |
|------|---------|--------|
| 输入 | 完整prompt（如1024 tokens） | 逐token生成 |
| 计算 | $O(n^2 \cdot d)$ | $O(n \cdot d)$ |
| 瓶颈 | Compute Bound | Memory Bound |
| KV Cache | 首次创建 | 读取+追加 |
| 优化 | FlashAttention、大batch | GQA/MLA、PagedAttention |
| 指标 | TTFT | TPOT / 吞吐量 |

---

## Q3: In-Context Learning的潜力和限制？

ICL让模型通过少量示例（few-shot）适应新任务，无需梯度更新。

**潜力**：
- 零成本适应新任务
- 保留模型原有能力
- 示例选择灵活

**限制**：
- 受上下文长度限制
- 对示例格式和顺序敏感
- 复杂推理任务效果不如fine-tuning
- 无法注入大规模领域知识

**最新趋势**：Pre-SFT + ICL结合——用ICL挑选高质量训练数据，再SFT微调。

---

## Q4: 如何选择SFT数据？质量 vs 数量？

**数据质量 > 数据数量**：
- 精心挑选的高质量数据（10-20%全量）可达到接近全量的效果
- 数据多样性同样重要——覆盖不同任务类型、难度、风格
- 避免数据泄露和污染（去重、与benchmark去重）

**筛选策略**：
1. 去重（n-gram overlap、embedding similarity）
2. 质量打分（模型评分、规则过滤）
3. 多样性采样（按类别、难度分层采样）
4. 与目标分布对齐（KL散度匹配）

---

## Q5: 模型训练中常用的Trick总结

1. **Gradient Clipping**：防止梯度爆炸，max_norm=1.0
2. **Warmup + Decay**：前N步线性增长，之后cosine衰减
3. **Weight Decay**：AdamW解耦实现，通常1e-4到1e-2
4. **EMA**：指数移动平均模型参数，提升泛化
5. **Dropout**：训练时随机丢弃神经元，防止过拟合（LLaMA不用）
6. **Label Smoothing**：软化标签分布，通常ε=0.1
7. **Mixed Precision**：FP16/BF16训练，节省显存加速训练

---

## Q6: LLM的Scaling Law？

**Kaplan et al. (OpenAI)**：$L(N, D) \propto N^{-0.076} + D^{-0.095}$（Loss随参数量N和数据量D的幂律下降）

**Chinchilla (DeepMind)**：同等计算预算下，模型大小和数据量应等比增长（$N \approx D/20$）。颠覆了Kaplan的"模型越大越好"结论。

**实际指导**：
- 给定计算预算，选择模型大小和数据量的最优组合
- 大多数开源模型"欠训练"（数据量不够）
- LLaMA-3的训练token数远超Chinchilla最优值，效果反而更好→Scaling Law仍在演进
