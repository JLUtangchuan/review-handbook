---
title: "百面LLM-75"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/2354408625
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-75

> @swtheking | https://zhuanlan.zhihu.com/p/2354408625

---

提问：大模型真的有self-correct能力吗？如果想让大模型提升self-correct能力需要迎接的挑战是？

回答：

很多篇论文已证明大模型在无外界反馈的情况下，几乎无self-correct的能力[1]
self-correct能力并不是简单的sft算法就可以完成的，包括Star或者RFT都不行：

因为有很多correct答案会改成incorrect答案。

3. 因此会有如下challenges：

a. 如何把模型的正确的答案保留。

b. 如何把模型的错误的答案纠正回来。

c. 如何在训练的时候保证第一步的答案的分布，因为训练的时候依然存在第一步答案也被训练的情况，如果第一步答案偏离，第二步答案也会失效。




[1] Training Language Models to Self-Correct via Reinforcement Learning





## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-9dee726fbbdf9b9abb0fc330beb96e69_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

