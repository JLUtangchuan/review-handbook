---
title: "百面LLM-66"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/713621238
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-66

> @swtheking | https://zhuanlan.zhihu.com/p/713621238

---

提问：Llama2模型现在position embedding的位置在哪？是否可以换位置？

回答：现在Llama2的position embedding位置是存在于各个层的MHA（or GQA）之后，计算Attention之前：

那么这个位置如果换到类似MHA之前是不可以的，因为它无法保证相对不变性，也就是当token x,y在(i, j)位置的attention score和在(i+m, j+m)位置的attention score应该是一致的：

现在的Rope下的x，y attention score计算如下：

(
𝑅
(
𝜃
𝑖
)
𝑊
𝐾
𝑥
)
𝑇
(
𝑅
(
𝜃
𝑗
)
𝑊
𝑄
𝑦
)
=
(
𝑊
𝐾
𝑥
)
𝑇
𝑅
(
𝜃
𝑖
)
𝑇
𝑅
(
𝜃
𝑗
)
(
𝑊
𝑄
𝑦
)
=
(
𝑊
𝐾
𝑥
)
𝑇
𝑅
(
𝜃
𝑗
−
𝜃
𝑖
)
(
𝑊
𝑄
𝑦
)
.

其中

𝑅
(
𝜃
𝑖
)
𝑇
𝑅
(
𝜃
𝑗
)
=
𝑅
(
𝜃
𝑗
−
𝜃
𝑖
)
 是由于RoPE的旋转不变性（极坐标）。

但如果把Rope放在MHA 之前，会变成：

(
𝑊
𝐾
𝑅
(
𝜃
𝑖
)
𝑥
)
𝑇
(
𝑊
𝑄
𝑅
(
𝜃
𝑗
)
𝑦
)
=
𝑥
𝑇
𝑅
(
𝜃
𝑖
)
𝑇
𝑊
𝐾
𝑇
𝑊
𝑄
𝑅
(
𝜃
𝑗
)
𝑦

这个公式后续就不能利用RoPE的旋转不变性（极坐标）。

[1] Llama模型结构解析（源码阅读）-CSDN博客

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-1c20424349bde4c747409d228a2cccc0_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

