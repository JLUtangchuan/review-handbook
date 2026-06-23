---
title: "Diffusion + RL 系列一 （DQL 及其后续发展）"
author: "Zhennan"
source_url: https://zhuanlan.zhihu.com/p/1963075673762555122
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Diffusion + RL 系列一 （DQL 及其后续发展）

> 作者: Zhennan | 来源: https://zhuanlan.zhihu.com/p/1963075673762555122

---

本篇博客算是本人对于过去一年对于 Diffusion RL 的一些探索与经验性总结，后续估计不再深入地做此具体的方向（也不一定hhh），因此希望借此机会，对这一年的研究旅程做一个阶段性回顾。

对于 Diffusion 的部分笔者笔力有限，对基础的知识不打算展开，感兴趣的朋友可以看看 Diffusion Models 基础知识总结回顾 、 https://www.youtube.com/watch?v=wMmqCMwuM2Q 、 What are Diffusion Models? | Lil'Log ，都是我感觉非常好的博客和 video ；

我们都知道，Reinforcement Learning 通常采用 Actor-Critic（AC）架构，而 Diffusion Model 往往承担其中 Actor 网络 的角色。这种对应关系其实非常直观——传统的 Diffusion Model 是在给定条件（condition）下生成与目标分布最匹配的样本；而在 RL 中，Actor 则是根据状态生成最优动作。二者的目标在本质上都可视为“从条件分布中采样最适合的输出”，因此使用 Diffusion Model 来实现 Actor 网络是十分自然的。而动机是 Diffusion Model 比过去的所有生成式模型都有更强大的分布建模能力，因此我们期待看到 Diffusion Model 如何助力 RL 的发展。

最具代表性的工作无疑是 Diffusion Policy，它以监督学习（Imitation Learning, IL）的方式，直接学习从状态到动作的映射。然而这仍属于模仿学习的范畴，本文不做过多讨论。接下来的部分，我将主要聚焦于 Diffusion Model 与强化学习的融合方式，以及这一方向在实践中的一些思考与体会。

本系列预估分为两个分支： DQL 代表的 Q-learning based 的分支以及 DPPO 代表 policy gradient 的分支。这其中会有很多很多其他有价值的工作，由于精力原因也无法一一提及了。本文先主要聚焦于 DQL 与其变种

DQL - Diffusion Q-learning [1]
Offline RL 基础

DQL 是一个经典的 Diffusion Model 与 Offline RL 的结合工作。让我们回顾一下 Offline RL 的目标，我们要求符合两个目标，第一个：使 Q(s,a) 最大； 第二个：policy 分布要和行为策略的 KL 散度尽可能小 （即不要生成 OOD action，否则会崩），故而天然地有下式：

\mathcal{L}=\min \left(-Q(s, a)+\frac{1}{\alpha} D_{K L}\left(\pi_{\theta}(s) \| \pi_{\beta}(s)\right)\right) ........ (公式（1）)

我们假设有一个最优的 policy 分布 \pi^{*} ，损失函数也天然地可以认为是拉进 \pi_{\theta} 和 \pi^{*} 的距离，换句话说： \mathcal{L} = D_{KL}(\pi_{\theta} || \pi^{*}) ，可以简单地解出 Offline RL 的最优 \pi^{*} 的解析形式： \pi^*\propto\pi_\beta\exp(\alpha Q(s,a))

DQL 方法

上述讲过了， Offline RL 的目标就是最大化 Q 时使 policy 的分布 \pi_{\theta} 尽可能地符合收集数据所用的行为策略分布 \pi_{\beta} ,其实后者的目标和 Diffusion Model 的训练目标是一致的，Diffusion Model 的训练目标本质上就是去拟合一个固定的分布，所以我们可以直接将公式（1）改写为：

\mathcal{L}(\theta)=\mathcal{L}_d(\theta)+\mathcal{L}_q(\theta)=\mathcal{L}_d(\theta)-\alpha\cdot\mathbb{E}_{\boldsymbol{s}\sim\mathcal{D},\boldsymbol{a}^0\sim\pi_\theta}\left[Q_\phi(\boldsymbol{s},\boldsymbol{a}^0)\right] ........ (公式（2）)

其中 \mathcal{L}_d(\theta) 就是 Diffusion Model 的优化目标，至于 Diffusion Model 究竟是用 DDPM 还是 DDIM，是用 SDE 还是 ODE 的形式，反而不重要，具体地，在本文中

\mathcal{L}_d(\theta)=\mathbb{E}_{i\sim\mathcal{U},\boldsymbol{\epsilon}\sim\mathcal{N}(\boldsymbol{0},\boldsymbol{I}),(\boldsymbol{s},\boldsymbol{a})\sim\mathcal{D}}\left[||\boldsymbol{\epsilon}-\boldsymbol{\epsilon}_\theta(\sqrt{\bar{\alpha}_i}\boldsymbol{a}+\sqrt{1-\bar{\alpha}_i}\boldsymbol{\epsilon},\boldsymbol{s},i)||^2\right]

