---
title: "百面LLM-27"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/689508595
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-27

> @swtheking | https://zhuanlan.zhihu.com/p/689508595

---

提问：什么样的数据格式在SFT或者ICL阶段可以提升模型的reasoning的能力？

回答：

数学reasoning上是有三种形式可以显著提高效果模型的reasoning的能力 [1]

Reverse ： 128 + 367 = 495 -> 128 + 367 = ^594, 因为人就是反着计算的，从个位数到百位数。
COT or POT (Simplified Scratchpad): 把这个计算过程列举下来，用自然语言，符号或者代码形式呈现。
Detailed Scratchpad：把整个思考过程详细地用自然语言和符号表达出来。

整体上Detailed Scratchpad需要的总条数最少就能达到100%在加法上的效果，但是其实总token数和plain需要差不多数量达到最好的效果。

[1] Lee N, Sreenivasan K, Lee J D, et al. Teaching arithmetic to small transformers[J]. arXiv preprint arXiv:2307.03381, 2023.

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic2.zhimg.com/v2-6142d053cde90342c01315e9fc668ccb_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

