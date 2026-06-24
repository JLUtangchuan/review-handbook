---
title: "百面LLM-14"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/687067338
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-14

> @swtheking | https://zhuanlan.zhihu.com/p/687067338

---

提问：在什么情况下DPO exactly 数学上等同于 PPO。

回答：

𝑝
(
𝑦
>
𝑦
′
)
=
𝛿
(
𝑟
(
𝑦
)
−
𝑟
(
𝑦
′
)
)
 。
𝑦
′
 通过在ref policy（其实这个ref policy不是必须的，任何policy下的蒙特卡洛采样也可）下蒙特卡洛采样。
DPO loss需要改成IPO loss形式，也就是 
𝑚
𝑎
𝑥
𝜋
𝐸
𝑥
∼
𝜌
,
𝑦
∼
𝜋
(
.
|
𝑥
)
,
𝑦
′
∼
𝜇
(
.
|
𝑥
)
[
𝜙
(
𝑝
∗
(
𝑦
>
𝑦
′
|
𝑥
)
)
]
−
𝜏
𝐷
𝐾
𝐿
(
𝜋
|
|
𝜋
𝑟
𝑒
𝑓
)
 。
𝜙
(
𝑞
)
=
𝑞
1
−
𝑞
 。

附录：

为何这里相对于DPO原始的loss有个 
𝜙
(
𝑞
)
 函数：

因为之前的DPO假设BT model的优化最终的稳态是一个最大化reward函数的状态，也就是说对应的所有x生成的y都是最大r(x,y)的y。但是从数学角度来看，他们的最终得到的action的reward的分布其实是不一致的，因为有一个sigmoid函数，因此加上 
𝜙
(
𝑞
)
 后，最终的分布也会和以下loss目标一致

具体证明如下：

其中u是ref policy分布

参考论文IPO， A General Theoretical Paradigm to Understand Learning from Human Preferences ，细节证明可以看IPO。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-827b40906be9a1ecc5997fc37bf75368_1440w.jpg)

![图](https://pic4.zhimg.com/v2-0cfdfb1cb813e4f83cdc887022aab0e1_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

