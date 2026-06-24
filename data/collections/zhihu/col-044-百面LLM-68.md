---
title: "百面LLM-68"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/715088707
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-68

> @swtheking | https://zhuanlan.zhihu.com/p/715088707

---

提问：PRM(progressive reward model) [1] 和PPO的value network [2]异同如何？

回答：

快问快答：PRM就是global的value network。

PRM: 类似之前RL中state exploration方向的做法：首先利用一个policy （MCTS policy or Q star policy）来充分探索整个Response的token分布空间，对于不同的Response获得rm model的打分，并通过TD-error [2] 反向传播的方式获取token-wised reward。因为Response的分布空间已经被充分的探索，因此state（token）的value已经可以被充分的评估（也就是token-wised reward已经被充分计算出来）。那么PRM充当的是一个state覆盖完全的value network。

value network是覆盖某一个policy可以经过的trajectory的state distribution的PRM。或者认为value network是一个只覆盖部分response 分布的PRM。

PRM对value network的优势：所有state or token被充分探索，token-wised reward分数更准，更容易探索出更高打分的response，在RL sampling阶段有着明显优势。

Value network对于PRM的优势：探索的state的空间较小，需要样本量较少。整体训练和当时训练的policy耦合，不需要单拉出来训练。

（未完待续..., 这个PRM + Reinforce类型的算法和PPO的比较很值得深入讨论～～～～）

[1] Lightman H, Kosaraju V, Burda Y, et al. Let's verify step by step[J]. arXiv preprint arXiv:2305.20050, 2023.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

