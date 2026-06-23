---
title: "框架优美且适合入门VLA的论文分享：ORION"
author: "同济学长"
source_url: https://zhuanlan.zhihu.com/p/1944483851511506580
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 框架优美且适合入门VLA的论文分享：ORION

> 作者: 同济学长 | 来源: https://zhuanlan.zhihu.com/p/1944483851511506580

---

论文链接：[2503.19755] ORION: A Holistic End-to-End Autonomous Driving Framework by Vision-Language Instructed Action Generation

项目地址：GitHub - xiaomi-mlab/Orion: [ICCV 2025] Official code of 「ORION: A Holistic End-to-End Autonomous Driving Framework by Vision-Language Instructed Action Generation」

ORION 框架在 ICCV 2025 大会上由华中科技大学与小米 EV 联合提出，这个论文工作结构清晰、设计优雅，是自动驾驶 VLA（Vision-Language-Action）领域的标杆式入门之作，也非常适合作为 VLA 学习的入门。所以在这里记录下来。

第一章：论文背景与核心贡献
1.1 背景介绍

在自动驾驶领域，端到端（End-to-End, E2E） 方法希望用一个统一的神经网络，从传感器输入直接生成控制指令或规划轨迹，避免传统感知 → 预测 → 规划 → 控制这种模块化方案带来的误差累积。但实际应用中，E2E 方法面临两大挑战：

缺乏推理能力：如图a，这种传统E2E框架模型（如UniAD）通过模仿专家轨迹（人类驾驶轨迹），实现模型性能的提升；他们在开放路况（Open-loop）下表现良好，但在复杂环境和闭环测试中，表现糟糕，因为无法进行复杂因果推理。(PS: 所以马上要引入大语言模型)；
语义与数值的鸿沟：大规模视觉-语言模型（Vision-Language Models, VLMs）具备强大的场景理解和推理能力，但其输出主要是文本或语义信息（如图b）用这个信息直接解码输出轨迹，或者作为传统 E2E 模型的辅助模块(如图c，相当于快慢系统)，提供一个高级的决策信息；图b的问题是：自动驾驶最终需要的是数值化的轨迹点（位置、速度等），这两者之间存在显著的语义空间—动作空间差距。图c的问题是：语义和动作空间的割裂，是两个独立的模型。 所以，有必要设计一个语义空间—动作空间的解码器，而且实现端到端的训练。
主要E2E框架的对比
1.2 核心贡献

ORION 框架(图d)正是为了解决这些痛点：

它将 VLM 的推理能力与生成式规划器结合，通过统一的潜在表示（latent representation）桥接语义空间与轨迹动作空间；
引入 QT-Former 模块，解决长时序信息建模问题，提升模型在复杂交互场景下的决策能力；
最终在 Bench2Drive 的封闭循环测试中取得显著领先，Driving Score 提升 14.28，Success Rate 提升 19.61%，相较于 SOTA 模型大幅超越。
1.3 关键术语列表
英文术语	中文含义	备注
End-to-End (E2E)	端到端	直接从输入到输出的模型架构
Vision-Language Model (VLM)	视觉-语言模型	能理解图像+文本信息的大模型
Closed-loop Evaluation	闭环评估	在仿真环境中循环测试模型决策
Open-loop Evaluation	开环评估	只评估预测误差，不反馈到环境
Generative Planner	生成式规划器	基于潜在变量生成轨迹的模块
QT-Former	Query-based Temporal Former	用查询机制建模时序信息
Latent Representation	潜在表示	不同模态共享的隐藏特征空间
第二章：ORION 框架整体结构与数据流
2.1 总体架构
简化版本的ORION框架的数据流与模块连接图
论文里提供的方法架构示意图

ORION 框架的核心思想是打通视觉理解、语言推理与轨迹生成，让模型在统一的潜在表示空间内完成从场景感知 → 场景推理 → 轨迹规划的闭环流程。整个系统分为三大模块：

QT-Former：负责时序信息建模与多视角图像特征压缩。它利用查询（Query）机制，从当前帧与历史帧中提取关键信息，生成场景 Token 和历史 Token，便于后续推理。
LLM 推理模块：基于视觉特征、用户指令/导航指令，生成 Planning Token，相当于一种场景条件的语义总结，为轨迹生成提供决策依据。
生成式规划器（Generative Planner）：利用 VAE ，Difussion等生成模型，将 Planning Token 映射到轨迹动作空间，直接输出多模态未来轨迹，保证端到端可训练性。

