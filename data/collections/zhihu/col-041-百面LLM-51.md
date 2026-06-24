---
title: "百面LLM-51"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/705910006
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-51

> @swtheking | https://zhuanlan.zhihu.com/p/705910006

---

提问：RLHF的performance上界是什么？达到这个上届是trivial的事情嘛？

回答：RLHF的performance上界就是rm模型的泛化上界，也就是rm模型下的Best of N的效果。这就是为什么OpenAI评价RM的一个主要指标是BON [1]。

达到这个上届明显不是trivial的事情，原因如下：

1）评判任务本身难度低于生成任务，评判任务的拟合能力就会高于生成任务，在超级大模型下，由于泛化和拟合是几乎同时增长的（也就几乎不存在过拟合，Grokking理论 [2]）, 因此RM泛化也比RLHF强。

2）Pre-train模型固有的bias很高。尽管RM也是Fine-Tune pre-train model，但由于是单个reward预测，不影响原始模型生成的response分布，所以并不会特别大地影响pre-train 原始的response distribution。但是RLHF不一样，它需要将新的信息压缩回Pre-train model，有一些数据本身而言就是很难压缩回Pre-train model。

[1] Lightman H, Kosaraju V, Burda Y, et al. Let's verify step by step[J]. arXiv preprint arXiv:2305.20050, 2023.

[2] Power A, Burda Y, Edwards H, et al. Grokking: Generalization beyond overfitting on small algorithmic datasets[J]. arXiv preprint arXiv:2201.02177, 2022.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-97b072dcf234d0fdbff4dd762abd5275_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

