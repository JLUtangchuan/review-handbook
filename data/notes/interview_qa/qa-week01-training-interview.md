---
id: qa-week01-training-interview
title: "大模型训练/优化/微调面试问答集"
type: interview_qa
week: 1
topics: ["optimizers", "loss-functions", "training-regularization", "peft"]
tags:
- name: "训练优化"
  initial_weight: 1.5
- name: "面试高频"
  initial_weight: 1.5
- name: "微调"
  initial_weight: 1.4
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
recommendations: ["fnd-week02-activation", "qa-week02-swiglu"]
---

# 大模型训练/优化/微调面试问答集

> 来源: 百面LLM专栏

---

## Q1: Loss Spike的原因与解决方案？

**现象**：训练过程中loss突然飙升（spike），然后缓慢恢复或不恢复。

**原因分析**：
1. **梯度爆炸**：某批次数据导致异常大的梯度更新
2. **优化器状态损坏**：Adam的m/v累积了错误梯度方向
3. **数据质量问题**：脏数据、错误标注
4. **学习率过大**：超过稳定训练阈值

**解决方案**：
- Gradient Clipping（裁剪到max_norm）
- 检测spike后回滚checkpoint并跳过该batch
- Adam的$\epsilon$调大（默认1e-8→1e-6）
- 减小学习率或使用warmup

---

## Q2: Adam vs AdamW的核心区别？

**Adam**：$m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t, v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2, \theta_t = \theta_{t-1} - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon}\hat{m}_t - \eta\lambda\theta_{t-1}$

**AdamW**：$\theta_t = \theta_{t-1} - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon}\hat{m}_t \quad \text{// 先更新梯度}$，然后$\theta_t = \theta_t - \eta\lambda\theta_{t-1} \quad \text{// 独立应用Weight Decay}$

**关键区别**：Adam中Weight Decay与梯度更新耦合（受动量影响），AdamW解耦Weight Decay。实验证明AdamW训练更稳定，泛化更好。

---

## Q3: Gradient Accumulation的原理和作用？

**原理**：将大batch拆分为多个micro-batch，分别计算梯度并累加，最后统一更新参数。

```python
optimizer.zero_grad()
for i, micro_batch in enumerate(dataloader):
    loss = model(micro_batch) / accumulation_steps
    loss.backward()  # 梯度累加到.grad
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

**作用**：
- 在显存受限时模拟大batch训练
- 保持BatchNorm的统计稳定性
- accumulation_steps=B_effective/B_per_gpu

---

## Q4: 混合精度训练（AMP）的原理？

**核心**：前向和反向传播用FP16（速度快），权重更新和master copy用FP32（精度高）。

**Loss Scaling**：防止FP16下小梯度underflow为0。前向时将loss乘以scale_factor放大，反向后梯度除以scale_factor恢复。动态loss scaling自动调整缩放因子。

**BF16 vs FP16**：BF16有更大的动态范围（与FP32相同的指数位），不需要loss scaling，但精度略低（7位尾数 vs 10位）。大模型训练逐渐从FP16转向BF16。

---

## Q5: Pre-SFT (Model-Generated Data for Fine-Tuning) 的核心思想？

传统SFT依赖人工标注数据，成本高、覆盖窄。Pre-SFT让**模型自己决定哪些监督数据对fine-tuning最有用**：

1. 用大模型对候选数据打分（质量、多样性、难度）
2. 选择高价值子集进行SFT训练
3. 实验证明：精心筛选的10-20%数据可达到全量数据的fine-tuning效果

**关键insight**：不是数据越多越好，数据质量和对齐度更重要。

---

## Q6: 为什么大模型需要Warmup？

**原因**：
1. 训练初期模型参数随机，梯度方向不稳定
2. Adam的m/v估计需要预热才能准确
3. 大学习率直接训练会导致训练初期发散

**策略**：前N步（通常N=总步数的1-5%）学习率从0线性增长到目标值，之后正常衰减（cosine/linear decay）。

**新趋势**：一些大模型（如PaLM）发现不需要warmup也能稳定训练，与架构和初始化有关。
