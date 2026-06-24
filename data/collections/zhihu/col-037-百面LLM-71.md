---
title: "百面LLM-71"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/719079596
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-71

> @swtheking | https://zhuanlan.zhihu.com/p/719079596

---

提问：rm model还是critic model才是AGI的正确道路？

回答：

此时的观点：1）rm model的效果会比critic model or GenRm效果好，2）critic model是一个愿景，是一个AGI终极愿景，难度几乎就等于AGI本身。

对于2）可以先解释一下，包括OpenAI在内也把此当作alignment的目标之一 [1]：

Training AI systems using human feedback
Training AI systems to assist human evaluation
Training AI systems to do alignment research

这里的2）应该就是critic model的愿景，而发布的critic model文章 [2] 也是一种尝试。

但这个任务太难了！因为这个任务要求的不只是发现哪个response是对的，哪个是错的，还要给出准确的错误的位置，那么这个任务的难度几乎等同于生成任务。我们可以把这个critic task当作一个普通的AGI任务，也需要SFT和RL过程来完成。所以需要其指导模型继续进化，需要的标注数据量非常大。尤其是RL这个AGI任务的rm来自哪？

对于1）是因为rm只需要模型分辨对或者错，这种任务简单许多。并不需要具体的解释和指出确定的错误位置，使得模型可以找出一些coarse pattern [3] 来泛化。这种泛化也许有一些漏洞，或者会误标一些难的对抗样本。但整体的泛化能力还是很不错的（在code，math任务上非常明显）。因此rm的效果会比critic model效果好。

那么此时此刻我的判断是，critic model是重要AGI目标，但rm可以做的更实用。我会两者都做，用critic model产出合成数据给rm打底，再结合少量的LLM的现阶段response和人工标注不停更新rm model来提升RLHF效果。

[1] https://openai.com/blog/our-approach-to-alignment-research

[2] McAleese N, Pokorny R M, Uribe J F C, et al. Llm critics help catch llm bugs[J]. arXiv preprint arXiv:2407.00215, 2024.

[3] swtheking：考古OpenAI，Anthropic论文1 : Training Verifiers to Solve Math Word Problems

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

