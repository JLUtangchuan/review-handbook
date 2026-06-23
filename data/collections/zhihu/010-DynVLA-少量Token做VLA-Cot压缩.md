---
title: "DynVLA：少量Token做VLA Cot压缩"
author: "罗清雨"
source_url: https://zhuanlan.zhihu.com/p/2039807168044652235
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# DynVLA：少量Token做VLA Cot压缩

> 作者: 罗清雨 | 来源: https://zhuanlan.zhihu.com/p/2039807168044652235

---

来自中科院的一篇做cot token压缩的paper，试验做的不错

核心创新在于提出了一种全新的思维链（Chain-of-Thought, CoT）范式——Dynamics CoT。与传统的 Textual CoT（生成文本推理）或 Visual CoT（生成未来图像）不同，DynVLA 认为自动驾驶决策的关键在于对未来世界动力学（World Dynamics）的理解。

核心目标：在执行动作前，先预测紧凑的未来动力学状态，从而实现更具前瞻性、更安全且延迟更低的决策。
核心优势：它通过将复杂的未来演变压缩为极少数的“动力学标记”，文中使用8个token（Dynamics Tokens），在保持高精度 spatiotemporal（时空）理解的同时，大幅降低了推理延迟。
(a) Textual CoT：通过文本描述推理，延迟高且缺乏时空理解。
(b) Visual CoT：通过预测未来像素图像推理，存在大量冗余。
(c) Dynamics CoT (DynVLA)：将未来动力学压缩为 8 个标记，实现高效推理与准确的时空建模。




DynVLA 是如何实现的？

DynVLA 的实现主要分为三个关键阶段：动力学标记化（Dynamics Tokenizer）、监督微调（SFT）以及强化微调（RFT）。

1. Dynamics Tokenizer，提炼关键token

这个模块是 DynVLA 的“感知与压缩引擎”，其核心任务是将原始的视觉观测转化为紧凑的、解耦的、具有物理意义的离散token，这是一个单独训练的模块。

这是 DynVLA 的“大脑”部分，负责将连续的视觉输入转化为离散的动力学标记。

解耦设计：为了处理复杂的驾驶场景，模型将动力学显式解耦为两部分：
Ego-centric Dynamics：由车辆自身运动引起的动力学。
Environment-centric Dynamics：由外部交通参与者（如其他车辆、行人）引起的动力学。
物理正则化：为了防止 ego 运动与环境运动混淆（例如：将车辆前行误判为前方车辆后退），模型引入了动作解码器，通过预测真实动作（Ground-truth action）来监督 ego-centric 分支，强制其学习真实的车辆运动。
跨视图一致性：模型要求同一组动力学标记能够同时预测未来的图像和 BEV（鸟瞰图）地图，从而确保动力学表示在不同视角下具有语义一致性。
离散化：使用 VQ（Vector Quantization）码本将连续的动力学特征映射为离散的标记（Tokens），最终形成紧凑的动力学序列。




架构图解 (基于图 2a)

在论文的图 2(a) 中，Dynamics Tokenizer 的工作流可以拆解为以下四个关键部分：

输入层 (Patchifier)：
模型接收相邻的两帧图像 O_t ​ 和 O_{t+1} 。
使用 ViT Patchifier 将图像切片为 patch 序列 x_t 和 x_{t+1} 。
编码层 (Dynamics Encoder)：
这是一个基于 Transformer 的编码器 ( E_{dyn} ​)，包含 L_{Enc}=12 ​层。
它接收 patch 序列，并结合两组可学习的查询向量： Q_{ego} ​ (自我中心查询) 和 Q_{env} ​ (环境中心查询)。

离散化层 (VQ Codebooks)：

这是实现“压缩”的关键。它维护两个独立的码本： C_{ego} 和 C_{env}

通过最近邻搜索（Nearest-neighbor assignment），将连续的动力学特征映射为离散的索引（例如：5, 78, 9, 61...）。

解码层 (Dynamics Decoder)：
包含两个分支：图像解码器 ( D_{dyn}^{img} ​) 和 BEV 解码器 ( D_{dyn}^{bev} ​)。
它们接收离散标记映射回的嵌入 z_t ，并结合当前状态进行条件解码，重构出 O_{t+1} 和 BEV_{t+1} ​。

2. 模型实现细节 (数学与算法)

A. 动力学解耦 (Decoupled Dynamics)

模型通过公式 (1) 显式地将动力学表示分开：

(e_t^{ego}, e_t^{env}) = E_{dyn}(x_t, x_{t+1}; Q_{ego}, Q_{env})
Q_{ego} ​和 Q_{env} ​：这是两组可学习的参数，维度为 N_{ego} \times d 和 N_{env} \times d 。在实现中， N_{ego}=4, N_{env}=4 ，总共 8 个 token。


作用：这种设计强制模型在特征空间中将“我怎么动”和“周围怎么动”分开，避免了物理上的混淆。

B. 向量量化 (Vector Quantization)

这是实现“紧凑性”的核心。对于每一组动力学表示 e t ​ ∈R N×d VQ ​ ​，模型在码本 C = \{c_i\}_{i=1}^M 中寻找最近的向量：

D_t = \text{argmin}_{c_i \in C} \|e_t - c_i\|_2^2
码本大小：M=64。

总标记数： N_{ego} + N_{env} = 8 。这意味着模型用极小的信息量（8 个索引）就概括了未来 1 秒的场景演变。

C. 动作正则化 (Action-based Regularization)

为了确保 D_t^{ego} ​ 确实代表 ego 运动，模型引入了动作解码器：

