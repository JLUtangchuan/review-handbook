---
title: "百面LLM-98"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1952783174095574422
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-98

> @swtheking | https://zhuanlan.zhihu.com/p/1952783174095574422

---

提问：什么会是RL Scaling的Bottleneck？

回答：

首先在任何时候，算力似乎都不是rl scaling的bottleneck，但好的infra和基建阻止了高效的实验和迭代，正确的评估和好的infra，以及充足的算力是rl scaling发生的必要条件。

除此之外，还有一个必要条件就是好的基础模型，太差的基座模型不会有rl scaling，因为泛化太差了。

那么，在短文的RLHF时代有两个事情限制了rl scaling：

Response diversity限制了RL Scaling，因为在一定的迭代步骤以后，模型的entropy会持续降低，那么sample 出来的都是同样的response，导致一个prompt下所有的response reward趋于一致，模型无法继续迭代。
Reward Model （Model-based RM），无论BT model还是GenRM都有个非常大的弊病，就是它们会把相似的response打相似的分数，这个可怕的点在于，他们分不清fine-granted response difference。用上这样的reward model，模型后续输出也会非常容易塌缩，发生reward hacking or response diversity消失。BTW，一个能帮助模型区分fine granted response difference的reward是非常重要的，除了reward verifier，其实PRM还是有一定的机会的。

长文时代，在加上了生成长度以及加上了reward verifier，确实可以发生rl scaling了，但其实还有一个因素继续限制了持续的rl scaling：

高质量的prompt：好像大部分公司还是没意识到less is more这个事情，一份好的rl prompt集合或者好的rl task会在RL训练的过程中持续scale 模型效果，拓展模型的边界。但随意的堆量是一个非常错误的方向。

最后还是推荐一下我之前在seed做的一篇rl scaling的文章，最近在长文上也是有同样的观察，https://arxiv.org/abs/2503.22230。我个人感觉这个项目极大提升了我对rl scaling的理解，无论长文还是短文。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-5f6dd46ace94af40e503c1e6a8c0a34d_bh.webp?source=d6434cab)

![图](https://pic3.zhimg.com/v2-25d9de2e2b8d4971d2c24574387ab4c0_xl.webp?source=d6434cab)

