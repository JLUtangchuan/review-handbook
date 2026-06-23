---
title: "[自动驾驶] SparseDriveV2 论文阅读报告"
author: "这个是网名"
source_url: https://zhuanlan.zhihu.com/p/2025175020712857922
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# [自动驾驶] SparseDriveV2 论文阅读报告

> 作者: 这个是网名 | 来源: https://zhuanlan.zhihu.com/p/2025175020712857922

---

本报告来源于：paper-reading-skill；欢迎大家收藏使用该SKILL
0. 基本信息
论文标题：SparseDriveV2: Scoring is All You Need for End-to-End Autonomous Driving
作者：Wenchao Sun, Xuewu Lin, Keyu Chen, Zixiang Pei, Xiang Li, Yining Shi, Sifa Zheng
机构：Tsinghua University；Horizon Continental Technology；Horizon
来源（会议 / arXiv / 期刊）：arXiv 预印本（cs.CV）
年份：2026
原始输入链接：https://arxiv.org/abs/2603.29163
最终使用的 arXiv 版本号 / ID：2603.29163v1
原论文 arXiv 链接：https://arxiv.org/abs/2603.29163v1
幻觉翻译链接（hjfy）：https://hjfy.top/arxiv/2603.29163v1
Cool Papers 链接：https://papers.cool/arxiv/2603.29163v1
代码链接：https://github.com/swc-17/SparseDriveV2
论文研究方向：端到端自动驾驶；多模态规划；scoring-based planning；静态轨迹词表扩展
本文一句话概括：本文把未来轨迹拆成“几何路径 + 速度曲线”两套词表，并用“先分解粗筛、再组合重评分”的两级评分流程，把静态规划词表扩展到 262,144 条候选轨迹，从而在不做动态轨迹生成的前提下刷新 NAVSIM 和 Bench2Drive 上 scoring-based planning 的成绩。
1. 论文核心观点与主张的系统梳理
1.1 研究背景与动机

端到端自动驾驶中的规划模块天然具有多模态性：同一个场景中，跟车、轻微绕行、保守减速等多条未来轨迹都可能是合理的。现有工作大致分为两类。第一类是静态词表打分，即先从数据里聚类出一批轨迹 anchor，再让网络对全部候选打分；第二类是动态生成 proposal，包括回归式 proposal refinement、扩散模型、flow matching 等。前者简单、结构清晰，但常被批评“动作空间太粗”；后者更细粒度，但通常需要更复杂的生成器和更高的推理成本。

这篇论文的动机不是继续把生成器做得更强，而是反问一个更基础的问题：动态生成真的“必需”吗？作者给出的切入点是，很多人把静态词表方法表现不够强，归因为“固定词表天花板低”；但也可能真正的原因只是“词表还不够密”。为此，论文先用 Hydra-MDP 做了一个 scaling study。

Hydra-MDP 静态 anchor 数	NAVSIM v2 EPDMS	GPU 训练显存（MB）	相比上一档增益
1024	85.02	9531	-
2048	85.80	11451	+0.78
4096	86.33	15513	+0.53
8192	86.78	23261	+0.45
16384	87.35	38877	+0.57
32768	OOM	OOM	-

这个表支持了论文最关键的观察：在 1024 到 16384 的范围内，性能持续提升，并没有出现明显饱和；真正先撞到的是显存和算力约束，而不是方法本身的表达极限。因此作者把问题重写为两个更具体的技术目标：

如何用更紧凑的表示，构造一个远比传统 8192 anchor 更密的轨迹词表。
如何在不把计算量炸掉的前提下，对这个超密候选集合进行有效打分。
1.2 问题设定

论文采用标准的 scoring-based planning 设定：输入当前传感器观测 o_t，在预定义候选集合 \mathcal{T} 中挑出最优轨迹。式 (1) 定义了这个核心决策：

\tau^{*} = \arg\max_{\tau \in \mathcal{T}} s(\tau, o_t)

