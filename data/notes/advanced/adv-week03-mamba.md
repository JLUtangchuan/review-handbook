---
id: adv-week03-mamba
title: Mamba/SSM/Titans：从Attention到State Space的记忆力架构革命
type: advanced
week: 3
topics:
- architecture-innovation
tags:
- name: Mamba
  initial_weight: 1.5
- name: SSM
  initial_weight: 1.4
- name: Titans
  initial_weight: 1.3
- name: 架构创新
  initial_weight: 1.2
difficulty: 5
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- fnd-week03-deepseek
- qa-week03-moe-routing
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/6780a3370000000017038fce
  title: DeepSeek v3核心技术解读
  saved_at: '2026-06-22'
---

# Mamba/SSM/Titans：从Attention到State Space的记忆力架构革命

## 来源
- [xiaohongshu] [DeepSeek v3核心技术解读](https://www.xiaohongshu.com/explore/6780a3370000000017038fce)

## 内容
Transformer统治了深度学习五年，但其O(n²)的attention复杂度始终是长序列的瓶颈。State Space Model（SSM）家族提供了一条线性复杂度的替代路线。
**Mamba（2023.12）— SSM的质变**： - 核心思想：用State Space Model替代Attention - SSM建模：h_t = A·h_{t-1} + B·x_t（状态方程）；y_t = C·h_t（输出方程） - 关键创新Selective Scan：A、B、C参数随输入x_t变化（输入依赖），解决了固定SSM无法做content-based reasoning的问题 - 复杂度O(n·d)（线性！），且可以用parallel scan高效计算 - Mamba-2（2024.05）：将Selective SSM重新表述为structured matrix multiplication，与FlashAttention共享底层优化
**Mamba与Attention的关系**： - Attention: y = softmax(QK^T/√d)·V，显式建模token间交互 - SSM: h_t = A_t·h_{t-1} + B_t·x_t，隐式通过state传递信息 - Mamba-2统一视角：SSM可以看作Attention的special case（Q=1, K和V由state dynamics定义） - 互补性：Attention擅长精确检索（lookup），SSM擅长序列建模（上下文压缩）
**Titans（Google, 2025）— 记忆力的系统化**： - 提出三种记忆模块：Persistent Memory（长期固定知识）、Contextual Memory（当前上下文）、Neural Memory（可学习的记忆机制） - 核心创新：将记忆作为一等公民纳入架构设计，而非attention的副作用 - 神经记忆模块使用surprise-based写入机制：模型对其预测误差大的token做更强的记忆编码
**应用建议**： - 超长序列（>100K）：优先考虑Mamba-2或Hybrid（Mamba前几层+Attention后几层） - 标准长度（<32K）：Transformer（FlashAttention足够高效） - 机器人/实时系统：Mamba的低延迟、线性复杂度有优势


## 关键要点
- SSM的核心三参数：A（状态转移）、B（输入投影）、C（输出投影）
- Selective Scan：让A、B、C成为输入的线性函数，用parallel scan O(n log n)实现
- Mamba-2的SSD算法：structured matrix duality，将SSM转化为半可分矩阵乘法
- Hybrid Mamba-Attention：Jamba/Mamba2-Hybrid等将Mamba和Attention层交替使用
- Titans的记忆架构：Persistent + Contextual + Neural记忆的三层金字塔
- Surprise-based memory写入：高预测误差→重要性高→强记忆编码
- Attention vs SSM的核心trade-off：O(n²)精确检索 vs O(n)线性建模
- 具身智能中SSM可能特别有用：实时控制需要低延迟+长序列历史

## 自测问题
- Mamba的Selective Scan如何实现content-based reasoning？与标准SSM的关键区别？
- Mamba-2如何将SSM与Attention统一？SSD算法的核心insight？
- 在具身智能场景中，Mamba/SSM相比Transformer有什么优势？
- Titans的surprise-based记忆机制与Attention的KV Cache有什么本质不同？

## 相关笔记
- [[fnd-week03-deepseek]]
- [[qa-week03-moe-routing]]
