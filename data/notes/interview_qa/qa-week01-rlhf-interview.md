---
id: qa-week01-rlhf-interview
title: "RLHF/DPO/GRPO面试问答集"
type: interview_qa
week: 1
topics: ["rlhf-pipeline", "grpo-variants", "reward-design"]
tags:
- name: "RLHF"
  initial_weight: 1.8
- name: "DPO"
  initial_weight: 1.5
- name: "GRPO"
  initial_weight: 1.7
- name: "面试高频"
  initial_weight: 1.8
difficulty: 5
status: pending
rating: 0
created_at: "2026-06-24"
updated_at: "2026-06-24"
sources:
- platform: zhihu
  url: "https://www.zhihu.com/column/c_1747590116120698880"
  title: "百面LLM专栏"
  saved_at: "2026-06-24"
recommendations: ["qa-week05-ppo-vs-grpo", "fnd-week05-rlhf"]
---

# RLHF/DPO/GRPO面试问答集

> 来源: 百面LLM专栏

---

## Q1: BT Model（DPO和RM的训练形式）的问题是什么？

BT model的loss形式：$loss = -\log\sigma(pos - neg)$，最大化正负样本的reward差距。

**三大问题**：

1. **模式坍塌（Mode Collapse）**：最大化正负差距导致模型坍塌到只有正例空间，失去熵（entropy）。负例输出概率→0，模型抗噪声能力弱。正负pair标错会导致严重后果。

2. **忽略细粒度差异**：logsigmoid函数过度关注语义差别大的pair，忽略差别小的pair，容易overfit到"容易学"的case。用hinge loss可缓解。

3. **无法建模全序关系**：数据集中存在$A > B, B > C, C > A$的偏序关系时，BT model找不到Nash equilibrium点，只会学乱。

---

## Q2: DPO的变体有哪些？各自解决什么问题？

| 方法 | 核心改进 | 解决问题 |
|------|---------|---------|
| **RSO** | 统计拒绝采样改进采样方式 | DPO几乎是off-policy采样 |
| **Iterative DPO** | 在线采样替代离线采样 | 蒙特卡洛采样难以达到 |
| **IPO** | 限制reward gap范围 | BT model过度扩大gap导致overfit |
| **DPOP** | 惩罚正例概率下降的pair | 编辑距离小的pair导致模型效果崩塌 |

---

## Q3: RL Scaling的Bottleneck是什么？

**必要条件**：好的infra和基建、充足的算力、好的基座模型（太差的基座不会有RL scaling）。

**短文本RLHF时代的两大限制**：

1. **Response Diversity消失**：迭代一定步数后模型entropy持续降低，采样出的response趋于一致→所有response的reward趋于一致→模型无法继续迭代。

2. **Reward Model的致命缺陷**：无论BT model还是GenRM，都给相似response打相似分数，**无法区分细粒度差异（fine-grained response difference）**→模型输出塌缩→reward hacking或response diversity消失。

---

## Q4: PPO训练后如何提升生成多样性？

**Temperature优先**：直接改变概率分布形状，低概率词更可能被采样到。效果比top_p更显著。

**top_p配合**：扩展候选词集合，在多样性和连贯性间找平衡。

**推荐策略**：先尝试提升temperature（如从0.7→1.0），再适当提升top_p（如从0.9→0.95）。

---

## Q5: RLHF中多阶段为何要加入Rejection Sampling？

本质是在**mode seeking（模式寻求）和mode covering（模式覆盖）之间取得平衡**。

- Mode seeking：仅生成少数高概率模式，缺乏多样性
- Mode covering：尝试覆盖所有模式，但生成质量可能下降

Rejection Sampling兼顾两者：在best-of-n采样中保留高质量样本（mode seeking），同时通过采样多样性保持覆盖（mode covering）。相当于同时优化forward KL和backward KL。

---

## Q6: RLHF中EMA Model Merge如何做？

EMA公式：$\theta_m = \frac{\theta_t + \beta\theta_{t-1} + \beta^2\theta_{t-2} + ... + \theta_0}{1 + \beta + \beta^2 + ... + \beta^t}$

**在线更新公式**（边迭代边merge）：

定义$W_0 = 1, W_t = \beta W_{t-1} + 1$，则$E_t = \frac{\beta W_{t-1} \cdot E_{t-1} + \theta_t}{W_t}$

含义：新merge参数 = 旧merge参数的加权 + 新训练参数的加权，权重自适应更新。

**作用**：缓解reward hacking，平滑policy更新，保持与SFT模型的接近度。