这条公式在这里负责什么：把规划问题写成“候选排序”而不是“直接回归唯一轨迹”。
符号说明：o_t 是当前场景观测；\mathcal{T} 是轨迹词表；s(\tau, o_t) 是评分网络输出的轨迹质量分数。
自然语言翻译：系统先准备许多可能的未来，再由网络选择当前场景下最值得执行的一条。
工程映射：scene encoder -> candidate scorer -> top-1 trajectory。
如果没有这一步：SparseDriveV2 的 path/velocity factorization、粗筛、重评分就没有统一的优化目标。

在这个设定下，论文的真正问题不是“怎么生成一条更炫的轨迹”，而是“怎么以可扩展的方式枚举并筛选足够密的候选集”。因此它瞄准的是 selection paradigm 的上限，而不是 generation paradigm 的表达力上限。

1.3 核心观点（Claims）的逐条梳理
主张 ID	主张内容	显式或隐含	原文位置	证据类型	结论强度
C1	静态词表方法的主要瓶颈不是范式本身，而是词表密度受算力约束过小。	显式	引言 + scaling study 表	主实验	部分支持
C2	将轨迹分解为几何路径与速度曲线，可以用组合方式大幅扩展动作空间覆盖率。	显式	方法 §3.2-§3.3	方法设计 + 主实验	部分支持
C3	先做 path/velocity 粗评分，再对小规模组合轨迹做精评分，可以把超密词表的计算量压回可行范围。	显式	方法 §3.4 + 消融	方法设计 + 消融实验	部分支持
C4	在当前 NAVSIM 与 Bench2Drive 基准上，高密度 scoring-based planning 足以达到甚至超过动态生成方法。	显式	实验 §4	主实验	强支持

对这四条主张需要区分证据边界：

C1 并没有被“理论证明”，只是被 Hydra-MDP 的实证 scaling study 支持到 16384 anchor 为止。
C2 的“覆盖率更强”主要来自组合构造和 benchmark 结果，论文没有直接给出几何覆盖率统计或轨迹分布覆盖可视化。
C3 在实验上是可信的，因为消融表明确表明 deformable aggregation 与 trajectory re-conditioning 都有增益；但论文没有报告完整的推理时延、FLOPs 或显存曲线。
C4 是证据最闭环的一条：作者给出了 NAVSIM v1、NAVSIM v2、Bench2Drive 和能力分项上的直接结果。
1.4 创新性与贡献边界

这篇论文的创新不在于提出一种全新的端到端驾驶范式，而在于把“静态词表太粗”的老问题重新建模成一个可扩展组合问题。具体来说，它有两条真正的机制性贡献：

词表表示从“整条时空轨迹”改成“路径词表 × 速度词表”，从而把 8192 个 monolithic anchor 扩展成 1024 \times 256 的组合词表。
评分流程从“对所有完整轨迹逐个打分”改成“先对路径和速度分别粗筛，再对少量组合轨迹细评分”，把计算预算集中在最有希望的候选上。

但它的贡献边界同样很清晰：

它不是对“动态生成完全无用”的理论反驳，只是在当前两个 benchmark 上证明“动态生成并非唯一高性能路径”。
它没有提出新的世界模型、显式规则推理器或闭环控制器；scene encoder 仍延续 SparseDrive 的轻量风格。
它也没有证明 factorization 是唯一最优分解方式；路径/速度只是一个合理且工程上可组合的选择。
2. 关键论据、理论基础与数学方法的深度解析
2.1 理论基础与学术渊源

SparseDriveV2 所在的技术脉络非常清楚。

首先，它直接承接 scoring-based planning 这条线。VADv2 把端到端驾驶写成概率规划问题；Hydra-MDP 用多教师蒸馏与多头轨迹打分提升多模态规划；DriveSuprim 进一步强化 coarse-to-fine 的精准筛选能力。这条线的共同假设是：只要候选集足够好，打分器就可以比直接回归更安全、更可控。

其次，它又正面回应 dynamic generation 这条线。DiffusionDrive、DiffusionDriveV2、GoalFlow、iPad 的核心逻辑都是：静态词表太粗，必须通过条件生成或 proposal refinement 才能获得足够细粒度的候选。SparseDriveV2 接受了“候选覆盖率决定上限”这一共识，但拒绝把“生成器”当成唯一实现路径。

