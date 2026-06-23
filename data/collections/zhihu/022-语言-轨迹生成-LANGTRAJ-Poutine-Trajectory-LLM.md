---
title: "语言—>轨迹生成：LANGTRAJ、Poutine、Trajectory-LLM"
author: "周舒畅"
source_url: https://zhuanlan.zhihu.com/p/1969362264105648451
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 语言—>轨迹生成：LANGTRAJ、Poutine、Trajectory-LLM

> 作者: 周舒畅 | 来源: https://zhuanlan.zhihu.com/p/1969362264105648451

---

https://arxiv.org/abs/2504.11521

https://arxiv.org/abs/2506.11234

https://proceedings.iclr.cc/paper_files/paper/2025/file/6bbefb73c0ede70635823a18426b9208-Paper-Conference.pdf

<戏剧>

剧名： 语言的轨迹：在代码与现实之间导航

场景： 国际人工智能驱动出行研讨会（International Symposium on AI-Powered Mobility）的圆桌论坛现场。灯光聚焦于四位坐在台上的顶尖学者。

人物：

主持人 (Dr. David Chen): 自动驾驶领域的资深研究员，风格沉稳。(^-^)
Dr. Eleanor Vance: 来自剑桥大学的生成模型专家，对扩散模型有深入研究，思维严谨。(O_O)
Professor Kenji Tanaka: 斯坦福大学人机交互实验室负责人，专注于大型语言模型在物理世界的应用，见解独到。(¬‿¬)
Dr. Anya Sharma: MIT的强化学习与多模态模型研究先驱，充满激情。(*^\^*)/

(论坛开始)

Dr. David Chen (主持人): (^-^) 各位来宾，欢迎来到本次圆桌论坛。今天，我们齐聚一堂，探讨一个自动驾驶领域的核心难题：如何生成既真实可控，又能在复杂、罕见的“长尾场景”中保持鲁棒性的驾驶行为。我们有幸邀请到了三位杰出学者，他们的最新研究——LANGTRAJ、TRAJECTORY-LLM 和 Poutine——为我们提供了三种截然不同却又相互关联的解题思路。让我们从 LANGTRAJ 开始。Dr. Vance，您的团队使用了扩散模型，这在轨迹生成领域已不新奇，但 LANGTRAJ 的独特之处在哪里？

Dr. Eleanor Vance: (O_O) 问得好，David。确实，使用扩散模型生成轨迹已有先例。但它们大多依赖于“测试时指导”（test-time guidance），即在训练后，通过启发式函数或约束来“引导”模型生成期望的轨迹。这种方法的灵活性有限，且需要大量领域知识。LANGTRAJ 的核心突破在于，我们将自然语言指令直接训练阶段就融入了扩散模型的条件中。我们不再是事后引导，而是在模型学习数据分布时，就让它理解“A车礼让B车”或“A车为了转弯而变道”这类高级语义。

Dr. David Chen: (^-^) 这意味着模型本身就学会了语言与驾驶行为之间的映射，而不是被动地被引导。

Dr. Eleanor Vance: (O_O) 完全正确。我们为此构建了 INTERDRIVE 数据集，专门标注了车辆间的交互行为。这使得 LANGTRAJ 能够生成非常细致、符合逻辑的交互场景。大家可以从论文的图1看到，在“文本条件”和“碰撞引导”下，模型生成的场景比无条件生成的要复杂和真实得多。它不仅是一个模拟器，更是一个能理解人类意图的场景生成引擎。

Professor Kenji Tanaka: (¬‿¬) Eleanor 的工作非常启发。LANGTRAJ 在“模拟”层面做到了极致。而我们的 TRAJECTORY-LLM 走了另一条路。我们不直接从语言到轨迹，因为我们发现这中间存在一个巨大的语义鸿沟。一个简单的指令，如“A车超越B车”，背后蕴含着复杂的“驾驶逻辑”（driving logic）。

Dr. David Chen: (^-^) “驾驶逻辑”？请您详细解释一下。

