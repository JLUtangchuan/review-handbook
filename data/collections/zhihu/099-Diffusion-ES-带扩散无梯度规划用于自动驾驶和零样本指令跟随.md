---
title: "Diffusion-ES：带扩散无梯度规划用于自动驾驶和零样本指令跟随"
author: "黄浴"
source_url: https://zhuanlan.zhihu.com/p/12811810842
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Diffusion-ES：带扩散无梯度规划用于自动驾驶和零样本指令跟随

> 作者: 黄浴 | 来源: https://zhuanlan.zhihu.com/p/12811810842

---

24年7月来自CMU的论文“Diffusion-ES：Gradient-free Planning with Diffusion for Autonomous Driving and Zero-Shot Instruction Following”。

扩散模型擅长为决策和控制建模复杂和多模态轨迹分布。最近提出奖励-梯度引导去噪，以生成最大化可微分奖励函数和一个扩散模型捕获的数据分布下似然的轨迹。奖励梯度引导去噪，需要一个适合干净和噪声样本的可微分奖励函数，这限制了它作为通用轨迹优化器的适用性。Diffusion-ES，是一种将无梯度优化与轨迹去噪相结合的方法，以优化黑盒子不可微分的目标，同时保持在数据流形中。Diffusion-ES 在进化搜索过程中从扩散模型中采样轨迹，并使用黑箱奖励函数对其进行评分。它使用截断扩散过程来变异高得分轨迹，该过程应用少量的噪声和去噪步骤，从而可以更有效地探索解空间。Diffusion-ES 在 nuPlan（一种成熟的自动驾驶闭环规划基准）上实现了最佳性能。Diffusion-ES 优于现有的基于采样规划器、反应性确定性或基于扩散的策略以及奖励梯度指导。此外，与之前的指导方法不同，该方法可以优化由少量 LLM 提示生成的不可微分语言-成形奖励函数。在人类老师的指导下，该方法可以生成新的、高度复杂的行为，例如激进的车道编织，而这些行为在训练数据中并不存在。这能够解决最困难的 nuPlan 场景，这些场景超出了现有轨迹优化方法和驾驶策略的能力。

如图所示：Diffusion-ES 是一种针对任意奖励函数的测试-时轨迹优化方法，它结合了生成轨迹模型和基于采样的搜索。（a）Diffusion-ES 通过优化鼓励沿车道行驶、避免碰撞和遵守交通标志的通用驾驶奖励函数而生成的轨迹。Diffusion-ES 在 nuPlan [5] 中实现了最先进的驾驶性能。（b-f）Diffusion-ES 通过测试-时优化语言形状的奖励函数来遵循自然语言中的驾驶指令，而无需任何额外的训练。 提示 LLM 将语言指令映射到驾驶奖励函数的程序，然后用 Diffusion-ES 对其进行优化。

Diffusion-ES 是一种轨迹优化方法，它利用无梯度进化搜索从经过训练的扩散模型中执行奖励-引导采样，适用于任何黑盒子奖励函数 R(x)。具体来说，用经过训练的扩散模型 ε/θ 来初始化样本群体，并使用截断扩散去噪过程在数据流形中对样本进行变异。扩散-ES 的控制流程如图（左）和算法 1 所示。如图（右）可视化不同噪声水平的突变。颜色表示沿轨迹的时间步长。虽然噪声扰动本身可能会导致不切实际的轨迹，但去噪有助于将样本投射回轨迹数据流形。

为了遵循自然语言给出的驾驶指令，将它们映射到黑盒子奖励函数，并使用 Diffusion-ES 对其进行优化。采用了与 [29, 71] 类似的方法，即使用 LLM 从语言指令中合成奖励函数。奖励函数是可组合的，允许将语言指导与其他约束无缝结合。这在驾驶中至关重要，因为会不断同时优化许多不同的目标（例如安全性、驾驶员舒适度、路线遵守情况）。

与之前的工作类似，公开一个 Python API，可用于提取有关道路场景中实体的信息。由于驾驶中的许多基本奖励信号不会因场景而异（例如，避免碰撞或可驾驶区域合规性），允许 LLM 编写奖励成形代码来修改基本奖励函数的行为，而不是从头开始生成所有内容。奖励成形可以添加辅助奖励项（例如，密集车道到达奖励）或重加权现有奖励项。如图展示生成的代码示例：使用 LLM 提示通过语言指令塑造奖励函数并使用 Diffusion-ES 对其进行优化，对于相同的初始场景，展示两种不同的语言指令，以及它们生成的奖励成形代码和来自 Diffusion-ES 生成的轨迹。

目标是处理具有时间依赖性的一般和复杂的语言指令，例如“向左换道，然后从右侧超车，然后驶出”。以前的研究 [25, 71] 产生了一个固定的奖励函数，即在规划期间固定的奖励函数。这使得仅通过奖励来表达序贯规划变得具有挑战性。在代码中捕获这些规划的一种更自然、更简洁的方法，是使用在调用之间保留内部状态的生成器函数。

在已发布的 nuPlan 训练数据的 1% 上训练扩散模型，该数据从原始的 20Hz 到 0.5Hz 进行子采样。扩散模型是使用 T = 100 个扩散步骤训练的 DDIM [58]。用缩放的线性 beta 调度并预测 ε。模型在 PyTorch 中实现，使用 HuggingFace Diffusers 库来实现扩散模型。

基本扩散架构如下。每个轨迹航点都线性投影到隐维度大小为 256 的潜特征。噪声级别使用正弦位置嵌入进行编码，然后使用 2 层 MLP。通过将噪声特征连接到特征维度上的所有轨迹特征并投影回隐大小为 256，将噪声特征与轨迹tokens融合。还将旋转位置嵌入 [59] 作为时间嵌入应用于轨迹tokens。然后，将所有轨迹tokens传递到 8 个 Transformer 编码器层，每个轨迹tokens解码为相应的航路点。最终轨迹由堆叠的航路点预测组成。条件扩散策略基线使用类似的架构，只是使用 Urban Driver [53] 的 重实现 nuPlan 主干来对场景进行特征化，并将这些tokens传递到自注意层。

以批量大小 256 训练模型，并使用 AdamW 优化器，学习率为 1e-4，权重衰减为 5e-4，(β1, β2) = (0.9, 0.999)。

轨迹由 16 个 2D 姿势航路点组成，每个航路点有 3 个特征 (x, y, θ)。用 MotionLM [54] 中描述的 Verlet 包裹，对这些轨迹特征进行预处理，这可以通过鼓励平滑轨迹来提高性能。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-dd52b3ded9e49cb8cd7030aef42d3ecd_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-208788b81b2c753bef7d4a92275fbcdc_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-246f52cabae0bf8ac1ba46e1dc5bb3fe_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-5121df6380ef44360adedccfc2c7dc9d_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-ef404ff8305107b6dd692b05b9c3fa27_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-6822d9274711f4b55a72db2a27307a97_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-dd52b3ded9e49cb8cd7030aef42d3ecd_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-62af72255eb78bb2c583a8cca7f2a70c.webp)

![图片](https://pic1.zhimg.com/v2-e499b4bc303acad40d377560bfb0d5b1_250x0.jpg?source=172ae18b)