从理论性质上看，这篇论文不是基于新的概率建模定理或最优化结论，而是基于一个结构化归纳偏置：驾驶轨迹可以近似拆分成“去哪儿”和“多快去”两个相对独立的部分。这个归纳偏置本身并不新，但它被作者嵌入到一个可训练、可组合、可筛选的规划系统里，形成了完整方法。

2.2 问题形式化与建模选择

论文把未来轨迹 \tau 分解为几何路径 p 和速度序列 v。其中，路径只描述空间几何，速度只描述时间推进。式 (2) 给出速度曲线的提取方式：

v_t = \frac{\sqrt{(x_t - x_{t-1})^2 + (y_t - y_{t-1})^2}}{\Delta t}

这条公式在这里负责什么：把原始轨迹里的时序推进信息抽出来，变成一个独立的速度 profile。
符号说明：(x_t, y_t) 是时刻 t 的 ego 位置；\Delta t 是固定采样间隔；v_t 是该时间段平均速度。
自然语言翻译：速度序列只关心“每一拍走多快”，而不关心“空间路径长什么样”。
工程映射：可以先从 demonstration trajectory 计算速度，再单独对速度序列做聚类得到 velocity vocabulary。
若删除该分解：轨迹就只能作为整条时空曲线整体聚类，词表规模会更快撞上显存和打分成本上限。

一个极简 toy example 可以帮助理解。假设 \Delta t = 0.5 秒，轨迹点为 (0,0) \rightarrow (1,0) \rightarrow (2,0)，那么两段位移都为 1 米，于是速度序列就是 [2, 2] m/s。如果把空间路径换成一条向左转的小弧线，但每 0.5 秒的累计前进距离仍近似相同，那么它可以复用同一个 velocity anchor，而只更换 path anchor。

式 (3) 则把路径与速度重新组合回轨迹：

s_t = \sum_{k=1}^{t} v_k \Delta t,\qquad \tau = \mathcal{C}(p, v)

这条公式在这里负责什么：先根据速度累加出“当前时刻沿路径已走多远”，再沿着路径插值得到当前位置。
符号说明：s_t 是时刻 t 的累计路程；\mathcal{C}(p, v) 是路径与速度的组合算子。
自然语言翻译：路径负责给出道路几何骨架，速度负责决定在这条骨架上推进到哪里。
训练 / 推理中的作用：这使得作者可以先独立筛选 path 与 velocity，再只对组合后的少量轨迹做重评分。
强假设：它默认路径几何与速度演化在一阶上可以拆开建模，真正的强耦合关系留给后续 re-conditioning 去弥补。

这套建模选择有明显优点，也有明显风险。优点是组合数暴涨、存储成本不按同样速度暴涨；风险是路径和速度并不总是可独立组合，例如急弯与高速通常天然不兼容。作者后面用 trajectory re-conditioning 来缓和这个问题，但并没有完全消除这一建模假设。

2.3 核心推导与算法构造

下面这张总览图最能概括 SparseDriveV2 的方法结构。

图中可以清楚看到三个阶段：先把轨迹分解成 path 与 velocity；再构造超密组合词表；最后执行 coarse factorized scoring 和 fine-grained trajectory scoring。

式 (4) 定义了它的组合词表：

\mathcal{T} = \{ \tau_{i,j},\; \tau_{i,j} = \mathcal{C}(p_i, v_j),\; p_i \in \mathcal{P},\; v_j \in \mathcal{V} \}

这条公式在这里负责什么：把两个较小的词表提升成一个超大的组合候选空间。
符号说明：\mathcal{P} 是路径词表；\mathcal{V} 是速度词表；\tau_{i,j} 是两者组合出的轨迹。
自然语言翻译：不是直接存 26 万条完整轨迹，而是只存 1024 条路径和 256 条速度模板，使用时再按需组合。
工程映射：可以把 path embedding 与 velocity embedding 预编码，再做 top-K 筛选和笛卡尔积组合。
如果没有这一步：词表扩展只能靠把 monolithic anchor 继续堆大，马上重现 Hydra-MDP scaling study 里的 OOM 问题。

