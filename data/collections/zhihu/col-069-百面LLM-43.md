---
title: "百面LLM-43"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/698397614
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-43

> @swtheking | https://zhuanlan.zhihu.com/p/698397614

---

提问：ROPE公式中的base是越大越能适应长文本还是越小越能适应长文本？

回答：ROPE公式中，旋转向量的分量 
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
,
𝑖
:
𝑖
+
1
)
 如下：

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

其中p是token position，d是embedding的维度。

相对距离为T的两个position的矩阵相乘的分量:

𝑅
𝑠
𝑅
𝑠
+
𝑇
𝑇
(
𝜃
𝑖
,
𝑖
:
𝑖
+
1
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
𝑇
)
	
−
sin
⁡
(
𝜃
𝑖
∗
𝑇
)


sin
⁡
(
𝜃
𝑖
∗
𝑇
)
	
cos
⁡
(
𝜃
𝑖
∗
𝑇
)
)

当base变大的时候, 
𝜃
𝑖
 会变小，因此 
𝑅
𝑠
𝑅
𝑠
+
𝑇
𝑇
 会对矩阵旋转的角度越小。T越大的时候，所有d维度同时都转了360度的整数倍的概率越低（当所有维度都是360度整数倍的时候，无衰减），其余都是随着T变大衰减变大。如下图：

当然base大也有base大的问题，也就是相邻的postion的衰减变弱了。

[1] Su J, Ahmed M, Lu Y, et al. Roformer: Enhanced transformer with rotary position embedding[J]. Neurocomputing, 2024, 568: 127063.

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-a20188f4b9c95447968be68d280128d8_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

