---
title: "流匹配轨迹生成：FlowDrive、SafeFlow、GoalFlow、TrajFlow"
author: "周舒畅"
source_url: https://zhuanlan.zhihu.com/p/1961123873593483350
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 流匹配轨迹生成：FlowDrive、SafeFlow、GoalFlow、TrajFlow

> 作者: 周舒畅 | 来源: https://zhuanlan.zhihu.com/p/1961123873593483350

---

https://www.arxiv.org/abs/2509.21961

https://arxiv.org/abs/2504.08661

https://arxiv.org/abs/2503.05689

https://arxiv.org/abs/2506.08541

<戏剧>

剧名： 流函数匹配之夜 (Flow Matching Night)

时间： 一个周五的深夜，一场顶级人工智能会议的线上社交活动结束后。

地点： 一场仅限受邀者的 Zoom 虚拟圆桌会议。

人物：

Yann LeCun (杨立昆): 图灵奖得主，深度学习领域的巨擘，Meta 首席 AI 科学家。他手持一杯浓缩咖啡，眼神锐利。
Daniela Rus (丹妮拉·鲁斯): MIT CSAIL 主任，机器人和自主系统领域的权威。她背景是 MIT 的实验室，充满未来感。
Francesco Bullo (弗朗西斯科·布洛): 加州大学圣巴巴拉分校教授，控制理论与机器人运动规划专家。他身后是一块写满了微分方程的白板。

(会议开始)

主持人 (画外音): 欢迎各位，今晚我们来聊一个热门话题：Flow Matching。它似乎正从图像生成领域溢出，大举进入机器人和自动驾驶的世界。我们手头有四篇非常有趣的预印本论文：FlowDrive, SafeFlow, TrajFlow, 和 GoalFlow。Yann，不如从你开始？

Yann LeCun: (扶了扶眼镜) Bien sûr。这是一个非常迷人的趋势。我们看到生成模型正在从“生成好看的猫”进化到“规划安全的路径”。(¬‿¬) 扩散模型（Diffusion Models）虽然强大，但其迭代采样的过程对于需要实时决策的机器人来说，实在是太慢了。Flow Matching，特别是 Rectified Flow，提供了一个更直接、更高效的范式。它试图学习一个从简单先验分布（如高斯分布）到复杂数据分布的“直线”映射。Francesco，你的领域，这不就是最优传输（Optimal Transport）思想的体现吗？

Francesco Bullo: Exactly, Yann! 你一语中的。这几篇论文都建立在一个非常优雅的数学基础上。FlowDrive 的公式 (1) 就完美地阐释了这一点。

x_t = (1-t)z + tx, \quad t \in [0, 1]

这里，z 是高斯噪声，x 是真实的轨迹数据，x_t 则是噪声和真实数据之间的线性插值。模型的目标是学习一个速度场 (velocity field) v_\theta(t, x_t, c) 来预测这个路径的瞬时速度，也就是 x-z。训练的目标函数，如 FlowDrive 的公式 (4) 所示：

\mathcal{L}_{RF}(\theta) = \mathbb{E}_{(x,c) \sim p_{\text{data}}(x,c), z \sim p_0, t \sim \mathcal{U}[0,1]} \left[ w(t) \| v_\theta(t, x_t, c) - (x-z) \|_2^2 \right]

这种方法的妙处在于，一旦 v_\theta 训练好了，理论上我可以通过求解一个常微分方程（ODE）在很少的几步甚至一步内就完成采样。这为实时应用打开了大门。

Daniela Rus: (点头赞同) 这正是 FlowDrive 想要解决的问题。但它更进一步，触及了一个在自动驾驶数据中普遍存在的痛点：长尾分布（long-tailed distribution）。(ಠ_ಠ) 数据集里充满了“直道跟车”的案例，而“紧急避让行人”的场景却凤毛麟角。如果直接用不平衡数据去训练，得到的模型会是一个“循规蹈矩的傻瓜”，在关键时刻掉链子。

