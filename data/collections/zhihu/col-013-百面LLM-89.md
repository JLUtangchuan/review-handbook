---
title: "百面LLM-89"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/20260833435
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-89

> @swtheking | https://zhuanlan.zhihu.com/p/20260833435

---

提问：SFT有什么问题？有什么替代方法？

回答：

在A的论文中提出：SFT 改变了模型对底层数据分布的期望。具体来说，SFT 改变了模型对数据分布 P(X) 的期望，其中我们假定 X 是 SFT 数据集的答案集。相反，提示方法要求模型对分布 P(X | C) 进行预测，其中 C 是上下文。

为了明确说明这一点，他们使用了一个计数任务来演示这一点：他们向语言模型展示列表 C = 1,2,··· ,63，然后模型会极高概率地预测接下来的数字是 X = 64,65,···。如果他们在 C 上进行微调，那么结果模型不会立即预期看到 64 这个标记，但如果继续这个序列，它会抓住计数模式。

那么可以用以下方式解决：

1）Prompting： 通过提供某些输入来引导和触发语言模型或 AI 系统生成响应的过程。

2）Context distillation: 在训练阶段通过prompting生成高质量的上下文信息（或输出），然后使用这些上下文信息训练自己的模型。

3）Rejection Sampling Fine-Tuning ：主要是通过基于一定标准选择和拒绝样本来优化模型的性能，从而提高生成内容的质量。再用高质量的自生产样本来FT自己。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-eac2b7d2aca0fac96a8e48585df66d3e_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-f4edee3245fef67fc37641fd9aa839a1.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

