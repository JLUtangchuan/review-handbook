---
title: "百面LLM-30"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/689974663
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-30

> @swtheking | https://zhuanlan.zhihu.com/p/689974663

---

提问：In Context Learning和SFT的关系是什么？

回答：ICL是一种特殊的SFT。在论文 EXPLORING THE RELATIONSHIP BETWEEN IN- CONTEXT LEARNING AND INSTRUCTION TUNING [1] 中，用很多实验证明了ICL和SFT在改变LLM内部embedding维度有诸多相似。

ICL和SFT（IT）在最终模型state上是相似的：其中用 
ℎ
𝑎
𝑛
𝑐
ℎ
𝑜
𝑟
 是普通输入一个query得到的最后一个词最后一层的表示，而 
ℎ
𝐼
𝐶
𝐿
 是ICL+一个query的最后一个词最后一层的表示，最后 
ℎ
𝐼
𝑇
 是SFT后的一个query预测阶段的query最后一个词最后一层的表示。

图a）中显示了ICL和SFT的最后表示相似度很高，但ICL和Anchor，以及SFT和Anchor的最后表示相似度很低。

[1] Duan H, Tang Y, Yang Y, et al. Exploring the relationship between in-context learning and instruction tuning[J]. arXiv preprint arXiv:2311.10367, 2023.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-f28f11dea02d773da1987c99bdb6b31e_1440w.jpg)

![图](https://pic4.zhimg.com/v2-103e13e34539e2d55a89e1c75b4587d9_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

