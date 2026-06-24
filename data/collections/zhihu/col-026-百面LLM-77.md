---
title: "百面LLM-77"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/3757026120
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-77

> @swtheking | https://zhuanlan.zhihu.com/p/3757026120

---

提问：BON policy 随着 N 增长的情况下，

1）和原始采样sft policy的KL距离按照什么方式增长？

2）gold reward 按照什么方式增长？

3）BON policy随着KL增长的reward增长方式？

回答：

1）BON随着N增长，KL按照 
𝑙
𝑜
𝑔
(
𝑛
)
 增长 [1]，具体而言是按照：

2）gold reward 也是按照 
𝑙
𝑜
𝑔
(
𝑛
)
 方式增长[2]:

3) 那么推出，BON policy的reward增长按照KL增长几乎是线性增长的。

刚预测是线性增长，看了经典论文给了结论： For BoN, despite visual similarity, a linear fit (bon) did not work well (fig. 20). The predictions for RL and BoN are not as easily modelled as the gold score predictions. We leave a better understanding of the proxy RM score behavior to future work.









[1] Learning to summarize from human feedback.

[2] Let's verify step by step.

[3] Scaling Laws for Reward Model Overoptimization





## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-dc6237f86854f6355941bad579babf2c_1440w.jpg)

![图](https://pic1.zhimg.com/v2-fa676eb6195be02f04e3c9c45fc22b18_1440w.jpg)

![图](https://pic1.zhimg.com/v2-6a8add628dc0f131941e95040630cbbe_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-9e4b89c1e567b49a58633727f5dc7014.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-e17602e8876453915c8b5905aa0340b2.webp)

