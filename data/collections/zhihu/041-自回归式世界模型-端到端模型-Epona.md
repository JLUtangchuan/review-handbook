---
title: "自回归式世界模型 + 端到端模型：Epona"
author: "蔡道清"
source_url: https://zhuanlan.zhihu.com/p/1932480841222723066
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 自回归式世界模型 + 端到端模型：Epona

> 作者: 蔡道清 | 来源: https://zhuanlan.zhihu.com/p/1932480841222723066

---

Paper link： Epona: Autoregressive Diffusion World Model for Autonomous Driving

Code link：GitHub - Kevin-thu/Epona: Official Code for Epona: Autoregressive Diffusion World Model for Autonomous Driving (ICCV 2025)

作者阵容挺强的，代码也开源了，值得follow。

Motivation

自动驾驶世界模型需同时满足长时程高分辨率场景生成与实时精准轨迹规划，但现有方法存在明显局限：

扩散模型（如Vista）：固定长度视频生成（≤15秒），无法支持灵活长时预测（>2分钟）和多模态轨迹控制；
GPT式自回归模型（如GAIA-1）：可无限延伸，却需把图像离散成 token，导致视觉质量下降，且缺乏连续动作轨迹生成能力，难以用于实时规划。

因而，本文提出一个既能生成长时高分辨率视频，又能端到端输出连续轨迹的统一框架。

Contribution
解耦了时空建模框架：具有因果注意力的 GPT 风格的transformer 在压缩的潜在空间中处理时间动态性，而双diffusion transformer 分别处理空间渲染和轨迹生成。
异步多模态生成机制：
并行生成3秒轨迹（TrajDiT）与下一帧图像（VisDiT），共享历史潜变量确保对齐；
轨迹模块可独立运行，实现20Hz实时规划（推理算力降低90%）。
前向链训练策略：周期性用模型预测替代真实帧，模拟推理误差，抑制自回归漂移；
时序感知解码器：改进DCAE编码器，添加时空注意力，解决闪烁问题，潜变量压缩率提升16倍。
首个支持2分钟高分辨率生成（512×1024）与端到端规划的自动驾驶世界模型；
Method
世界模型的设计范式

这里定义的自动驾驶领域的世界模型输入是一系列前向的相机观测 \left\{ O_t \right\}_{t=1}^T 和对应的驾驶轨迹 \left\{ a_{t-1\rightarrow t} \right\}_{t=1}^T ，目标是预测未来的驾驶动态特性。现有的方式主要是下面两种：

基于视频扩散的世界模型（video-diffusion model）：比如Vista，通过捕捉过去和固定长度的未来的时空分布来建模世界模型：p({{\left\{ O_{T+i} \right\}}}_{i=1}^n, \left\{ O_t, a_t \right\}_{t=1}^T)，本文认为这种方式破坏了历史观测和未来预测之间的因果关系，限制了其建模现实世界progressive dynamics，并且不能生成灵活长度的，长时序的视频。
基于GPT的世界模型：基于transfomer的自回归式的世界模型，将图像离散化成token序列，以token-by-token的方式建模条件图像分布： \prod_{i=1}^{L}p(t_i|t_{<i}, \left\{ O_t, a_t \right\}_{t=1}^T) 。本文认为这种独立的token建模方式削弱了空间关系，并且量化的过程损坏了高频的细节，破坏了生成的质量。
本文提出的方式是将世界模型建模成a sequential future prediction process in the temporal domain。具体来说，给定过去的观测和驾驶轨迹，既预测未来的规划轨迹，又预测下一帧图像的条件分布。通过解耦因果时序建模和细粒度的未来预测，模型能够生成灵活长度的视频；另外，还能作为实时的轨迹规划器，一举两得。
轨迹预测
下一帧图像的预测
模型主要结构

Multimodal Spatiotemporal Transformer（MST）：具体来说，给定过去的编码的驾驶场景 Z\in R^{B\times T\times L\times C} 和动作序列 a\in R^{B \times T \times 3} ，首先投射到编码空间，然后沿着空间维度concat，增加时间的位置编码，以此获得隐式的编码序列 E\in R^{B\times T\times (L+3) \times D} 。接下来的处理流程如下：