Professor Kenji Tanaka: (¬‿¬) 当然。比如，超车时速度要合理，不能过快；变道时要考虑周围路况和道路宽度。直接从“超车”这个指令生成一连串坐标点，很容易产生不切实际、甚至危险的轨迹。因此，我们提出了一个“交互-行为-轨迹”（interaction-behavior-trajectory）的两阶段翻译流程。第一阶段，LLM将高级的交互指令（如“超车”）分解为一系列带有逻辑解释的原子行为（如“变道：左侧路面足够宽，因此向左变道”）。第二阶段，再将这些具体的行为和逻辑转化为精确的轨迹数据。

Dr. Anya Sharma: (*^\^*)/ 我喜欢这个概念！Kenji，你们 фактически是在让LLM扮演一个“驾驶教练”的角色，它不仅告诉车辆“做什么”，还解释了“为什么这么做”。这为轨迹的真实性和多样性提供了坚实的保障。

Professor Kenji Tanaka: (¬‿¬) 正是如此，Anya。我们通过这种方式，让模型学会了在不同地图拓扑结构下生成合乎逻辑的轨迹。TRAJECTORY-LLM 的目标是成为一个高效的数据生成器，为下游的预测模型提供海量、高质量、多样化的训练数据。

Dr. David Chen: (^-^) 非常精彩。我们有了语言引导的模拟器 LANGTRAJ，和基于驾驶逻辑的数据生成器 TRAJECTORY-LLM。那么，Anya，你们的 Poutine 模型似乎更进一步，它不只是生成场景，而是要直接在这些场景里驾驶。它是一个端到端的驾驶代理（agent）。你们是如何应对那些极端罕见的长尾场景的？

Dr. Anya Sharma: (*^\^*)/ Poutine 的哲学是，我们不需要从零开始构建一个驾驶模型。我们可以站在巨人的肩膀上—也就是预训练的视觉语言模型（VLM）。这些模型从海量互联网数据中学到了丰富的世界知识和常识推理能力。我们的核心思想是，将端到端驾驶视为一个视觉-语言-轨迹（VLT）的序列预测任务。

Dr. David Chen: (^-^) 所以轨迹也被编码成了文本？

Dr. Anya Sharma: (*^\^*)/ 没错！我们把轨迹点序列化为字符串。这样，整个驾驶任务——从看懂图像，理解指令，到生成驾驶解释和最终的轨迹——都统一在了一个自回归的Next-Token Prediction框架下。我们用多样化的数据（日本的常规驾驶数据 CoVLA 和 Waymo 的长尾场景数据 WOD-E2E）对一个现成的3B参数VLM进行预训练，我们称之为 Poutine-Base。但真正的魔法发生在第二阶段：强化学习后训练。

Dr. David Chen: (^-^) 也就是 GRPO 算法。

Dr. Anya Sharma: (*^\^*)/ 对！我们只用了不到500个人类偏好标注的样本，通过 GRPO 算法对模型进行微调。这个过程极大地提升了模型在长尾场景中的表现，使其决策更符合人类专家的偏好。结果非常惊人，Poutine 在2025年Waymo视觉端到端驾驶挑战赛中取得了第一名，并且在RFS（评估者反馈分数）上远超其他方法。这证明了“大规模预训练 + 轻量级RL微调”这条路径在解决鲁棒驾驶问题上的巨大潜力。

Dr. David Chen: (^-^) 感谢三位的精彩分享。总结一下，LANGTRAJ 通过在训练中融入语言，构建了一个强大的交互式场景模拟器。TRAJECTORY-LLM 通过引入“驾驶逻辑”作为中间步骤，成为了一个高质量的数据生成引擎。而 Poutine 则利用VLM的强大能力，并结合强化学习，打造了一个在长尾场景中表现卓越的端到端驾驶代理。三篇论文，分别从模拟、数据和代理三个层面，为我们展示了语言在赋能下一代自动驾驶系统中的核心价值。今天的讨论到此结束，再次感谢三位专！

(全场掌声雷动)

戏剧>

<回答>

