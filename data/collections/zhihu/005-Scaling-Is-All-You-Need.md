---
title: "Scaling Is All You Need"
author: "振振有词"
source_url: https://zhuanlan.zhihu.com/p/2045891619426252501
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Scaling Is All You Need

> 作者: 振振有词 | 来源: https://zhuanlan.zhihu.com/p/2045891619426252501

---

自动驾驶从 UniAD 开始了 E2E 范式的热潮，从 23 年到现在 3 年的时间里，从实验室走到实车的商业化落地，无论是 FSD，HSD 等一段式 E2E 的智驾方案都展现出巨大的潜力与体验提升。城区的领航辅助功能从有功能走向大家实际的通勤过程中开始去用智驾来放松自己，来释放更多的时间给自己。不过从去年开始，VLA，WM 等词开始不断地冲击大家的视野，到最近 EponaV2,论文的输出，整体的范式再次逐渐清晰，核心思想就是： scaling is all you need ！

WM：
from 附件1




维度	Renderer	Simulator	Planner
输出	像素（观测）	状态（几何+物理）	动作
受众	人眼	人+计算机程序	机器人/Agent
契约	视觉逼真度	结构正确性	任务成功
知道什么	观看者会看到什么	世界实际是什么	该做什么
商业成熟度	最高（已大规模部署）	中（Omniverse、数字孪生）	最低（实验室阶段）
代表工作	Sora, Genie 3, RTFM	NVIDIA Omniverse, World Labs Marble	VLA, World Action Models

Sora, Genie 3, RTFMNVIDIA Omniverse, World Labs MarbleVLA, World Action Models

文章核心： Simulator（模拟器）才是真正的关键枢纽 — 语言是对世界的抽象，像素是对世界的投影，但几何、物理和动力学才是世界本身。掌握 Simulator 的模型可以向下游投射为 Renderer（视觉）和 Planner（动作），反之则不行。

Renderer 现在业内第一增益就是数据增广， 在 corner case，紧急场景，小众场景，通过不断地场景增广，放到数据里去训练，这个已经得到了大规模的验证；

整体 pip 如果可以很高效的 work，或者类似 3dgs 高速的渲染， 是否可以支持闭环仿真？ 整体国内在这块真正一段式 RL 闭环仿真得到大批量的 work 的工作还不是很多， 因此才有 RAD-2: Scaling Reinforcement Learning in a Generator-Discriminator Framework 这个工作。




EponaV2：
from 附件3

这张图展示了三种不同的自动驾驶模型训练流程对比，重点突出了本文提出的 EponaV2 与传统方法及现有世界模型的区别。

(a) 基于感知的模型 (Perception-Based Models)
依赖人工标注 (Human Labels)：这类模型（如 VADv2）在训练感知模块时需要大量的物体边界框、语义分割等手动标注。
任务设计：通过设计辅助任务（如占用预测 Occ-Pred 或视觉问答 VQA）来建立感知能力。
局限性：人工标注极其昂贵且耗时，严重限制了模型通过大规模数据进行扩展（Data Scaling）的能力。
(b) 现有的驾驶世界模型 (Existing Driving World Models)
无感知标签 (Perception-Free)：这类模型（如 📄 Epona 和 📄 DriveVLA-W0）通过预测下一帧图像 (I_{N+1}) 来学习环境动力学。
单一监督：主要依赖图像预测作为自监督信号。
局限性：原始图像中的信息高度缠绕，模型难以仅通过预测像素来深入理解 3D 几何关系和复杂的语义上下文，导致规划效果不尽如人意。
(C) EponaV2
综合未来推理 (Comprehensive Future Reasoning)：EponaV2 不仅预测下一帧图像，还利用 基础模型 (Foundation Models) 生成的伪标签来预测未来的 深度图 ((d_{N+1})) 和 语义图 ((h_{N+1}))。
自监督强化：

深度预测：强制模型理解 3D 几何结构和物体的运动动态。
语义预测：利用 SAM 3 等模型提取的语义特征，使模型关注对驾驶决策至关重要的元素。
优势：这种方法既保持了“无感知标签”的可扩展性，又通过更丰富的多模态推理增强了模型对现实世界的理解，从而显著提升了轨迹规划的准确性。
from 附件3
from 附件3
from 附件2

无论是 xiaopeng 的 VLA2.0 还是 EponaV2，核心思想都是去掉感知的强监督信息， 利用自监督的核心思想实现 scaling law；这点思想完全就是照搬大语言模型的思想， chatgpt 或者现在 vibe coding 能这么 work，核心还是强大的，海量高质量的数据；

利用 DINOv2 来对图形进行信息提取，通过前后帧 GT 图像，进行一致性 loss 的监督，实现自监督； 同时在信息提取的方向与图像生成的方向，无论是 Dit，还是 RAEV2 都取得了巨大的进展，让高质量的信息提取成为可能，让快速的重建越来越 work。

但是目前 WM 还停留在 renderer 的阶段，不能高质量地理解这个世界，所以需要 WM 这个方向，类似李飞飞他们进一步的工作，但是要有类似可以实践的、可以增加类似 EponaV2 的图像的深度、语义分割等模型去提取信息，进行自监督；

这个点稍微延展一下，类似现在都是 auto labeling 工作，无论是 OD，OCC，LD，segmentation 都是可以自动化提取进行监督；这样也可以增加整体的 backbone 对于空间的理解能力，也方便 planner 任务后续 RL 与 SFT 的过程。

综合来看，follow 大语言模型的范式，依赖自监督+WM 的迭代范式，未来在智能驾驶领域有无限的想象空间。

L2++已经走到了一定瓶颈，L4 才能给所有的 OEM、TIER1 新的故事与想象空间；

新的范式解决了几点关键问题：

整体网络的无损信息传输，图像特征的提取导向 backbone，直接到 planner 任务，比之前分段或者 Uniad 的范式好很多；
没有高质量的同源数据要求，让 scaling law 成为可能；
WM 的闭环仿真对于智驾这个闭环系统太重要了，只有闭环+生成才能达到真正的超越人类；

null

Fei-Fei Li on X: 「A Functional Taxonomy of World Models」 / X
Xianming Liu on X: 「Building the World Model for Autonomous Driving」 / X
EponaV2: Driving World Model with Comprehensive Future Reasoning by Jiawei Xu
Improved Baselines with Representation Autoencoders

以上均为个人观点，欢迎交流。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-ab6c1b9d9115523926ce792775976538_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-a405ea8f6dc471b42a22388837d2ea2d_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-13a993e107701b0cfa5eb442c4e311f0_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-1dc80d114915137e6ffcbdc4304881f1_1440w.jpg)

![图片](https://pica.zhimg.com/v2-171fd9650858bebbf541203468d43b8e_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-411dd1d9be905ba2b540e40426ec91ce_1440w.jpg)

![图片](https://picx.zhimg.com/v2-0ba3ae331ca8cb4c45826dcbda3e14f1_250x0.jpg?source=172ae18b)

