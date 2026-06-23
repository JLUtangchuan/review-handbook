---
title: "空间势场法：One-4-all、PBDMP、FlowDrive"
author: "周舒畅"
source_url: https://zhuanlan.zhihu.com/p/1975272224467461447
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 空间势场法：One-4-all、PBDMP、FlowDrive

> 作者: 周舒畅 | 来源: https://zhuanlan.zhihu.com/p/1975272224467461447

---

https://arxiv.org/abs/2303.04011

https://arxiv.org/pdf/2407.06169

https://arxiv.org/pdf/2509.14303

<戏剧> 地点：苏黎世联邦理工学院（ETH Zurich）的一间可以俯瞰城市的各种各样机器人原型的现代化会议室。白板上写满了微分方程和神经网络架构图。

人物：

Oussama Khatib（斯坦福大学教授，人工势场法 APF 的奠基人之一）：身着整洁的西装，眼神锐利，对物理直觉有着执着的追求。
Yann LeCun（纽约大学教授，Meta 首席 AI 科学家）：穿着标志性的深色 T 恤，专注于基于能量的模型（EBM）和表征学习。
Raquel Urtasun（多伦多大学教授，Waabi 创始人）：身穿干练的夹克，专注于自动驾驶和深度学习的实际应用。

(幕启：三人围坐在一张长桌旁，桌上散落着三篇论文的打印稿。Khatib 手里拿着 One-4-All 的论文，嘴角露出一丝复杂的微笑。)

Oussama Khatib: (放下论文，摘下眼镜擦拭) 先生们，女士们，俗话说“时尚是个轮回”，看来机器人学也是如此。1986年我提出人工势场法（Artificial Potential Fields, APF）时，大家还在为避障计算头疼。四十年过去了，这篇 “One-4-All (O4A)” 竟然再次把“势场”带回了舞台中心，而且是用于高维图像导航。

Yann LeCun: (身体前倾，手指敲击着桌面) Oussama，这可不是你当年的势场了。这篇 O4A 的精妙之处在于，它不再是在笛卡尔空间通过显式几何构建势场，而是在自监督学习得到的潜在空间（Latent Space）里通过流形学习（Manifold Learning）来构建。

Raquel Urtasun: (点头) 是的，O4A 解决了一个核心痛点：长期导航（Long-horizon navigation）。传统的端到端方法要么只能做局部反应，要么需要构建庞大的拓扑图（Topological Memory）。O4A 居然声称是 “Graph-free”（无图）的，但在训练时又利用了图的连通性。

Khatib: 没错。让我们看看它是如何定义的。他们通过一个“测地线回归器”（Geodesic Regressor）来预测两个图像嵌入之间的最短路径距离，这实际上就是势场中的吸引子（Attractor）。


Khatib: 看看图 1，(指着投影) 即使没有位姿信息，机器人也能根据图像嵌入的梯度“滑”向目标。

LeCun: 这里的关键是他们的势场函数 \mathcal{P}。它结合了测地线距离 p^+ 作为吸引力，以及对已访问状态的排斥力 p^-。公式如下：

\mathcal{P}(x_t, x_g, \mathcal{B}) = p^+(x_t, x_g) + \sum_{x \in \mathcal{B}} p^-(x_t, x)

这里的 x_t 和 x_g 分别是当前和目标图像的嵌入， \mathcal{B} 是已访问状态的缓冲区。这完全就是一个基于能量的模型（Energy-Based Model）！通过最小化这个能量函数来生成动作。

Raquel: 我觉得有趣的是它的训练过程。它在训练阶段构建了一个临时图 \mathcal{G} 来训练这个 p^+，训练完就把图扔了。这意味着推理时不需要维护图搜索，计算效率极高。这对于我们在自动驾驶中对延迟的苛刻要求很有启发。

Khatib: (指着图 3) 这种可视化的势能面非常直观。深色区域代表低势能。机器人本质上是在流形上进行梯度下降。但是，Oussama 的老问题来了——局部极小值（Local Minima）。虽然他们加了排斥子来把机器人推出死胡同，但这在复杂几何结构中真的足够鲁棒吗？

Raquel: 这正是我要引入第二篇论文 “FlowDrive” 的原因。(拿起 FlowDrive 的论文) 在自动驾驶领域，纯粹的隐式势场是不够的，我们需要显式的规则约束，比如车道线和动态障碍物。FlowDrive 提出了一种能量流场（Energy Flow Field）的概念。

LeCun: (眉毛一挑) 哦？把能量场嵌入到 BEV (鸟瞰图) 特征中？这听起来像是结合了物理先验和深度学习。

Raquel: 正是。现在的端到端自动驶模型通常是一个黑盒。FlowDrive 引入了两个可学习的能量场：风险势场（Risk Potential Field） U_{\text{risk}} 和 车道吸引场（Lane Attraction Field） U_{\text{lane}}。

