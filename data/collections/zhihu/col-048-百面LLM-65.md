---
title: "百面LLM-65"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/713086458
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-65

> @swtheking | https://zhuanlan.zhihu.com/p/713086458

---

提问：对PPO后的model（训练比较完备的model），提升top_p还是temperature能更大程度提升多样性？（避免更多采样到greedy sampling的sample）

回答：在已完成PPO（Proximal Policy Optimization）训练的模型中，要增加生成文本的多样性并避免更多地采样到贪婪采样的样本，调整 top_p 和 temperature 都是有效的策略，但它们的作用方式有所不同。

比较:

提升 temperature 会更显著地增加生成的多样性，因为它直接影响了概率分布的形状，使得低概率的词更有可能被采样到。
提升 top_p 也会增加多样性，但其效果相对较温和，因为它只是扩展了被考虑的候选词集合，而不是改变每个词的采样概率。

结论:

如果需要显著增加多样性，建议首先尝试提升 temperature，因为它对生成文本的随机性影响更大。
其次，可以适当提升 top_p，进一步扩展候选词集合，从而在多样性和连贯性之间找到平衡。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic4.zhimg.com/v2-10378e80e0d8964bf558a47b9495bd24.webp)