在 NAVSIM 的主设置里，N_p = 1024、N_v = 256，因此完整候选空间为 262,144 条轨迹。为了让这个数量级可算，作者没有直接对全部组合做精评分，而是先分别给路径和速度打 coarse score，再选 top-K：

\mathcal{T}_{\mathrm{coarse}} = \{ \mathcal{C}(p_i, v_j),\; p_i \in \mathcal{P}_{K_p},\; v_j \in \mathcal{V}_{K_v} \}

在 NAVSIM v1 中，第一层保留 128 条 path 与 64 条 velocity；第二层进一步收缩到 20 条 path 与 20 条 velocity，最终只有 400 条组合轨迹进入精评分。也就是说，最终 expensive trajectory-level reasoning 的对象从 262,144 条降到了 400 条，压缩倍率约为 655 倍。这是整篇论文最重要的复杂度控制点。

这一步背后的逻辑可以写成一句工程直译：先用 path scorer 过滤“往哪去明显不合理”的几何骨架，再用 velocity scorer 过滤“速度模式明显不合理”的时序推进，最后只在高概率组合上做高成本精判。这个逻辑并不是定理，而是由模型结构直接推出来的复杂度分层。

论文接着指出，简单把 path embedding 和 velocity embedding 相加，隐含了“路径与速度独立”的假设。为弥补这一点，作者引入 trajectory re-conditioning：组合后的 trajectory embedding 继续和 scene feature 做一次 interaction，再输出最终 trajectory score。这个 re-conditioning 是必要的，因为“急弯 + 高速”之类的失配只有在联合时空语境下才能显式暴露。

式 (5) 给出了训练损失的总体结构：

\mathcal{L} = \mathcal{L}_{\mathrm{path}} + \mathcal{L}_{\mathrm{vel}} + \mathcal{L}_{\mathrm{traj}} + \alpha \mathcal{L}_{\mathrm{metric}}

这条公式在这里负责什么：同时监督 coarse 路径打分、coarse 速度打分、fine trajectory 打分和 rule-based metric distillation。
符号说明：\mathcal{L}_{\mathrm{path}} 与 \mathcal{L}_{\mathrm{vel}} 是基于软标签的分类损失；\mathcal{L}_{\mathrm{traj}} 是轨迹级 imitation-style soft classification；\mathcal{L}_{\mathrm{metric}} 是教师规则分数的 BCE 监督。
自然语言翻译：作者不是只让模型学“像人开”，还让它学 benchmark 里的安全、舒适、规则合规等指标分数。
代码中的典型对应：soft target over clustered anchors + metric sub-score prediction。
若删掉 metric supervision：方法会更接近纯 imitation 的 trajectory ranking；作者明确说明 Bench2Drive 就没有使用 metric-based supervision。

这说明 SparseDriveV2 的收益不只来自词表结构，也来自 supervision design。换言之，它并不是一个“只改候选集合、其他都不动”的干净因果实验；它同时利用了多级打分与规则蒸馏。

2.4 理论结论的适用范围

这篇论文的方法论结论成立范围比较明确。

首先，它证明的是 benchmark-level sufficiency，而不是范式层面的 necessity。也就是：在 NAVSIM 与 Bench2Drive 上，一个足够密、足够会筛的 scoring-based planner 可以非常强；但这不等于动态生成在更开放、长时域、强导航约束场景中一定不再必要。

其次，它的方法依赖 path/velocity 的可分解性。这个假设在车道跟随、转向、跟车等常见场景中是合理的，但在高阶交互、长时导航、极端规避等情形中可能会变脆。论文的 failure case 也确实指向导航信息不足，而不是纯粹的轨迹平滑问题。

最后，作者没有给出覆盖率、收敛性、最优性或 coarse stage recall 的理论保证。换句话说，论文的强项是结构设计和 benchmark 实证，而不是理论闭环。