综合深度分析报告：LANGTRAJ, TRAJECTORY-LLM, 与 Poutine

这三篇论文共同指向了自动驾驶领域的一个关键发展方向：利用自然语言的强大表征和推理能力，来解决传统方法难以应对的复杂交互、场景多样性和长尾问题。尽管目标一致，但它们的技术路径、核心贡献和应用场景各有侧重，分别代表了语言引导的模拟（Simulation）、语言驱动的数据生成（Data Generation）和语言增强的驾驶代理（Agent）三种范式。

1. LANGTRAJ: Diffusion Model and Dataset for Language-Conditioned Trajectory Simulation

核心思想： 通过在训练阶段直接将自然语言指令作为条件，训练一个扩散模型（Diffusion Model）来联合模拟场景中所有智能体的轨迹，从而实现对交通场景的精细化、语义化控制。

关键贡献：

首个直接语言条件化的交互式模拟扩散模： 核心创新在于改变了以往依赖“测试时引导”的模式。通过在训练时就让模型学习语言-场景-轨迹的联合分布，LANGTRAJ 能更原生、更高效地根据文本指令生成相应的驾驶行为。
INTERDRIVE 数据集： 发布了一个大规模、高质量的交互式驾驶场景数据集。该数据集包含15万个人工标注的交互场景（如汇合、礼让、超车）和额外的启发式单体行为标签，为训练语言条件化模型提供了数据基础。
新颖的闭环训练策略： 提出了一种专为扩散模型设计的闭环训练策略，通过在训练中引入模型自身的生成样本，减少了训练与推理之间的分布偏移，提升了在迭代式（closed-loop）模拟中的真实感和稳定性。

方法论详解：

LANGTRAJ 的架构主要包含：
场景编码器 (Scene Encoder): 采用Query-Centric的方法处理高清地图和历史轨迹，为每个智能体生成一个上下文嵌入。
语言编码器 (Language Encoder): 使用DistillBERT等模型处理文本指令，生成语言嵌入。为了区分指令中的不同角色（如“A车”、“B车”），它使用了“目标智能体”、“其他智能体1”等角色重述技巧。
去噪器 (Denoiser): 一个基于Transformer的模块，它在每个去噪步骤中融合场景上下文、语言条件和带噪声的未来轨迹，逐步恢复出清晰的轨迹。

图表分析：

Figure 1: 这是论文最具说服力的图示。
顶部 (Unconditioned): 展示了没有文本条件时，模型生成的“普通”场景，车辆行为较为平淡。
中部 (Text Conditioned): 在给定如“A1 变道以转弯”等文本指令后，模型能准确生成对应的交互行为。
底部 (Text Cond. + Coll. Guidance): 结合了文本条件和对抗性碰撞引导，模型可以生成稀有的、安全关键的场景（如A1强切入，迫使A2减速），这对于测试自动驾驶系统的极限能力至关重要。

表格解读：

Table 2: Evaluation of LANGTRAJ
Method	Text	Meta↑	Kinematic↑	Interactive↑	Map↑	mADE↓
LANGTRAJ	✗	0.72	0.42	0.79	0.79	2.89
	✓	0.72	0.43	0.80	0.78	2.52
ProSim	✗	0.69	0.42	0.73	0.80	2.73
	✓	0.69	0.42	0.73	0.81	2.35

此表显示，在ProSim-Instruct测试集上，`LANGTRAJ` 在加入文本条件后，mADE（最小平均位移误差）显著降低（从2.89到2.52），证明了其语言可控性。同时，其真实感指标（Meta, Kinematic等）与基线模型ProSim相当，说明在提升可控性的同时未牺牲真实性。

Table 4: Text Conditioning Evaluation
Text Conditioning	Meta↑	Kinematic↑	Interactive↑	Map↑	mADE↓
None	0.72	0.41	0.80	0.80	2.65
Direct Condition (Ours)	0.72	0.42	0.80	0.79	2.29
LLM-Based Guidance	0.70	0.42	0.75	0.80	2.70
这张表直接对比了`LANGTRAJ`的“直接条件化”方法与基于LLM生成引导函数（CTG++风格）的方法。结果清晰表明，“直接条件化”在mADE上表现最好（2.29），远优于无文本（2.65）和LLM引导（2.70），且在真实感指标上保持了最高水平。这证明了其方法的优越性。

