---
title: "百面LLM-74"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/939621341
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-74

> @swtheking | https://zhuanlan.zhihu.com/p/939621341

---

提问：Rejection Sampling在RL中训练中算forward KL，还是backward KL？

回答：

chatgpt结果

LLM（大型语言模型）的拒绝采样（Rejection Sampling）是一种用于改进模型输出质量的技术。它主要用于在生成文本时，通过筛选和选择高质量的输出，从而提升生成结果的质量。
拒绝采样（Rejection Sampling）简介
拒绝采样是一种从复杂分布中抽取样本的通用方法。对于语言模型来说，拒绝采样步骤如下：
生成候选输出：从模型中生成多个候选输出。
评价候选输出：使用一个评分函数来评价每个候选输出的质量。
筛选输出：根据评分函数的反馈，拒绝低质量的输出，保留高质量的输出。
拒绝采样在 LLM 中的应用
在 LLM 的上下文中，拒绝采样可以用于优化生成文本的质量，例如在文本生成、对话系统或其他自然语言处理任务中。
具体步骤
生成候选输出：使用 LLM 生成一批候选输出（例如生成 10 个可能的回答或文本段落）。
评分和筛选：使用一个辅助模型或评分机制（例如排行榜或外部验证器）来对这些候选输出进行评分。
选择最佳输出：在保留一定数量的高质量输出的基础上，选择评分最高的输出作为最终结果。

严格来说，RS应该是forward KL方式。它的teacher policy 应该是BON的policy。

如下图：

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-7d79385546f4b0c043c94648f8ed0635_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

