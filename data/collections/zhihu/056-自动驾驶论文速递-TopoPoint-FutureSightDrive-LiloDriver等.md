---
title: "自动驾驶论文速递 | TopoPoint、FutureSightDrive、LiloDriver等~"
author: "擎天柱"
source_url: https://zhuanlan.zhihu.com/p/1910614155888669718
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 自动驾驶论文速递 | TopoPoint、FutureSightDrive、LiloDriver等~

> 作者: 擎天柱 | 来源: https://zhuanlan.zhihu.com/p/1910614155888669718

---

TopoPoint
论文标题：TopoPoint: Enhance Topology Reasoning via Endpoint Detection in Autonomous Driving
论文链接：https://arxiv.org/abs/2505.17771
代码：https://github.com/Franpin/TopoPoint

核心创新点：

1. 端点偏差问题建模与显式检测

问题定义 ：首次系统性指出拓扑推理性能受限于车道端点偏差（endpoint deviation），即多车道预测中端点无法严格对齐的问题。
解决方案 ：
独立端点查询 ：引入显式的端点检测分支（point query），与车道检测（lane query）分离，避免端点受多车道联合监督导致的误差累积。
几何匹配算法（PLGM） ：推理阶段通过计算端点与车道几何距离（L1距离），采用阈值筛选与均值融合策略修正车道端点，有效缓解偏差。

2. 多模态特征交互框架（TopoPoint）

Point-Lane Merge Self-Attention (PLMSA) ：
几何注意力偏置 ：在自注意力机制中，将端点与车道的几何距离（端点到车道起点/终点的最小L1距离）映射为可学习的注意力掩码（fmap = e^(-λ·σ̂)），增强全局上下文共享。
公式化表达 ：通过拼接端点-车道注意力矩阵（Mpl）与车道-车道矩阵（Mll），构建带几何约束的注意力权重：
统一场景图网络（Unified Scene Graph Network） ：
点-车道图卷积（PLGCN） ：基于邻接矩阵（Apl = λ₁Gpl + λ₂Mpl）实现端点与车道特征的双向传播，通过图卷积网络（GCN）聚合跨模态信息。
分层交互设计 ：多阶段GCN模块（PLGCN1/2）结合车道内关系（GCNll）与交通元素语义（GCNlt），提升拓扑关系建模能力。

3. 新评估指标与实验验证

DETp指标 ：针对端点检测提出专用评估标准，基于Fréchet距离在多阈值（1.0/2.0/3.0米）下计算平均精度（AP），填补领域空白。
SOTA性能 ：在OpenLane-V2数据集上，TopoPoint以48.8 OLS得分超越现有方法（如TopoFormer的46.3），并在DETp指标上显著提升（52.6 vs. 45.2），验证了端点检测与拓扑推理的协同优化效果。
FutureSightDrive
论文标题：FutureSightDrive: Thinking Visually with Spatio-Temporal CoT for Autonomous Driving
论文链接：https://arxiv.org/abs/2505.17685

核心创新点：

1. 时空链式思维（Spatio-Temporal Chain-of-Thought, CoT）推理框架

提出一种基于视觉的时空CoT方法，通过统一图像格式编码未来场景的空间关系（如车道线分割、3D目标检测）与时间演化（未来帧序列），替代传统离散文本CoT。该方法通过物理先验约束（如车道线骨架、动态物体运动模式）引导模型生成粗粒度视觉线索，再逐步补充细节，实现符合物理规律的时空因果推理，消除跨模态转换的语义鸿沟。

2. 统一的视觉生成与理解预训练范式

设计多任务联合训练策略：

语义理解保留 ：通过视觉问答（VQA）任务维持模型对当前场景的理解能力；
视觉生成激活 ：基于共享的图文词汇空间，仅需0.3%的训练数据量即可激活现有MLLM的视觉生成能力，无需复杂架构修改。
创新性采用渐进式生成（Progressive Visual CoT），先生成车道线和3D检测框约束物理规律，再生成完整未来帧，解决直接生成细节场景的物理不一致性问题。

3. 基于逆动力学建模的轨迹规划

将时空CoT作为中间推理步骤，使视觉语言模型（VLM）兼具世界模型与决策规划能力：

通过统一帧预测未来空间关系（红车道线、3D检测框）；
利用自回归生成未来帧捕捉时间动态演化；
基于当前观测与未来预测联合优化轨迹，形成闭环推理链。

4. 端到端视觉因果推理流水线

首次实现自动驾驶中图像级具身关联（pixel-level embodied association），无需依赖人工设计的抽象符号系统。通过视觉生成替代文本符号推理，建立从感知到决策的端到端视觉因果推理路径，显著提升轨迹规划精度（L2误差降低至0.28m）与场景理解能力（DriveLM GVQA得分0.57）。
LiloDriver
论文标题：LiloDriver: A Lifelong Learning Framework for Closed-loop Motion Planning in Long-tail Autonomous Driving Scenarios
论文链接：https://arxiv.org/abs/2505.17209
代码：https://github.com/Hyan-Yao/LiloDriver

