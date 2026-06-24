---
title: "百面LLM-46"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/701058776
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-46

> @swtheking | https://zhuanlan.zhihu.com/p/701058776

---

提问：Deepseek math中GRPO [1]和DPO，PPO的关系？

回答：GRPO执行图如下：

他们相对于PPO有两个比较重要的改变

抛弃了PPO的GAE和value-network
选择对于一个Q采样多次，且在这批次内进行reward normalize

对于第一次操作主要目的是为了降低显存占用，这个目的很充分，尤其在很大的模型下，省下不少资源。但带来的弊端就是缺少了token-wise reward的预估，且抛弃了GAE这种TD & MC learning的方式，采取了纯蒙特卡洛采样的方式。那么势必会一定带来很大的gradient预估的variance。那他们后续采用的方式，是在同一个query state s_0下多次采样来降低预估的variance。(这样有点像DPO的方式，DPO降低variance的方式本质也是在同一个query state下进行两次采样进行对比学习)。

从传统RL方向看：GRPO可以对应于Reinforce-baseline-meta learning算法。特殊性在于它把游戏按照query state划分成了多个子游戏，用一个policy分别在不同子游戏内做Reinforce-baseline算法，相当于meta learning版本的Reinforce-baseline算法。

整体在reward model打的reward比较准确下，比DPO采样效率更高，variance更低。比PPO采样效率略低，但节省内存。

附录：给我们一个PPO的改进的方向，也就是在不同query-state下做PPO-meta-learning。

[1] Shao Z, Wang P, Zhu Q, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models[J]. arXiv preprint arXiv:2402.03300, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-a821614abbb7887dee42e5010cf240ad_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

