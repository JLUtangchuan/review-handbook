---
title: "自动驾驶论文速递 | ChatBEV、BridgeAD、思维链综述等最新工作（2025.3.20）"
author: "自动驾驶之心"
source_url: https://zhuanlan.zhihu.com/p/31442240588
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 自动驾驶论文速递 | ChatBEV、BridgeAD、思维链综述等最新工作（2025.3.20）

> 作者: 自动驾驶之心 | 来源: https://zhuanlan.zhihu.com/p/31442240588

---

今日自动驾驶前沿算法更新：

哈工大等团队思维链最新综述；
新加坡国立最细年底思维链综述；
上交提出ChatBEV；
复旦中稿CVPR'25的端到端算法BridgeAD；
Towards Reasoning Era
论文标题：Towards Reasoning Era: A Survey of Long Chain-of-Thought for Reasoning Large Language Models
论文链接：https://arxiv.org/abs/2503.09567
项目主页： https://long-cot.github.io/

核心创新点：

1. 理论框架创新

Long CoT范式定义

首次系统性区分长链思维（Long CoT）与 短链思维（Short CoT） ，明确Long CoT的三大核心特征：

深度逻辑处理 ：通过扩展推理节点数量与复杂度，支持多层级逻辑结构整合。
广泛探索（Extensive Exploration） ：引入并行不确定节点生成与未知逻辑迁移机制，突破线性推理局限。
可行反思（Feasible Reflection） ：基于反馈的动态逻辑修正，提升复杂任务中的容错能力。

2. 技术方法创新

推理增强技术

动态并行树搜索（Dynamic Parallel Tree Search） 通过多分支并行生成与剪枝策略，优化复杂推理路径的探索效率（如MCTS与A* 搜索改进）。
强化微调（Reinforcement Fine-Tuning, RFT） 结合过程奖励模型（PRM）与 结果奖励模型（ORM） ，实现分阶段强化学习（如OpenRFT框架）。
自反思框架（Self-Reflection Framework） 引入模型自检与错误修正机制（如Critic-CoT、ARIES），通过迭代优化提升逻辑一致性。

知识整合策略

混合反馈机制（Hybrid Feedback） 融合全局反馈（最终答案正确性）与 过程反馈（中间步骤合理性） ，结合SFT-based精细化模仿学习。
外部探索（External Exploration） 基于多智能体协作的图搜索（如SoS、CoRAG）与人类先验知识注入，扩展推理边界。

3. 评估体系创新

复杂任务基准扩展 提出高难度数学推理数据集（如AIME 2024 、FrontierMath ）与代码生成验证基准（如StepCoder ），量化Long CoT的泛化能力。 推理边界量化 定义概念深度（Concept Depth）与 推理容量上限 ，分析模型在复杂任务中的性能衰减阈值（如GSM-Infinite测试）。

4. 优化机制创新

自学习策略（Self-Learning Strategies） 通过自博弈（Self-Play）与 弱监督蒸馏 （如STaR、V-STaR），实现无标注数据下的推理能力迭代。
高效推理架构 采用蒙特卡洛树搜索（MCTS）与 Q值排序 优化决策路径，降低长序列推理的计算冗余（如QLASS、DQO）。

5. 安全与可解释性

安全推理框架 提出对抗性验证（Adversarial Verification）与 医疗专用纠错（Medec） ，增强高风险场景下的鲁棒性。
可解释性分析 通过概率混合模型（PMM）与 信息论一致性（ITC） ，量化模型推理策略的置信度与可解释性。

本文内容均出自『自动驾驶之心知识星球』，欢迎加入交流。这里已经汇聚了近4000名自动驾驶从业人员，每日分享前沿技术、行业动态、岗位招聘、大佬直播等一手资料！欢迎加入~

https://t.zsxq.com/04NneQvBM (二维码自动识别)

Multimodal Chain-of-Thought Reasoning
论文标题：Multimodal Chain-of-Thought Reasoning: A Comprehensive Survey
论文链接：https://arxiv.org/abs/2503.12605
项目主页：https://github.com/yaotingwangofficial/Awesome-MCoT

核心创新点：

1. 多模态思维链（MCoT）方法论体系

模态适配推理机制 ：提出针对图像、视频、音频、3D及结构化数据的专用推理框架（如Multimodal-CoT、Video-of-Thought、Audio-CoT、Cot3DRef），通过模态特性分解任务步骤，提升跨模态复杂任务的可解释性与性能。
结构化数据处理范式 ：引入Chain-of-Command（TableGPT）和Chain-of-Table，通过命令集（如SelectCondition、GroupBy）动态生成操作序列，实现表格数据的精准语义解析与重建。

2. 细粒度视觉推理与注意力模拟

视觉注意力机制 ：ReFocus通过编辑操作（如高亮、掩码）模拟人类注意力机制，增强结构化数据（如表格、医学影像）的细粒度理解能力。
动态实例定位 ：Image-of-Thought结合文本与视觉检索动态定位目标对象，支持复杂场景下的语义 grounding。

3. 多模态生成与推理协同优化

生成增强推理 ：RPG-DiffusionMaster通过MCoT分解文本提示为子区域生成指导，提升文本到图像扩散模型的一致性；L3GO提出Chain-of-3D-Thoughts框架，实现非常规3D对象的生成。
程序化推理合成 ：3D-PreMise融合LLM与程序合成生成参数化3D形状，通过显式推理示例指导工业设计。

