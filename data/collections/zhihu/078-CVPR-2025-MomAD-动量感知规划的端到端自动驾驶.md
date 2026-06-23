---
title: "CVPR 2025｜MomAD：动量感知规划的端到端自动驾驶"
author: "地平线HorizonRobotics"
source_url: https://zhuanlan.zhihu.com/p/28730865330
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# CVPR 2025｜MomAD：动量感知规划的端到端自动驾驶

> 作者: 地平线HorizonRobotics | 来源: https://zhuanlan.zhihu.com/p/28730865330

---

论文链接：https://arxiv.org/abs/2503.03125
论文代码：https://github.com/adept-thu/MomAD

研究背景

自动驾驶技术经历了从模块化到更集成化的端到端范式的转变。传统方法将检测、跟踪、地图构建、运动预测和规划等任务分开处理，而端到端框架则强调这些任务的无缝集成。通过优先考虑规划，端到端框架能够战略性地引导来自上游感知模块的信息，从而增强动态驾驶环境中的鲁棒性和可靠性。高质量的规划依赖于准确预测自车未来的轨迹，这需要对静态和动态环境因素（如地图元素和与周围交通参与者的交互）有长远的理解。

然而，由于其他道路使用者意图的不确定性、道路条件的变化以及人类驾驶行为引入的模糊性，轨迹预测本质上是随机的，这使得确定性预测变得次优甚至具有风险。现有的多模态轨迹规划方法虽然能够考虑多种可能的交通参与者行为，但它们通常是基于当前感知帧的一次性预测，容易受到遮挡或关键视觉线索丢失的影响，导致轨迹质量下降。此外，缺乏时间一致性可能导致连续轨迹缺乏连贯性，引发不稳定的车辆控制。为了解决这些问题，本文提出了动量感知驾驶框架 (MomAD) ，通过引入轨迹动量和感知动量来稳定和优化轨迹预测，从而在动态驾驶环境中实现更平滑和一致的规划结果。

根据上图对比我们可以看到，(a) 确定性规划的方案，缺乏动作多样性，存在安全风险；(b) 多模态轨迹规划方案，通过选择最高分轨迹，但存在最大分数偏移问题导致稳定性不足；(c) 我们提出的MomAD巧妙利用“惯性”的思想，通过动量规划，利用历史和感知动量提升时序一致性，解决端到端自动驾驶中不稳定行驶的问题。

研究方法
1. Topological Trajectory Matching

该模块通过Hausdorff距离选择与历史路径最匹配的多模态轨迹提案，以确保时序一致性和轨迹的连续性。具体来说，TTM模块通过最小化不同时间步之间的规划差异，防止轨迹偏离历史轨迹。

2. Momentum Planning Interactor

该模块通过长时查询混合器将当前最佳规划查询与历史规划查询进行交叉注意力处理，扩展静态和动态感知文件，从而丰富当前查询的上下文信息。MPI模块通过结合历史查询和当前查询，生成改进的轨迹预测，增强了对周围环境的感知能力。

3. Robust Instance Denoising via Perturbation

在训练过程中引入受控噪声扰动，使模型能够区分关键和无关特征，提高对感知噪声的鲁棒性。通过这种方式，模型在测试时能够更好地应对实例特征的波动，生成更稳定和平滑的轨迹。

结果与分析

如表所示，MomAD在L2误差、碰撞率和TPC（轨迹预测一致性）上分别达到了0.60米、0.09%和0.54米。与UniAD、VAD和SparseDrive等最先进方法相比，我们的方法在规划结果上表现出色。值得注意的是，我们在TPC指标上取得了显著改进，在nuScenes数据集上1秒、2秒和3秒的TPC分别提升了0.30米、0.53米和0.78米，直接证明了我们在时间一致性方面的有效性。

总体而言，MomAD有效利用了动量的平滑优势，在提升时间一致性方面效果显著。

准确的长轨迹预测对于提升自动驾驶的稳定性至关重要，同时也有助于评估模型解决多模态轨迹规划中时间一致性问题的能力。如表所示，我们在nuScenes和Turning-nuScenes数据集上对比了SparseDrive和MomAD在4-6秒长轨迹预测中的表现，结果显示MomAD在性能上有显著提升。

具体而言，在nuScenes数据集中，与SparseDrive相比，MomAD在4秒、5秒和6秒的L2误差分别降低了0.09米（5.14%）、0.34米（14.66%）和0.50米（16.95%），碰撞率分别降低了0.04%、0.11%和0.20%，TPC（轨迹预测一致性）分别降低了0.14米（10.53%）、0.21米（12.65%）和0.38米（19.10%）。

此外，在Turning-nuScenes数据集中，与SparseDrive相比，MomAD在4秒、5秒和6秒的L2误差分别降低了0.27米（13.04%）、0.64米（23.62%）和0.85米（25.30%），碰撞率分别降低了0.06%、0.14%和0.26%，TPC分别降低了0.17米（11.04%）、0.73米（31.60%）和0.97米（32.45%）。

可以观察到，MomAD在更远距离的轨迹预测上表现显著提升，尤其是在6秒时的改进幅度最大。总体而言，MomAD提升了长轨迹预测的性能，进一步证明了其能够有效缓解时间一致性问题。

我们已在Bench2Drive数据集上进行了具有挑战性的闭环评估，结果如表所示。该数据集涵盖44个交互场景，例如切入、超车、绕行，以及220条路线，覆盖多种天气条件和地点。我们的MomAD框架在成功率上分别比VAD多模态变体和SparseDrive分别提高了16.3%和8.4%，并在舒适度评分（轨迹平滑度）上分别提升了7.2%和5.3%，证明了其有效性。

结论

MomAD框架通过引入轨迹动量和感知动量，显著提高了端到端自动驾驶系统在轨迹规划中的稳定性和鲁棒性。未来工作将探索扩散模型和推测解码方法，以进一步提高轨迹多样性和效率。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-b38f7e2a81b20518426ffabdc8517b56_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic3.zhimg.com/v2-1c2097368baee490af52b8c761aaf86e_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-30d470f57d966e9f9e834b1bc3f97aba_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-bd12bb2bebf94580cfa2530fbe4c73a0_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-6b5da4929048edbf471d588e988966ed_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-f7fe33881e4c3eed26d748f73877e482_1440w.jpg)

![图片](https://pica.zhimg.com/v2-79005f292628e4b0d84ab0eae766d50a_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-b4f4a3bdd6f9aec282b685e9ce3031e0_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-62af72255eb78bb2c583a8cca7f2a70c.webp)

![图片](https://pic1.zhimg.com/v2-45bf1b51f18ed8b4528ba10adb7518ed_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-5baa6b037997bc525d7538fce224fed0_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-d24ed870663f60e7a6b4a38a7e3ed4df_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-ae1ceb8178332793d7bdba3944694573_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-3764d7b5ff180fbc545cfcd4fa471d1c_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-a690ef18ba60629122390e2373e8e82e_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4e6e8aff416cc858aa302883250b9af4_250x0.jpg?source=172ae18b)

