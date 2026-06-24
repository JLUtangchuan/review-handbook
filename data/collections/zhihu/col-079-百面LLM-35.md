---
title: "百面LLM-35"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/692106045
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-35

> @swtheking | https://zhuanlan.zhihu.com/p/692106045

---

提问：同样是reward hacking，比如length bias，PPO和DPO的表现有何不同，以及背后原理有何不同？

回答：同样是reward hacking，PPO的reward hacking程度会比DPO更加强烈。

拿length bias举例子，如果你选择的preference dataset有length bias，那么训练reward model的时候也会带入这种length bias。由于PPO是on policy采样，那么每一个step由于query采样出的response有长又短，而在每一个step以后，经过reward打分和Policy gradient过程以后，长的response都会被加强，而这个step的短的response其实也是上一个step的长response，那么几个step以后response的长度会成倍的增加。对于DPO来说，由于你提升的pos response的长度是一定的，即使多学几轮，也是overfit这个response，长度增益虽然也会有，但不会像PPO那么恐怖。

其背后原理来看，DPO的长度增加其实是BT model中的对简单samples的overfit，相比于其它pattern，长度pattern更容易抓住，那么DPO训练完模型就会有length bias。而对于PPO而言，其实reward model的length bias和DPO本源是一致的，但通过PPO算法的on policy采样会左右互搏，倍数放大reward model的length bias问题。这就是为什么PPO容易学飞，不稳定的原因。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

