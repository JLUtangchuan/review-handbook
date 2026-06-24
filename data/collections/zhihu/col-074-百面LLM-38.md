---
title: "百面LLM-38"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/694960319
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-38

> @swtheking | https://zhuanlan.zhihu.com/p/694960319

---

提问：DPOP，也就是Smaug: Fixing Failure Modes of Preference Optimization with DPO-Positive论文中发现了DPO一个缺点，也就是positive和negative的probability同时下降，这里他给的数学证明是对的嘛？如果是错的，请指出错误？（这里可以先看论文的数学证明）

回答：它的推导应该是有谬误的～（B.1章对DPO的gradient推导），直觉就是有问题的，因为BT就是最大化Good response的概率和最小化Bad response的概率。但却推倒出反方向的Gradient。下面给出严格的解释和指出错误在哪：

首先论文做了一个极端的假设：Good response和Bad response只差一个字符且长度相等（这个假设也是可能存在的，因为数学问题中1个字符就能有对有错）。

假设这个token在第m步，因此 
（
）
𝑦
𝑤
=
（
𝑡
1
,
𝑡
2
,
.
.
.
,
𝑡
𝐾
）
 而 
𝑦
𝑙
=
(
𝑡
1
,
𝑡
2
,
.
.
.
,
𝑡
𝑚
−
1
,
𝑡
𝑚
,
𝑡
𝑚
+
1
,
.
.
.
,
𝑡
𝐾
)
 .然后定义 
𝑦
<
𝑟
=
(
𝑡
1
,
𝑡
2
,
.
.
.
,
𝑡
𝑟
)
 , 
𝑦
>=
𝑟
=
(
𝑦
𝑟
,
𝑦
𝑟
+
1
,
.
.
.
,
𝑦
𝐾
)
 。

对于DPO公式来说，我们进行求导得出：

公式1

这个公式的意思是，其实DPO的gradient就是最大化正例的概率，和最小化负例的概率：

根据chain rule，我们有：

公式2

这个是语言模型的乘法法则，然后加了个log，所以结合上面两个公式可以推导出：

公式3

这里我们把不一样的token m从原公式中拉出来，得到这个公式。

然后我们定义了 
𝑠
𝑖
𝑥
 代表了给予context x，下个token是词表的第i个token的概率，因此我们有：

公式4

这个公式就是说在BP过程中，加强那个Cross Entropy选中的第i个token的概率，降低未选中的token的概率，（1是indicator函数，i=j为1，其余为0）。不失一般性，我们假设正确的词都在此表的第一个，因此 
𝑖
==
1
 ：

那么之前的公式3的第一部分就可以链式推导为：

公式5

这里DPOP做了一个假设，在实际过程中，我们的positive的概率一开始在sft模型中是比negative概率大的（这个假设也没啥问题）：

因此： s^{y^{<k}_w,x}_j \leq s^{y^{<k}_l,x}_j, j \neq 1, s^{y^{<k}_w,x}_1 \geq s^{y^{<k}_l,x}_1 ，这里论文中说： we see that the gradient vector is decreasing in the correct logit dimension and increasing in the wrong logit dimensions. 因该是在公式5中， j == 1 时候公式5为负的，反之，公式5为正的。但事实是公式5是从公式3继承下来的，公式3其实前面有个负号的，我不知道是不是因为这个遗漏会得出BT model会做出减少positive的概率，增加negative概率的结论。








## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-90c3a5bd4d8aa45193791cb7f50ead97_1440w.jpg)

![图](https://pic2.zhimg.com/v2-f6080560a98dca6964ba299a2a9dcfa5_1440w.jpg)

![图](https://pic4.zhimg.com/v2-bfc8e6258be907a95cfda1ae6452ee03_1440w.jpg)

![图](https://pic2.zhimg.com/v2-70ade9b9073d880f58ec5d2c4dcb39e3_1440w.jpg)

![图](https://pic2.zhimg.com/v2-22a66328f67a9f18e01bed1c77c6d72f_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

