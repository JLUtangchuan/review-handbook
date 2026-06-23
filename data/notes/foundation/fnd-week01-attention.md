---
id: fnd-week01-attention
title: MHA/MQA/GQA/MLA 一张图看懂注意力机制演进
type: foundation
week: 1
topics:
- attention-arch
tags:
- name: 注意力机制
  initial_weight: 1.5
- name: MHA
  initial_weight: 1.2
- name: GQA
  initial_weight: 1.3
- name: 面试高频
  initial_weight: 1.5
difficulty: 3
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- fnd-week01-transformer-block
- qa-week01-attn-complexity
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6950e1de000000001e00e177
  title: MHA/MQA/GQA 一张图看懂！
  saved_at: '2026-06-22'
---

# MHA/MQA/GQA/MLA 一张图看懂注意力机制演进

## 来源
- [xiaohongshu] [MHA/MQA/GQA 一张图看懂！](https://www.xiaohongshu.com/explore/6950e1de000000001e00e177)

## 内容
MHA（Multi-Head Attention）每个head有独立的K/V，计算量大但效果最好； MQA（Multi-Query Attention）所有head共享一组K/V，省显存但表达能力弱； GQA（Grouped Query Attention）折中方案，将head分组，每组共享K/V，是大模型推理首选； MLA（Multi-head Latent Attention，DeepSeek）将K/V压缩到低维latent空间再展开，极致压缩KV Cache。
**核心结论**： - 训练：MHA（精度优先） - 推理：GQA（显存与效果平衡） - 极致压缩：MLA（DeepSeek专属）


## 关键要点
- {'MHA': '每个attention head有独立的Q、K、V投影，参数量=3×d_model×d_kv×n_heads'}
- {'MQA': '所有head共享K、V，参数量大幅减少，但不同head无法关注不同语义空间'}
- {'GQA': 'n_heads个Q分成n_groups组，每组共享K、V，n_groups=1即MQA，n_groups=n_heads即MHA'}
- GQA在LLaMA2/3、Mistral等主流模型中广泛使用，通常n_groups=8
- MLA核心思想：将K、V先投影到低维latent，再通过up-projection恢复，训练时存full KV，推理时只存latent
- KV Cache大小对比：MHA(1x) > GQA(1/group_ratio) > MQA(1/n_heads) ≈ MLA(约1/4~1/10)

## 自测问题
- MHA、MQA、GQA的区别？各自参数量和KV Cache大小如何计算？
- 为什么GQA是当前大模型推理的主流选择？
- MLA如何做到比GQA更极致的KV压缩？其核心insight是什么？
- 实际训练中如何处理GQA的group分配？

## 图片
![MHA vs MQA vs GQA 对比图](http://sns-webpic-qc.xhscdn.com/202606222256/75157530ea33be96bb66eaa23afb6eb1/spectrum/1040g0k031qklje3ogm0040to5t11l9rtq78eg1o!nc_n_webp_mw_1)
*MHA vs MQA vs GQA 对比图*

## 相关笔记
- [[fnd-week01-transformer-block]]
- [[qa-week01-attn-complexity]]