4. 领域专用推理范式

医疗健康 ：StressSelfRefine采用心理学启发的“描述-评估-高亮”流程检测视频压力信号；MedCoT通过分层专家机制优化医学诊断推理。
具身智能与机器人 ：E-CoT结合目标定位与抓取位姿推理提升机器人交互能力；SpatialCoT通过坐标对齐与空间推理优化具身任务规划。

5. 基准与评估体系

多模态推理基准 ：构建M3CoT、VMMMU等跨领域基准，覆盖科学问答（ScienceQA）、视频推理（VideoCoT）及医疗诊断（MathVista），系统评估MCoT的鲁棒性与效率。

6. 数据增强与知识注入

自动化数据生成 ：G-CoT、PS-CoT通过任务分解自动生成标注推理轨迹，缓解数据依赖问题。
外部知识整合 ：KAM-CoT引入知识库增强，HoT通过超图连接多推理节点，提升复杂任务的知识覆盖率。
ChatBEV
论文标题：ChatBEV: A Visual Language Model that Understands BEV Maps
论文链接：https://arxiv.org/abs/2503.13938

核心创新点：

1. 首个BEV场景理解VQA基准（ChatBEV-QA）

构建了包含137k+问答对的大规模BEV地图问答数据集，覆盖全局场景理解 （区域/车道类型）、车辆-车道交互 （定位/导航推理）和车辆-车辆交互 （存在性/相对方位）三大维度，填补了BEV地图多任务理解的基准空白。

2. 自动化数据生成管道

提出基于规则函数的标注系统和模板化问题生成框架，通过轨迹预测车道匹配 、空间关系量化 等技术自动生成高质量VQA数据，突破传统人工标注的规模限制。

3. BEV专用视觉语言模型（ChatBEV）

采用视觉指令调优（Visual Instruction Tuning）策略，基于LLaVA等预训练模型进行LoRA微调，首次实现BEV地图的细粒度语义解析，包括车道拓扑推理、动态交互建模等能力。

4. 语言驱动的场景生成框架

将ChatBEV的全局场景编码 （区域/车道类型）与导航推理 （车道中心线预测）嵌入扩散模型，显著提升生成场景的语义一致性和交通规则符合度，实现语言约束下的可控场景生成。
Bridging Past and Future
论文标题：Bridging Past and Future: End-to-End Autonomous Driving with Historical Prediction and Planning
论文链接：https://arxiv.org/abs/2503.14182

核心创新点：

1. 多步骤查询分解机制

提出将运动预测（motion prediction）与路径规划（planning）的查询（queries）分解为多时间步粒度 （multi-step queries），即对每个未来时间步单独建模（如预测轨迹的每一步对应独立查询），突破传统方法中单查询表征整条轨迹的局限性。这一设计使历史预测与规划信息能按时间步精准对齐，增强时序一致性。

2. 历史信息分层融合架构

感知阶段 ：通过Historical Mot2Det Fusion模块 ，将历史运动预测查询（historical motion queries）与当前帧目标检测查询（object queries）跨模态交互，提升动态物体感知精度。
规划阶段 ：在History-Enhanced Planning模块 中，将历史规划查询（historical planning queries）与未来多步规划查询结合，利用历史决策经验优化当前规划策略。

3. 时序一致性交互模块

设计Step-Level Mot2Plan Interaction ，强制对齐运动预测与规划的时间步级交互 （如将周围车辆的未来状态预测与自车规划轨迹在对应时间步关联），解决传统方法中预测与规划分离导致的动态场景不一致问题，显著降低碰撞率（collision rate）。

『自动驾驶之心知识星球』近4000人的交流社区，已得到大多数自动驾驶公司的认可！涉及30+自动驾驶技术栈学习路线，从0到一带你入门自动驾驶感知（端到端自动驾驶、世界模型、仿真闭环、2D/3D检测、语义分割、车道线、BEV感知、Occupancy、多传感器融合、多传感器标定、目标跟踪）、自动驾驶定位建图（SLAM、高精地图、局部在线地图）、自动驾驶规划控制/轨迹预测等领域技术方案、大模型，更有行业动态和岗位发布！欢迎扫码加入~

https://t.zsxq.com/04NneQvBM (二维码自动识别)


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-155d2614cb3a7a7cab50e5fc0e1e778e_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic3.zhimg.com/v2-25b5fe30d8791dfcd03ed4bd5ec2a4ca_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-c248766b46f73ebd59faf2dfd7155ecc_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-8501e3d4d83927cd2943ce111fff6a45_1440w.jpg)

![图片](https://picx.zhimg.com/v2-14b3deed05ede149d602eb6726e22c4f_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-155d2614cb3a7a7cab50e5fc0e1e778e_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-db69f04b261270dca8af54cb023a8961.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-6db8ac0c4b232287eb50f0028f449de8.webp)

![图片](https://picx.zhimg.com/v2-028bec663ff266545af7fb2b311d7d65_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-d682d7e08ec3b7610e8dc630710766b1_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-9361e3828585300c35972fa773699896_250x0.jpg?source=172ae18b)