3. 实验设计与实验结果的充分性分析
3.1 实验目标与论文主张的对应关系
实验组	对应主张	是否充分验证	缺失项
Hydra-MDP scaling study	C1：静态词表瓶颈主要是密度与算力，而非范式本身	部分充分	只验证到 16384 anchor；基于外部 baseline 而非 SparseDriveV2 自身
NAVSIM v1 leaderboard	C4：scoring-based 方法可达 SOTA	充分	缺少 latency / FLOPs
NAVSIM v2 leaderboard	C2 + C3 + C4：高密词表与两级打分能提升更严格评测指标	较充分	与部分 baseline 的 corrected EPDMS 不可完全横向对齐
Bench2Drive main result	C4：方法可跨 benchmark 泛化	较充分	设置与 NAVSIM 显著不同，不能直接说明单一机制迁移
Bench2Drive ability result	C4：能力分项具有稳定收益	部分充分	没有分场景失败诊断
词表扩展消融	C2：组合词表确实有效	较充分	未报告覆盖率或候选召回率
评分模块消融	C3：DFA 与 re-conditioning 有效	较充分	没有完整速度 / 显存 / 时延代价分析

从这个矩阵看，论文的证据链对“结果强”是闭环的，但对“为什么一定是这个机制导致的”仍有一些未闭环部分，尤其缺少 coverage、latency 和 coarse recall 这些更直接的诊断量。

3.2 实验设置合理性

论文选用的两个 benchmark 都是当前端到端自动驾驶规划中较有代表性的公开评测。

NAVSIM：使用 navtrain（1192 个训练场景）与 navtest（136 个评估场景），同时报告 NAVSIM v1 与 NAVSIM v2。
Bench2Drive：220 条测试路线、44 类交互场景，是更接近闭环驾驶能力的 CARLA 基准。

NAVSIM 的主配置是这篇论文最干净的实验设置：ResNet-34 backbone，输入三路相机，图像分辨率 256 \times 512，路径词表 1024 个、速度词表 256 个，规划时域 4 秒。这里的组合词表规模与方法核心完全一致，因此 NAVSIM 结果最能支撑本文主张。

Bench2Drive 则明显更“工程化”：作者改用 ResNet-50、六路相机、两阶段训练，并加入检测、在线地图和运动预测等辅助任务。更重要的是，附录明确说明 Bench2Drive 不使用 metric-based supervision，而是纯 imitation learning。这意味着：

Bench2Drive 结果确实说明该方法思想能迁移到另一个闭环 benchmark。
但它不能被解读为“完全相同的 SparseDriveV2 配方在两个 benchmark 上都一样成立”，因为 backbone、输入、辅助任务和训练 recipe 都变了。

评测指标方面，论文把 PDMS / EPDMS 作为核心目标，这本身是合理的，因为它们综合了安全、进度、合规与舒适等维度。不过论文在 NAVSIM v2 的公式与表头符号之间有一个小的不一致：正文公式使用 C 与 EC，表格列名却写成了 HC 与 EC。这不影响主结论，但说明论文在指标记号上还不够严整。

3.3 实验结果的解释力度

先看 NAVSIM v1 的关键竞争结果。

方法	Backbone	EP	PDMS
DriveSuprim	ResNet-34	86.7	89.9
DiffusionDriveV2	ResNet-34	87.5	91.2
iPad	ResNet-34	88.0	91.7
Hydra-MDP	V2-99	86.5	90.3
GoalFlow	V2-99	85.0	90.3
SparseDriveV2	ResNet-34	88.6	92.0

审稿人提示：这张表对 C4 是直接证据。SparseDriveV2 在同为 ResNet-34 的设置下超过了 iPad 和 DiffusionDriveV2，也超过了使用更大 V2-99 backbone 的 Hydra-MDP 与 GoalFlow。尤其是 EP 达到 88.6，说明更密的候选集合确实提高了“往前走得更好”的能力，而不是只靠更保守的驾驶换分数。

