---
title: "百面LLM-18"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/687799662
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-18

> @swtheking | https://zhuanlan.zhihu.com/p/687799662

---

提问：提升sft的prompt的多样性有什么好的方法？

回答：

明文TAG法：也就是对SFT的prompt进行打tag，对其中的名词和动词进行分类打标，最后通过tag对prompt的分布进行调整，保证tag的分布是均匀的。著名的就是InsTag [1] 这个方法。
模型embedding聚类方法：通过模型最后一层的embedding对prompt进行表示，那么通过prompt embedding的距离表示prompt的相似度，对于过于相似的prompt进行删除。著名的有Self-Evolved Diverse Data Sampling for Efficient Instruction Tuning [2]。
Figure: Blue points: training data point ; Red points: novel data points to be seleted.
从complexity角度，对于prompt直接进行难度的升级，所以即使在同一个语意空间的prompt也会变得diverse。比较著名的是Wizard 方法 [3]，通过GPT4进行prompt难度升级，然后构成complexity丰富的prompt。

[1] Lu K, Yuan H, Yuan Z, et al. # InsTag: Instruction Tagging for Analyzing Supervised Fine-tuning of Large Language Models[C]//The Twelfth International Conference on Learning Representations. 2023.

[2] Wu S, Lu K, Xu B, et al. Self-evolved diverse data sampling for efficient instruction tuning[J]. arXiv preprint arXiv:2311.08182, 2023.

[3] Luo Z, Xu C, Zhao P, et al. Wizardcoder: Empowering code large language models with evol-instruct[J]. arXiv preprint arXiv:2306.08568, 2023.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-6866bd7d362e6597ac0779198d725b90_1440w.jpg)

![图](https://pic3.zhimg.com/v2-3680b3c9e49fcfb4ea2cc6fdfe0939e0_1440w.jpg)

![图](https://pic3.zhimg.com/v2-5035db54296d19455f86a80951477c18_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic2.zhimg.com/v2-bc3af0794a84fa779af758f5cf241c1e_bh.webp?source=d6434cab)

![图](https://pic2.zhimg.com/v2-25d9de2e2b8d4971d2c24574387ab4c0_xl.webp?source=d6434cab)

