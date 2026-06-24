---
title: "百面LLM-36"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/692446316
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-36

> @swtheking | https://zhuanlan.zhihu.com/p/692446316

---

提问：现有的rm模型泛化能力怎么样？由@南屏晚钟提供

回答：现有rm模型似乎泛化能力非常有限，原因是很多论文提出很难看到rm模型在scale model size以后有更多的收益[1]。如果把rm当做一种instruct任务，如果你用同样的数据进行训练LLM，理论上泛化能力应该可以随着模型变大而获得更强的能力，因为你的底座模型的能力变大了。但现阶段，甚至在alpaca eval榜单上能看到bert训练出的rm效果很好，那么显然rm的整体scale是没有特别的收益的。那么后续怎么提升rm模型能更好地利用大模型基座的能力将是rm研究的重要方向。

[1] Huang S, Noukhovitch M, Hosseini A, et al. The N+ Implementation Details of RLHF with PPO: A Case Study on TL; DR Summarization[J]. arXiv preprint arXiv:2403.17031, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

