---
title: "百面LLM-50"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/704240664
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-50

> @swtheking | https://zhuanlan.zhihu.com/p/704240664

---

提问：如何在RLHF中做state探索？感谢 @王小惟 Weixun 的推荐。

回答：在传统RL中，state探索是一个很重要的方向，因为模型永远无法预估好完全没见过的state的value。当然对于和原始state分布相近的state，模型可以泛化出来。但当遇到的state分布和曾经见过的state分布相差越来越远的时候，这个评估会越来越不准确，具体理论可以看 [1]。

在RLHF中，我们首先收集pair数据进行reward model训练，然后用reward model对LLM进行RL训练。当LLM刚开始训练的时候，生成的response（state），reward model是见过的。但当训练过久以后，生成的response逐渐偏离原始policy的response分布。那么这里面有一部分是准确的（离原始response分布相近），另一部分则是不准确的（离原始response分布相远）。如下图：

在LLama2 [2]中, 使用边训边标的方式来解决这个问题，也就是训一段时间，收集数据进行标注。但这种标注方法太过于耗费人力。尤其是标注的某些部分（离原始response分布相近的state）本身reward是依然准确的，标注所以是被浪费了。

因此，为了减少人力浪费，用最节省的方式进行标注，论文 [3]提出一个active learning的方式完成探索潜在高分state。具体来说，他们在DPO loss后新加了一项探索loss：

这里的第二项的目的是让模型生成更多sft model中生成不了的response。

Tips：这里和降低KL散度的weight区别是，降低KL散度weight能让sft model生成很多高得分却偏离sft model的response，但是不能保留那些低得分但偏离sft model的response（也就是上图中y_u右边部分）。

对于新的loss，模型可以采样出更多偏离reward response原始分布的response，提高标注的sample efficiency，降低成本。

[1] Liu Z, Lu M, Xiong W, et al. Maximize to explore: One objective function fusing estimation, planning, and exploration[J]. Advances in Neural Information Processing Systems, 2024, 36.

[2] Touvron H, Martin L, Stone K, et al. Llama 2: Open foundation and fine-tuned chat models[J]. arXiv preprint arXiv:2307.09288, 2023.

[3] Zhang S, Yu D, Sharma H, et al. Self-Exploring Language Models: Active Preference Elicitation for Online Alignment[J]. arXiv preprint arXiv:2405.19332, 2024.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-e1feebbb4e57f07274bceb0b1ebbd32f_1440w.jpg)

![图](https://pic1.zhimg.com/v2-313412c74f2b11f22755bceb52f389a6_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