CPQL - Boosting Continuous Control with Consistency Policy [2]

论文链接：[2310.06343] Boosting Continuous Control with Consistency Policy

DQL 缺点 / CPQL 的动机

在公式（2）中，其实有一个地方非常地不优雅，在于 \mathbb{E}_{\boldsymbol{s}\sim\mathcal{D},\boldsymbol{a}^0\sim\pi_\theta}\left[Q_\phi(\boldsymbol{s},\boldsymbol{a}^0)\right] 的计算，可以想象，你辛苦反向去噪算出了一个 a^{0}, 然后反传梯度的时候又要经过一条长长的扩散链 （BPTT），这个过程无疑是低效的 ； 而且你又无法去计算中间扩散步的 Q(s,a^k) 【此处 a^{k} 指中间扩散步的噪声动作】。

CPQL 提供了一种干净简单的解法 —— 直接使用 consistency model 不就好了 ？consistency model [3] 是由 songyang 等人提出的、支持单步生成的模型；简单来说，Consistency Model 通过将路径上的所有点映射到同一个终点从而支持单步生成

CPQL 方法：

具体地，就是把 Diffusion Model 换成了单步生成的 consistency model，我们将公式（2）改写为以下的损失函数如下：

\mathcal{L}{(\theta)}=-\mathbb{E}_{s_{t}\sim\mathcal{B},a_{t}\sim\pi_{\theta}}[Q_{\phi}(s_{t},a_{t})]+\eta\mathcal{L}_{c}(\theta) ........ (公式（3）)

