---
title: "NeurIPS 2024 | DACER：扩散模型与在线强化学习强强联合创造新SOTA！"
author: "Brandon Liu"
source_url: https://zhuanlan.zhihu.com/p/15581456331
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# NeurIPS 2024 | DACER：扩散模型与在线强化学习强强联合创造新SOTA！

> 作者: Brandon Liu | 来源: https://zhuanlan.zhihu.com/p/15581456331

---

本文介绍清华大学智能驾驶课题组（iDLab）在 NeurIPS 2024 发表的最新研究成果《Diffusion Actor-Critic with Entropy Regulator》。该算法创新性地将扩散模型的反向过程作为策略函数，使在线强化学习算法能够产生多模态动作分布。此外，本文提出了基于高斯混合模型的熵正则化方法，显著提升了算法的整体性能。该研究工作由清华大学2023级研究生王以诺在李升波教授指导下完成。

Arxiv地址：https://arxiv.org/pdf/2405.15177

代码链接：https://github.com/happy-yan/DACER-Diffusion-with-Online-RL

一．背景

在线强化学习（Online Reinforcement Learning, Online RL）作为人工智能领域解决复杂序列决策问题的核心方法之一，其应用范围持续扩展。在智能博弈、机器人控制及自动驾驶等传统应用领域取得显著成果的同时，强化学习技术正在大语言模型（Large Language Models, LLM）的微调优化、价值对齐及推理增强等关键环节发挥重要作用。然而在大多数传统的在线强化学习算法中，策略函数通常被参数化为可学习的高斯分布，这限制了它们表达复杂策略的能力。

扩散模型作为一种生成模型因其强大的拟合多模态分布能力而广为人知。它通过逐步添加和移除噪声来学习原始数据分布，在图像和视频生成领域表现出色。在RL中，策略网络可以被视为一种状态条件生成模型。Online RL通过与环境交互来学习控制策略，而Offline RL无需与环境互动，主要从先前收集的数据中学习策略[1]。在实际应用中，许多控制问题都有优秀的模拟器，使用Offline RL并不合适，因为具有互动能力的Online RL表现更佳。然而，扩散模型直接用于Online RL可能遇到的问题包括：

扩散模型的损失函数项本质上是一种模仿学习损失项，但与Offline RL不同，Online RL中并不存在可供模仿的数据；
扩散模型的反向过程无法进行解析求熵，这使得其难以与最大熵强化学习框架相结合，从而导致算法收敛性能不佳。

为了解决上述的问题，清华大学研究团队提出了一种基于扩散模型的在线强化学习算法 DACER（Diffusion Actor-Critic with Entropy Regulator）。我们将DACER建立在去噪扩散概率模型（DDPM）[2]的基础上。受到Kaiming He[3]启发，扩散模型的表示能力主要来源于反向扩散过程而非正向，因此我们将扩散模型的反向过程重新概念化为一种新的策略近似函数，利用其强大的表示能力来提升RL算法的性能。这个新策略函数的优化目标是最大化期望Q值。在RL中，最大化熵对于策略探索至关重要，但扩散策略的熵难以解析确定。因此，我们选择在固定间隔处采样动作，并使用高斯混合模型（GMM）来拟合动作分布，可计算每个状态下策略的近似熵。这些熵的平均值之后被用作当前扩散策略熵的近似。最后，我们使用估计的熵来平衡扩散策略在训练过程中的探索与利用。

DACER的关键技术
2.1 扩散策略表征
将条件扩散模型的反向过程用作参数化策略



采样过程可以重新表述为：






2.2 扩散策略学习
在Online RL中，由于没有可供模仿的数据集，我们放弃了行为克隆项和模仿学习框架。策略学习的目标是最大化由扩散网络在给定状态下生成的动作的期望Q值：



此外，我们使用课题组提出的分布式Q学习[4]的方法来缓解值函数的过估计问题。然而，直接使用上述扩散策略学习方法进行训练时，会因策略动作过于确定性而导致性能不佳。
2.3 扩散策略与熵调节器
对于每个状态，我们使用扩散策略来采样N个动作，然后使用高斯混合模型（GMM）来拟合策略分布。我们可以通过以下方式估计对应于该状态的动作分布的熵[3]：



类似于最大化熵的RL，我们根据估计的熵学习一个参数α：



最终，我们使用下式在训练的采样阶段调整扩散策略的熵。熵调节机制是解锁探索潜能的关键。



综上所述，DACER算法的整体流程为


实验结果
下图为DACER与其他强化学习算法在MuJoCo[6]上的表现对比。图1和表1分别展示了学习曲线和性能策略。在所有评估的任务中，DACER算法始终与所有竞争基准算法的性能相匹配或超越。特别是在Humanoid-v3场景中，DACER相较于DDPG、TD3、PPO、SAC、DSAC和TRPO分别提升了124.7%、111.1%、73.1%、27.3%、9.8%和1131.9%。






