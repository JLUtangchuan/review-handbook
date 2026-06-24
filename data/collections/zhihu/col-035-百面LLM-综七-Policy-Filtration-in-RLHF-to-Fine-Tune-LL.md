---
title: "百面LLM，综七，Policy Filtration in RLHF to Fine-Tune LLM  for Code Generation"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/720116346
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综七，Policy Filtration in RLHF to Fine-Tune LLM  for Code Generation

> @swtheking | https://zhuanlan.zhihu.com/p/720116346

---

这是我这半年做的主要的一个在RLHF科研工作，我和 @张海抱 一起完成的对PPO在RLHF领域改进的一个算法。主要的insight来自Llama2的rejection sampling + RLHF和BON一系列的算法。由于我自己是负责整个RLHF的流程，所以我深刻地感受到训练rm过程中，rm score存在特别多的噪声，如下图所示：

如图所示，其实reward分布上来讲，除了最高分阶段（>0.8）和最低分阶段(<-0.8)能和真实的准确率对应上（code任务上就是pass@1）。那么在PPO过程中就会引入大量的reward noise。因此为了减轻这些noise对PPO过程的影响，我们设计了Policy Filtration方式来减轻噪音。这个方法在小模型的各种code任务上效果表现良好，超过了baseline。除此之外我们在论文中还对比了DPO，BOND等各种RLHF变形的算法，证明了模型的有效性。

TL;DR: Reinforcement learning from human feedback (RLHF) is one of the key techniques that helps large language models (LLMs) to follow instructions and provide helpful and harmless responses. While direct policy optimization methods exist, state-ofthe-art LLMs adopt RL-based methods (usually PPO) in RLHF to train the policy to generate good responses guided by a reward model learned from preference data. The main challenge of these methods is the inaccuracy of the intermediate reward model, especially in code generation tasks that require long and complex reasoning to score a response. We find that the reliability of the reward model varies across responses assigned with different rewards. This motivates us to filter the samples whose rewards may be unreliable to improve signal-to-noise ratio during policy learning, resulting in Policy Filtration for Proximal Policy Optimization (PF-PPO). To choose a proper policy filtration strategy for a given reward model, the coefficient of determination (R2) between rewards and actual scores on filtered samples serves as a good metrics and helps us find several promising strategies. We provide extensive experiments to validate the effectiveness of PF-PPO in code generation tasks, and find that some variants of PF-PPO are highly effective and achieve new state-of-the-art performance across 7-billion-parameter models on HumanEval, MBPP, and a new and more challenging LeetCode Contest benchmark.

人类反馈强化学习（RLHF）是帮助大型语言模型（LLMs）遵循指令并提供有用且无害响应的关键技术之一。虽然存在直接的策略优化方法，但最先进的LLMs在RLHF中采用基于RL的方法（通常是PPO）来训练策略，通过从偏好数据中学习的奖励模型引导生成良好的响应。这些方法的主要挑战是中间奖励模型的不准确性，特别是在代码生成任务中，这些任务需要长时间和复杂的推理来对响应进行评分。我们发现，奖励模型的可靠性在分配不同奖励的响应之间有所不同。这促使我们筛选那些奖励可能不可靠的样本，以提高策略学习中的信噪比，从而提出了用于近端策略优化（PPO）的策略过滤（PF-PPO）。为了为给定的奖励模型选择合适的策略过滤策略，使用过滤样本的奖励与实际评分之间的决定系数（R²）作为良好的度量标准，帮助我们找到几种有前景的策略。我们进行了广泛的实验验证了PF-PPO在代码生成任务中的有效性，并发现PF-PPO的某些变体非常有效，在7亿参数模型的HumanEval、MBPP以及一个新的更具挑战性的LeetCode竞赛基准测试中取得了新的最先进性能。

Code：GitHub - swtheing/PF-PPO-RLHF

Paper：https://arxiv.org/pdf/2409.06957

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-7439eb551ec75791f4b1ad352a7b9993_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

