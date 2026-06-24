---
title: "百面LLM-32"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/690724347
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-32

> @swtheking | https://zhuanlan.zhihu.com/p/690724347

---

提问：如何看待各种ppo rlhf的平替算法dpo/kto/rrhf/slic/orpo/samug/remax等算法号称性能等能超过ppo？(由 @none 提供问题)

回答：

这是一个非常好的的问题，这个问题其实触及到RL + LLM很多根本的问题，我和很多RL届的senior researcher @张海抱 @Wei Xiong @陈雄辉 都曾经讨论过。2023年，我们很多人觉得很难理解为什么需要使用preference data训练LLM成为RM，再训RLHF，整个过程没有信息增益，徒增effort，一度认为是OpenAI炫技的表现。事实证明到了此时此刻，PPO依然是最solid，最有效，最好的算法。无任何offline，online的RL算法可以匹敌。

那么我把PPO算法的优点列为以下几点，如果后续有算法可以做到，maybe可以平替：

On policy采样：on policy采样目前看来是最高效的拟合蒙特卡洛采样方式。举个例子，如果不使用on policy采样，你随机采样到一个模型generate概率差值很大的两个response，如果符合人类preference，那么本身就不需要排序，如果不符合，你也很难通过RLHF纠正它。如果强行纠正，会破坏模型本来的平衡。
Credit Assign: 由于value model的存在，其实PPO会很好的把reward分配给不同的token，那么一些关键的token会合理地分配一个高reward，一些不关键的token会分配一个低reward。
Rank Model：PPO内部其实是一种内置的rank model，比较的是高reward和低reward的response，只是高和低一直是动态的变化的。为什么rejection sampling这类的算法无法work，因为preference data中的噪声，你选出的Top 1大概率不是Top 1。

那么如果让我设计一种可能替代PPO的算法也许是：

带credit assign的iterative的weight-token dpo算法

weight-token dpo算法：

𝑙
𝑜
𝑠
𝑠
=
−
𝑙
𝑜
𝑔
𝑠
𝑖
𝑔
𝑚
𝑜
𝑖
𝑑
(
𝛽
∏
𝑖
𝑛
𝑤
𝑖
⋅
𝑝
𝜃
(
𝑦
𝑤
𝑖
|
𝑦
𝑤
𝑖
−
1
,
.
.
.
,
𝑦
𝑤
0
,
𝑥
)
∏
𝑖
𝑛
𝑤
𝑖
⋅
𝑝
𝑟
𝑒
𝑓
(
𝑦
𝑤
𝑖
|
𝑦
𝑤
𝑖
−
1
,
.
.
.
,
𝑦
𝑤
0
,
𝑥
)
−
𝛽
∏
𝑖
𝑛
𝑤
𝑖
⋅
𝑝
𝜃
(
𝑦
𝑙
𝑖
|
𝑦
𝑙
𝑖
−
1
,
.
.
.
,
𝑦
𝑙
0
,
𝑥
)
∏
𝑖
𝑛
𝑤
𝑖
⋅
𝑝
𝑟
𝑒
𝑓
(
𝑦
𝑙
𝑖
|
𝑦
𝑙
𝑖
−
1
.
.
.
,
𝑦
𝑙
0
,
𝑥
)
)

那么我还需要一个模型来assign token weight，这个我也看到类似的paper，是用rm的attention weight来产生完成credit assign [1]

[1]Chan A J, Sun H, Holt S, et al. Dense Reward for Free in Reinforcement Learning from Human Feedback[J]. arXiv preprint arXiv:2402.00782, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