Yann LeCun: FlowDrive 提出的数据平衡策略很有意思。他们比较了基于场景标签的重采样（Scenario-based Sampling）和基于轨迹形态聚类的重采样（Cluster-based Sampling）。

Daniela Rus: 是的，你看他们的表 2(a) 就很说明问题。

Method	Score
No weighted sampling	81.91
Scenario-based sampling	80.08
Cluster-based sampling	85.37

结果表明，直接对轨迹的“形态”进行聚类和平衡，比依赖于人类定义的“场景标签”更有效。这给了我们一个启示：让数据自己说话。此外，我非常欣赏他们的“温和引导（Moderated Guidance）”机制。它不是在生成轨迹后再进行暴力修正，而是在 ODE 求解的中间步骤注入微小的、结构化的扰动，比如侧向偏移。

这样，模型就有机会在后续的步骤中将这个扰动“合理化”，使其与场景保持一致，从而生成既多样化又真实可行的轨迹。这是一个非常聪明的“in-the-loop”思想。

Francesco Bullo: (身体前倾，显得很兴奋) Speaking of control and safety, ahem, SafeFlow 这篇论文简直是为我量身定做的！(~_~;) 其他方法通常在规划之后，用一些基于规则的后处理来保证安全，这就像是给系统打补丁。SafeFlow 则是从第一性原理出发，将安全性整合到了生成过程的核心。它的武器是控制屏障函数（Control Barrier Functions, CBFs）。

Yann LeCun: 啊，CBFs。控制理论中的强大工具，用于确保系统状态永远不会离开一个“安全集”。SafeFlow 是如何把它和 Flow Matching 结合的？

Francesco Bullo: 它提出了一个全新的概念：流匹配屏障函数（Flow Matching Barrier Functions, FMBFs）。传统的 CBF 作用于系统的动态方程 \dot{x} = f(x) + g(x)u 。SafeFlow 将 Flow Matching 的 ODE 过程 \frac{d}{dt}\psi_t(\tau) = v_\theta^t(\tau) 视为一个动态系统，并引入一个控制项 u_t 来保证安全：

\frac{d}{dt}\psi_t(\tau) = v_\theta^t(\tau) + u_t

然后，它定义了一个 FMBF 条件，如论文中的公式 (7)，来确保在任何时刻 t，轨迹都朝着安全区域演化，并在最终时刻 t=1 达到安全状态。这个 u_t 是通过求解一个二次规划（QP）问题得到的，目标是最小化对原始速度场的干扰，同时满足安全约束。这是一种“白盒”方法，提供了可证明的（provable）安全性。这与 FlowDrive 的后处理相比，在理论上要坚实得多。

Daniela Rus: Provable safety，这在机器人领域是圣杯。但 Yann，你肯定也关心效率和不确定性问题。TrajFlow 在这方面做得怎么样？

Yann LeCun: TrajFlow 的切入点非常务实。它解决了多模态预测中的一个核心效率问题。传统的生成模型需要独立采样多次才能得到多个候选轨迹，这非常耗时。TrajFlow 设计了一个“Multi-shot”的解码器，一次前向传播就能同时预测出多个（例如 64 个）候选轨迹及其置信度。这对于部署来说是巨大的优势。

它的另一个亮点是引入了基于 Plackett-Luce 分布的排序损失（Ranking Loss）。我们都知道，直接预测的置信度分数往往校准得不好（poorly calibrated）。TrajFlow 不仅让模型预测哪个轨迹最好，还让它对所有候选轨迹进行排序。通过学习这个排序，模型能更好地理解不同轨迹之间的相对好坏，从而输出校准得更好的不确定性。你看它在 WOMD 数据集上的表现：

Method	minADE↓	minFDE↓	Miss Rate↓	mAP↑	Soft mAP↑
EDA [23]	0.5718	1.1702	0.1169	0.4487	0.4596
BeTop [24]	0.5723	1.1668	0.1176	0.4566	0.4678
TrajFlow	0.5714	1.1667	0.1162	0.4604	0.4710

