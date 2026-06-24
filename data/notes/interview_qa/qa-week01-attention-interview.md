---
id: qa-week01-attention-interview
title: "Attention机制面试问答集：MHA/MQA/GQA/MLA/KV Cache"
type: interview_qa
week: 1
topics: ["attention-arch", "kv-cache"]
tags:
- name: "Attention"
  initial_weight: 1.8
- name: "面试高频"
  initial_weight: 1.8
- name: "KV Cache"
  initial_weight: 1.5
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
recommendations: ["fnd-week01-attention", "qa-week01-attn-complexity", "fnd-week10-kv-cache"]
---

# Attention机制面试问答集

> 来源: 百面LLM专栏 | 整理自102篇面试问答

---

## Q1: MHA、MQA、GQA、MLA的区别？各自的KV Cache大小如何计算？

**MHA (Multi-Head Attention)**：每个head有独立的Q、K、V投影。$h$个head × $d_{head}$维 = 每层每token存储$2 \times h \times d_{head}$个float。

**MQA (Multi-Query Attention)**：所有head共享一组K、V。KV Cache压缩$h$倍（如LLaMA-7B 32倍），但不同head无法关注不同语义空间。

**GQA (Grouped Query Attention)**：将$h$个head分为$g$组，每组共享K/V。LLaMA-2/3使用$g=8$，KV Cache压缩8倍，效果损失极小。

**MLA (Multi-head Latent Attention)**：DeepSeek独创。将K/V投影到低维latent($d_c \approx 128$)，推理时只存latent表示。压缩比$d_{model}/d_c \approx 40$倍。

**KV Cache计算公式**：每层每token = $2 \times n_{kv\_heads} \times d_{head} \times \text{sizeof(dtype)}$

---

## Q2: RoPE位置编码在Llama2中放在哪里？能否换位置？

Llama2的RoPE位于各层MHA/GQA之后、计算Attention之前（即对Q和K施加旋转编码）。

**不能放在MHA之前**。原因：RoPE依赖旋转不变性——$(R(\theta_i)W_K x)^T(R(\theta_j)W_Q y) = (W_K x)^T R(\theta_j - \theta_i)(W_Q y)$。若放在MHA前变为$(W_K R(\theta_i)x)^T(W_Q R(\theta_j)y)$，无法利用旋转不变性化简，Attention score不再只依赖相对位置差$\theta_j - \theta_i$。

---

## Q3: 现代Transformer面试高频五件套是什么？

1. **FlashAttention**：IO-Aware，Tiling+Online Softmax，训推加速2-4倍
2. **GQA/MQA**：KV Cache压缩，$g$组共享K/V
3. **RMSNorm + Pre-LN**：去掉re-centering，梯度更稳定
4. **SwiGLU**：门控激活，优于ReLU/GELU
5. **RoPE**：旋转位置编码，天然编码相对位置

---

## Q4: Attention Score的手写公式和PyTorch实现？

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}} + \text{mask}\right)V
$$

```python
def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn = F.softmax(scores, dim=-1)
    return torch.matmul(attn, V)
```

**关键细节**：
- `masked_fill`用`-1e9`而非`-inf`（避免NaN）
- 除以$\sqrt{d_k}$防止softmax梯度消失
- 训练时可加dropout：`F.dropout(attn, p=0.1)`

---

## Q5: KV Cache显存计算题

**题目**：LLaMA-7B ($L=32, h=32, d_{head}=128, d_{model}=4096$)，序列长度2048，FP16，计算MHA和GQA($g=8$)的KV Cache大小。

**MHA**：
$2 \times 32 \times 32 \times 128 \times 2048 \times 2 = 1.0\text{GB}$

**GQA($g=8$)**：
$2 \times 32 \times 8 \times 128 \times 2048 \times 2 = 0.25\text{GB}$

**关键**：GQA将KV Cache压缩8倍（$h/g$倍）。
