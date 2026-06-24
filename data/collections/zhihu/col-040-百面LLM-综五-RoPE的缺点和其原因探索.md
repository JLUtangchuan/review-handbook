---
title: "百面LLM，综五，RoPE的缺点和其原因探索"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/717174366
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综五，RoPE的缺点和其原因探索

> @swtheking | https://zhuanlan.zhihu.com/p/717174366

---

首先在这里先介绍一下simple long context小分队：

大家好，我们是simple long context
一个专注long context的小团队
我们近期准备放出来三份工作
1 探究影响基于rope编码的大模型外推的原因是什么？

2 低成本long context continue pretrain

3 按照工业流程构建的long context open ended sft数据集（规则迭代和标注迭代流程都会开放出来

第一份工作以blog的方式放出来
https://difficult-link-dd7.notion.site/a40396b3205849fe84f9810c8a175856?v=f4e0c4586d3247ed8bea3dd00f044bad
这份工作还欠缺更详细的实验，例如在不同的模型的实验，更多的数据。
并且我们觉得在虚数平面夹角的规范化也有一定的探索空间。
但我们近期团队忙着一个更大的目标，有兴趣的同学和朋友可以继续自行探索哈，有什么疑惑的，也欢迎随时联系我们

其次，感谢 @苏剑林 苏神和我们团队的讨论，我们把所有的讨论都列在了讨论的章节里，算是全视角观察了RoPE。

最后介绍一下这个blog：

TL;DR: In this blog, we investigate the potential underlying reason of a limitation in RoPE: its difficulty in maintaining long-term decay in sequences that extend far beyond its trained length.This issue may arise from a highProportion ofObtuse angles on theComplexPlane (POCP) between W_Qx and W_Ky.To validate this hypothesis, we conduct experiments using both randomly initialized W_Qx and W_Ky, as well as randomly selected W_Qx and W_Ky from different models.The experimental results shows that POCP significantly influences the model's ability to maintain long-term decay over long contexts. Additionally, post-training on long contexts primarily decreases the model's POCP. Furthermore, we discuss how the model's high POCP contributes to RoPE's inability to maintain long-term decay and its impact on RoPE's difficulty in generalizing beyond the context window observed during training.

简述：在本文中，我们探讨了RoPE的一个局限性背后的潜在原因：其在处理远超训练长度的序列时难以保持长期衰减的能力。这个问题可能源于在复平面上W_Qx和W_Ky之间的钝角比例（POCP）较高。为了验证这一假设，我们进行了实验，使用了随机初始化的W_Qx和W_Ky，以及从不同模型中随机选择的W_Qx和W_Ky。实验结果表明，POCP显著影响了模型在长上下文中保持长期衰减的能力。此外，在长上下文上进行的后训练主要减少了模型的POCP。我们还讨论了模型的高POCP如何导致RoPE难以保持长期衰减，以及它对RoPE在超出训练时观察到的上下文窗口时难以泛化的影响。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-6c59a08d31e47b0a01761e53ffa71031_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-4ef127f357cf0101ae8b85c5e5d6b72b.webp)