它在 mAP (mean Average Precision) 这项关键指标上达到了 SOTA，这直接证明了其不确定性估计的优越性。

Daniela Rus: 我看到了。这确实非常重要。但是，所有这些方法似乎都面临一个共同挑战：生成模型的输出空间太大了，有时会产生一些天马行空、不符合物理或场景约束的轨迹。GoalFlow 似乎就是为了解决这个问题。


Francesco Bullo: GoalFlow 的想法非常直观，它采用了“由粗到精”（coarse-to-fine）的策略。它不直接生成整条轨迹，而是分两步走： 1. 目标点构建（Goal Point Construction）: 首先，基于场景的 BEV 特征，从一个巨大的目标点词汇表（vocabulary）中预测一个最可能的目标点。这个预测过程同时考虑了与真值的距离和是否在可行驶区域内。 2. 轨迹生成（Trajectory Planning）: 然后，以这个预测出的目标点作为强引导条件（strong guidance），再用 Flow Matching 生成通往该点的轨迹。

Daniela Rus: 这相当于给生成模型戴上了一个“缰绳”。(^_^) 通过首先确定一个合理的目标，极大地约束了轨迹的生成空间，避免了模型“自由发挥”过度而产生无意义的结果。这从系统设计的角度看非常高明。你看它在 Navsim 仿真环境中的表现，尤其是在可行驶区域合规性（SDAC）和最终得分（SPDM）上，远超其他方法。

Method	SNC↑	SDAC↑	STTC↑	SCF↑	SEP↑	SPDM↑
TransFuser [3]	97.7	92.8	92.8	100	79.2	84.0
UniAD [15]	97.8	91.9	92.9	100	78.8	83.4
GoalFlow (Ours)	98.4	98.3	94.6	100	85.0	90.3

它的 SDAC 高达 98.3，这意味着它生成的轨迹极少越界。这是目标点强约束带来的直接好处。

Yann LeCun: 所以，我们看到了四种不同的策略来“驯服”和“强化”Flow Matching。FlowDrive 致力于解决数据偏差；SafeFlow 提供了理论安全；TrajFlow 追求效率和不确定性校准；而 GoalFlow 则通过目标点引导来提升端到端系统的稳定性和合理性。它们共同描绘了一幅激动人心的蓝图。

Francesco Bullo: 是的。未来的方向很明确：如何将这些优点结合起来。我们能否拥有一个既有 SafeFlow 的安全证明，又有 TrajFlow 的采样效率，同时还能像 FlowDrive 那样对长尾数据鲁棒，并采用 GoalFlow 的分层规划思想的规划器？那将是一个非常强大的系统。

Daniela Rus: 毫无疑问。这四篇论文展示了 Flow Matching 作为一个核心引擎的巨大潜力。它不仅是一个数学工具，更是一个可以被深度定制、可以与领域知识（如安全约束、目标导向）紧密集成的框架。未来的自主系统，一定会在这样的基石上建立。What a time to be in robotics! (^o^)/

(会议在热烈的讨论中结束)

戏剧> <回答>

这四篇论文集中探讨了流函数匹配（Flow Matching, FM）这一新兴生成模型在自动驾驶和机器人运动规划领域的应用。它们共享一个共同的基础——利用常微分方程（ODE）学习从简单先驗分布到复杂数据分布的映射，从而实现高效、高质量的轨迹生成。然而，每篇论文都针对该领域的一个特定核心挑战，提出了独特的解决方案。

核心技术：流函数匹配 (Flow Matching)

所有论文均采用了基于矫正流 (Rectified Flow, RF) 的流函数匹配框架。其核心思想是构建一个从标准高斯噪声 z \sim \mathcal{N}(0, I) 到真实数据（轨迹）x 的直线概率路径：

x_t = (1-t)z + tx

