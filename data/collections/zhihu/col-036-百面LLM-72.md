---
title: "百面LLM-72"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/719080351
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-72

> @swtheking | https://zhuanlan.zhihu.com/p/719080351

---

提问：为什么大模型需要合成数据？

回答：

现在o1出来后，也渐渐热门起来：

主要有以下两个点：

1）高质量数据，本质互联网数据还是太低质量了，只能达到人类中下游水平，而经过pre-train的数据清洗，sft的高质量对齐，RL的进一步对齐，模型的生成质量大幅度提高，因此高质量的合成数据可以泛化出来。self-taught，self-training, self-train这一系列论文由此得来。

2）人类的思考过程不会写出来，这是openai的一个researcher给的理由，我觉得也很对的。也就是人类很多写出来的和想的不是完全一致的，而写出来的比思考的少很多。因此如果希望模型达到AGI水平，必须把人类如何思考的过程也描述出来，这也是互联网中缺乏的数据之一。o1也就是沿着这条路进化出来的。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