再看 NAVSIM v2。这里更能体现“更严格规则下是否仍然成立”。

方法	Backbone	EP	LK	原始 EPDMS*	修正后 EPDMS
DriveSuprim	ResNet-34	88.4	95.5	83.1	未报告
DiffusionDriveV2	ResNet-34	88.9	96.0	85.5	87.5
DriveSuprim	V2-99	90.6	96.6	86.0	未报告
SparseDriveV2	ResNet-34	91.1	96.9	86.7	90.1

审稿人提示：这里最重要的信息不是“86.7 比 85.5 高 1.2”，而是修正后 EPDMS 达到 90.1，比 DiffusionDriveV2 的 87.5 高出 2.6。这说明 SparseDriveV2 在更严格的规则与安全门控下仍保留优势。论文还特别报告了 corrected EPDMS，这一点是透明和规范的。

下面这张定性图与上面的 EP 提升是呼应的。作者想说明 path vocabulary 的几何建模更容易贴合高层意图。

图像层面，这张图支持的不是“绝对更优”，而是“在同类场景里，路径建模确实更容易贴住专家意图骨架”。它是主结果的补充证据，不是单独证据。

再看 Bench2Drive。这里需要同时看主结果和细分能力，而不是只看 Driving Score。

方法	Driving Score	Success Rate (%)	Efficiency	Comfort
SimLingo	86.02	67.27	259.23	33.67
HiP-AD	86.77	69.09	203.12	19.36
SparseDriveV2	89.15	70.00	199.84	18.32
方法	Merging	Overtaking	Emergency Brake	Give Way	Traffic Sign	Mean
Hydra-NeXt	40.00	64.44	61.67	50.00	50.00	53.22
HiP-AD	50.00	84.44	83.33	40.00	72.10	65.98
SparseDriveV2	66.25	75.55	75.00	50.00	71.57	67.67

审稿人提示：SparseDriveV2 在闭环分数和成功率上是最强的，但它并不是所有子指标都第一。效率不如 SimLingo，舒适度也不是最优。这说明它的优势更像是“更稳、更能完成任务”，而不是“在每个驾驶风格维度都全面最强”。

论文附录里的这张图与 Bench2Drive 主结果的解释是配套的：SparseDriveV2 在基线停滞的场景里表现出更高的交通效率。

从解释力度看，这篇论文的实验最有说服力的地方在于：主结果、跨 benchmark 结果、能力分项和消融方向是一致的，几乎没有互相打架的地方。最薄弱的地方则是：没有速度、时延、显存和 coarse-stage recall 的直接量化，因此“高效”更多是结构性推断，而不是完整实测闭环。

3.4 潜在未讨论因素

论文的关键消融如下。

词表设置	EPDMS
N_p = 512,\; N_v = 128	88.7
N_p = 512,\; N_v = 256	89.2
N_p = 1024,\; N_v = 128	89.5
N_p = 1024,\; N_v = 256	90.1
Path 交互模块	Trajectory re-conditioning	EPDMS
MHA	否	87.7
MHA	是	89.9
DFA	否	89.9
DFA	是	90.1

审稿人提示：这个消融表很关键，因为它说明性能提升不是只靠“把词表堆大”。如果没有更强的 path interaction 与 re-conditioning，仅靠粗粒度组合并不足以到 90.1。尤其是 MHA 无 re-conditioning 到最终配置之间有 2.4 EPDMS 的差距，说明联合时空重评分并不是装饰件。

但这部分仍留下几个未展开的问题：

论文没有报告 coarse stage 的召回率。如果正确 path 或 velocity 在第一轮就被剪掉，fine scorer 是无法恢复的。
论文没有直接度量“组合后无效轨迹占比”。也就是说，factorization 的坏处被 re-conditioning 修了多少，缺少一个显式统计。
没有给出 SparseDriveV2 自身的推理速度、显存峰值或 FLOPs；只给了 Hydra-MDP 随 anchor 扩大时的显存曲线。
没有 multi-seed 或置信区间，无法判断 0.2 到 0.4 分级别的小增益是否稳定。