模型 v_\theta 的任务是学习该路径上的速度场 v_t = x-z。通过最小化以下损失函数进行训练：

\mathcal{L}_{RF}(\theta) = \mathbb{E} \left[ \| v_\theta(t, x_t, c) - (x-z) \|_2^2 \right]

其中 c 是场景上下文。相比于扩散模型，RF 的优势在于其路径简单（直线）、ODE 求解步数少，因此推理速度快，非常适合实时应用。

分论文深入剖析
1. FlowDrive: 应对数据不平衡与提升多样性

FlowDrive 聚焦于解决真实世界驾驶数据中普遍存在的长尾分布问题和生成轨迹多样性不足的挑战。

核心贡献 1：数据平衡 (Data Balancing)
问题: 训练数据中常见行为（如跟车）远多于稀有但关键的行为（如变道避障），导致模型偏向于保守、平庸的决策。
方案: 论文比较了两种数据采样策略：基于场景标签的重采样和基于轨迹形态聚类的重采样。实验（如下表）证明，后者通过对归一化后的未来轨迹进行 K-Means 聚类，并对稀有类别的簇进行过采样，能更有效地提升模型在关键场景的表现。

核心贡献 2：温和引导 (Moderated Guidance)
问题: 如何在不破坏场景一致性的前提下，系统性地增加生成轨迹的多样性。
方案: 提出一种“在环路中（in-the-loop）”的引导机制。在 ODE 求解的中间步骤，对当前轨迹点施加一个小的、结构化的扰动（如沿法线方向的侧向偏移）。由于该扰动发生在生成过程中，模型可以在后续的求解步骤中进行调整，使其与环境约束（如车道线）相适应，从而生成既多样又可行的轨迹。
2. SafeFlow: 追求可证明的安全性

SafeFlow 的目标是将形式化的安全保证内生地融入到流函数匹配的生成过程中，而不是依赖于后处理。

核心贡献：流匹配屏障函数 (Flow Matching Barrier Functions, FMBFs)
问题: 传统的学习型规划器缺乏严格的安全保证，其安全性通常通过大量测试来间接验证。
方案: 论文从控制理论中的控制屏障函数 (Control Barrier Functions, CBFs) 汲取灵感，提出 FMBFs。它将 FM 的 ODE 求解过程看作一个动态系统，并引入一个额外的控制项 u_t 来修正速度场 v_\theta： \dot{\psi}_t = v_\theta(\psi_t) + u_t
u_t 通过求解一个实时二次规划（QP）问题得到。该 QP 问题的目标是在满足 FMBF 所定义的安全性约束（确保轨迹状态始终在预定义的安全集内演化）的前提下，最小化 u_t 的范数，即对原始生成过程的干扰。这种方法为生成过程提供了可证明的安全性 (provable safety)，在机器人和自动驾驶等安全关键领域具有重大价值。
3. TrajFlow: 关注多模态预测效率与不确定性

TrajFlow 致力于解决自动驾驶多模态运动预测中的两大实际挑战：推理效率和不确定性校准。

核心贡献 1：多样本单次生成 (Multi-shot Prediction)
问题: 为捕捉未来运动的多种可能性，传统方法需要多次独立运行生成模型，计算成本高。
方案: 设计了一种基于 Query 的解码器架构，通过一次前向传播，能够并行地生成多个（例如 64 个）候选轨迹，极大地提升了多模态预测的效率。
核心贡献 2：基于 Plackett-Luce 的排序损失
问题: 模型输出的置信度分数往往校准不佳，即分数高低不能准确反映预测的真实好坏。
方案: 引入了基于 Plackett-Luce 模型的排序损失函数。除了预测每个轨迹的置信度外，模型还被训练去学习所有候选轨迹相对于真实情况的正确排序。这迫使模型去理解不同轨迹间的相对优劣，从而产出校准更佳的置信度分数，在 Waymo 公开数据集的关键指标 mAP 上取得了当前最佳性能。
其他贡献: 还提出了自调节 (Self-conditioning) 训练技巧，以缓解模型在 t 接近 1 时（此时输入与输出高度相似）的过拟合问题。
4. GoalFlow: 探索端到端系统中的稳定生成

