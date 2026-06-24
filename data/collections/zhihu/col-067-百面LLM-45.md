---
title: "百面LLM-45"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/699926500
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-45

> @swtheking | https://zhuanlan.zhihu.com/p/699926500

---

提问：为什么Position Embedding和ROPE中不同维度需要设置不同的三角函数？

回答：

1）position embedding或ROPE中奇偶三角函数共享一个夹角 
𝜃
 ,但是分别为sin和cos函数，这个是为了旋转矩阵而设置（参考复数坐标系或者极坐标系），旋转矩阵本身是为了保证相对距离attention变化（衰减）一致性。当然这个点原始的position embedding失败了，但ROPE成功了（这背后原因，后面可以细说）。

2）在分完奇偶以后，不同的两维向量的三角函数也不一样，主要是换了夹角 
𝜃
 , 对于第i和i+1维度，它们的三角函数是：

𝑅
(
𝜃
𝑖
∗
𝑝
,
𝑖
:
𝑖
+
1
)
=
(
cos
⁡
(
𝜃
𝑖
∗
𝑝
)
	
−
sin
⁡
(
𝜃
𝑖
∗
𝑝
)


sin
⁡
(
𝜃
𝑖
∗
𝑝
)
	
cos
⁡
(
𝜃
𝑖
∗
𝑝
)
)

𝜃
𝑖
=
1
𝑏
𝑎
𝑠
𝑒
2
∗
⌊
(
𝑖
+
1
)
/
2
⌋
/
𝑑

那为什么他们也要使用不同的夹角呢？原因大体如下：如果使用同样夹角，那么会增大碰撞概率，使得相对距离attention变化（衰减）波动较大。举个例子，如果夹角不变，且为60度。当对第0个词我进行attention的时候，同样是苹果这个词在第3个position位置出现，和第 3 + （360 / 60）* n 个位置出现的加上了position embedding 或者rope后的embedding表示将会一致。那么并不能表示真正的远程衰减。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-6b7f28b7a60dc5f10930d91bf3479cad.webp)

