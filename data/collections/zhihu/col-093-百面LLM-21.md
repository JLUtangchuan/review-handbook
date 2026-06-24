---
title: "百面LLM-21"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/688369625
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-21

> @swtheking | https://zhuanlan.zhihu.com/p/688369625

---

提问：如果我们把推理结果相关的多个关键段落按照下列规则藏在一段文章里：

A：关键段落藏在头部
B：关键段落藏在尾部
C：关键段落藏在中间
D：关键段落随机分布在文章中

然后，把文章交给大模型，并要求它生成正确的推理过程和结果。请按照模型能预测正确推理过程和结果的概率对这几个规则排序？

回答：B > A > C > D. 这是一个经典的长文本的大海捞针的问题，整体而言，模型的attention分布集中在头部和尾部，中间的attention较少，那么B > A > C。最后还有如果分散在文章中，这个结论就更难获得。Mistral 70B的研究结果如下：

更多结论可以参考论文 Same Task, More Tokens: the Impact of Input Length on the Reasoning Performance of Large Language Models [1]。

[1] Levy M, Jacoby A, Goldberg Y. Same Task, More Tokens: the Impact of Input Length on the Reasoning Performance of Large Language Models[J]. arXiv preprint arXiv:2402.14848, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-3e3df2b2c71fb5592393a6023ad53fdb_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic2.zhimg.com/v2-9bc899c5c9136a7d83cbc05983a7d210_bh.webp?source=d6434cab)

![图](https://pic2.zhimg.com/v2-ecaf7d53d6e1173d0b311c482bf37681_xl.webp?source=d6434cab)

