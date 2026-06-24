---
title: "百面LLM-52"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/706444920
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-52

> @swtheking | https://zhuanlan.zhihu.com/p/706444920

---

提问：为什么SAC [1]算法在RL届和PPO平分秋色，甚至于略胜一筹，而在LLM届却无人问津？

回答：最近和 @张海抱 吃饭聊天的时候聊到为啥之前在RL届SAC算法在各个游戏benchmark上能比PPO效果还好点，在LLM届甚至关注度远不如PPO，也不如Reinforce系列的算法，如remax [2]，GRPO [3]等。然后我们一起分析了一下整个原始SAC的特点

1）on-policy和off-policy 混合采样，使用整个replay buffer来更新policy。

2）计算Q function，也就是预估整体（s，a）的Q value。

3）Maximize Action Entropy。

其实其中2）和advantage function可能差距不大，3）Maximize Action Entropy其实和PPO的clip操作一致，防止overfit某次过大的reward action，导致action space偏移和原始的action space差距过大，而引发state distribution shift问题。

那么SAC在游戏环境中的优势就是1）更高的样本利用效率，由于和环境交互在原始RL届是很贵的，因此如果能把off-policy samples使用起来，是很吸引人的一种做法。而和3）的结合更加保证了这一部分off policy的samples不会导致state distribution shift问题。这个实际上是对PPO的一种升级，试图将off-policy samples继续利用起来，而保证效果持续提升。

但在LLM届，有点不同，就是sampling没有那么贵，也就是off-policy samples没有那么珍贵。那么off-policy samples带来的收益，完全可以通过on policy多采样完成，而且整体分布还会贴近当前policy的action space。那么效果也会更好。因此SAC并没有受到更多的挖掘～～。

[1] Haarnoja T, Zhou A, Abbeel P, et al. Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor[C]//International conference on machine learning. PMLR, 2018: 1861-1870.

[2] Li Z, Xu T, Zhang Y, et al. Remax: A simple, effective, and efficient method for aligning large language models[J]. arXiv preprint arXiv:2310.10505, 2023.

[3] Shao Z, Wang P, Zhu Q, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models[J]. arXiv preprint arXiv:2402.03300, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

