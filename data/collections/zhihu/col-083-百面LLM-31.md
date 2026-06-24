---
title: "百面LLM-31"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/690350290
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-31

> @swtheking | https://zhuanlan.zhihu.com/p/690350290

---

提问：现阶段利用SFT阶段在做RLHF的方法有哪些？优点和缺点是什么？

回答：总结的方法有：

CFT[1], 通过在SFT中放入两个response，一个GPT4的，一个GPT3.5的，然后加一个后缀prompt进行区分，比如<GPT4>，<GPT3>。sft data会变成 Q <GPT4>：GPT_ans_4, Q<GPT3.5>: GPT_ans_3.5。然后模型内部会通过prompt区分何时生成GPT4这种高质量答案，何时生成GPT3.5这种低质量答案。
CUT 方法[2]：如CFT一样加入后缀，不过是用reward表示，而且会把Judgement也加入到后缀中，增加整体的可解释性。除此之外，他们还引入了一种Contrastive Unlikelihood Training的方式，这个留到后续再细讲。
ORPO[3]利用SFT CE loss后面加了一项类似DPO的loss，同时做SFT和DPO，进行对比区分。这个方法相比于前两个方法的好处，是没有特定解释的prompt。

最后给我自己的见解：

SFT阶段做RLHF本质是强化学习的一个分支Hindsight relabeling [4] 的方法的演变。通过对比好坏case的方式找到自动relabeling的线索。但整体和RLHF相比差距比较远，因为这种relabeling的方式非常隐式的表达RLHF，目标不够强（没有强reward指导，和gradient回传）。总结而言这是一个简单，高效且解释性高的RL方法，适合在不做RLHF的情况下达到超过SFT的效果。

[1] Wang G, Cheng S, Zhan X, et al. Openchat: Advancing open-source language models with mixed-quality data[J]. arXiv preprint arXiv:2309.11235, 2023.

[2] Xu W, Cai D, Zhang Z, et al. Reasons to reject? aligning language models with judgments[J]. arXiv preprint arXiv:2312.14591, 2023.

[3] Hong J, Lee N, Thorne J. Reference-free Monolithic Preference Optimization with Odds Ratio[J]. arXiv preprint arXiv:2403.07691, 2024.

[4] Andrychowicz M, Wolski F, Ray A, et al. Hindsight experience replay[J]. Advances in neural information processing systems, 2017, 30.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-83f96e2a4a33a1daa2951735e1fef284_1440w.jpg)

![图](https://pic3.zhimg.com/v2-31d408fe6206096f8303c4973fd64010_1440w.jpg)

![图](https://pic1.zhimg.com/v2-2974bf051c85a175d2ce0c7973357a92_1440w.jpg)

![图](https://pic2.zhimg.com/v2-e0b2a88feeaafa154305c699fa052beb_1440w.jpg)

![图](https://pic1.zhimg.com/v2-0e2e409a7798cd6efaea891e278c33f0_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

