---
title: "百面LLM-25"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/689015698
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-25

> @swtheking | https://zhuanlan.zhihu.com/p/689015698

---

提问：在LLM中，假设我们可以在不同层中，交换两个位置token的embedding，那么是偏顶层对最后预测的影响大，还是底层对最后预测的影响大？

回答：

有两个观点：

顶层：

因为第n层的第m个token会看到下面n-1层前m-1个token的所有attention模式(对所有前面token的attention)，那么如果你交换的是第k层（k << n）的(m-1)个token和前面任一token，那么在第k层可以兼容这个模式，所以预测影响不会特别大。相反如果在最顶层，那么第(m-1)个token和第m - j (j > 1)个token交换，那么第m个token只有一个错误的attention模式可以看到（最后的错误模式），那么预测影响很大。
底层的typo错误会在模型中间被减弱，被LLM兼容。还有之前有对bert模型进行分析，BERT Rediscovers the Classical NLP Pipeline [1], BERT分析底层是词法分析，高层是语义分析, 因此模型可能在高层影响更大。
第n层改变某个token等于前n-1层这个位置的token的作用都被修改了。

底层：

底层是等于是从句子角度改了两个词的位置，从底层进行修改了句子的顺序。

我个人觉得是顶层比较大，因为改顶层的embedding相当于底层把顺序换了，而且删了下面很多层的作用。除此之外GPT4也是可以兼容顺序错乱的情况的。

最后附几个insightful的实验

In-Context Learning Creates Task Vectors [1]发现，大模型在模型的中下层主要是做task classification任务，在上层才是做预测任务，它也曾经做过类似实验，只是选择的是特定的token交换（ICL中demonstrations的最后一个token和classification任务的最后一个预测token对换），发现是底层影响没有上层高。具体也可以看我的blog [2]。

2. GPT4对打乱文字顺序的兼容性很强，这可能是训过类似数据的原因。[4]

[1] Tenney I, Das D, Pavlick E. BERT rediscovers the classical NLP pipeline[J]. arXiv preprint arXiv:1905.05950, 2019.

[2] Hendel R, Geva M, Globerson A. In-context learning creates task vectors[J]. arXiv preprint arXiv:2310.15916, 2023.

[3] https://difficult-link-dd7.notion.site/c31d141411be4d0eb50473fe6abae1db?v=50264a9824494b6c836ba0c6f3bebd2f

[4] Cao Q, Kojima T, Matsuo Y, et al. Unnatural error correction: Gpt-4 can almost perfectly handle unnatural scrambled text[C]//Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing. 2023: 8898-8913.

来源：LLaMafia群的一系列讨论。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-11c5aad0dc052afa5332468e26e6c66a_1440w.jpg)

![图](https://pica.zhimg.com/v2-72fa0b3f3e56e543f57a5ee4c5cf5278_1440w.jpg)

![图](https://pica.zhimg.com/v2-2d4eea847807f7b7bce78a3f2d9a92b8_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

