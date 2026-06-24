---
title: "百面LLM-67"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/714279113
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-67

> @swtheking | https://zhuanlan.zhihu.com/p/714279113

---

提问：如何计算对 
（
）
𝜋
𝑟
𝑒
𝑓
（
𝑦
）
 进行reward model的Best of N （BoN）后 
𝑦
 的分布函数？

Hint：假设你知道 
）
𝑝
<
(
𝑦
)
=
𝑃
𝑦
′
∼
𝜋
𝑟
𝑒
𝑓
[
𝑟
(
𝑦
′
）
<
𝑟
(
𝑦
)
)
]
 ,也就是任意 
𝑦
′
 的reward值小于 
𝑦
 的概率，以及

）
𝑝
≤
(
𝑦
)
=
𝑃
𝑦
′
∼
𝜋
𝑟
𝑒
𝑓
[
𝑟
(
𝑦
′
）
≤
𝑟
(
𝑦
)
)
]
 ,也就是任意 
𝑦
′
 的reward值不大于 
𝑦
 的概率。

回答：这是一道条件概率题(个人比较喜欢的领域），来自论文BOND [1]

答案如下：

𝜋
𝐵
𝑜
𝑁
=
𝜋
𝑟
𝑒
𝑓
(
𝑦
)
×
𝑝
≤
(
𝑦
)
𝑁
−
1
×
∑
𝑖
−
1
𝑁
[
𝑝
<
(
𝑦
)
𝑝
≤
(
𝑦
)
]
𝑖
−
1

证明如下：

1） 在不失一般性下，对于某一次BoN采样后的y分布可以定义如下，对于第一个最大reward的y（在多个response同分的时候，取下标最小的）设置概率为1，其余设置为0。

2）那么对于任一response y，在第i个位置被采样到，且满足是第一个最大reward的条件，称为事件 
𝐴
𝑖
 。

3）对于response y，它在BoN采样下的概率为 
𝑃
(
∪
𝑖
𝐴
𝑖
)
∗
1.0
+
(
1
−
𝑃
(
∪
𝑖
𝐴
𝑖
)
)
∗
0.0
=
𝑃
(
∪
𝑖
𝐴
𝑖
)
 。

4）计算 
𝑃
(
∪
𝑖
𝐴
𝑖
)
=
∑
𝑖
𝑁
𝑃
(
𝐴
𝑖
)
 。

5) 
𝑃
(
𝐴
𝑖
)
 的计算要符合两个条件，

1. 前i-1个的reward都小于y的reward，

2.后N-i个的reward都小于等于y的reward。

因此： 
𝑃
(
𝐴
𝑖
)
=
𝑃
<
(
𝑦
)
𝑖
−
1
∗
𝜋
𝑟
𝑒
𝑓
(
𝑦
)
∗
(
𝑃
≤
(
𝑦
)
𝑁
−
𝑖
)
=
𝑃
≤
(
𝑦
)
𝑁
−
1
∗
𝜋
𝑟
𝑒
𝑓
(
𝑦
)
∗
𝑃
<
(
𝑦
)
𝑖
−
1
𝑃
≤
(
𝑦
)
𝑖
−
1
.

6)最后，计算并集，就可得到正确答案。

[1] Sessa P G, Dadashi R, Hussenot L, et al. BOND: Aligning LLMs with Best-of-N Distillation[J]. arXiv preprint arXiv:2407.14622, 2024.

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