实现：一个两层 MLP 。
目标： ： a ^ t→t+1 ​ =MLP(D t ego ​ ) 。
损失： \mathcal{L}_{act-reg} = \|\hat{a}_{t \to t+1} - a_{t \to t+1}\|_2^2 ​。
意义：这不仅是正则化，更是一种物理约束。它强迫 D_t^{ego} 必须包含能够推导出车辆动作的信息，从而剔除了背景噪声。

D. 跨视图一致性 (Cross-view Consistency)

模型通过公式 (3) 强制语义对齐：

\hat{O}_{t+1} = D_{dyn}^{img}(x_t, z_t), \quad \widehat{BEV}_{t+1} = D_{dyn}^{bev}(b_t, z_t)

关键点：zt​ 是共享的。这意味着无论是在图像空间还是 BEV 空间，动力学标记 zt​ 必须能够解释场景的演变。这迫使模型学习到的是“场景的本质动力学”，而不是特定视角的像素变换。




为什么这个实现是“顶尖”的？

1.信息瓶颈 (Information Bottleneck)：通过将未来压缩为 8 个离散 token，模型被迫丢弃了无关的背景细节（如路边的树木纹理），只保留了对规划至关重要的“动力学信息”。

2.解耦带来的可解释性：在图 4 和图 8 的可视化中，我们可以看到通过替换 D_t^{ego} ​ 或 Dtenv ​，模型可以分别控制 ego 的转向或周围车辆的停止。这种可控性是传统端到端模型（黑盒）所不具备的。

3.计算效率：在推理时，模型只需要生成 8 个 token，相比于生成几百个像素的 Visual CoT，其计算开销降低了一个数量级，这对于自动驾驶的实时性至关重要。




2. 监督微调 (SFT on Dynamics CoT)




在这一阶段，模型学习“先思考，后行动”的逻辑。

结构化序列：训练目标是生成一个特定的序列：

y = [\langle BOD \rangle, \mathcal{D}_{t:t+K-1}, \langle EOD \rangle, \langle BOA \rangle, \mathcal{A}_{t:t+N-1}, \langle EOA \rangle]

其中 D 是动力学标记， A 是动作标记。

因果生成：模型被训练为先预测未来 K 步的动力学标记，然后再根据这些标记生成动作。这种方式将动力学推理作为决策的中间变量，增强了决策的物理依据。

3. 强化微调 (RFT on Dynamics CoT)

为了克服模仿学习（Imitation Learning）容易产生“平庸”或“不安全”轨迹的问题，DynVLA 引入了强化学习。

奖励设计：
轨迹奖励 (r_{traj}​)：使用 PDM Score（一种衡量驾驶安全与效率的指标）。
格式奖励 (r_{fmt}​)：强制模型严格遵守 CoT 的输出格式。

优化算法：使用 GRPO (Group Relative Policy Optimization) 算法，通过对多个候选序列进行采样和奖励评估，优化策略模型，使其在保持 CoT 结构的同时，输出更安全、更具前瞻性的驾驶决策。

试验结果

表 1 (第 6 页)：NAVSIM 基准测试结果。DynVLA 在 PDMS 指标上达到 91.7，优于所有对比方法。

表 2 (第 6 页)：Bench2Drive 基准测试结果。DynVLA 在闭环驾驶场景中表现最佳（DS 88.34，SR 72.73）。

表 3 (第 6 页)：大规模内部数据集结果。DynVLA 实现了最低的 ADE（1.215m）和碰撞率（4.04‰）。

表 4 (第 6 页)：CoT 设计与延迟分析。证明了 Dynamics CoT 在保持高性能的同时，将推理延迟大幅降低至 0.37s。

表 5 (第 6 页)：训练阶段消融实验。验证了 SFT 和 RFT 阶段对提升性能的贡献。

表 6 (第 7 页)：动力学标记器设计消融实验。证明了“解耦”、“图像分支”和“BEV 分支”对最终性能缺一不可。

表 7 (第 14 页)：预测时域（K）消融实验。确定了 K=2（2 秒未来）是性能与延迟的最佳平衡点。

表 8 (第 14 页)：标记数量与分配消融实验。证明了 8 个标记（4 个 ego + 4 个 env）的平衡分配方案效果最好。


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-7f14f6e211368e41f043a9bc3648d9d7_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-f9cc667c17a376c16874d1322eb3d8c6_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-5c1b089ea73cc2809d1f02bdc6f49302_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-cb46a647665433e7af32544726bcb32b_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-30692b4af934e35cf926d49b4920d04c_1440w.jpg)

![图片](https://picx.zhimg.com/v2-ad0e2d50c8428be2b73e5572440c8741_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-adffe604600cc4462882d38976458873_1440w.jpg)

![图片](https://picx.zhimg.com/v2-82267ea3169fa34cca5ba56fd68891ef_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-9189b354dd4443d93a57317a3b7cfeaf_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-34f22c7f83b519831769488a93055725_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-be423a887640388889c3ea3a90ee5011_1440w.jpg)

![图片](https://picx.zhimg.com/v2-a1cc4f589b79332545a815c62638685b_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-ad20f0650cea03fe127d2c2e49e173c7_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-76c2f208ae93311533ca960cc3b27cb5_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-62af72255eb78bb2c583a8cca7f2a70c.webp)

![图片](https://pica.zhimg.com/v2-0dd74feeb711dc54e5dd77f3c0b71ec7_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-f5d4b26b1aec8d1cc544aab37e13e348_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-565855031b520ddfc7d86c3e1b557d1b_250x0.jpg?source=172ae18b)

