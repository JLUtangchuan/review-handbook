---
title: "百面LLM-55"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/708037980
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-55

> @swtheking | https://zhuanlan.zhihu.com/p/708037980

---

提问：以下是两个RLHF算法不同种decoding的结果：

RLHF算法一：

1）抽样10次，top_p = 0.7, temperature = 0.95, pass@1 = 0.7

2) Greedy decoding, pass@1 = 0.78

RLHF算法二：

1）抽样10次，top_p = 0.7, temperature = 0.95, pass@1 = 0.72

2) Greedy decoding, pass@1 = 0.75

请问算法一和算法二哪个是PPO算法，哪个是DPO算法？假设RM噪声较小。

回答：这是我真实训练发现的一个现象，这里实际中算法一是PPO，算法二是DPO算法。其中原因是：

1）当使用DPO算法时，正确的response在被maximize，错误的responses在被minimize，但是由于DPO不能分辩token-wise的reward，那么虽然整体正确的response概率在增大，但某几个在正确response中关键的token未必能增大，甚至到达top 1。所以greedy的效果可能没有那么好。但随机pass@1的效果会还不错（因为整体的概率提升了）。

2）当使用PPO算法的时候，由于使用的是weighted logistics regression，那么在token维度，如果这个token可以获得的未来reward大于现在的state value，那么这个token就会被增强，而reward 得分最高的token会被最大化增强。因此Greedy的效果一定会很快的提升，但依然有部分和Greedy很像的response也被增强了，因为reward model使用的是BT model，很多错误但和正确很像的response的得分也很高。所以pass@1反而没那么高。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

