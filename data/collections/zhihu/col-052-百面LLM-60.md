---
title: "百面LLM-60"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/710203934
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-60

> @swtheking | https://zhuanlan.zhihu.com/p/710203934

---

提问：如何理解“压缩即智能”这句话，如何设计实验验证这句话？

回答：压缩指的是training ppl的指标，也就是训练数据的ppl越低，显得模型压缩能力越好。智能指的是模型完成各种人类任务的能力，比如数学，代码，逻辑推理等，那么OpenAI也构建了很多benchmark来完成智能的评判。那么这句话这么理解就是：模型在training ppl上越低，那么在benchmark上效果越好。但当我们需要设计实验来完成这件事情的时候，有两部分要做，1）计算training ppl，2）计算bench mark指标。2）的计算是比较trivial的，但1）的计算是非常耗费算力和时间的。因此我们使用泛化的test set的ppl来等价衡量这个指标（全体training set ppl和test set ppl呈现线性关系）。那么这个就是paper Compression Represents Intelligence Linearly [1] 所做的实验：

这篇论文用的是BPC，就是character-level ppl。发现在test set上的BPC和benchmark的指标呈线性关系。证明了压缩即智能的说法。

[1] Huang Y, Zhang J, Shan Z, et al. Compression represents intelligence linearly[J]. arXiv preprint arXiv:2404.09937, 2024.

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-3325b7486bba2b2f701f7168815a44be_1440w.jpg)

![图](https://pic4.zhimg.com/v2-d7cec76ab142f423c381967279f80a63_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

