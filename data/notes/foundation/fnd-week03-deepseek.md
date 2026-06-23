---
id: fnd-week03-deepseek
title: DeepSeek技术报告精读：V2(MLA+MoE)→V3(FP8+MTP)→R1(GRPO Reasoning)
type: foundation
week: 3
topics:
- llm-architecture
tags:
- name: DeepSeek
  initial_weight: 1.8
- name: MLA
  initial_weight: 1.5
- name: MoE
  initial_weight: 1.4
- name: 技术报告
  initial_weight: 1.3
difficulty: 4
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- adv-week03-mamba
- qa-week03-deepseek-mla
- qa-week03-moe-routing
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6780a3370000000017038fce
  title: DeepSeek v3核心技术解读
  saved_at: '2026-06-22'
---

# DeepSeek技术报告精读：V2(MLA+MoE)→V3(FP8+MTP)→R1(GRPO Reasoning)

## 来源
- [xiaohongshu] [DeepSeek v3核心技术解读](https://www.xiaohongshu.com/explore/6780a3370000000017038fce)

## 内容
DeepSeek系列三阶段技术演进：
**V2 — MLA + DeepSeekMoE**（2024.05）： - MLA（Multi-head Latent Attention）：将K/V投影到低维latent空间（d_latent << d_head×n_heads），推理时只存latent表示，KV Cache压缩比可达10× - DeepSeekMoE：细粒度专家（fine-grained）+ 共享专家（shared expert）。每个token激活top-k细粒度专家+固定shared expert - Aux-loss-free Load Balance：动态调整expert bias而非依赖aux loss
**V3 — FP8训练 + Multi-Token Prediction**（2024.12）： - FP8混合精度训练：首次在超大规模MoE上使用FP8，配合细粒度block-wise scaling - Multi-Token Prediction（MTP）：每个位置预测后续多个token，提升数据效率 - DualPipe：前后向+通信计算重叠的流水线并行策略 - 671B总参数，37B激活参数（每次推理只激活约5.5%参数） - 训练成本：2.7M GPU hours on H800（约$5.5M），仅为同等规模模型的1/10
**R1 — GRPO + 推理能力**（2025.01）： - 首次将GRPO从数学推理推广到通用推理任务 - 纯RL训练（无SFT冷启动）即可涌现CoT（思维链）能力 - Group Relative Policy Optimization：每个prompt采样一组response，组内做相对优势估计 - R1-Zero完全不用SFT数据，纯RL训练即可呈现推理行为 - R1保留SFT冷启动+RL的混合策略（DeepSeekMath的方法延续）


## 关键要点
- MLA核心公式：KV = W_down_kv(x) → c_kv（latent）；推理时attention计算：Q·(W_up_k(c_kv))^T
- DeepSeekMoE架构：1个shared expert + 256个routed experts，每token激活8个（1 shared + 7.5 routed平均）
- Expert负载均衡：Aux-loss-free策略用bias修正而非梯度惩罚，专家亲和度score加learnable bias
- FP8训练关键：block-wise量化（1×128 tile）使FP8 E4M3的动态范围覆盖99.9%的激活值
- MTP实现：每个Transformer层后接n个额外的输出head，预测未来第1~n个token，训练时辅助loss加权
- DualPipe：将forward、backward、通信三个阶段通过精细调度重叠
- R1奖励设计：accuracy reward（数学结果）+ format reward（格式奖励，鼓励结构化输出）
- 最终蒸馏：R1作为teacher蒸馏到Qwen/Llama等小模型（7B/14B/32B）

## 自测问题
- MLA的down-projection和up-projection具体如何工作？为什么推理时只需要存latent？
- DeepSeekMoE的shared expert + routed expert设计相比传统MoE有什么优势？
- FP8训练在数值稳定性方面面临哪些挑战？DeepSeek如何解决？
- GRPO与PPO在reward estimation上的核心区别？

## 图片
![DeepSeek V3架构全景](http://sns-webpic-qc.xhscdn.com/202606222257/70109c49610b2ff5b68b4df3399e3c46/1040g2sg31cfa5ao3h0705o0frbig853t5piqm5o!nc_n_webp_mw_1)
*DeepSeek V3架构全景*

## 相关笔记
- [[adv-week03-mamba]]
- [[qa-week03-deepseek-mla]]
- [[qa-week03-moe-routing]]