GoalFlow 旨在将 Flow Matching 嵌入到一个端到端的自动驾驶框架中，并通过引入目标点引导来解决生成模型输出发散、不稳定的问题。

核心贡献：目标驱动的二级生成框架 (Goal-Driven Two-stage Generation)
问题: 在没有强约束的情况下，直接使用生成模型进行端到端规划，容易产生偏离可行驶区域或不符合意图的轨迹，导致系统不稳定。
方案: 论文提出一个“由粗到精”的规划流程：
目标点构建: 基于多传感器融合的鸟瞰图（BEV）特征，首先从一个预先构建的密集目标点词汇表中，预测出最优的短期未来目标点。该预测同时考虑了位置准确性和可行驶区域合规性。
目标引导的轨迹生成: 将预测出的目标点作为强条件，引导 Flow Matching 模型生成一条通往该点的具体轨迹。
这种方法通过一个明确的中间目标（目标点）极大地约束了生成模型的搜索空间，确保了最终生成轨迹的高质量和高合规性。在 Navsim 仿真基准测试中，该方法在整体性能，尤其是在可行驶区域合规性（SDAC）指标上，大幅超越了现有方法。
综合比较与展望

下表总结了四篇论文的核心异同：

论文	核心问题	主要贡献	方法特点	应用场景/基准
FlowDrive	数据不平衡、多样性不足	数据平衡策略、温和引导机制	关注训练数据分布和在环引导	轨迹规划 (nuPlan)
SafeFlow	缺乏可证明的安全性	流匹配屏障函数 (FMBFs)	理论驱动、白盒安全、形式化方法	通用机器人运动规划
TrajFlow	多模态预测效率低、不确定性校准差	多样本单次生成、排序损失	提升效率和预测质量、关注不确定性	运动预测 (WOMD)
GoalFlow	端到端生成不稳定、轨迹发散	目标驱动的二级生成框架	系统集成、强约束引导、由粗到精	端到端自动驾驶 (Navsim)

展望: 这四篇论文共同揭示了 Flow Matching 作为下一代运动规划与预测模型核心引擎的巨大潜力。它们分别从数据、安全、效率和系统集成等不同维度，为“驯服”和“强化”这一强大的生成工具提供了宝贵的思路。未来的研究方向极有可能在于融合这些工作的优点：构建一个既能利用 SafeFlow 的形式化安全保证，又能达到 TrajFlow 的高效多模态预测，同时像 FlowDrive 一样对数据长尾分布具有鲁棒性，并采用 GoalFlow 的分层规划思想来确保端到端系统稳定性的综合性自主驾驶规划器。


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-0c3f8dd786a3cd7b77068907efa55ea5_1440w.jpg)

![图片](https://picx.zhimg.com/v2-db34d9e8758ee9d0267f9e0897e9b135_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-1c0222116723ee0748fc155c9899f11a_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c1a24f717a5209748dece5d586f6cad9_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-45e6be074d1320154ebe1bbceb4eb976_1440w.jpg)

![图片](https://pica.zhimg.com/v2-0ff415c0241974867047615623b23dd0_1440w.jpg)

![图片](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4ba0f0d3131d357ddb3e9bf89893cbc1.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-f028c7c1961ddce928e8b9e3addf1993.webp)

![图片](https://pic1.zhimg.com/v2-cfcc05c24e88159524b55271bbe6d12b_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-4e025a75f219cf79f6d1fda7726e297f.png)

![图片](https://pic1.zhimg.com/v2-66fa431105e25cc7a1f0a8d0e30ea816_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

![图片](https://pica.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-66fa431105e25cc7a1f0a8d0e30ea816_l.jpg?source=06d4cd63)

