---
title: "百面LLM-96"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1947746893758194266
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-96

> @swtheking | https://zhuanlan.zhihu.com/p/1947746893758194266

---

提问：在RLHF中模型的探索主要看entropy这个指标，那么除了这个entropy指标以外，还有别的什么因素呢？

回答：

首先entropy这个指标是最主要衡量模型的output的diversity的指标（也就是模型的探索能力）。在短文时代，entropy几乎是模型的output的diversity衡量的唯一指标。尤其是前几个token的entropy是最重要的，因为模型输出越靠后entropy越低，也就是说后面输出的token越确定。

但是在长文时代，我们应该还要考虑一个新的因素，就是输出长度。因为模型每吐出一个token，output diversity都是以几何倍上升的，假设长为N的文本序列，再下一次sample中可以sample 5个不同的token，那么原始output的diversity 会乘以5。当然由于越后的token entropy越低，这个边际效益是递减的。

最后还是想说一下，像所谓的“aha moment”本质是那些无意义的词，“让我思考一下”，是来提升后续的output diversity。在我观点下，没有所谓的aha moment，长cot本质是增加模型的整体diversity，且应对RL过程中diversity塌缩的现象。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-3e3c45fc94120e47f5156f3f9d8a5a5c.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-bc2e2435d1e5f83adb872124d4ae9419.webp)

