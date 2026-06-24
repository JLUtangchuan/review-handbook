---
title: "百面LLM-34"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/691614938
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-34

> @swtheking | https://zhuanlan.zhihu.com/p/691614938

---

提问：现在主流实现RM有几种，是怎么做的？

回答：

1）是主流Instruct GPT [1] 提出的，就是在整个句子之后插入一个新token位置，这个token是只有0-1两个选择，在实现上trl库其实是利用最后一个token后加一层MLP（或两层MLP）然后进行BT model的loss，进行pair-wise的训练。当然我也见过有一种改进就是0-1的二分类预测 [2]，这种做法比较适合有明确正误标准的方向，比如数学，代码和推理。

2）是phi-2-math [3] 使用的，使用全序列token进行预测，也就是在全序列的token的logit后都加入MLP层进行二分类，然后对这些所有token进行BT model的loss，进行pair-wise的训练。这种做法本质是类似RL中Reinforce算法的做法，然后把所有的token赋予最后的reward值，这样的做法好处其实是变相地增加了样本量，坏处是增加了大量噪声。和Reinforce算法一样是无bias，但高variance的做法。最终效果取决于变相增加的样本量是否能抵抗住高variance。在数学上使用合理地原因是，数学是过程式学习，过程中每一个token都很重要。这种做法类似于没钱版本的verify step by step [4]。

[1] Ouyang L, Wu J, Jiang X, et al. Training language models to follow instructions with human feedback[J]. Advances in neural information processing systems, 2022, 35: 27730-27744.

[2] Dubois Y, Li C X, Taori R, et al. Alpacafarm: A simulation framework for methods that learn from human feedback[J]. Advances in Neural Information Processing Systems, 2024, 36.

[3] Liu B, Bubeck S, Eldan R, et al. Tinygsm: achieving> 80% on gsm8k with small language models[J]. arXiv preprint arXiv:2312.09241, 2023.

[4] Lightman H, Kosaraju V, Burda Y, et al. Let's Verify Step by Step[J]. arXiv preprint arXiv:2305.20050, 2023.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

