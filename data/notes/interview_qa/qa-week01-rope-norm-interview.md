---
id: qa-week01-rope-norm-interview
title: "位置编码/归一化/激活函数面试问答集"
type: interview_qa
week: 1
topics: ["position-encoding", "normalization", "activation-functions"]
tags:
- name: "RoPE"
  initial_weight: 1.7
- name: "面试高频"
  initial_weight: 1.5
- name: "归一化"
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
recommendations: ["fnd-week02-pos-encoding", "fnd-week02-activation", "fnd-week02-norm"]
---

# 位置编码/归一化/激活函数面试问答集

> 来源: 百面LLM专栏

---

## Q1: RoPE的核心原理？为什么能编码相对位置？

RoPE通过**旋转矩阵**对Q和K施加位置相关的旋转变换：

$$q_m = R(\theta, m) \cdot q, \quad k_n = R(\theta, n) \cdot k$$

Attention Score：
$$q_m^T k_n = (R_m q)^T (R_n k) = q^T R_m^T R_n k = q^T R_{n-m} k$$

**关键性质**：旋转矩阵满足$R_m^T R_n = R_{n-m}$（旋转不变性），使attention score仅依赖相对位置差$n-m$。

**物理直觉**：用极坐标旋转角度表示绝对位置，两个向量的内积只与它们的角度差（相对位置）有关，与各自的绝对角度无关。

---

## Q2: RoPE的缺点和探索方向？

1. **长距离衰减失效**：未经长文本训练的RoPE在远距离上无法保持有效的attention衰减
2. **外推需要特殊处理**：需要NTK-aware scaling或YaRN等方法扩展上下文长度
3. **基频选择敏感**：base=10000是经验值，不同任务可能需要调整
4. **对特定频率过拟合**：训练长度内的频率分布与推理长度不匹配

**解决方案**：NTK-aware scaling（放大base）、YaRN（NTK + temperature）、LongRecipe（结构化长文本训练）。

---

## Q3: Transformer中原始Sinusoidal PE的弱点？

Sinusoidal PE: $PE(pos, 2i) = \sin(pos/10000^{2i/d}), PE(pos, 2i+1) = \cos(pos/10000^{2i/d})$

**主要弱点**：**平移方差性（Translation Variance）**。在不同位置上的相同pattern会产生不同的attention score，即$(i,j)$位置的score与$(i+m, j+m)$位置的score不相等。模型需要额外学习来补偿这种差异，降低了泛化能力。

RoPE通过旋转不变性解决了这个问题。

---

## Q4: RMSNorm vs LayerNorm的区别和使用？

**LayerNorm**: $y = \frac{x - \mu}{\sigma} \cdot \gamma + \beta$（re-center + re-scale）

**RMSNorm**: $y = \frac{x}{\sqrt{\text{mean}(x^2) + \epsilon}} \cdot \gamma$（仅re-scale，无re-center，无$\beta$）

**RMSNorm的计算量约为LayerNorm的60-70%**（去掉均值计算），效果几乎一致。LLaMA/Mistral/Qwen/DeepSeek全部使用RMSNorm。

**Pre-LN vs Post-LN**：现代LLM统一使用Pre-LN（Sublayer前归一化），梯度通过残差直通底层，训练更稳定。

---

## Q5: SwiGLU为什么优于ReLU？

**SwiGLU = Swish(xW_gate) ⊙ (xW_up)**

三个核心优势：
1. **平滑可导**：处处可导，优化更稳定，消除ReLU的死神经元问题
2. **门控机制**：动态控制信息流，gate分支选择性激活特征
3. **非单调**：负半区允许小的负值通过（SiLU最小值≈-0.28），保留更多信息

**参数量平衡**：SwiGLU使用3个权重矩阵（gate/up/down），但通过将FFN中间维度从$4d$调整为$\frac{8}{3}d$，总参数量与标准ReLU-FFN（2个矩阵，$4d$中间维度）基本一致。

---

## Q6: RoPE外推方法总结

| 方法 | 核心思想 | 代表 |
|------|---------|------|
| Linear Scaling | 所有位置除以放大因子 | Position Interpolation |
| NTK-aware | 放大base频率，高频不压缩 | NTK-RoPE |
| YaRN | NTK + temperature tuning | 效果最优 |
| ReRoPE | 训练短，推理滑动窗口+reset | 训练推理一致 |

**核心insight**：高频分量（近距离依赖）不应被压缩，低频分量（远距离依赖）可以压缩。NTK-aware通过调整base=10000→500000等方式实现。