Raquel: 如图 1© 所示，他们不是直接回归轨迹，而是生成由流场引导的轨迹。这解耦了“意图预测”和“轨迹生成”。

Khatib: 让我看看他们的数学定义。如果不符合物理直觉，我可不买账。

Raquel: (翻到公式页) 风险场是基于高斯核的，给障碍物高能量：

U_{\text{risk}}(u, v) = \sum_{i} \eta \exp \left( - \frac{\|(u, v) - (u_i, v_i)\|^2}{2\sigma^2} \right)

而车道吸引场则非常聪明地利用了横向和纵向距离：

U_{\text{lane}}(u, v) = \frac{1}{2} k_{\text{lat}} d(u, v)^2 + k_{\text{lon}} (L - s(u, v))

Khatib: 嗯… d(u,v) 是横向偏差，s(u,v) 是纵向进程。这实际上是在潜在空间里强行嵌入了一我们控制理论中常用的 cost function。妙就妙在，这些场是端到端学出来的，既保留了语义理解，又有了几何解释性。

LeCun: 而且他们用扩散模型（Diffusion Model）来生成轨迹，条件就是这些流场特征。这不仅仅是势场，这是引导生成（Guided Generation）。看看他们在 NAVSIM 上的表现。

Raquel: 没错，这里有一张表格，FlowDrive 在 EPDMS（扩展预测驾驶员模型得分）上达到了 SOTA。

Method	Backbone	EPDMS \uparrow	NC \uparrow	DAC \uparrow
Transfuser	ResNet34	76.7	96.9	89.9
VADv2	ResNet34	76.6	97.3	91.7
HydraMDP++	ResNet34	81.4	97.2	97.5
Diffusiondrive	ResNet34	84.3	98.0	96.0
FlowDrive(our)	ResNet34	84.9	98.3	96.2
FlowDrive(our)	V2-99	86.3	98.5	97.4

(注：表格数据来自论文 Table 1)

Raquel: 你们看，FlowDrive 仅分数高，而且在 NC (No Collision) 和 DAC (Drivable Area Compliance) 上表现极佳。这证明了引入显式的能量场约束能显著提升安全性。

LeCun: (指着图 2) 这种可视化的确很有说服力。中间的 Flow Field 清晰地指出了哪里是低能量（安全）区域。但是，Raquel，FlowDrive 似乎还是依赖特定任务的训练。如果我有未见过的障碍物组合怎么办？

Khatib: 问得好，Yann。这就要引出第三篇论文了，“Potential Based Diffusion Motion Planning (PBDMP)”。这篇论文试图解决我这一辈子都在对抗的恶魔——局部极小值，并且引入了组合性（Compositionality）。

LeCun: 啊，扩散模型作为优化器。这是我最近非常喜欢的方向。这篇论文的核心思想是：利用扩散模型的去噪过程，来模拟在能量景观中的退火优化（Annealed Optimization）。

Khatib: 传统的 APF 容易在局部极小值，因为它是贪婪的梯度下降。但 PBDMP 将路径规划视为从高斯噪声中去噪出一条轨迹 q_{1:T}。其去噪过程本质上是在优化势能函数 U_\theta。

q_{1:T}^{s-1} = q_{1:T}^s - \gamma \epsilon + \xi, \quad \xi \sim \mathcal{N}(0, \sigma_s^2 I)

\epsilon = \nabla_{q_{1:T}} E_\theta(q_{1:T}, s, q_{st}, q_e, C)

LeCun: 这里的 E_\theta 就是扩散模型学到的能量函数。最美妙的是它的可组合性。如果你有多个约束（比如避开行人 C_1 和避开墙壁 C_2），你可以直接把它们的势能加起来！

E^{\text{comb}}(q_{1:T}, \dots) = \sum_{i=1}^{N} E_\theta(q_{1:T}, s, q_{st}, q_e, C_i)

Raquel: (看着图 1) 这太神奇了。训练时只见过单个障碍物，测试时可以直接叠加势场来处理复杂的“迷宫”或者多机械臂协作。这在传统深度学习中通常属于 Out-of-Distribution (OOD) 问题，模型会直接崩溃。

Khatib: 是的，这解决了传统 APF 难以设计复杂势场的难题，也解决了纯学习方法难以泛化的问题。我们来看看他们关于“运动细化（Refining）”的结果，这是在解决碰撞时的关键步骤。

Env	R=3 (Before/After)	R=5 (Before/After)	R=10 (Before/After)
Maze2D	96.3 / 99.8	95.3 / 99.0	95.8 / 100.0
KUKA	71.3 / 90.0	69.5 / 94.3	69.8 / 94.8
Dual KUKA	45.5 / 69.8	47.3 / 77.3	47.0 / 80.8

(注：表格数据来自论文 Table 1，展示了细化尝试次数 R 对成功率的影响)

LeCun: 数据显示，通过在测试时利用梯度引导采样（Refining），成功率显著提升。这证明了基于梯度的优化在推理阶段依然强大，只要你的梯度来自一个平滑的、学习到的能量流形。

