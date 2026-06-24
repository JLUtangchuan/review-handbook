---
id: qa-week03-moe-routing
title: MoE负载均衡：Aux-loss、Expert Choice与DeepSeek的Shared Expert策略
type: interview_qa
week: 3
topics:
  - architecture-innovation
  - llm-architecture
tags:
  - name: MoE
    initial_weight: 1.5
  - name: 负载均衡
    initial_weight: 1.4
  - name: 面试高频
    initial_weight: 1.5
difficulty: 4
status: completed
rating: 2
created_at: '2026-06-22'
updated_at: '2026-06-24'
recommendations:
  - fnd-week03-deepseek
sources:
  - platform: xiaohongshu
    url: https://www.xiaohongshu.com/explore/6780a3370000000017038fce
    title: DeepSeek v3核心技术解读
    saved_at: '2026-06-22'
question: MoE负载均衡问题：Aux-loss / Expert Choice / DeepSeek的Shared Expert策略？
---

# MoE负载均衡：Aux-loss、Expert Choice与DeepSeek的Shared Expert策略

> **💡 问题**: MoE负载均衡问题：Aux-loss / Expert Choice / DeepSeek的Shared Expert策略？

## 来源
- [xiaohongshu] [DeepSeek v3核心技术解读](https://www.xiaohongshu.com/explore/6780a3370000000017038fce)

## 内容
> **💡 问题**: MoE负载均衡问题：Aux-loss / Expert Choice / DeepSeek的Shared Expert策略？

## 来源
- [xiaohongshu] [DeepSeek v3核心技术解读](https://www.xiaohongshu.com/explore/6780a3370000000017038fce)

## 回答
MoE负载均衡是MoE架构的核心挑战——如果专家负载不均，会导致部分专家过载（token堆积→延迟高）、部分专家闲置（浪费算力）。
**问题本质**： - 路由网络倾向于反复选择相同专家（富者愈富效应），导致专家利用不均 - 极端情况：90%的token流向5%的专家
**三种主流解决方案**：
**1. Auxiliary Loss（辅助损失）— 传统方案**： - 在训练loss中加一项惩罚专家不均衡程度的辅助loss - L_aux = α × Var(f_i) （专家处理token数的方差） - 问题：(a) α需要调参→太大会损害模型效果；(b) 只在训练时起作用，推理时可能不均衡
**2. Expert Choice（让专家选token）— Google Switch Transformer**： - 反过来：每个专家选择top-k个token（而非token选专家） - 保证每个专家恰好处理相同数量的token - 问题：token可能被多个专家选中或遗漏
**3. DeepSeek方案（Shared Expert + Aux-loss-free）— 业界最优**： - Shared Expert：一个所有token都会经过的共享专家，提供基础能力 - Routed Experts：细粒度专家（256个），token选择top-k个 - Aux-loss-free Load Balance：动态调整每个专家的bias项（非梯度更新），亲和度score = softmax(W_r·x + b_expert)，周期性调整b使专家负载均衡 - 优势：(a) 不损害模型效果（bias调整不在计算图中）；(b) 推理时也有效
**DeepSeekMoE具体配置**： - 1 Shared Expert + 256 Routed Experts - 每token激活：1 shared（固定）+ top-8 routed（共9个专家） - 细粒度：每个routed expert的hidden_dim仅为标准MoE专家的1/4→更多专家+更细粒度
**面试回答要点**：解释问题→列举三种方案→重点说明DeepSeek方案的创新


## 延伸思考
- Token Choice vs Expert Choice的通信复杂度对比？
- Aux-loss-free bias调整的频率如何确定？
- 推理时如果某个专家过载怎么办？（capacity factor/overflow策略）

## 图片
![MoE路由与负载均衡](http://sns-webpic-qc.xhscdn.com/202606222257/70109c49610b2ff5b68b4df3399e3c46/1040g2sg31cfa5ao3h0705o0frbig853t5piqm5o!nc_n_webp_mw_1)
*MoE路由与负载均衡*

## 相关笔记
- [[fnd-week03-deepseek]]

## 相关笔记
- [[fnd-week03-deepseek]]
