---
title: "百面LLM-22"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/688584471
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-22

> @swtheking | https://zhuanlan.zhihu.com/p/688584471

---

提问：Pair RM是什么形式的RM，相比于原RM形式有什么好处？

回答：原RM是BT model形式的RM，每个sample组成形式是（prompt，answer)，通过maximize positive sample和negative sample的gap来完成pointwise的rank。Pair RM是pairwise rank，数据组成形式是（prompt，pos_answer, neg_answer）. Pair RM的好处是pos answer和neg answer可以互相在context下看到两者，那么可以通过字面的比较找到两者的diff，整体解释性和泛化能力都会比普通RM好。因为普通RM很容易overfit原数据，很难找到真正diff地pattern。现在Alpaca-Eval [1]榜单上就有Pair RM的身影，而且Pair RM整体很小 [2]，效果很好。

[1] AlpacaEval Leaderboard

[2] ContextualAI/Contextual_KTO_Mistral_PairRM · Hugging Face

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-5f6dd46ace94af40e503c1e6a8c0a34d_bh.webp?source=d6434cab)

![图](https://pic3.zhimg.com/v2-25d9de2e2b8d4971d2c24574387ab4c0_xl.webp?source=d6434cab)

