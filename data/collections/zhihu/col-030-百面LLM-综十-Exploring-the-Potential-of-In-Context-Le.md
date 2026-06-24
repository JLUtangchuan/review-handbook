---
title: "百面LLM，综十， Exploring the Potential of In-Context Learning: New Pathways for Enhancing LLM Performance"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/984779552
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综十， Exploring the Potential of In-Context Learning: New Pathways for Enhancing LLM Performance

> @swtheking | https://zhuanlan.zhihu.com/p/984779552

---

这篇blog是大概写了一年，反复修改的blog，主要总结了一年以来做CPT，SFT和合成数据生成看过的论文和自己实践得出来的insight。这里感谢很多大佬在其中尖锐的意见，也是我反反复复修改这个blog的动力。其中最感谢 @张海抱 和我高强度修改的3个月，以及有几个LLM博士同学很细节评论。不得不说的一件小事，是这个改了7个月的时候，给欧美大佬看的时候负反馈非常之大，使得我一度一夜没睡抱着被子哭以及有隐而不发的意愿。但后续业界的同学review，反而给了非常正面反馈很多，可能有很多的小点戳中了他们实践的经历。

这个blog类似survey，但是细节很多，我尽量满足大家的一些观感，很多细节用三角形隐藏了，对细节不关心的同学可以直接跳过。

TL;DR:In-Context Learning (ICL) is one of the emerging capacities of LLMs. In this blog, we explore the key elements influencing its effectiveness and introduce the Bayesian inference view of ICL. Additionally, we explore the potential of leveraging these elements to enhance both the pre-training and the alignment of chat-based LLMs, proposing new pathways to boost chat-based LLM performance.

In-Context Learning（ICL）是大型语言模型（LLMs）的一种新兴能力。在这篇博客中，我们探讨了影响其有效性的关键因素，并介绍了ICL的贝叶斯推断视角。此外，我们还探讨了利用这些因素来增强聊天型LLM的预训练和对齐的潜力，提出了提升聊天型LLM性能的新途径。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

