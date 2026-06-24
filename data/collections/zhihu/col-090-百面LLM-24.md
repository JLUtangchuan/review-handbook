---
title: "百面LLM-24"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/688806462
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-24

> @swtheking | https://zhuanlan.zhihu.com/p/688806462

---

提问：BT model （DPO，RM的训练形式）的问题在哪？

回答：

BT model loss形式如下：

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
𝑝
𝑜
𝑠
−
𝑛
𝑒
𝑔
)

最大化正负例子的差距得到的模型会塌缩成只有正例子的空间，失去所有负例子的概率。在DPO中就是只会生成正例，负例子输出概率为0。在RM中正例子会无限接近于1，负例子会无限接近于0。那么这样的模型是没有entropy的，抗噪声能力会减弱。如果正负pair标错了，会导致严重后果。
忽略语意或字面上差别较小的pos sample和neg sample，过度关注语意或字面上差别较大的pos sample和neg sample，也就是比较容易学的case，并overfit。这是logsigmoid函数的问题，用hinge loss这类loss可以缓解这一问题。
不能找出全序关系，如果数据集里有A > B, B > C, C > A这种偏序关系，并不能找到它的nash equivalence的点，只会学乱。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

