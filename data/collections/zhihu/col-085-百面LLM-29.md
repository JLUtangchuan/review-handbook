---
title: "百面LLM-29"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/689847625
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-29

> @swtheking | https://zhuanlan.zhihu.com/p/689847625

---

提问：如何在predict阶段提升一个大模型的回答质量？

回答：有以下三种主流的做法：

促使模型给予COT形式的回答，会提升模型的输出质量。其中包括提示词"think step by step"，以及prompt中加入COT形式回答的例子，都会促使模型有COT的回答，来提升模型输出质量。
Self consistency [1] 或者 universal self-consistency [2]的方法。这一系列的方法主要是利用模型多个答案ensemble的思想提升模型的效果。Self consistency使用在数学领域，在模型生成多个答案的时候，利用答案结果的一致性判断哪个答案是正确的：一般模型解数学题的时候会生成COT过程和答案，最终多个结果用投票方式决定使用哪个答案作为最终答案。对于universal self-consistency是把self consistency方法推广到所有领域，最终是把多个答案再次输入模型判断哪几个答案是一致的，并输出最终结果。
Self-debug或者反思[3]，把模型结果和现实交互反馈再次喂给模型，让其反思和debug，那么会提升模型最终效果。

这三种做法后续的大融合就是类似于lang chain或者agent的思路。本质是让大模型这种概率模型一次生成对的答案的概率不是特别高（> 90%），需要在多轮对话反馈(这种反馈可以来源于工具或者人的监督)以后修正其答案，提升答案质量才能完全为人所用。

[1]Wang X, Wei J, Schuurmans D, et al. Self-consistency improves chain of thought reasoning in language models[J]. arXiv preprint arXiv:2203.11171, 2022.

[2]Chen X, Aksitov R, Alon U, et al. Universal self-consistency for large language model generation[J]. arXiv preprint arXiv:2311.17311, 2023.

[3]Chen X, Lin M, Schärli N, et al. Teaching large language models to self-debug[J]. arXiv preprint arXiv:2304.05128, 2023.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-a6b37e4ae2dbe039a1dc6fd11e7a634c_1440w.jpg)

![图](https://pic3.zhimg.com/v2-0eb271c697bd7a45cdf0838e22cb48c6_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

