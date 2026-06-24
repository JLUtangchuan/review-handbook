---
title: "百面LLM-79"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/5733143681
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-79

> @swtheking | https://zhuanlan.zhihu.com/p/5733143681

---

提问：什么是模型分布式training中的的pp，tp和dp参数？

回答：

在分布式训练中，数据并行 (DP)、张量并行 (TP) 和流水线并行 (PP) 的组合使用决定了总使用的 GPU 数量。理解它们之间的关系有助于设计高效的分布式训练策略。我们可以通过乘积关系来直观地了解这些参数如何共同决定总 GPU 数量。




### 1. 数据并行 (DP)

数据并行是指在不同的 GPU 上同时训练同一个模型的不同数据批次。每个 GPU 保持一份完整的模型副本。




### 2. 张量并行 (TP)

张量并行是指将模型的权重或者计算图在不同的 GPU 之间进行拆分。每个 GPU 处理模型的一部分。




### 3. 流水线并行 (PP)

流水线并行是将模型的层（或多个连续层）分割到不同的 GPU 上，以形成一个流水线计算模式。




### GPU 数量计算

假设我们再训练一个需要并行化的深度学习模型，并且以下参数分别表示数据并行、张量并行和流水线并行的数量：




- \(DP\)：数据并行的数量。

- \(TP\)：张量并行的数量。

- \(PP\)：流水线并行的数量。




### 总 GPU 数量的计算

总 GPU 数量 
(
𝑁
GPU
)
 是这三个并行策略所用数量的乘积：




\[ N_{\text{GPU}} = DP \times TP \times PP \]




### 示例

举一个例子来说明：




#### 示例参数设置

- 数据并行 (DP)：4

- 张量并行 (TP)：2

- 流水线并行 (PP)：3




#### 计算总 GPU 数量

根据公式：




\[ N_{\text{GPU}} = DP \times TP \times PP \]

\[ N_{\text{GPU}} = 4 \times 2 \times 3 \]

\[ N_{\text{GPU}} = 24 \]




因此，在这种配置下，总共需要 24 个 GPU 来完成分布式训练。




### 例子解释

- 每个数据并行单元 (DP) 有 4 个独立的数据处理队列。

- 每个张量并行单元 (TP) 将模型的张量拆分在 2 个 GPU 上进行并行计算。

- 每个流水线并行单元 (PP) 将模型的层次划分到 3 个 GPU 上，形成流水线。




最终，组合这三种并行方式，整个训练系统将利用到 24 个 GPU。




### 综述

通过合理设置 DP、TP 和 PP 参数，可以设计出高效的分布式训练策略，充分利用 GPU 资源来训练更大规模的模型和数据集。理解各参数间的关系并做出合理选择是提升分布式训练效率的关键。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