作者自己在附录里也给出了失败案例，而且失败点并不是“不会转弯”，而是“导航决策错误”。

这张图非常重要，因为它提醒我们：即便 path/velocity factorization 和 coarse-to-fine scorer 都成立，方法的最终上限仍可能被 route understanding 或高层语义约束所限制。论文把问题主要定义为动作空间覆盖与评分效率，但真实闭环里，高层导航同样可能是瓶颈。

4. 与当前领域主流共识及反对观点的关系
4.1 与主流观点的一致性

SparseDriveV2 与当前端到端自动驾驶领域的主流共识在两点上高度一致。

第一，多模态候选是必须的。无论是 VADv2、Hydra-MDP、DriveSuprim 这样的 scoring-based 方法，还是 DiffusionDrive、GoalFlow、iPad 这样的生成式方法，都默认“单轨迹回归不足以覆盖驾驶行为不确定性”。SparseDriveV2 没有反对这一点，它只是把“多模态”实现为更大的静态组合词表。

第二，候选质量与筛选能力共同决定上限。DriveSuprim 强调 coarse-to-fine selection，DiffusionDrive/GoalFlow 强调 proposal expressiveness，iPad 强调 proposal-centric refinement。SparseDriveV2 其实是在这个主流共识内部，选择了一条更偏结构压缩和组合扩展的路线。

4.2 与反对或竞争观点的分歧

这篇论文最直接的竞争对象不是早期端到端驾驶模型，而是近两年的动态 proposal / diffusion / hybrid 工作。

DiffusionDrive 与 DiffusionDriveV2 的核心立场是：固定词表无法精细覆盖动作分布，因此需要条件生成和采样。
GoalFlow 的立场更进一步：不只要生成，还要用目标点约束生成过程，否则多模态会发散。
iPad 的立场是：proposal 应该成为端到端驾驶的中心对象，通过迭代 refinement 持续修正。
GTRS 则给出了一个更强的竞争观点：静态词表和小规模动态 proposal 各有缺点，最优路径可能是 hybrid。

SparseDriveV2 与这些方法的分歧在于，它认为“生成器的价值”在 benchmark 上有一部分其实可以被“更密的静态覆盖 + 更好的筛选”替代。就当前结果看，它确实在 NAVSIM 和 Bench2Drive 上赢了不少动态方法；但它还没有真正反驳 GTRS 那种“最终可能仍需 hybrid”的观点，因为论文没有做 matched-compute 的静态 vs 动态 vs hybrid 对照。

当前未检索到明确、正式发表的文献直接反驳“高密度 scoring-based planning 可以很强”这一点；但也同样未检索到正式文献能支持“动态生成在一般场景里已无必要”。更稳妥的说法是：SparseDriveV2 在现有公开 benchmark 上，把 static scoring 这条线又向前推了一大步。

4.3 论文在学术版图中的定位

我会把这篇论文定位为一篇很强的“范式内部上限推进”工作，而不是范式颠覆工作。

它没有推翻 scoring-based planning，也没有推翻 dynamic generation；它做的是把原本被认为“太粗”的 static vocabulary，改造成一个可扩展的 factorized super-dense vocabulary，并证明这条路在公开 benchmark 上足够强。换句话说，它更像是在回答：

“静态词表到底是不是已经到头了？”作者回答：还远没到头。
“要想继续涨点，是否一定得上 diffusion / flow / proposal refinement？”作者回答：未必。

所以它在学术版图中的位置，更接近“给 scoring-based 路线续命并刷新上限的关键工程论文”，而不是“理论上终结生成式规划”的论文。

4.4 文献检索说明

本报告在文献对照部分实际核查了以下类型的真实来源：

目标论文的 arXiv 页面与源码包。
Hydra-MDP、VADv2、DriveSuprim、DiffusionDriveV2、iPad、GTRS 等工作的 arXiv 页面。
GoalFlow 与 DiffusionDrive 的 CVPR 2025 官方公开版本页面。
论文源码包中的 main.bib，用于交叉核对标题、年份和 venue。