核心创新点：

1. 终身学习框架设计

提出首个面向自动驾驶长尾场景的终身学习闭环运动规划框架，无需重新训练即可通过动态知识增强适应新场景，突破传统规则驱动与数据驱动方法的静态局限性。

多模态场景编码与原型学习

构建融合矢量化地图与智能体历史轨迹的场景编码器，引入混合损失函数（LPRO + LCLS）：

LPRO损失 ：通过原型（Prototype）学习最大化类间分离度并最小化类内方差，优化场景嵌入的判别性表示；
LCLS损失 ：结合分类目标提升场景语义对齐能力。

解决LLM场景表示中细节冗余或缺失的问题，提升长尾场景的泛化性。

3. 记忆增强的规划生成机制

增量式DBSCAN聚类 ：动态存储场景嵌入向量，增量更新记忆库以识别核心/边界/噪声场景，实现长期经验积累；
网格搜索优化 ：针对聚类后的场景簇，联合优化行为规划器参数（如最小跟车距离、加速度），生成场景特异性策略，提升复杂交互的鲁棒性。

4. LLM-引导的上下文推理架构

首次将大语言模型（LLM）与结构化记忆结合，通过以下设计增强决策能力：

链式思维（Chain-of-Thought）推理 ：利用LLM解析文本化场景描述（含系统提示、运动动态及记忆中的少量示例），生成符合上下文的驾驶行为策略；
规则规划器协同 ：将LLM输出映射至参数化行为规划器（如扩展IDM模型），确保控制稳定性与物理可行性，避免直接生成轨迹的幻觉问题。

5. 闭环仿真与真实世界评估验证

在大规模闭环基准nuPlan中，提出Test14-hard长尾场景集，验证LiloDriver在罕见场景（如高横向加速度、密集行人交互）下的性能提升，结合合成数据后训练进一步缓解记忆干扰问题，证明方法的数据高效性与部署可行性。

本文均出自『自动驾驶之心知识星球』硬核资料在星球置顶链接，加入即可获取：

行业招聘信息&独家内推；
自驾学习视频&资料；
前沿技术每日更新；




https://t.zsxq.com/04NneQvBM (二维码自动识别)




推荐阅读

自动驾驶怎么入门？近30+感知/融合/规划/标定/预测等学习路线汇总

端到端和大模型问世，4D标注如何喂养千万级数据？

多模态大模型在自动驾驶中是怎么用的？一览主流方案，直击落地

国内首个面向工业级的自动驾驶规划控制实战教程

端到端任务工业界是怎么做的？主流方案是怎么样的？如何设计自己的模型？

什么是BEV感知？入门学习路线（纯视觉+多传感器融合）有哪些？

一套完整的自动驾驶仿真工具链是什么样的？端到端模型是怎么接入仿真的？

PNC，今年的香饽饽！近10种规控算法与代码实现你都知道吗？

Occupancy数据怎么生成？如何优化自己的模型？

自动驾驶的仿真测试是怎么做的？一览Carla与Autoware方案！

BEV模型怎么部署到车上？从零开始你的部署！BEV检测+BEV车道线+Occupancy三项主流任务（基于TensorRT）

具身智能视觉语言动作模型，VLA怎么入门？

视觉语言导航技术栈有哪些？为什么VLN如此重要？

1v1 科研论文辅导

重磅！自动驾驶之心论文辅导来啦（近40+方向，顶会/顶刊/SCI/EI/中文核心/申博等）


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-779508ccbcb0157d7e8462ac2b86d4e9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-6062ca4e35a5ee2d49f95aeb7abaa326_1440w.jpg)

![图片](https://picx.zhimg.com/v2-fe897789079cb1e2470107b2a76de437_1440w.jpg)

![图片](https://picx.zhimg.com/v2-34847ed43f6e44b9a915d24b2566fd37_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-1f5a2d5f32c404dec86b664709fff776_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-d67f267cfa60b9979ae8a2d357fd15e9_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-f38d7094e06858a2a8e4c1272854e17c_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-779508ccbcb0157d7e8462ac2b86d4e9_l.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-b82bf43cc500516d710646cd4ece45a7.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-e8953a94a8f82bdc95a10a2d51a14800.webp)

![图片](https://picx.zhimg.com/v2-96bebfc8e46b6ea2b81ac670c1cc6ddd_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-ab4d3eedf0f10c06a4d0438522809e7c_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-7755c34a84b8cc1bb3effec4103c7d49_250x0.jpg?source=172ae18b)

