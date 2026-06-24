---
title: "百面LLM，综六，LongRecipe: Recipe for Efficient Long Context Generalization in Large Language Models"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/718299687
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综六，LongRecipe: Recipe for Efficient Long Context Generalization in Large Language Models

> @swtheking | https://zhuanlan.zhihu.com/p/718299687

---

首先在这里先介绍一下simple long context小分队：

大家好，我们是simple long context
一个专注long context的小团队
我们近期准备放出来三份工作
1 探究影响基于rope编码的大模型外推的原因是什么？

2 低成本long context continue pretrain

3 按照工业流程构建的long context open ended sft数据集（规则迭代和标注迭代流程都会开放出来

第二份工作以paper的方式放出来
https://huggingface.co/papers/2409.00509
这份工作的code和模型都放在了hf上，希望大家喜欢。

你想将LLM的上下文窗口扩展到128k，只需使用一台GPU和成千上万的短样本，同时实现接近GPT-4的性能吗？那就来看看我们的LongRecipe吧！

— 论文: [https://arxiv.org/abs/2409.00509](LongRecipe: Recipe for Efficient Long Context Generalization in Large Languge Models)

— 代码: [GitHub - zhiyuanhubj/LongRecipe](GitHub - zhiyuanhubj/LongRecipe)

— LongRecipe-Llama3-8B-128k: [https://huggingface.co/zhiyuanhucs/LongRecipe-Llama3-8B-128k](https://huggingface.co/zhiyuanhucs/LongRecipe-Llama3-8B-128k)

— LongRecipe-Qwen2-7B-128k: [https://huggingface.co/zhiyuanhucs/LongRecipe-Qwen2-7B-128k](https://huggingface.co/zhiyuanhucs/LongRecipe-Qwen2-7B-128k)

TL;DL: Large language models (LLMs) face significant challenges in handling long-context tasks because of their limited effective context window size during pretraining, which restricts their ability to generalize over extended sequences. Meanwhile, extending the context window in LLMs through post-pretraining is highly resource-intensive. To address this, we introduce **LongRecipe**, an efficient training strategy for extending the context window of LLMs, including impactful token analysis, position index transformation, and training optimization strategies. It simulates long-sequence inputs while maintaining training efficiency and significantly improves the model's understanding of long-range dependencies. Experiments on three types of LLMs show that LongRecipe can utilize long sequences while requiring only 30% of the target context window size, and reduces computational training resource over 85% compared to full sequence training. Furthermore, LongRecipe also preserves the original LLM's capabilities in general tasks. Ultimately, *we can extend the effective context window of open-source LLMs from 8k to 128k, achieving performance close to GPT-4 with just one day of dedicated training using a single GPU with 80G memory.* Our code is released at the [link](https://github.com/zhiyuanhubj/LongRecipe).

大型语言模型（LLMs）在处理长上下文任务时面临显著挑战，因为在预训练期间其有效上下文窗口大小有限，这限制了它们在扩展序列上的泛化能力。与此同时，通过后续预训练来扩展LLM的上下文窗口资源消耗极高。为了解决这个问题，我们提出了 LongRecipe，这是一种高效的训练策略，用于扩展LLM的上下文窗口，包括有影响力的令牌分析、位置索引转换和训练优化策略。它在保持训练效率的同时模拟长序列输入，并显著改善模型对长距离依赖的理解。在对三种类型的LLM进行实验后，我们发现 LongRecipe 能够利用长序列，同时只需目标上下文窗口大小的 30%，并且与完整序列训练相比，计算训练资源减少了超过 85%。此外，LongRecipe 还保留了原始LLM在一般任务中的能力。最终，我们可以将开源LLM的有效上下文窗口从 8k 扩展到 128k，仅需一天专用训练时间，使用一台 80G 内存的单GPU，即可达到接近 GPT-4 的性能。我们的代码已发布在 链接 上。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic4.zhimg.com/v2-309b8095c3b5bd70a250f0ecc832962a.webp)

