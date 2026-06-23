---
id: fnd-week01-transformer-block
title: 手撕Attention：从Self-Attention到MLA完整实现
type: foundation
week: 1
topics:
- attention-arch
- position-encoding
tags:
- name: Transformer
  initial_weight: 1.5
- name: Attention手写
  initial_weight: 1.8
- name: KV Cache
  initial_weight: 1.4
difficulty: 4
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- fnd-week01-attention
- cod-week01-mha
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/69ad304c000000002202302a
  title: 手撕Attention
  saved_at: '2026-06-22'
---

# 手撕Attention：从Self-Attention到MLA完整实现

## 来源
- [xiaohongshu] [手撕Attention](https://www.xiaohongshu.com/explore/69ad304c000000002202302a)

## 内容
完整覆盖Attention家族所有变体的代码实现与原理： 1. Self-Attention（单头标准实现，Q=K=V来自同一输入） 2. Cross-Attention（Q来自decoder，K/V来自encoder） 3. Multi-Head Attention（并行多头，concat后投影） 4. MHA with KV Cache（推理时缓存历史K/V，避免重复计算） 5. Multi-Query Attention（所有head共享K/V） 6. Grouped Query Attention（分组共享K/V） 7. MLA原理/代码（DeepSeek的极致KV压缩方案） 8. 配套知识点：Softmax数值稳定（减max防溢出）、Cross Entropy Loss、RoPE旋转位置编码、KL散度
**实现要点**： - Attention公式：O = softmax(QK^T/√d_k) · V - 除以√d_k防止内积过大导致softmax梯度消失 - KV Cache：推理时每个token的K/V只算一次，存下来复用 - Python/PyTorch实现：矩阵运算 + einops/einsum
这篇笔记覆盖了16页精华内容，从基础到进阶的Attention全家桶。


## 关键要点
- {'Self-Attention': 'Q/K/V通过三个线性层从同一输入投影，计算Scaled Dot-Product Attention'}
- {'Cross-Attention': 'decoder的Q关注encoder输出的K/V，应用于Encoder-Decoder架构'}
- {'MHA': 'n_head个独立的Attention并行计算，输出concat后经W_o投影，参数量=4×d_model²'}
- KV Cache原理：自回归解码时，已生成token的K/V不需要重复计算，直接拼接到当前输入前
- {'MQA': '所有head共享K/V矩阵，参数量降至(2+2/n_head)×d_model²，训练速度提升但精度略降'}
- {'GQA': '将head分成n_groups组，组内共享K/V，trade-off最优'}
- {'MLA': 'K/V→down_proj(latent)→up_proj，推理时只存latent表示，大幅减少KV Cache体积'}
- Softmax稳定技巧：x - max(x)避免e^x数值溢出
- {'CE Loss': '-∑y_true·log(softmax(logits))，与softmax组合有梯度简化'}

## 自测问题
- 手写Scaled Dot-Product Attention的PyTorch代码，包含mask处理
- KV Cache为什么能加速推理？具体减少了多少计算量？
- MQA和GQA在代码实现上的区别是什么？
- MLA的down/up projection如何保证语义不丢失？

## 图片
![Attention家族全景图](http://sns-webpic-qc.xhscdn.com/202606222256/360e082cd28a9ec0ba1d90a5659c6c50/spectrum/1040g34o31tdt5h1256105no6jgq08o4hiqdu920!nc_n_webp_mw_1)
*Attention家族全景图*

## 相关笔记
- [[fnd-week01-attention]]
- [[cod-week01-mha]]
