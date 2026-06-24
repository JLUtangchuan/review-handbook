---
title: "百面LLM-88"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/19328285131
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-88

> @swtheking | https://zhuanlan.zhihu.com/p/19328285131

---

提问：Temporal Difference算法为什么是渐进无偏的（有偏，但大量sample以后的和真实值误差很小）？

回答：

时序差分方法（Temporal Difference, TD）是一种常用的强化学习算法，尤其是在训练马尔可夫决策过程（MDP）的价值函数时。TD方法解决了一个关键问题：如何在没有完整模型的情况下估计一个策略的价值函数。

为了理解为什么TD算法是渐进无偏的，我们需要先了解一些背景知识和核心概念：

1. 价值函数的定义

在MDP中，价值函数 V(s) 表示从状态 s 开始，按照某一策略 
𝜋
 进行决策所期望的累积回报。

2. 贝尔曼方程

贝尔曼方程为价值函数提供了一个递归定义：

𝑉
(
𝑠
)
=
𝐸
[
𝑅
𝑡
+
1
+
𝛾
𝑉
(
𝑆
𝑡
+
1
)
]

其中， 
𝑅
𝑡
+
1
 表示在时间 t+1 时获得的即时奖励， 
𝛾
 是折扣因子。

3. TD更新规则

TD方法使用下面的更新规则来迭代逼近价值函数：

𝑉
(
𝑆
𝑡
)
←
𝑉
(
𝑆
𝑡
)
+
𝛼
(
𝑅
𝑡
+
1
+
𝛾
𝑉
(
𝑆
𝑡
+
1
)
−
𝑉
(
𝑆
𝑡
)
)

其中：

𝛼
 是学习率， 
𝑅
𝑡
+
1
+
𝛾
𝑉
(
𝑆
𝑡
+
1
)
−
𝑉
(
𝑆
𝑡
)
 是TD误差。




渐进无偏性说明

渐进无偏性表示在时间趋向无穷时（即经历大量的状态转换和TD更新之后），所得到的价值函数估计 
𝑉
^
(
𝑠
)
 会收敛到真实的价值函数 
𝑉
(
𝑠
)
 。但由于前期 
𝑉
^
(
𝑠
)
 引入了大量的不准的噪声 
𝜖
 ，所以总是有偏的。




证明TD算法渐进无偏性的一些关键点包括：




1. 期望一致性：

TD算法的更新规则确保了在每一步更新中，预期的更新方向是正确的，即：

\mathbb{E}[V(S_t) + \alpha (R_{t+1} + \gamma V(S_{t+1}) - V(S_t))] = V(S_t)

这表明在期望意义下，更新是对的。

2. 马尔可夫性：

MDP的状态序列具有马尔可夫性，即给定当前状态和动作，未来状态和奖励的分布只依赖于当前状态和动作，而与过去的状态无关。

3. 学习率的衰减：

学习率 \alpha_t 通常满足某些条件，如

\sum_{t=1}^{\infty} \alpha_t = \infty, \quad \sum_{t=1}^{\infty} \alpha_t^2 < \infty

这些条件确保学习率随着时间的推移逐渐减小，但总量足够大，以覆盖所有状态。

综上，在满足这些假设和条件的情况下，TD算法使得价值函数估计在大多数情况下都会收敛于真实值。这种收敛性和无偏性结合使得TD算法在长期运行中，为所有状态提供渐近无偏的价值函数估计。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-1568482f9ce34f5670822414318a8bc1.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-07158f673115ebc9806a2b9a8a1405f2.webp)