为评估策略表征能力，我们将DACER与DSAC、TD3和PPO的性能进行了比较，结果如图2所示。可以看出，DACER的动作倾向于指向不同状态下的最近峰值。DACER的价值函数曲线显示了四个对称的峰值，与之前的分析相符合。相比于DSAC，我们的方法学习到了更优的策略表示，这主要得益于采用扩散模型来参数化策略，而非传统的MLP。相比之下，TD3和PPO的价值函数曲线难以学得四个对称的峰值[7]。总体而言，DACER展示了极佳的策略表征能力。



为展示DACER的多模态能力，我们选择了五个需要多模态策略的点：(0.5, 0.5)、(0.5, -0.5)、(-0.5, -0.5)、(-0.5, 0.5)和(0, 0)。对每个点采样100条轨迹，在图3中绘制。结果显示与DSAC相比，DACER展现了显著的多模态特性。这也解释了为什么只有DACER的Q函数能够学习到几乎完美对称的四个峰值。


总结
本研究中我们提出了一种基于扩散模型的在线强化学习算法 DACER（Diffusion Actor-Critic with Entropy Regulator），旨在克服传统强化学习方法在策略参数化中使用高斯分布的局限性。通过利用扩散模型的反向去噪过程，DACER能够有效地学习多模态分布，使得创建更复杂的策略并提高策略性能成为可能。一个显著的挑战来自于缺乏解析表达式来确定扩散策略的熵，使其难以与最大熵强化学习结合，导致性能不佳。为了解决这一问题，我们采用高斯混合模型（GMM）来估计熵，从而促进了关键参数α的学习，该参数通过调节动作输出中的噪声方差来实现探索和利用的平衡。在MuJoCo基准测试和多模态任务上的实证测试显示了DACER的优越性能。
参考文献

[1] S Eben Li. Reinforcement Learning for Sequential Decision and Optimal Control. Springer Verlag, Singapore, 2023.

[2] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851, 2020.

[3] Saining Xie Xinlei Chen, Zhuang Liu and Kaiming He. Deconstructing denoising diffusion models for self-supervised learning. arXiv preprint arXiv:2401.14404, 2024.

[4] Marco F Huber, Tim Bailey, Hugh Durrant-Whyte, and Uwe D Hanebeck. On entropy approximation for gaussian mixture random vectors. In 2008 IEEE International Conference on Multisensor Fusion and Integration for Intelligent Systems, pages 181–188. IEEE, 2008.

[5] Jingliang Duan, Yang Guan, Shengbo Eben Li, Yangang Ren, Qi Sun, and Bo Cheng. Distributional soft actor-critic: Off-policy reinforcement learning for addressing value estimation errors. IEEE Transactions on Neural Networks and Learning Systems, 33(11):6584–6598, 2021.

[6] Emanuel Todorov, Tom Erez, and Yuval Tassa. Mujoco: A physics engine for model-based control. In Intelligent Robots and Systems, 2012.

[7] Long Yang, Zhixiong Huang, Fenghao Lei, Yucun Zhong, Yiming Yang, Cong Fang, Shiting Wen, Binbin Zhou, and Zhouchen Lin. Policy representation via diffusion probability model for reinforcement learning. arXiv preprint arXiv:2305.13122, 2023.


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-851cce50cba5e82c9fce55a6275063a2_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic3.zhimg.com/v2-695a67feef4a8a293f802fa461659a98_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-7bde3068dedeb4b86f839fb9ddfb30c1_1440w.jpg)

![图片](https://pica.zhimg.com/v2-d041efe1866bd5753a9b990a16e6960a_1440w.jpg)

![图片](https://pica.zhimg.com/v2-af730591a3bc8eabcf2158e1e1852366_1440w.png)

![图片](https://pic1.zhimg.com/v2-146ca66dbf246f7029794dd419e78df2_1440w.png)

![图片](https://pic2.zhimg.com/v2-5b922346ccaf6b08405460de6c6ff5b3_1440w.png)

![图片](https://pic3.zhimg.com/v2-d0f17c41d89f313c5b74d983d468c5f4_1440w.png)

![图片](https://pica.zhimg.com/v2-a08bfd9f1e7eb3ba8cf2db61d1ae167c_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-fa06c46a4db351ca75ae9a8e22e8290e_1440w.png)

![图片](https://pic3.zhimg.com/v2-c8e6e190c12e0991dd2201910029a520_1440w.jpg)

![图片](https://picx.zhimg.com/v2-b57b31ae0e57c63b4c15b0c9e7ed791b_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-d5360bdf22a08e8f794b3b0f9ae98730_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-1c6257b6adeeb1a4714e58f75ef6c565_1440w.jpg)

![图片](https://picx.zhimg.com/v2-9ada9eeee1c9c7780354dd4cd41a097f_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-2b7c11f27a7fd03282819889435815aa.webp)