整个系统的数据流大致如下：

输入：多视角图像、导航指令、历史状态信息
视觉编码 → QT-Former → LLM → Planning Token → 生成式规划器 → 未来轨迹
训练时同时优化检测、推理、轨迹预测多个损失项
2.2 大致的数据流与 Shape 表示
模块	输入形状	输出形状	说明
视觉编码器（Vision Encoder）	多视角图像 (B, T, C, H, W)	图像特征 (B, N, D)	N为token数，D为特征维度
QT-Former	图像特征 (B, N, D) + 可学习的Query	场景/历史Token (B, Q, D)	Q为Query数量
LLM推理模块	Token + 指令 (B, Q, D)	Planning Token (B, 1, D)	统一语义表示
生成式规划器	Planning Token (B, 1, D)	轨迹点 (B, M, 2)	M为未来时间步, 2代表x,y
第三章：数据集与数据预处理
3.1 数据集概览

ORION 使用的主要数据集是 Bench2Drive，它专门为闭环端到端自动驾驶设计，基于 CARLA V2 仿真环境构建，特点包括：

多样化场景：共 44 种交互场景，如变道、避让行人、红绿灯控制等。
闭环评估协议：车辆预测的轨迹直接反馈到模拟环境中，评估其决策正确性。
官方拆分：
训练集：950 个片段，每段约 150 米驾驶数据
开环验证集：50 个片段
闭环测试集：220 条短路线，5 条路线/场景

每个片段（clip）通常覆盖 约 150 米的连续驾驶，包含每个 clip 包含：

meta.json：描述场景类型、天气、城镇、帧数等元信息
sensors_0.db3：ROS2 格式的传感器数据包，包含图像、点云、GNSS、IMU、CAN 等
calib/：相机和激光雷达的内外参标定文件
bbox_3d/：每帧的 3D 标注（车辆、行人等）
maps/：对应城镇的 OpenDRIVE 高精度地图
ego_trajectory.csv：自车的轨迹和控制信号（用于模仿学习）
3.2 自动化 VQA 标注管线

ORION 发现 Bench2Drive 缺乏 场景文本描述和因果标注，不利于 LLM 的推理训练，于是在 Bench2Drive 上引入了自动化 VQA 标注管线，使用QWEN-VL模型，生成了 Chat-B2D 数据集，供 LLM 推理训练。




标注流程：

关键对象选择：优先标注与自车决策相关的对象，如潜在碰撞车辆、红绿灯、行人。
场景描述生成：提取过去多帧画面 + 自车状态，生成文本描述，如“前方红灯亮起”。
因果 QA 生成：基于场景描述，生成“为什么要减速？”→“因为前方行人正在过马路”。

该过程使用 Qwen2-VL 等大模型自动完成，无需人工标注。

