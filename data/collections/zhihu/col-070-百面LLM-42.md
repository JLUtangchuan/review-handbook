---
title: "百面LLM-42"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/697546619
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-42

> @swtheking | https://zhuanlan.zhihu.com/p/697546619

---

提问：在大模型中什么是KV cache？

回答：LLM模型预测的时候使用的是KV cache的技术，也就是缓存已经推理出的前t-1个token的KV matrix，那么在第t个token开始就无需再计算这部分KV，直接调用缓存的KV就可以。具体而言，整个MHA在casual mask下，可以表示为： 
𝐿
𝑜
𝑔
𝑖
𝑡
𝑡
ℎ
=
∑
𝑖
≤
𝑡
𝑠
𝑜
𝑓
𝑡
𝑚
𝑎
𝑥
(
𝑄
𝑡
ℎ
𝐾
𝑖
ℎ
𝑇
𝑑
)
𝑉
𝑖
ℎ
 ,因此预测第t个token的时候，query的multi head（h表示）需要重新计算，以及第t个key和query的multi head（h表示）表示需要重新计算，其余的就可以直接用预测t-1个token缓存的KV进行计算。整体上会大大节省预测时间。附：但是这部分的KV需要占用GPU缓存，而大模型中缓存占用过多，会导致预测的时候Batch size过小，那么整体的预测吞吐率会降低，所以后续很多工作都在对于KV cache做优化。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

