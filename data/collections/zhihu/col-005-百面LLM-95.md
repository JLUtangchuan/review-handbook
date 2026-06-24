---
title: "百面LLM-95"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1940383353778996413
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-95

> @swtheking | https://zhuanlan.zhihu.com/p/1940383353778996413

---

提问：在PPO公式中

PPO-Clip 目标函数 ： 
𝐿
𝐶
𝐿
𝐼
𝑃
(
𝜃
)
=
𝐸
^
𝑡
[
min
(
𝑟
𝑡
(
𝜃
)
𝐴
^
𝑡
,
clip
(
𝑟
𝑡
(
𝜃
)
,
1
−
𝜖
,
1
+
𝜖
)
𝐴
^
𝑡
)
]

其中概率比率 
𝑟
𝑡
(
𝜃
)
=
𝜋
𝜃
(
𝑎
𝑡
|
𝑠
𝑡
)
𝜋
𝜃
𝑜
𝑙
𝑑
(
𝑎
𝑡
|
𝑠
𝑡
)

那么在LLM中，这个 
𝜋
𝑜
𝑙
𝑑
 是一条样本采样的概率分布（对应的vllm的输出的prob），还应该是这个old policy生成这条样本的概率分布（ref model输出的prob）？

回答：

在PPO中，由于是采样概率分布等于old policy分布，所以不存在这个问题，但在LLM里确实存在这个问题（VLLM采样和recompute probability生成的概率不一致）。

那我们就要细细分析这个概率比率的作用：

Importance Sampling
为了给clip服务，来判断何时应该clip。

这里John Schulman的论文里分析的非常透彻：

Our key insight is that the “old” policy in these methods serves two independent purposes. The first purpose is for off-policy corrections, via importance sampling, for which the old policy must be the behavior policy. The second purpose is to control the size of policy updates, for which the old policy can be any recent policy, which we call the proximal policy.

这里拆解开来和之前解释一致：

计算Importance Sampling Ratio。
为了clip服务，控制政策更新的幅度，也就是不允许模型过度的优化，从而overfit现在的状态，导致state distribution shift问题。

因此这里的 
𝜋
𝑜
𝑙
𝑑
 既是对应的vllm的输出的prob，也是old policy生成这条样本的概率分布（recompute log prob分布），前者为了Importance Sampling，后者为了解决clip。那么如果想彻底解决这个问题，可以参考John Schulman的论文“batch size invariance for policy optimization”里decouple 
𝜋
𝑜
𝑙
𝑑
 解决。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-9bbcdacf73ea70d3afa12f6443964b63.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-926d61270d8bffd4f42f25d1a517425e.webp)