Chat-B2D 一条数据示例
{
  「clip_id」: 「clip_045」,
  「timestamp」: 2.5,
  「scene_description」: 「前方红灯刚刚亮起，行人正在穿过人行道。」,
  「critical_objects」: [
    {「type」: 「traffic_light」, 「state」: 「red」, 「distance」: 15.2},
    {「type」: 「pedestrian」, 「id」: 3, 「distance」: 8.5}
  ,
  「qa_pair」: {
    「question」: 「为什么车辆需要减速？」,
    「answer」: 「因为前方红灯亮起，且行人正在过马路，车辆必须停车。」
  },
  「future_trajectory」: [[1.0, 0.5], [1.5, 0.7], ..., [10.2, 3.5]]
}

在 ORION 训练中：

scene_description + qa_pair → LLM 推理训练
critical_objects → QT-Former 辅助检测头监督
future_trajectory → 生成式规划器主任务监督
3.3 数据增强策略

为提升模型泛化能力，训练阶段对输入图像进行以下增强：

随机裁剪与缩放：防止模型过拟合固定视角
光照与天气变化：模拟真实场景昼夜、雨天条件
时序帧采样抖动：避免模型过度依赖特定帧间隔

此外，未来轨迹标签也会加噪声，提升模型在不确定环境下的鲁棒性。

第四章：方法详解（网络结构、数据流与训练目标）
4.1 QT-Former：时序上下文压缩 + 多任务感知（含记忆机制）

输入/输出与主要层：

输入：多视角相机特征 F_m（由视觉编码器，例如 EVA-02-L，提取；来自 6 路相机，见论文图示“×6 Image Features”）。
查询（可学习向量）：
场景查询 Q_s \in \mathbb{R}^{N_s \times C_q}（抽取“当前场景关键语义”）；
感知查询 Q_p \in \mathbb{R}^{N_p \times C_q}（送入各辅助头做目标检测、交通状态、动态体运动预测）；
历史查询 Q_h \in \mathbb{R}^{N_h \times C_q}（读写长时记忆）。
关键层：自注意力（SA）先在 Q_s, Q_p 内部交换信息；随后用带 3D 位置编码 P_m 的**交叉注意力（CA）**与图像特征 F_m 交互。
记忆：维护长时记忆库M \in \mathbb{R}^{(N_h \times n)\times C_q}（队列长度 n）与相对时间戳嵌入P_t；通过两次 CA 先从记忆取“前情要点”，再对齐当前场景：

Q_h = \mathrm{CA}(Q_h,\, M + P_t,\, M + P_t),\qquad \hat{Q}_h = \mathrm{CA}(Q_h,\, Q_s,\, Q_s) \tag{1}

\mathrm{CA}(Q,K,V)：交叉注意力；
“+”：逐元素加法；
\hat{Q}_h：更新后的历史查询；
M, P_t, Q_s, Q_h 定义如上。 更新后的 \hat{Q}_h 以先进先出（FIFO）写回记忆：

M = [\,\hat{Q}^{\,t-n}_h,\,\dots,\,\hat{Q}^{\,t-1}_h,\,\hat{Q}^{\,t}_h\,], \quad t=\text{当前帧时间} \tag{2}

上述记忆设计与“仅存压缩历史、不指导当前抽取”的做法不同，这里显式初始化少量历史查询去引导当前场景抽取，增强长时记忆能力。

向 LLM 对接：用两层 MLP 把 \hat{Q}_h 与 Q_s 分别映射到 LLM 推理空间，得到历史 Tokenx_h 与场景 Tokenx_s（维度与 LLM 嵌入维 C 对齐）。

辅助头与监督信号（预测/真值来源）：

目标检测头：输出关键对象（车辆/行人/车道等）的类别与位置（来自 Bench2Drive/模拟器的标注真值）；
交通状态头：输出交通灯/标志等状态（真值同上）；
动态体运动头：输出周围交通体的短期运动参数（真值为未来若干步的代理轨迹/速度等，来自数据集）

这个QT-Former 可以看成 Q-Former + 3D 感知 + 历史记忆 的自动驾驶专用升级版，Q-Former（BLIP-2）只做“图像→文本”对齐；QT-Former 额外加了 时序记忆 和 感知头。

4.2 大语言模型（LLM）：把视觉与历史推理为规划 Token

输入/输出与交互：

文本指令/QA 模板经分词器得到语言 Tokenx_q \in \mathbb{R}^{L \times C}（L：序列长度；C：LLM 隐向量维度）；
将 x_s, x_h 与 x_q 拼接输入 LLM，执行场景描述、历史回顾、场景分析、行动推理等子任务；
设计规划专用 Tokens（在模板中作为“最终问答的聚合位”）用于“汇聚整个对话/推理上下文”，其生成可表示为条件分布采样：

s \sim p\big(s \mid x_s, x_h, x_q, x_a\big) \tag{3}

x_a：LLM 生成的答案序列（文本）；
p(\cdot)：条件概率分布。 最终用 s 的嵌入去条件控制后续的轨迹生成
真值来源（用于 LLM 的训练）：来自 Chat-B2D 的 VQA 对（自动生成，高质量覆盖 4 类任务，训练 211 万/验证 12 万条）

这里的大语言模型是基于LoRA 微调的 Vicuna-7B 模型。

4.3 生成式规划器（Generative Planner）：桥接“推理空间”与“行动空间”

动机与建模：

目标：用规划 Token s 在行动空间生成当前帧的多模态轨迹a，形式化为条件分布 p(a\mid s)；
为了对齐“VLM 推理空间”与“数值轨迹空间”的分布差异，采用 VAE 风格的潜变量对齐（也尝试过 Diffusion，VAE 在对齐上更直接稳定；Diffusion 版本依然优于强基线，见消融）。

核心层与数据流：

两个两层 MLP 分别把 s 和真值轨迹t（来源：数据集中自车未来轨迹）投影为高斯潜变量：

p(z_s \mid s) \sim \mathcal{N}(\mu_s,\, \sigma_s^2),\qquad p(z_t \mid t) \sim \mathcal{N}(\mu_t,\, \sigma_t^2) \tag{4}

\mathcal{N}(\mu,\sigma^2)：均值 \mu、方差 \sigma^2 的高斯分布（可理解为对角协方差的高斯族）；
z_s, z_t：分别由 s 和 t 映射得到的潜向量；
\mu_s,\sigma_s,\mu_t,\sigma_t：由 MLP 预测的均值/标准差参数。
用 KL 散度使两者分布对齐：

\mathcal{L}_{\text{vae}} = D_{\mathrm{KL}}\!\big(\,p(z\!\mid\!s),\, p(z\!\mid\!t)\,\big) \tag{5}

D_{\mathrm{KL}}(p,q)：从 p 到 q 的 KL 散度（衡量两分布差异；为非负，0 表示完全匹配）。
采样（或取均值）得到 z 后，使用 GRU 解码器（沿用 GenAD 设计）把潜向量解码为多步未来轨迹（单位：米/秒，或离散采样时刻的 (x,y) 位置序列）

这个公式的本质是：把“思想”和“动作”都翻译成同一种“密码”（潜在空间中的高斯分布），从而对齐采样。那为什么需要这个“密码翻译”？，而不是直接映射？

简单来说，如果不通过VAE的潜在空间，直接让一个网络从 s 预测 t，会面临巨大挑战：

维度和模态鸿沟：s 是一个抽象的、语义的向量，t 是一个具体的、数值的坐标序列。直接映射非常困难。
多模态性丢失：确定性的映射（如MLP）只能输出一条轨迹，无法捕捉“减速停车”这一指令下多种合理的刹车距离和速度曲线。

而VAE通过构建的“密码本”，完美地解决了这些问题：

统一空间：将思想和动作都翻译到同一个数学空间（高斯分布）。
支持多模态：用分布而非单点来表示，天然支持生成多样化但合理的轨迹。
可微分对齐：通过KL散度，可以精确地、可微分地让“思想”去匹配“动作”。
4.4 训练目标
4.4.1 QT-Former（多任务感知）
检测分支：

\mathcal{L}_{\mathrm{det}}=\mathcal{L}_{\mathrm{cls}}+\mathcal{L}_{\mathrm{reg}} \tag{a}

\mathcal{L}_{\mathrm{cls}}：Focal Loss（处理前景/类别不均衡）；
\mathcal{L}_{\mathrm{reg}}：L1 回归（边界框/几何参数）；
预测值：类别概率、几何参数；真值：数据集标注的关键对象框/车道等。
交通状态分支：

\mathcal{L}_{\mathrm{tra}}=\text{Focal Loss} \tag{b}

预测值：信号灯/标志状态；真值：仿真环境提供的交通元素状态标注。
动态体运动分支：

\mathcal{L}_{m}=\mathcal{L}_{m\text{cls}}+\mathcal{L}_{m\text{reg}},\quad \mathcal{L}_{m\text{cls}}=\text{Focal},\ \mathcal{L}_{m\text{reg}}=\text{L1} \tag{c}

预测值：周围体的未来运动模式/参数；真值：数据集中对应时间窗的未来轨迹/速度等。
QT-Former 总损失：

\mathcal{L}_{\mathrm{qt}}=\mathcal{L}_{\mathrm{det}}+\mathcal{L}_{\mathrm{tra}}+\mathcal{L}_{m} \tag{6}

4.4.2 LLM 分支（视觉问答/推理）
自回归交叉熵：

\mathcal{L}_{\mathrm{ce}}=\text{CrossEntropy}\big(\text{LLM 输出 Token 序列},\ \text{Chat-B2D 参考答案}\big) \tag{7}

预测值：LLM 的 token 序列 x_a；真值：Chat-B2D 对应问题的参考答案文本。
用途：驱动 LLM 学到“场景描述/历史回顾/场景分析/行动推理”的可解释语言对齐，并由此产生更优的规划 Token s。
4.4.3 生成式规划器（轨迹预测）
潜空间对齐：\mathcal{L}_{\mathrm{vae}} 如式(5)。
数值拟合：\mathcal{L}_{\mathrm{mse}}（预测轨迹 vs 真值轨迹 t 的逐点均方误差）；
安全约束：\mathcal{L}_{\mathrm{col}}（碰撞损失：与场景/他车的几何碰撞惩罚）、\mathcal{L}_{\mathrm{bd}}（边界损失：越界/越道惩罚），参考 VAD 家族实现思想；
规划器总损失：

\mathcal{L}_{\mathrm{gp}}=\mathcal{L}_{\mathrm{vae}}+\mathcal{L}_{\mathrm{mse}}+\mathcal{L}_{\mathrm{col}}+\mathcal{L}_{\mathrm{bd}} \tag{8}

预测值：自车未来轨迹（可多模态，对应 Bench2Drive 6 类导航命令 NC 的 6 个模式）；
真值：自车未来轨迹 t（来自数据集/仿真器）。
4.4.4 总损失（端到端联合优化）

\mathcal{L}=\mathcal{L}_{\mathrm{qt}}+\mathcal{L}_{\mathrm{ce}}+\mathcal{L}_{\mathrm{gp}} \tag{9}

整体上，实现视觉—推理—行动三域对齐的统一优化；实现了 VQA 与规划的端到端联合训练。
4.5 训练流程：三阶段策略

论文采用 三阶段训练，一次完整训练包含 18 epoch，每阶段 6 epoch，逐步解冻模块：

阶段	冻结部分	优化部分	主要损失
阶段1	规划器	QT-Former 与 LLM	公式6 + 公式7
阶段2	QT-Former 与 LLM	VAE/Difussion model	公式8
阶段3	无	全部（联合优化）	公式9
阶段 1：专注 3D 视觉与感知任务 + LLM视觉语言理解
阶段 2：加入 generative planner，让 Token 具备语义到动作空间的生成能力
阶段 3：解冻规划器，端到端微调
注意：视觉编码器参数全程固定，不参与训练
第 5 章：硬件需求与推理速度

根据论文里提供的信息：ORION的训练，需要一个由32块高显存（80GB）的A800 GPU组成的大型计算集群才能完成。然后论文里也提到，当前版本的ORION由于其视觉语言模型模块带来的高计算复杂度，尚不具备实时驾驶的能力。


原文：
Limitation. Although ORION performs well in the closed-loop simulation environment on Bench2Drive[23], it is limited by the high computational complexity of the scalable VLM in real-time driving scenarios. In the future, we would like to reduce the complexity of ORION through techniques such as model compression and pruning, thereby enabling the model to achieve real-time autonomous driving.

第 6 章： 结果展示 + 消融实验细节
6.1 实际效果见官方项目主页

ORION: A Holistic End-to-End Autonomous Driving Framework by Vision-Language Instructed Action Generation
这里面有一些视频可以直观感受ORION的效果

6.2 消融实验设计

论文主要做了三类消融：

历史记忆长度 N_h

0（无历史）、8、16、32
结果：16 时 DS/SR 最优，太长导致噪声积累
规划器设计：VAE vs Diffusion
VAE：收敛快，推理稳定
Diffusion：生成质量高但慢，最终分数略低于 VAE
联合训练 vs 分阶段
若直接端到端训练，VQA 与规划性能都下降；
三阶段逐步解冻训练效果最佳。
6.3 主要实验结论总结
历史记忆与规划 Token：显著提高长时因果推理与规划性能
生成式规划器的潜变量对齐：是轨迹预测稳定性的核心
多任务联合训练：保证了 VQA、感知、规划三者互相促进


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-998bb04b240458b227e4a6d07fe26f49_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://picx.zhimg.com/v2-ad3edcfbf6449406419c4d8155dcb1bf_1440w.jpg)

![图片](https://pica.zhimg.com/v2-7602063c2c09bf3ed228d981b1f8c29c_1440w.jpg)

![图片](https://picx.zhimg.com/v2-be2c366d66b3d5560eca172ff0bfde11_1440w.jpg)

![图片](https://picx.zhimg.com/v2-55f6a60c5d1093a60e1a066939b83c15_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-118109c97f3fabd1288eb6d43daca5af_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-5d11ce4f5cbc3d9f002b4b1d00ceb139.webp)

![图片](https://pica.zhimg.com/v2-b69f2aa536f9ac9ceeb837d56c5e8dd1_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/cdd8d4de0826de43c2b9233c67ec9963_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-15b730382aa4b9fff91ac551b0f7534b_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-1cf7b9c855a6d6b6b0d7281e83cc6f04_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-722b43031d503118aaa1b7dd7e5028e4_250x0.jpg?source=172ae18b)

