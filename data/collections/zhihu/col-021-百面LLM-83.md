---
title: "百面LLM-83"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/10107491480
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-83

> @swtheking | https://zhuanlan.zhihu.com/p/10107491480

---

提问：LLM中数学上majority voting 为何有效。

回答：

这个就是个简单model ensemble的做法：

假设大模型可以对一个题，做对的答案是x，概率是p，（因为是数学题，那么对的答案应该是一致的），那么做不对的答案是y，概率是（1-p）。如果只sample一次，那么这个做对概率就是p。

但当sample n次，那么成功的概率是，sample n次中出x的次数大于出现y的次数。

那么这个就是一个服从二项分布的计算方法，那么整体计算如下：

假设事件E是sample出x的次数大于 n/2：

𝑃
(
𝐸
)
=
∑
𝑖
=
0
⌊
𝑛
−
1
2
⌋
(
1
−
𝑝
)
𝑖
𝑝
𝑛
−
𝑖
 .

当 
𝑝
>
0.5
 的时候， 
𝑃
(
𝐸
)
 都严格大于 
𝑝
 。

最后我们给个 
𝑝
=
0.7
,
𝑛
=
10
 概率为：0.849，显著高于原来的概率。

当然如果错误的答案不止一个，我们后续可以用组合数学的generation function计算概率，也不太难。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-8c4740a83e1593bd6355cf6041eb98da.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-e17602e8876453915c8b5905aa0340b2.webp)

