---
title: "百面LLM-61"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/710747093
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-61

> @swtheking | https://zhuanlan.zhihu.com/p/710747093

---

提问：在reasoning task上，Off-policy Policy Gradient方法（如下图）和DPO算法比，哪个效果好？由OpenRLHF作者 @跪按123334 提供

回答：在reasoning task上，DPO算法还是要比off-policy的PG好的。原因如下，DPO算法中preference dataset的构建可以保证正例子是正确的。因此maximize 正例基本能保证正确的gradient。但off-policy的PG是无法保证被增强的都是正例子的，因为即使是按query进行normalize reward，很多query的负例子（不正确的response）依旧会有一定概率被增强。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-63b98affc84b782eca1f3aaa2d0bd8aa_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic4.zhimg.com/v2-10378e80e0d8964bf558a47b9495bd24.webp)

