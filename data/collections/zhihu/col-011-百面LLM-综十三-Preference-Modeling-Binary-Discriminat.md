---
title: "百面LLM，综十三， Preference Modeling: Binary Discrimination Versus Imitation Learning"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/22542337841
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综十三， Preference Modeling: Binary Discrimination Versus Imitation Learning

> @swtheking | https://zhuanlan.zhihu.com/p/22542337841

---

这篇Blog是我们沿着Anthropic一个重要观察而延展做的实验，这个实验结论和Anthropic的结论略有不同，其中这个观点可能能帮助我们理解self-reward背后的原理。

本文考察了论文“A General Language Assistant as a Laboratory for Alignment”中的一个关键观察，即“排序偏好模型往往比模仿学习有很大改进，但二元判别通常提供的好处很小。”然而，我们的发现对此有不同见解：模型可以通过模仿学习学习每个问题的单对二元判别，但使用相同方法无法学习每个提示的多对二元判别。最终，我们发现我们实验与论文中描述实验的差异源于我们实验中代码生成样本难度增加，而论文中使用的样本难度较低。这种难度增加可能解释了两组结果之间的差异。

TLDR：This blog investigates a key observation from the paper "A General Language Assistant as a Laboratory for Alignment" that “Ranked preference models tend to improve greatly on imitation learning, but binary discrimination typically provides little benefit.” However, our findings differ on this point: The model can learn single-pair binary discrimination per prompt through imitation learning, but it is unable to learn multiple-pair binary discrimination per prompt using the same method. Finally, we find that the discrepancy between our experiments and those described in the paper arises from the increased difficulty of the code generation samples in our experiments compared to those used in the paper. This increased difficulty may explain the differences observed between the two sets of results.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-6db8ac0c4b232287eb50f0028f449de8.webp)

