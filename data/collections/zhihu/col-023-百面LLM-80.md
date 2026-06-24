---
title: "百面LLM 80"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/6500940766
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM 80

> @swtheking | https://zhuanlan.zhihu.com/p/6500940766

---

提问：一个模型经过理想的RLHF以后达到的状态和下面哪个模型的状态比较接近会更好？（开放问题）

1. 同尺寸模型经过更久预训练以后，sft以后模型的状态。

2. 更大尺寸模型，预训练同样多的tokens，并经过SFT以后模型的状态。

3. 一个模型蒸馏了更强大模型的状态。蒸馏指的是退火阶段或者sft阶段加入大量的更强大模型的数据。

回答：

我个人更倾向于2或者3。因为如果RLHF不能达到一个更好的pre-train的状态，RLHF依然只会是pre-train model的补丁。

具体而言，RLHF的其中所有的泛化能力和上限全部依赖pre-train，当pre-train model确定以后，RLHF性能的上界很快的会被确定下来。那么RLHF仅仅是一个提升pre-train model上的一个工具，很难和pre-train的效果提升相当，作用也十分有限。

但如何能做到RLHF后能和 Scale Pre-train Model的效果相当，可能需要以下两个条件中的任意一个：

大量且准确的feedback。类似数学的verifier或者code的sandbox。那么有机会像o1一样得到泛化能力很强的RL model。
大量的带标准答案的数据，并能利用好标准答案数据的RLHF算法。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

