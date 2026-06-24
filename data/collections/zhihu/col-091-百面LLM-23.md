---
title: "百面LLM-23"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/688703803
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-23

> @swtheking | https://zhuanlan.zhihu.com/p/688703803

---

提问：为什么G4-turbo在topp=0.0的情况下，还不能保证预测稳定性？（社区最近广泛讨论的问题）

附社区具体问题：

我构造了一个测试场景来测试该问题：
使用英文翻译为中文的任务，输入token量大于1k，输出token量也大于1k。总体控制在4k context范围内，方便兼顾到老版本模型和其他供应商的模型。
所有测试中输入prompt完全一致。
设置temperature=0，固定seed
对于每个模型请求至少20次，计算输出token序列结果之间的最大相同前缀的平均长度，越大说明第一个分歧token出现的越晚。
备注：0613版本的模型并不支持seed，也不会输出 system_fingerprint 。
gpt-3.5-turbo-0613模型的结果是最符合一般人预期的，在这种贪心解码的策略下，平均相同长度超过500。
gpt-4-0613与从1106开始的所有后续模型的平均相同长度大多在60-90的范围内。对于我的测试案例，超过100token的输出时，大概率结果不会完全一致。
作者：孔某人
链接：https://zhuanlan.zhihu.com/p/688676344

回答：预测稳定性在LLM中一直是一个问题，我通过现在的现象分析一下可能存在的问题：

如swtheking：大模型的面试题系列-1所讲的一种原因，由于模型预测时候，Open-AI会收集当时多个请求同时组batch，那么预测由于padding的影响，本身就会产出token level的不一致，当然这个不一致影响比较大，因为第一个token不一致后续都会不一致。
更极端的组batch的方式是，把多个请求pack在一起，然后使用block diagonal attention的方式进行预测，那么这个预测会比1方式更严重影响预测稳定性，因为pad更多个token。（ @王焱 提供）
预测中融合算子的加速，以及算子计算顺序的问题影响的预测结果。因为对于不同的硬件适配，甚至在同一硬件的算子计算顺序的随机性也能带来token level的不一致，但这种不一致概率较小。
除此之外，tensor parallel，data parallel以及batchsize变化会导致内部选择kennel不一致（计算算子不一致），那么导致效果的diff（比如vllm框架下）。
可能存在类似投机解码类更高效的解码方式带来的预测不稳定。当然投机解码理论上不会带来预测不稳定。
Sparse MOE的一些问题存在，Continuous batching 的时候因为每个 batch 的 case 不一样导致超 capacity factor 的时候会丢不同 token 导致不 deterministic，参考Non-determinism in GPT-4 is caused by Sparse MoE。（Yao Fu 提供）

从 @孔某人 观测到的现象可以推测，

GPT3.5-turbo由于模型小，可能没有进行组batch的操作，仅仅是某些融合算子加速导致了算子计算顺序不一致带来的不稳定。
G4-turbo和G4也许使用了组batch的形式，或者pack多个user query的形式进行预测推理，导致了很多预测不稳定。
也许在大模型下有类似投机解码类更高效的解码方式带来的预测不稳定。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-7bc86f7deead0f43667029ccd3be54d0_bh.webp?source=d6434cab)

![图](https://pica.zhimg.com/v2-e7769e27743e7b0bce6c1d6ffd256277_xl.webp?source=d6434cab)