总结： LANGTRAJ 是一个强大的、可控的交通场景模拟器。它非常适合用于自动驾驶系统的测试和验证，特别是生成那些难以在真实世界中采集到的、具有特定交互语义的边缘和危险场景。

2. TRAJECTORY-LLM: A LANGUAGE-BASED DATA GENERATOR FOR TRAJECTORY PREDICTION

核心思想： 重新定义了从语言到轨迹的生成过程，引入了一个中间层——“驾驶行为”（driving behavior）和其背后的“驾驶逻辑”（driving logic）。型不再直接映射交互到轨迹，而是遵循一个“交互 → 行为 → 轨迹”的两阶段流程，从而使生成的轨迹更符合人类驾驶习惯和物理规律。

关键贡献：

“交互-行为-轨迹”翻译新范式： 这是该论文最核心的理论贡献。通过将复杂的生成任务分解，引入可解释的中间行为层，极大地提升了生成轨迹的真实性和逻辑一致性。
Traj-LLM 模型： 一个基于LLM的轨迹生成器，能够执行上述两阶段翻译任务，并利用“随机局部性注意力”（random locality attention）机制将文本指令与地图、车辆位置等空间信息有效对齐。
L2T (Language-to-Trajectory) 数据集： 创建了一个包含24万个交通场景的新数据集，每个场景都配有车辆交互、行为逻辑的文本描述以及精确的轨迹数据，为训练这种两阶段模型提供了支持。

方法论详解：

阶段一 (Interaction-Behavior Translation):
输入：高级交互文本（如“A车绕过B车”）+ 地图信息 + 初始轨迹。
过程：LLM接收这些输入，并通过一个创新的“随机局部性注意力”机制，重点关注与交互最相关的地图区域和车辆。
输出：带有逻辑解释的低级行为序列（如“[A车] 变道：左侧有5米宽道路，右侧不足，故选择向左变道。”）。
阶段二 (Behavior-Trajectory Translation):
输入：阶段一生成的行为序列 + 交互文本 + 地图信息。
过程：LLM将这些详细的行为描述翻译成具体的、逐帧的运动参数（位置、速度、朝向）。
输出：最终的车辆轨迹。

该方法中的一个关键公式是随机局部性注意力中的加权特征： \tilde{F}^o_I = F^o_I + \sum_{k=1}^K (\alpha^k_{I \leftrightarrow X} S^{o,k}_{I \leftrightarrow X} F^k_X + \alpha^k_{I \leftrightarrow M} S^{o,k}_{I \leftrightarrow M} F^k_M), \quad \alpha^k_{I \leftrightarrow X}, \alpha^k_{I \leftrightarrow M} \sim \mathcal{N}(0, 1) 这个公式表达了交互特征 F^o_I 如何通过与最相关的 K 个轨迹特征 F_X 和地图特征 F_M 进行加权求和来更新。随机变量 \alpha 的引入为模型增加了一定的随机性（jitter），有助于生成更多样化的轨迹。

图表分析：

由于此文标记为ICLR 2025会议论文且未在arXiv上提供，无法生成其图片链接。但我将根据论文描述其核心图示。

Figure 2 (描述): 这是该论文的核心架构图。它清晰地分为(a)和(b)两个部分，分别对应“交互→行为”和“行为→轨迹”两个阶段。图中会展示文本、地图、初始轨迹如何输入到LLM中，经过随机局部性注意力（RLA）模块处理，先输出行为文本，再将行为文本输入到第二个流程中，最终输出轨迹坐标。这个图直观地展示了其两阶段的核心思想。

表格解读：

