---
title: "百面LLM，综二，样本效率-DPO实际应用之殇"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/703035777
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综二，样本效率-DPO实际应用之殇

> @swtheking | https://zhuanlan.zhihu.com/p/703035777

---

今天正好是2k粉丝日～最近两个月总结了一下之前所有DPO和PPO的知乎，写了一篇英文blog，从理论到实际对比了DPO和PPO算法的区别，给出我认为DPO算法的主要缺点：样本使用效率过低。这篇文章算是给出了和DPO作者Your Language Model is Secretly a Q-Function完全相反的视角理解DPO算法。

TLDR：In this blog, we compare Direct Preference Optimization (DPO) and Proximal Policy Optimization (PPO) from a reinforcement learning perspective. The absence of a critic model, the lack of GAE estimation, and the use of off-policy sampling in DPO result in high variance but unbiased token-wise rewards estimates. This leads to a significant drawback of DPO: sample inefficiency. Due to limited training samples and a reliance on off-policy data, DPO faces the state distribution shift problem. Additionally, as a Bradley-Terry model with limited samples, DPO struggles to distinguish response pairs with substantial token overlap while still attempting to maximize the difference between them. This interplay between the state distribution shift problem and the limitations of the Bradley-Terry model can result in reduced likelihoods for both positive and negative samples.

在本博客中，我们从强化学习的角度比较了直接偏好优化 (DPO) 和近端策略优化 (PPO)。DPO 缺乏评论模型、GAE 估计，并使用离策略采样，导致高方差但无偏的token-wise的奖励估计。这导致 DPO 的一个显著缺点：样本效率低下。由于训练样本有限且依赖离策略数据，DPO 面临状态分布偏移问题。此外，作为一个 Bradley-Terry 模型，在样本有限的情况下，DPO 很难区分具有大量词汇重叠的响应对，同时还试图最大化它们之间的差异。这种状态分布偏移问题与 Bradley-Terry 模型限制之间的联合作用下会导致正负样本的概率值同时降低。

最后感谢各位老师和同学对这篇blog的讨论和帮助，（有些建议采纳了，但有些问题我们可能理解还存在一些gap），后续如果可以会把他们提出的问题一一列出来，供大家讨论。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-8cbbf8f12fcec98b44c577429d0708c1.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-d15877ec7c4ca74121af246ff99803f4.webp)

