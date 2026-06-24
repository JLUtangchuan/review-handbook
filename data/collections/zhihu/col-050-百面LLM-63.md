---
title: "百面LLM-63"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/712562934
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-63

> @swtheking | https://zhuanlan.zhihu.com/p/712562934

---

提问：NTK原始方法，也就是直接拉大rope_base的方法为什么可以提升模型外推能力？

回答：提高base以后可以将远程不衰减的部分，变回衰减。

比如在llama-3.1-8k rope_base = 500000 的第一层下随机抽取两个token的Q，K。我们观察 attention score 和 positional distance的变化曲线：

可以发现在8k前attention score 虽然不难保证严格一致下降，但依然可以保持在远端为0附近。但是出了8k以后，就开始远程上升了。当我们试着用llama-3.1-64k rope_base = 8000000, 在不训的情况下，整体曲线变成：

那么明显16k以内可以保证远程衰减了～。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-bfe0b1b2d2c4214d3c5135287f94a631_1440w.jpg)

![图](https://pic3.zhimg.com/v2-5e91b9e416c7a0ab8be38438dd23d2a4_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