Table 1: Realism and Diversity
Method	Realism (Scene, AVG↓)	Diversity (Scene, WD↑)
SNet	6.88	0.00
TSim	9.78	2.92
BITS	5.14	7.27
CTG	7.57	5.70
LGen	7.95	4.02
CTG++	6.17	5.79
Traj-LLM	1.12	13.81
该表展示了`Traj-LLM`在真实感和多样性方面的巨大优势。其场景真实感得分（1.12）远低于其他所有方法，说明其生成的轨迹分布与真实数据极为接近。同时，其场景多样性得分（13.81）也遥遥领先，证明了其生成轨迹的丰富性。

总结： TRAJECTORY-LLM 是一个高效的、高质量的数据生成器。它的主要应用场景是为下游任务（如轨迹预测、行为规划模型的训练）提供海量的、接近真实世界分布的合成数据，从而降低对昂贵的真实世界数据采集的依赖。

3. Poutine: Vision-Language-Trajectory Pre-Training and Reinforcement Learning Post-Training

核心思想： 将端到端自动驾驶视为一个统一视觉-语言-轨迹（VLT）序列预测任务，通过利用大规模预训练视觉语言模型（VLM）的世界知识，并结合轻量级的、基于人类偏好的强化学习微调，来打造一个在复杂、长尾场景中表现鲁棒的驾驶代理。

关键贡献：

简单且可扩展的技术配方： 证明了无需复杂的定制化模块（如特殊的视觉主干或轨迹解码器），仅通过在一个现成的VLM上进行“预训练+RL微调”，就能实现顶级的端到端驾驶性能。
在长尾场景中的卓越表现： 在极具挑战性的Waymo WOD-E2E长尾场景基准测试中获得第一名，充分验证了该方法在处理稀有、安全关键事件时的鲁棒性。
强大的泛化能力： 仅在日本驾驶数据（CoVLA）上训练的模型，能够零样本迁移到美国驾驶场景（WOD-E2E）中，并取得不错的性能，展示了该方法强大的跨域泛化潜力。

方法论详解：

Poutine 的训练流程也分两个阶段：

* 阶段一 (Supervised Fine-Tuning, SFT):

* 数据：混合了常规驾驶场景（CoVLA）和长尾驾驶场景（WOD-E2E）。语言标注由一个更强大的72B VLM自动生成。

* 任务：模型被训练成一个多任务序列生成器，它需要按顺序输出：(1) 关键目标检测结果, (2) 自然语言驾驶解释, (3) 元行为分类, (4) 未来轨迹（编码为文本）。这种链式思考（Chain-of-Thought）的方式有助于提升模型的推理能力。

阶段二 (Reinforcement Learning Post-Training):
算法：使用 GRPO (Group Relative Policy Optimization)，一种基于偏好学习的RL算法。
数据：仅使用WOD-E2E验证集中的479个带有人类偏好评分的轨迹样本。
目标：优化模型，使其生成的轨迹更符合人类专家的偏好。奖励函数 r 由驾驶奖励 r_{\text{drive}} （如RFS分数）和格式奖励 r_{\text{format}} 组成。 r = r_{\text{drive}} + r_{\text{format}} GRPO的目标函数为： J_{\text{GRPO}}(\theta) = \mathbb{E} \left[ \frac{1}{N} \sum_{i=1}^{N} \{ \min[s_1 \cdot A_i, s_2 \cdot A_i] - \beta D_{\text{KL}}[\pi_\theta || \pi_{\text{ref}}] \} \right] 其中 A_i 是相对优势，表示样本 i 在一组生成样本中的相对好坏程度，D_{\text{KL}} 项用于防止模型偏离预训练模型太远。

图表分析：

Figure 1: 清晰地展示了 Poutine 的模型输入（任务描述、导航指令、历史轨迹、多视图图像）和输出（链式思考推理、未来轨迹），以及其两阶段训练流程。底部展示了如何从数据收集（Stage 0），到SFT（Stage 1），再到RL微调（Stage 2）的完整管线，逻辑非常清晰。

表格解读：

