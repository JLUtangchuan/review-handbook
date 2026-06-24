---
title: "百面LLM-37"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/692962369
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-37

> @swtheking | https://zhuanlan.zhihu.com/p/692962369

---

提问：请问模型在SFT后会出现“复读机”情况该如何debug（可以是各种形式上的复读，比如复读最后1-N个token，复读训练数据很少出现的token，复读大段有逻辑的文字），以及出现的原因是什么？（由 @moix 提供）

～～～

回答前先赞一下这个问题,

且说一下背景，好像之前国内一直有团队说复读机问题，最近这半年就没人说了～

～～～

回答：复读机问题是一个偏向LLM早期的问题，也就是pretrain模型能力不强的时候才会发生的问题。

如果debug会发现，复读机的本质是，复读的那部分数据不能给予更多的信息，所以模型attention时候会跳过这部分信息依然从之前的context后进行预测。也就是<context> -> 复读数据 & <context, 复读数据> -> 复读数据。之前的做法一般会搞一个复读的penalty阻止这一现象，现在几乎没用了。

那为什么sft以后会发生这种情况？

因为当sft数据的能力远大于pre-train model的本身能力，尤其你试图想overfit这部分数据的时候。

在overfit的过程中，模型会为了记住这部分数据，而过多修改原先的attention模式，且会打乱原始pretrain模型的原始分布。之前国内经常发现这种问题，就是总是想用比较低水平的模型硬distill G4的效果，那么最终结局就是复读机，但现在大家pre-train做起来以后，这个问题几乎不存在了。

最近好像大家又开始聊复读机的问题，在pretrain完模型更严重（我倒是没遇到过）。猜测模型在这个context下大概率只能输出这个token，那就是在这个位置塌缩了，因此模型遇到数据多样性不够的情况下，某些位置倾向性输出固定内容。但这种位置确定性塌缩会泛化到新数据上，感觉是模型承载力不足。所以导致“复读机”的问题应该主要有两个因素：1）模型承载能力（模型大小，模型结构），2）数据多样性。

补充：确实sft数据训练过少的情况也会导致复读，本质还是模型一般学不会何时停止输出结果，因为pre-train的时候一般是packing，那么基本不太会学会输出<eos>，所以pre-train模型一般都是会复读的。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

