---
title: "百面LLM-90"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/25751312482
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-90

> @swtheking | https://zhuanlan.zhihu.com/p/25751312482

---

提问：PPO中为什么要做clip ratio，主要考虑了哪些因素？

回答：

这个分析我非常推崇John Schulman的一段分析：

Our key insight is that the “old” policy in these methods serves two independent purposes. The first purpose is for off-policy corrections, via importance sampling, for which the old policy must be the behavior policy. The second purpose is to control the size of policy updates, for which the old policy can be any recent policy, which we call the proximal policy.

在这些方法中，"旧"政策具有两个独立的目的，这是我们的关键见解。第一个目的是通过重要性采样来进行离策略（off-policy）修正，对此旧政策必须是行为策略（behavior policy）。第二个目的是控制政策更新的幅度，对此旧政策可以是任何最近的政策，我们称之为近端政策（proximal policy）。

总结而言：

对Importance Sampling Ratio进行修正，把off-policy转变成on-policy。
控制政策更新的幅度，也就是不允许模型过度的优化，从而overfit现在的状态，导致state distribution shift问题。

进一步讲，其实1是不需要进行clip的，也就是off-policy不是ppo clip的因素，我们完全可以通过Importance Sampling规避off-policy的问题。但第二个问题是主要要控制的，也就是避免state distribution shift的问题。








## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-471c53ec1fb6db37bc89f1107033eff7.webp)

