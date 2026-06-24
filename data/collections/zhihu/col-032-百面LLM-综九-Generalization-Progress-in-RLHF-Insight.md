---
title: "百面LLM，综九， Generalization Progress in RLHF: Insights into the Impact of Reward Models and PPO"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/721794976
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综九， Generalization Progress in RLHF: Insights into the Impact of Reward Models and PPO

> @swtheking | https://zhuanlan.zhihu.com/p/721794976

---

很早之前写的一个blog，最近想清楚了，发出来：

RL和RLHF的核心区别可能就是泛化的问题，RL的泛化是为了更好更快地搜索，也就是提升sample efficiency。但RLHF的核心问题就是泛化。因此我们这一篇主要讨论RLHF的泛化来源。

TL;DR:In this blog, we summarize recent research and design experiments to explore the generalization process in RLHF. The generalization in RLHF involves two primary aspects: generalization originating from the training of the reward model and generalization resulting from PPO training. The generalization of the reward model primarily stems from the preference datasets and the inherent generalization capabilities of pre-trained models. Meanwhile, the generalization achieved through PPO training encompasses two key components: generalization derived from on-policy samples and generalization stemming from token-wise rewards. Based on these findings, we offer some recommendations for data construction in RLHF.

简要：在这篇博客中，我们总结了最近的研究，并设计了一系列实验来探讨 RLHF 中的泛化过程。RLHF 中的泛化涉及两个主要方面：源自奖励模型训练的泛化和源自 PPO 训练的泛化。奖励模型的泛化主要来源于偏好数据集和预训练模型的内在泛化能力。同时，通过 PPO 训练达到的泛化包含两个关键组成部分：源自策略内样本的泛化和源自逐字奖励的泛化。基于这些发现，我们对 RLHF 中的数据构建提出了一些建议。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-ae0d8f9712d898b7d2f0939939f021e3.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-309b8095c3b5bd70a250f0ecc832962a.webp)