这里B是batch size，T是条件图像的帧数，L是图像特征被拉平后的数量，C和D都是特征维度。CausalMask是三角因果attn mask。最后，使用最后一帧的隐式编码 F\in R^{B\times\ (L+3) \times D}作为压缩后的表征来为下一阶段的预测做准备。

Trajectory Planning Diffusion Transformer (TrajDiT)：采用了Dual-Single-Stream结构的DiT，在dual-stream阶段，历史隐式表征F和轨迹数据通过transfomer blocks独立处理，仅靠attention operations链接；在single-stream阶段，两者被concat，经过后续的transformer blocks融合信息。训练阶段，在轨迹真值上加噪，再去噪；推理阶段，随机的高斯噪声迭代去噪，生成轨迹。

Next-frame Prediction Diffusion Transformer (VisDiT)：VisDiT和TrajDiT的结构类似，额外接入了action control a_{T\rightarrow T+1} 。推理阶段，VisDiT对 \tilde{Z}_{T+1} 去噪，条件输入是F和action（来自于TrajDiT的预测或者用户输入）。隐变量通过DCAE解码器生成下一帧的图像。

Chain-of-Forward Training

主要针对的问题是：自回归推理中，模型依赖自身预测结果，会导致误差累积（"漂移问题"）。解决方式是训练阶段模拟推理噪声，即周期性地用模型预测的帧（非真值）作为输入，进行多步前向传递。同时，为了提高训练效率，使用预测的速度v_Θ直接估算去噪潜变量，避免完整采样。

Temporal-aware DCAE Decoder

DCAE是32倍下采样，原始的DCAE缺乏时序交互，因而存在视频闪烁的问题。为了增强时序一致性，本文在DCAE解码器之前引入时空自注意力层。微调时仅训练解码器，复用预训练参数。

Experiment
参数细节

2.5B的参数量，其中1.3B是12层的MST，1.2B是12层的VisDiT，50M是两层的TrajDiT。由此可见，大部分参数放在了观测的编码上。48张A100GPUs，bs 96，60w次迭代，每10步执行一次COT，每次执行三次前向传播。DiT的采样步数100。

性能评估
视频生成
轨迹控制
长时序视频生成
轨迹规划指标
小结
是自动驾驶领域里，结合了图像生成和自车的轨迹预测的框架性质的工作，而且无论是图像生成的质量，还是轨迹预测的质量，都很高。有很强的拓展性：闭环仿真，RL，自车行为的因果性解释。
不足之处是只有单相机，自动驾驶领域的传感器很复杂，多路相机的一致性问题，点云生成都有待解决。


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-a0ab0cd6c684ebc012bce000027a9268_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-d512459fee030f0a70a633cfb14a382a_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-d4b35016723a261d8ce64872ea381df9_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-ae65b71fedc7bafb564ab17de6933c27_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c4d807988e36577d19294de352e246d1_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-87edd4620fff77f3f8fcd9853661a607_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-edd45f83d8d9969fd9b2e8ba9664d960_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-f5384fde5adef7b5997c9132a526499b_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-e4cdf53a4f689d5193b439db64566752_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-c4ab2679a8b52b92f1b36f39608c60f9_1440w.jpg)

![图片](https://pica.zhimg.com/v2-fc74e7b69de36c5006d2cdaa530eff14_1440w.jpg)

![图片](https://picx.zhimg.com/v2-64a1a5e7620eb44aadfd1cfd84e41f45_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-f0369418531a3d63c4a274ab59b0c9c6_1440w.jpg)

![图片](https://picx.zhimg.com/v2-f6605c0fb23104e4db8bc6e4085b298b_1440w.jpg)

![图片](https://pica.zhimg.com/v2-d9e595d09dfd4000272af4d5f866bc5c_1440w.jpg)

![图片](https://pica.zhimg.com/v2-1059b51583b8b2a7fcc048a44aee1a5e.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-8d69b1e8ea162d41c08d744bb68db08e.webp)

![图片](https://picx.zhimg.com/v2-0e37d53c77c0e756c4e1b8b052b640b2_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-74ecc4b114fce67b6b42b7f602c3b1d6.png)

