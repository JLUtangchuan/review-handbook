---
title: "百面LLM-56"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/708777662
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-56

> @swtheking | https://zhuanlan.zhihu.com/p/708777662

---

提问：为什么小模型上做RLHF比较困难，在大模型上做RLHF相对容易？

回答：

1）SFT后小模型的基础能力偏弱，比如reasoning这个方向，整体准确率比较低。因此在PPO或者DPO，on- policy sampling很难sample到正确的答案，因此即使有很好的reward model，也很难给予正确的梯度方向，导致了PPO or DPO训练后的模型错误率也很高。

2）更小的模型意味着更低的表征能力，在pretrain阶段的bias更难被alignment阶段所纠正。比如A和A‘如果编辑距离很低，但一个正确一个错误，但在pretrain阶段后模型两者的生成概率差值很低。由于在小模型下几乎没有足够的表征能力分辨两者，因此RLHF很难对这两者进行排序或者改变两者生成概率的差值。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

