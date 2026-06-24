---
title: "百面LLM-58"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/709101537
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-58

> @swtheking | https://zhuanlan.zhihu.com/p/709101537

---

提问：怎么解决MOE模型中的expert塌缩的问题？或者expert不均衡问题？

回答：在deepseek-v2中通过一个新增的loss来完成：

其中 
𝑓
𝑖
 指的是第i个expert被激活的token数的加权平均。 
𝑃
𝑖
 指的是第i个expert的token粒度的被激活权重平均。因此 
𝑓
𝑖
𝑃
𝑖
 就是这个expert被激活的“概率”。

因为

1) 
∑
𝑖
𝑓
𝑖
<=
𝑚

2) 
∑
𝑖
𝑃
𝑖
<=
𝑛

3) 
𝑓
𝑖
=
𝐹
(
𝑃
𝑖
)
 , 且F是个单调递增函数且是凸函数。

因此，minimize 
𝐿
𝐸
𝑥
𝑝
𝐵
𝑎
𝑙
 就等价于均衡各个expert的激活概率。

证明如下：

通过 Jensen's Inequality 可以看出，如果 F 是一个凸函数，均匀分布可以最大化总和。
Chat GPT作答
特别地，如果 F 是一个线性函数，均匀分布将显著降低总和。

[1] Dai D, Deng C, Zhao C, et al. Deepseekmoe: Towards ultimate expert specialization in mixture-of-experts language models[J]. arXiv preprint arXiv:2401.06066, 2024.

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-5c53de2fa3eddc8ad7204ef36951a074_1440w.jpg)

![图](https://pica.zhimg.com/v2-dc0e19f19e3558d9643e5e7c0821090c_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

