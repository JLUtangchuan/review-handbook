---
title: "百面LLM - 99"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/8752529866
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM - 99

> @swtheking | https://zhuanlan.zhihu.com/p/8752529866

---

提问：在RLHF领域可以通过对多个RL过程中训练的 model和SFT model做merge的方式来缓解reward hacking。其中一类的merge方式叫做EMA（Exponentially Weighted Moving Average，指数加权移动平均），公式如下：
𝜃
𝑚
=
𝜃
𝑡
+
𝛽
𝜃
𝑡
−
1
+
𝛽
2
𝜃
𝑡
−
2
+
.
.
.
+
𝜃
0
1
+
𝛽
+
𝛽
2
+
.
.
.
+
𝛽
𝑡
.

那么在真实的场景下，我们可以边迭代，边做model merge。请问我们的公式该如何更新？

回答：

假设从 
𝜃
0
 开始更新, 
𝐸
𝑖
 是每步merge的参数，其中， 
𝐸
0
=
𝜃
0
 ，那么，

𝐸
1
=
𝛽
𝜃
0
+
𝜃
1
𝛽
+
1
 , 
𝐸
2
=
𝛽
2
𝜃
0
+
𝛽
𝜃
1
+
𝜃
2
𝛽
2
+
𝛽
+
1
=
𝛽
(
𝛽
𝜃
0
+
𝜃
1
)
+
𝜃
2
𝛽
2
+
𝛽
+
1
=
𝛽
(
𝛽
+
1
)
𝐸
1
+
𝜃
2
𝛽
2
+
𝛽
+
1

我们假设 
𝑊
0
=
1
,
𝑊
1
=
1
+
𝛽
=
𝑊
0
∗
𝛽
+
1
,
.
.
.
,
𝑊
𝑡
=
𝛽
𝑊
𝑡
−
1
+
1
.

那么， 
𝐸
2
=
(
𝛽
𝑊
1
)
𝐸
1
+
𝜃
2
𝑊
2
 .

那么最终我们的更新公式可以为以下：

𝑊
0
=
1
 , 
𝐸
0
=
𝜃
0
, 
𝑊
𝑡
=
𝛽
𝑊
𝑡
−
1
+
1
, 
𝐸
𝑡
=
𝛽
𝑊
𝑡
−
1
𝐸
𝑡
−
1
+
𝜃
𝑡
𝑊
𝑡
.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-7bc86f7deead0f43667029ccd3be54d0_bh.webp?source=d6434cab)

![图](https://pica.zhimg.com/v2-e7769e27743e7b0bce6c1d6ffd256277_xl.webp?source=d6434cab)

