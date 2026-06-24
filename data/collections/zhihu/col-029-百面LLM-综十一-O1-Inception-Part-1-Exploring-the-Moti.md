---
title: "百面LLM，综十一， O1 Inception Part-1: Exploring the Motivation Behind O1"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1800405970
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综十一， O1 Inception Part-1: Exploring the Motivation Behind O1

> @swtheking | https://zhuanlan.zhihu.com/p/1800405970

---

在很多同学开始并进展O1之前，我还是在踌躇和思考。思考的点，是

为什么我们要做o1？
现有框架有啥问题是需要o1解决的？
以及o1的关键破局点在哪里？

现在我的belief是这是一个解决已有RLHF的比较general的框架，它的出现是为了解决RLHF中很多人工介入的问题。

TL;DR:Recently, a number of projects have sought to explore the mechanisms of O1 or reimplement it. Instead, this blog aims to explore the motivation behind O1: how to train an LLM that avoids significant modification of model parameters, maintains a low KL divergence from the pre-trained LLM, and achieves high performance on unseen data. Finally, without going into detail, we propose a preliminary method to achieve this objective, which combines Chain of Thought (COT), self-correction, self-refinement, and planning methods.

摘要：最近，一些项目试图探索 O1 的机制或重新实现它。相反，这篇博客旨在探讨 O1 背后的动机：如何训练一个大语言模型（LLM），以避免对模型参数的重大修改，保持与预训练 LLM 的低 KL 散度，同时在未见过的数据上取得高性能。最后，不深入细节地，我们提出了一种初步方法来实现这一目标，该方法结合了思维链（COT）、自我纠正、自我完善和规划方法。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

