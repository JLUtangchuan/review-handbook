---
title: "百面LLM-49"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/703274156
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-49

> @swtheking | https://zhuanlan.zhihu.com/p/703274156

---

提问：稳定PPO训练的trick有哪些？

回答：

reward normalize：使用历史获得过的所有 reward 的均值和方差进行标准化 [1]。
token KL penalty：限制模型更新方向 [1]。
Critic Model：使用 RM 初始化 Critic，并在 PPO 正式训练之前先进行 Critic 预训练 [1]。
Global Gradient Clipping [1]。
使用相对较小的 Experience Buffer [1]。
Pretrain Loss：在 PPO 训练 loss 中加入 Pretrain Language Model Loss [1]。
按照各个task对不同reward 进行normalize [2]。
训练reward model的时候，加上L2 normalize [2]。


[1] 何枝：【RLHF】怎样让 PPO 训练更稳定？早期人类征服 RLHF 的驯化经验

[2] ChatGLM-RLHF: Practices of Aligning Large Language Models with Human Feedback

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

