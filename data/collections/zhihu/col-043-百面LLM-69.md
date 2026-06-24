---
title: "百面LLM-69"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/716114315
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-69

> @swtheking | https://zhuanlan.zhihu.com/p/716114315

---

提问：为什么Llama2 [1] RLHF中多阶段RLHF过程中，要加入rejection sampling过程？

回答：本质是为了在mode seeking过程中兼顾mode covering。或者说是兼顾对rm的 best of n policy的forward KL和backward KL两种形式的分布拟合。

首先你要了解什么是mode seeking，什么是mode covering？

chatgpt生产～～～
Mode seeking（模式寻求）指的是生成模型倾向于集中生成数据分布中的少数几个模式（或类别）的样本，而忽略或无法覆盖数据分布中的其他模式。简而言之，模型在生成样本时只关注最常见的模式，而忽略了数据分布的多样性。
特点：
集中生成：模型会生成许多相似的样本，这些样本往往集中在数据分布的一个或几个模式（高密度区域）。
缺乏多样性：生成的样本可能会缺乏多样性，因为模型忽视了其他模式或类别。
示例：
在图像生成任务中，如果一个 GAN 模型是 mode seeking 的，它可能会只生成某一类特定风格的图像，而忽略数据集中存在的其他类别或风格。
Mode covering（模式覆盖）指的是生成模型倾向于尝试覆盖数据分布中的所有模式，即生成样本时尽可能地覆盖数据分布的多样性。然而，这种策略有时会导致模型生成的样本质量较差，因为它试图生成的数据分布过于广泛，可能生成一些不真实或不常见的样本。
特点：
广泛覆盖：模型会尝试生成数据分布中的所有模式，包括一些稀有或边缘的模式。
可能影响质量：由于尝试覆盖所有模式，生成的样本可能会出现一些不真实或质量较低的情况。
示例：
在文本生成任务中，如果一个生成模型是 mode covering 的，它可能会生成各种不同风格、主题的文本，覆盖数据分布中的多样性，但有时生成的文本可能不符合常理或质量较低。
总结
Mode Seeking：模型只关注数据分布中最常见的模式，生成的样本多样性较低，但质量较高。缺点是可能忽略了数据分布中的其他模式。
Mode Covering：模型尝试覆盖数据分布中的所有模式，生成的样本多样性较高，但可能导致样本质量下降或生成不真实的样本。
在实际应用中，理想的生成模型应该能够在 mode seeking 和 mode covering 之间找到平衡，既能覆盖数据分布中的主要模式，又能保持样本的多样性和质量。

RLHF这种mode seeking的好处是：快速拟合rm中简单case的best of n，但是对于难的case会忽略或者遗忘。

那么rejection sampling的作用就是保证很多难的case的最优解被覆盖到，在RLHF的mode seeking过程中加强mode covering。

Tips：这种想法很好，好像效果很一般，需要更好的方式来解决这个问题。

[1] Touvron H, Martin L, Stone K, et al. Llama 2: Open foundation and fine-tuned chat models[J]. arXiv preprint arXiv:2307.09288, 2023.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