Raquel: 总结一下。O4A 用流形学习把图像导航变成了势场下降；FlowDrive 把物理规则变成了 BEV 空间的流场来引导动驾驶；而 PBDMP 则利用扩散模型的概率性质解决了势场法的局部极小值问题，并带来了组合性。

Khatib: (靠在椅背上，若有所思) 这告诉我，基于物理直觉的“势场”并没有过时。恰恰相反，深度学习赋予了它从数据中构建复杂几何的能力，而扩散模型赋予了它跨越局部极小值的能力。

LeCun: 同意。这就是结构化世界模型（Structured World Models）的未来。我们不再是拟合黑盒，而是在学习能量景观（Energy Landscapes）。

Raquel: 并且让这些景观真正能指导机器人不撞墙、不撞人。这就叫“Embodied AI”（具身智能）的落地。好了，谁想去喝杯咖啡？我请客。

(三人起身，Khatib 顺手将三篇论文叠好放进包里，显然他打算回去给学生们上一课。)

(幕落) </戏剧>

<回答> 这三篇论文（One-4-All, FlowDrive, PBDMP）共同探讨了一个核心主题：如何利用现代深度学习技术流形学习、扩散模型）复兴并增强传统的“人工势场法（Potential Fields）”思想，以解决具身导航和运动规划中的长时程、安全性和泛化性问题。

以下是各篇论文的深入讨论：

1. One-4-All (O4A): Neural Potential Fields for Embodied Navigation
核心贡献：提出了一种无图（Graph-free）的图像目标导航方法。传统的半参数方法需要维护拓扑图，而 O4A 在训练阶段利用自监督学习构建图 \mathcal{G} 来学习环境流形，但在推理阶段仅依赖神经网络。
关键技术：
测地线回归器（Geodesic Regressor）：学习两个图像嵌入之间的最短路径距离，作为势场中的吸引子。
潜在势场：定义了一个包含吸引子 p^+ 和排斥子 p^-（针对已访问状态）的势函数 \mathcal{P}。
自监督学习：无需位姿真值，仅通过图像序列的时间连续性来学习局部度量 d_h。
优势：解决了传统拓扑地图随环境增大而显存爆炸的问题，且推理速度极快（前向传播）。
2. FlowDrive: Energy Flow Field for End-to-End Autonomous Driving
核心贡献：针对端到端自动驾驶缺乏可解释性和几何约束的问题，提出了能量流场（Energy Flow Field）表征。
关键技术：
风险与车道场：显式建模了 U_{\text{risk}}（避障）和 U_{\text{lane}}（车道保持）两个势场，并将这些物理/规则约束编码进 BEV 特征中。
流感知锚点细化（Flow-Aware Anchor Refinement）：利用流场的梯度来初始化和调整轨迹锚点，使其更符合几何约束。
任务解耦：将运动意图预测（Mode prediction）与轨迹去噪（Trajectory generation）在特征层面解耦。
优势：在 NAVSIM 榜单上达到 SOTA，证明了引入显式的物理/语义能量场能显著提升生成轨迹的安全性和合规性。
3. Potential Based Diffusion Motion Planning (PBDMP)
核心贡献：利用扩散模型来参数化运动规划的势场，解决了传统势场法易陷入局部极小值的顽疾，并实现了零样本的约束组合。
关键技术：
扩散即优化：将去噪过程视为在平滑能量景观上的退火优化过程。噪声的逐渐去除对应于从粗糙到精细的势场下降，有效避免了局部极小值。
组合性（Compositionality）：E^{\text{comb}} = \sum E_i。通过直接叠加针对不同障碍物训练的势能函数，可以在测试时处理从未见过的复杂障碍物组合。
优势：展示了极强的泛化能力（如从单障碍物泛化到迷宫），并且比基于采样的传统方法（如 RRT*）在生成轨迹平滑度上有优势。

总结：这三项工作标志着“神经势场（Neural Potential Fields）”的崛起。它们不再依赖人工设计的简单斥力/引力公式，而是通过数据驱动的方式学习高维、复杂的能量景观，同时保留了势场法在实时控制和避障导向上的数学优雅性。 </回答>

人类评论：预测场比预测轨迹稠密的多，对多峰分布友好的多，很有吸引力。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-c1d4c9c4c28b88b10eed8c6cfb41b9f6_1440w.jpg)

![图片](https://pica.zhimg.com/v2-865091f3c9e8de1030e69b903ed0c9d0_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-205f3530defed8f006a9bc5d63cd0a10_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-02374d3ccd8875868ed689e4ea5d4490_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-96af13f3eb1b7740c8b7ec199de05253_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-26ba424f1c3aa9a577fc24c7ef742185.webp)

![图片](https://pic1.zhimg.com/v2-c8800afd80e17be7e40b4ba5b1654cdb_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-bffb2bf11422c5ef7d8949788114c2ab.png)