Table 2: Results on WOD-E2E test split
Method	RFS+ (Overall) ↑	RFS (Spotlight) ↑	ADE at 5 s (Avg)↓	ADE at 3 s (Avg)↓
Waymo Baseline	7.53	6.60	3.02	1.32
Swin-Trajectory	7.54	6.68	2.81	1.21
AutoVLA	7.56	6.94	2.96	1.35
ViT-Adapter-GRU	7.85	6.67	2.89	1.44
Poutine-Base	7.91	7.04	2.94	1.27
Poutine	7.99	6.89	2.74	1.21

这张表是 `Poutine` 的核心成果展示。最终的 `Poutine` 模型在主要评价指标RFS (Overall)上达到了7.99，显著高于所有其他方法，包括其未经过RL微调的版本 `Poutine-Base`（7.91），证明了RL微调的有效性。同时，它在ADE指标上也取得了并列第一的成绩。

总结： Poutine 是一个强大的端到端驾驶代理。它不模拟场景，也不生成数据，而是直接在给定的视觉和文本输入下做出驾驶决策。它尤其擅长处理那些需要常识推理和快速反应的、非程序化的长尾驾驶场景。

综合对比与未来展望
特性	LANGTRAJ	TRAJECTORY-LLM	Poutine
核心任务	交互式场景模拟	轨迹数据生成	端到端驾驶决策
模型类型	扩散模型 (Diffusion)	大语言模型 (LLM)	视觉语言模型 (VLM) + RL
语言作用	训练时条件，用于控制模拟	核心驱动力，通过两阶段翻译	多模态输入/输出，用于推理和生成
数据集	INTERDRIVE (交互标注)	L2T (交互+行为逻辑)	CoVLA + WOD-E2E (常规+长尾)
创新点	直接语言条件化，闭环训练	“交互-行为-轨迹”范式	“VLM预训练+RL微调”配方
应用场景	自动驾驶系统测试、验证、场景生成	训练下游预测/规划模型	直接部署为端到端驾驶系统

未来展望：

这三篇论文揭示了一个清晰的趋势：语言正在成为连接人类意图与机器行为的核心桥梁。

融合趋势：LANGTRAJ 和 TRAJECTORY-LLM 所生成的高质量、多样化、带语言标注的场景数据，可反过来作为训练 Poutine 这类驾驶代理的宝贵资源。一个未来的强大系统可能会集成这三者的思想：使用 TRAJECTORY-LLM 的逻辑生成海量数据，用 LANGTRAJ 的方法创造特定测试用例，最终用这些数据训练出像 Poutine 一样鲁棒的驾驶代理。
向世界模型演进： 这些工作都可视为构建更完整“世界模型”的雏形。未来的模型不仅要理解当前的场景，还要能基于语言指令进行长远规划、反事实推理（“如果那辆车没有让行会怎么样？”），并生成符合物理和社会规则的、可解释的驾驶行为。
可解释性与安全性：TRAJECTORY-LLM 的“驾驶逻辑”和 Poutine 的“链式思考”都为提升自动驾驶系统的可解释性提供了新的途径。当车辆做出决策时，它可以同时生成一段自然语言解释，这将极大地增强人与车辆之间的信任，也是实现更高等级自动驾驶的关键一步。

总之，三篇论文从不同维度，但一致地强调了将高级语义理解能力融入到自动驾驶任务中的重要性，为该领域未来的发展开辟了激动人心的新方向。

回答>


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://picx.zhimg.com/v2-92540398b61b00a209a829fb19064b8f_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-be2e8f5f8eceb75ff9dcb8a102fd6c1a_1440w.jpg)

![图片](https://pica.zhimg.com/v2-e66141dcaed7b3eb89322b2623716dfe_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-765006a66ae3b8ba6783931f7a1462c7.webp)

![图片](https://pica.zhimg.com/v2-40718a446d48fd41ee1f9fe6c6a9c460_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-fb9e07a1c6431caef8cdeafbee338549_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-3f9caab588405b0423bd4b1bae13f714_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-0ed2a71ef2e5a5884d388b9076478369_250x0.jpg?source=172ae18b)

