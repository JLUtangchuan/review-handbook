---
id: qa-week01-moe-inference-interview
title: "MoE/推理优化/长文本面试问答集"
type: interview_qa
week: 1
topics: ["architecture-innovation", "inference-opt", "kv-cache"]
tags:
- name: "MoE"
  initial_weight: 1.5
- name: "推理优化"
  initial_weight: 1.5
- name: "长文本"
  initial_weight: 1.3
difficulty: 4
status: pending
rating: 0
created_at: "2026-06-24"
updated_at: "2026-06-24"
sources:
- platform: zhihu
  url: "https://www.zhihu.com/column/c_1747590116120698880"
  title: "百面LLM专栏"
  saved_at: "2026-06-24"
recommendations: ["qa-week03-moe-routing", "fnd-week10-kv-cache"]
---

# MoE/推理优化/长文本面试问答集

> 来源: 百面LLM专栏

---

## Q1: MoE中Expert Load Balance怎么实现？

MoE路由网络倾向于反复选择相同专家→专家利用率不均→90% tokens可能只流经5%的专家。

**三种方案**：

1. **Auxiliary Loss**（传统）：$L_{aux} = \alpha \cdot \text{Var}(f_i)$，惩罚专家负载方差。需要调$\alpha$，太大损害模型效果。

2. **Expert Choice**（Google）：反过来让每个专家选top-k个token，保证每个专家处理相同数量token。但token可能被遗漏。

3. **DeepSeek方案（SOTA）**：
   - **Shared Expert**：所有token必经的共享专家
   - **256 Routed Experts**：token选top-8个
   - **Aux-loss-free bias调整**：每个专家有可学习bias，周期性调整且不在梯度计算图中→不损害模型效果

---

## Q2: Prompt Compression的方法？

当输入过长时，压缩prompt以节省KV Cache和推理时间。

| 方法 | 思路 | 代表 |
|------|------|------|
| **LLMLingua** | 用小模型评估token重要性，删减低重要度token | Microsoft |
| **ICAE** | 用auto-encoder压缩context为少量summary token | - |
| **Gist Token** | 在prompt前加可学习的压缩token | - |
| **Selective Context** | 保留与query最相关的context部分 | - |

**核心trade-off**：压缩率 vs 信息保留。

---

## Q3: Knowledge Distillation怎么做？

将大模型（Teacher）的知识迁移到小模型（Student）。

| 方法 | 核心 | 特点 |
|------|------|------|
| **Logit-based** | Student拟合Teacher的logits分布 | 用KL散度，温度T软化 |
| **Feature-based** | Student拟合Teacher的中间层特征 | 需要访问Teacher内部 |
| **Online Distillation** | Teacher和Student同时训练 | 无需预训练Teacher |
| **On-policy Distillation**（DeepSeek R1） | 用Teacher生成数据训练Student | 数据质量高 |

**DeepSeek R1蒸馏**：用R1作为teacher生成800K高质量推理样本，蒸馏Qwen/Llama 7B/14B/32B，小模型达到接近大模型的推理能力。

---

## Q4: 长文本训练的LongRecipe方法？

**核心思想**：结构化长文本训练 + 位置编码适配。

1. **数据构建**：将短文本拼接为长文档（document packing），插入分隔符
2. **位置编码适配**：使用NTK-aware或YaRN调整RoPE
3. **训练策略**：先短文本训练，再逐步增加长度（curriculum learning）
4. **效率优化**：使用FlashAttention + Ring Attention分布式长序列训练

---

## Q5: Speculative Decoding如何加速推理？

**核心思想**：Draft Model快速生成候选tokens → Target Model并行验证 → 接受/拒绝。

**流程**：
1. Draft Model（小模型，如7B）自回归生成k个候选token
2. Target Model（大模型）一次性forward验证k个token
3. 根据概率比接受/拒绝每个token
4. 从第一个被拒绝的位置重新采样

**加速原理**：Draft快+验证并行 = 2-3倍推理加速，**数学上等价于Target Model自回归采样**（无精度损失）。

---

## Q6: Long Context的RoPE Position Interpolation方法对比

| 方法 | 公式 | 效果 |
|------|------|------|
| **Linear PI** | $\theta_i' = \theta_i / s$ | 简单但效果差，高频损失大 |
| **NTK-aware** | $\theta_i' = b \cdot \theta_i^{(\log b / \log 10000)}$ | 高频不压缩，低频压缩 |
| **YaRN** | NTK + temperature $t$ | SOTA，兼顾PPL和长文本 |
| **ReRoPE** | 滑动窗口 + 周期reset | 训练推理一致 |

**YaRN关键**：NTK-adjusted frequency + temperature scaling。$t = \sqrt{s}$时PPL最优。
