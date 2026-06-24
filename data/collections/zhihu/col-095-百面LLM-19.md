---
title: "百面LLM-19"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/688032507
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-19

> @swtheking | https://zhuanlan.zhihu.com/p/688032507

---

提问：如何在公开数据集中筛选合适自己模型的sft数据？

回答：

根据prompt筛选sft数据：
swtheking：大模型的面试题系列-18
51 赞同 · 6 评论 文章
利用sft model和pretrain model的关系筛选模型的sft数据：
IFD方法 [1]：利用以下公式进行数据选择： 
𝑟
𝜃
(
𝑄
,
𝐴
)
=
𝑃
𝜃
(
𝐴
|
𝑄
)
/
𝑃
𝜃
(
𝐴
)
 。这个公式其实是计算pretrain model生成对齐后模型的answer的难度（在 prompt的condition 下生成A的概率）。这个概率越低，越说明生成难度高，那么sft模型学习到的对齐规律越多，那么我们更应该选择这个sft数据。
Hybrid Method （混合了多种之前列举的指标和方法。）：例如 What MakeGood Data for Alignment? A Comprehensive Study of Automatic Data Selectionin Instruction Tuning [2] 文章，从complexity，diversity和quality三个方向对sft数据建模，训练了多个模型对各个指标维度进行分别衡量。

[1] Li M, Zhang Y, Li Z, et al. From quantity to quality: Boosting llm performance with self-guided data selection for instruction tuning[J]. arXiv preprint arXiv:2308.12032, 2023.

[2] Liu W, Zeng W, He K, et al. What makes good data for alignment? a comprehensive study of automatic data selection in instruction tuning[J]. arXiv preprint arXiv:2312.15685, 2023.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-843a3368d028fd2cf67b3bfd106aa45d.png?source=7e7ef6e2&needBackground=1)

![图](https://pic3.zhimg.com/v2-5f827469a56fe1828f65da3fafc47eb8_1440w.jpg)

![图](https://pic3.zhimg.com/v2-0a8d75e21061628ef917fc3a2d89a730_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

