---
title: "百面LLM，综四，RoPE的介绍"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/714142522
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综四，RoPE的介绍

> @swtheking | https://zhuanlan.zhihu.com/p/714142522

---

在长文本领域研究的同学，都会先面临学RoPE的挑战，我也是在看了很多篇知乎的介绍和自己的理解以后，写下了这篇RoPE的介绍，感谢很多同学在此之中的帮助和指正。在这篇介绍中，我们抛弃了所有关于复数有关公式，只通过极坐标旋转这一角度来介绍RoPE，试图帮助大家建立RoPE和原始transformer中PE的关系：

TLDR: In this blog, we introduce absolute position encoding in the original Transformer architecture and its primary weakness: translation variance. We then explain how RoPE addresses this issue in Llama2's architecture. Furthermore, we highlight a limitation of RoPE: without post-training on long contexts, it cannot maintain far-field attenuation for these extended texts.

在本篇博客中，我们介绍了原始Transformer架构中的绝对位置编码及其主要缺陷：平移不变性问题。接着，我们解释了RoPE如何在Llama2架构中解决这一问题。此外，我们还强调了RoPE的一个局限性：如果不对长文本进行后期训练，它无法在这些扩展文本中保持远距离衰减。

更新博客：

https://difficult-link-dd7.notion.site/a08016ff028f44f7ab7e366ed682efa0?v=b5a87525670a4e7a95a0d2671d81e5e6&pvs=74
difficult-link-dd7.notion.site/a08016ff028f44f7ab7e366ed682efa0?v=b5a87525670a4e7a95a0d2671d81e5e6&pvs=74

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