检索结论如下：

可以确认当前主流确实分成 scoring-based、dynamic generation 和 hybrid 三条路线。
可以确认 SparseDriveV2 的比较对象都是真实存在且近两年活跃的代表工作。
当前未检索到明确支持“动态生成在一般意义上不再必要”的外部文献；SparseDriveV2 的贡献更准确地说是 benchmark-level counterexample。
当前也未检索到正式文献直接反驳其 factorized scoring 设计，但 GTRS 所代表的 hybrid 观点构成了最直接的竞争性立场。
4.5 相关论文补充表
序号	论文标题	作者 / 年份	来源	与原论文关系	一句话概述
1	Hydra-MDP: End-to-End Multimodal Planning with Multi-target Hydra-Distillation	Li et al., 2024	arXiv	直接前身 / scaling study baseline	代表性的静态词表打分方法，用多教师蒸馏提升多模态规划性能。
2	DriveSuprim: Towards Precise Trajectory Selection for End-to-End Planning	Yao et al., 2025	arXiv	直接竞争方法	通过 coarse-to-fine selection、增强和自蒸馏提升 selection-based planning 的精细判别能力。
3	DiffusionDrive: Truncated Diffusion Model for End-to-End Autonomous Driving	Liao et al., 2025	CVPR 2025	动态生成竞争方法	用截断扩散和 anchor-guided diffusion 做实时多模态轨迹生成。
4	DiffusionDriveV2: Reinforcement Learning-Constrained Truncated Diffusion Modeling in End-to-End Autonomous Driving	Zou et al., 2025	arXiv	强动态生成基线	在 DiffusionDrive 上叠加 RL 约束，进一步平衡多样性与高质量轨迹。
5	GoalFlow: Goal-Driven Flow Matching for Multimodal Trajectories Generation in End-to-End Autonomous Driving	Xing et al., 2025	CVPR 2025	动态生成竞争方法	用 goal-conditioned flow matching 生成轨迹，并用 goal scorer 约束生成过程。
6	iPad: Iterative Proposal-centric End-to-End Autonomous Driving	Guo et al., 2025	arXiv	proposal refinement 竞争方法	把 proposal 作为中心对象，通过迭代 proposal-anchored attention 细化规划候选。
7	Generalized Trajectory Scoring for End-to-End Multimodal Planning	Li et al., 2025	arXiv	最直接的竞争性观点	明确主张静态词表与动态 proposal 各有缺陷，提出 hybrid generalized scoring 框架。
8	VADv2: End-to-End Vectorized Autonomous Driving via Probabilistic Planning	Chen et al., 2024	arXiv	早期相关基线


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-c12a83917fb277dab6417b045eee4453_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic2.zhimg.com/v2-8afd43e04c5d28a11cf610840f07414f_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-1f6fac6a6cca753c7729da7a92a8895d_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-9648ce89d6fa7f61f7097febd3554b5f_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-792961ccb247e98d694b10541c9133ec_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-c12a83917fb277dab6417b045eee4453_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-62af72255eb78bb2c583a8cca7f2a70c.webp)

![图片](https://pic1.zhimg.com/5289a02e03cf0bc99699a87c28761973_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-c12a83917fb277dab6417b045eee4453_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-082e3fe0a24a9a34a052ba50e78991e9_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-fd26310d755a1228f56a2dbcb80d29b0_xld.png?source=1d2f5c51)

![图片](https://picx.zhimg.com/v2-cf46d971dacd15175b568b8cd4e7b0e7_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-c12a83917fb277dab6417b045eee4453_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-8a8f1403a93ddd0a458bed730bebe19b.png)

![图片](https://picx.zhimg.com/v2-3c740abe5eb9772af683021cec8c7342_xld.png?source=1d2f5c51)

![图片](https://pica.zhimg.com/v2-954ce59b9746d7b9151313de1f065b74_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4e6e8aff416cc858aa302883250b9af4_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-896bf312667478a35cd8727eded2c846_250x0.jpg?source=172ae18b)

