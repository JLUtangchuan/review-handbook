---
title: "百面LLM-44"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/699827201
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-44

> @swtheking | https://zhuanlan.zhihu.com/p/699827201

---

提问：在LLM中选择像传统RL中value network和policy network共享底座会有问题吗？如果有解释一下为什么？

回答：这种做法是有问题的。但甚至在主流的TRL库中使用的就是value network和policy network共享底座的方式，其motivation是为了降低显存。具体而言，这种方式仅仅在policy network后加了一层MLP, 也就是ValueHead,代表value network， 细节可以参考我们写的一个TRL库的RLHF的介绍[1]。

这种做法的问题是共享底座，两个network会互相影响学习。当reward normalize做的不好的时候（比如过度稀疏，比如variance较大），value network学习会占主导，影响policy的学习。当降低value network的loss占比的时候，value network又很难学好，那么token-wise reward学得很差。根据PPO的GAE:

𝐴
𝑑
𝑣
𝑎
𝑛
𝑡
𝑎
𝑔
𝑒
(
𝑇
)
=
∑
𝑡
≥
𝑇
𝛾
𝑡
−
𝑇
𝑟
𝑡
−
𝑉
𝑎
𝑙
𝑢
𝑒
(
𝑇
)

那么Advantage函数会学的很不稳定，那么会影响整个policy的学习，因此也学习不到好的policy。这样可能在某些简单场景下效果还行，但复杂场景下是不行的。

附：为什么在传统RL中这一套共享参数是make sense的，但在LLM领域却是不好的呢？

答：关键传统RL中一般是learn from zero，那么value network和policy network都是从头学的，所以影响不太大。但LLM是先模仿学习出policy，然后试图用rm来纠正这个policy。那么这个policy初始化的value network带来的bias太大，让rm很难纠正。（ps，还有就是底座模型太大，但value头太小了，就一层mlp，这个bias也是确实太大）。

附：改进方案？

实在想共享参数，那就多加几层MLP在policy network上构造value network。

[1] Reinforcement Learning From Human Feedback

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