\mathcal{L}_{c}(\theta)=\mathbb{E}_{k \sim \mathcal{U}(1, N-1), s_{t} \sim \mathcal{B}, a_{t} \sim \pi_{\beta}, z \sim \mathcal{N}(0, I)}\left[\lambda\left(\tau_{k}\right) d\left(\pi_{\theta}\left(s_{t}, a_{t}^{\tau_{k+1}}, \tau_{k+1}\right), \pi_{\bar{\theta}}\left(s_{t}, a_{t}^{\tau_{k}}, \tau_{k}\right)\right)\right.

\mathcal{L}_{c}(\theta) 为 consistency model 的损失函数 —— 一致性损失，作者在代码中实际上直接使用了 mse loss，即生成 a^{0} 与数据集中 action 的重建损失，并在附录中证明了一致性损失和重建损失的收敛一致性 —— 但实际上无伤大雅，实践表明一致性损失也能跑出让人满意的结果。

CP3ER - Generalizing Consistency Policy to Visual RL with Prioritized Proximal Experience Regularization [4]

论文的链接：2410.00051

（夹带私货的嫌疑hhh，本人参与的文章，导师一作带飞~，如果感觉还okay可以考虑 cite 一下，和 QVPO, DANCER 都是第一批将 diffusion 类的模型应用到在线 RL 的文章）

CP3ER 扩展范式到在线强化学习中

CP3ER 进一步将 CPQL 的范式推广到了在线视觉强化学习中，为什么这种离线的范式可以推广到在线上呢？其实我们发现，Consistency Policy 可以很好地 unified Offline （经典 Offline） 和 Online （最大熵强化学习）阶段的训练目标：

如上图所示，

（1）当你要求你的 policy 接近数据集中的行为策略时，这就是一个 Offline RL ;

（2）当你要求你的 policy 去拟合一个均匀分布时，实际上这就是一个最大熵强化学习的目标 ——【在保证你的 Q 估计最大的前提下，尽可能使你的 policy network 熵值最大，以增强探索】

（3）当你要求你的 policy 去拟合一个在线数据集（实时更新，接收最新的在线交互数据）时，实际上这就是一个 exploration 和 exploition 的 trade off ； 特别地，你可以通过调节 \lambda 的系数，当 λ 大时，bc 项偏大，比较保守；当 λ 小时，bc 项偏小，比较激进；

CP3ER 方法论

到这里我们已经很清楚了，损失函数和 CPQL 差不多，我们将公式（3）进一步改写为：

J(\theta)=\mathbb{E}_{s_t\sim\mathcal{B},a_t\sim\pi_\theta}[\sum_{t=0}^\infty\gamma^tr_t(s_t,a_t)]-\eta\mathbb{E}_{s_t\sim\mathcal{B},a_t\sim\pi_\beta}[\log\pi_\theta(a_t|s_t)] ........ (公式（4）)

最终你想让你的策略保守或者激进，完全取决于你怎么去选择你的参考策略 \pi_{\beta}

（1）\pi_{\beta} 选一个 fix dataset 对应的行为策略，调高 \eta , 这就和 CPQL 没什么区别
（2）\pi_{\beta} 选一个随机策略 （ a \sim \text{env.action_space.sample()} ），调低 \eta （最佳实践是 0.05）, 这就和最大熵强化学习没什么区别

（3）\pi_{\beta} 选一个选一个在线数据集的行为策略，调低 \eta , 这就是 CP3ER 的雏形

（4）进一步的，我们发现，参考策略 \pi_{\beta} 的选择会影响公式（4）的优化难度 ；当参考策略距离最优策略比较远时，上述优化目标需要更多的样本才能收敛到比较好的结果。相反，当策略提升方向与正则化方法一致时，策略的收敛速度会更快。所以，我们提出了一种近端经验优先的加权采样方法——参考策略 \pi_{\beta}不再是一个在线经验回放池（Replaybuffer）中的策略，而是一个优先考虑最近收集的数据的一个策略。简单来说，实现方案是给 Off-policy 的采样做加权，优先考虑最近收集的数据

\beta = \frac{1}{1+\exp{(2\alpha-\alpha \frac{2T}{\Delta t})}}

其中 \alpha 是超参数，在上述设置中，距离当前时刻比较近的样本会被以较高的概率采样，而距离较远的样本采样概率比较低。我们称上述采样方法为近端策略优先。

在值函数的选择上，我们选用了表达能力更强的 Distribution Critic ； 具体地，我们选用了混合高斯分布来建模 Q 函数。

【论文还给出了很多实证分析，包括：为什么可以这么做等，AC 框架对一致性模型训练的潜在影响等】

FQL (FLOW-Q learning) [5]

相信沿着 DQL, CPQL, CP3ER 讲下来，大家看到 FQL 就已经可以预见他在做什么了 —— 用了一个 Flow matching policy 来替代了 Diffusion model

甚至你能立马猜出损失函数长什么样，尽管如此，我感觉 FQL 还是带来了一些新东西

FQL 将 DQL 的损失函数公式（2）进一步改写为：

\mathcal{L}_\pi=\mathbb{E}_{s\sim\mathcal{D}}[-Q_\phi(s,a^\pi)]+\alpha\mathcal{L}_{FLOW}(\theta) ........ (公式（5）)

其中，flow policy 的 loss 被定义为：

\begin{aligned} \mathcal{L}_{FLOW}(\theta) & =\mathbb{E}_{s,a=x^1\sim\mathcal{D}}\quad[\|v_\theta(t,s,x^t)-(x^1-x^0)\|_2^2] \\ & x^0{\sim}N(0,1_d) \\ & t{\sim}Unif([0,1]) \end{aligned}

但在这里，FQL 遇到了和 CPQL 一样的问题，这个 Q_\phi(s,a^\pi) 的梯度反传实在太低效了，虽然 Flow matching 已经极大减小了推理步数，但是仍然无法做到一步到位，这导致了这个梯度反向传播既慢效果又不好 ，见下图：

为了解决这个问题，FQL 提供了一种新的解法，蒸馏一个 one-step 的 ODE policy ，简单来说，这个ODE policy 接收一个噪声和一个状态，然后直接输出动作，这个动作将会蒸馏 Flow policy 的先验。为什么这个 ODE policy 还要接收一个噪声作为输入呢，这是为了模仿 Flow policy 建模多峰分布的能力，可以理解为：同一个 state 在不同的噪声可以映射到不同的动作，以此来彰显 Diffusion Model / Flow matching 的强大多峰建模能力。

自此，pipeline 已经非常清晰，依次： TD error update Q network 、flow loss update bc flow policy、distill loss + q-loss update one-step policy

后面 FQL 还展示了强大的 Offline2Online 的能力，在此不再过多赘述




[1] Wang, Zhendong, Jonathan J. Hunt, and Mingyuan Zhou. "Diffusion policies as an expressive policy class for offline reinforcement learning.", ICLR 2023

[2] Yuhui Chen, Haoran Li, Dongbin Zhao, "Boosting Continuous Control with Consistency Policy", AAMAS 2024 oral

[3] Yang Song, Prafulla Dhariwal, Mark Chen "Consistency Models"

[4] Haoran Li, Zhennan Jiang,Yuhui Chen,Dongbin Zhao "Generalizing Consistency Policy to Visual RL with Prioritized Proximal Experience Regularization", NeurIPS 2024

[5] Seohong Park,Qiyang Li,Sergey Levine, "Flow Q-LearningFlow Q-Learning", ICML 2025


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-420667479c6cb8ac21a9a40c3b34b167_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://pic1.zhimg.com/v2-060044fe45bd016626d98a74c377dcc4_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-ab081a03d76f2c2cb0da6c7eabecceac_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-453b0dc138850199f8af8e616afb9ffc_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-0c32218609bbe2ff0b51663f01c9f66c.webp)

![图片](https://pic1.zhimg.com/v2-7e73e5cb6734fae4619bd787a305a415_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-7f09d05d34f03eab99e820014c393070.png)

![图片](https://pic1.zhimg.com/v2-cfc18179149dffa5d9cf68bafcbffe01_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-3e36d546a9454c8964fbc218f0db1ff8.png)

