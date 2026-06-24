---
title: "百面LLM-39"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/696050896
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-39

> @swtheking | https://zhuanlan.zhihu.com/p/696050896

---

提问：模型需要从4k的长度拓宽到8k的长度，主要是在pre-train阶段完成，还是在sft阶段完成？

回答：

在pre-train阶段扩充比较合理。因为预训练直接拼稍短的文本就可以拉长长度，不需要考虑太多sft格式上的问题先拉长后对sft数据的需求量会少一些，长sft数据大量构造太困难了。曾经做过一个对比实验，通过10k超出基础模型长度的数据去sft，但长文本的能力提升有限，而且基础长度内大海捞针还稍微有下降，猜测是短文本部分能力因为扩充的时候没有持续学习有点丢失，后续实验用10k拼起来的数据做post-train单纯扩充长度，效果就已经比较明显了，但还没有结合过sft对比效果。

除此之外，提及一点，模型在post-train阶段拓宽的文本长度，如果sft阶段没有一些长sft样本进行保持，长文本能力会在sft后下降。

答案由 @刘玉梁 提供，问题由 @王焱 组织的长文本技术讨论群 @蜗牛在花园跑酷 提出。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

