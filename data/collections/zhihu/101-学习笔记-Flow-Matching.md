---
title: "学习笔记 - Flow Matching"
author: "tianchen"
source_url: https://zhuanlan.zhihu.com/p/12701512782
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 学习笔记 - Flow Matching

> 作者: tianchen | 来源: https://zhuanlan.zhihu.com/p/12701512782

---

注：原文为英文发表在我的blog：http://guhaochen.uk上，此版本为chatgpt翻译。

流匹配（Flow Matching）是一种用于训练流生成模型的技术。作为一名机器学习初学者，我将从生成模型开始，解释我对流匹配的理解。

生成模型

对于生成模型，一个关键假设是，我们想要生成的样本服从一个分布 p(x)。例如，如果我们想训练一个模型生成猫的图像，那么我们需要学习一个概率分布，该分布的维度为 256 \times 256 \times 3。（256 \times 256 是图像的分辨率，3 是通道数。）从该分布中采样的样本将与猫的图像类似。

p(x) 是一个非常复杂的分布，大多数情况下我们并不知道它的具体形式。一个策略是从简单的分布 p_Z(z) 映射到 p_X(x)，其中 z 是一个简单的分布，比如高斯分布。通过从 p_Z(z) 中采样，并将其变换为 p_X(x)，我们就可以生成样本。这正是流生成模型（Flow-based Generative Models）的核心思想。

正则流（Normalizing Flows）

在正则流（Normalizing Flow）中，我们建立了一个可学习的生成器 G_{\theta}，使得：

x = G_{\theta}(z) \\p_{1}(x) = p_{0}(z) |det(J_{G^{-1}})| \\

其中 p_{0}(z) 是标准高斯分布，p_{1}(x) 是数据的真实分布。

|det(J_{G^{-1}})| 是逆函数 G 的雅可比行列式的绝对值，其存在可以理解为概率空间的拉伸程度。严格证明可以在任何统计学教材中找到。

模型的损失函数通过最大化对数似然来定义：

log p_{1}(x) = log p_{0}(z) + log |det(J_{G^{-1}})| \\

G_{\theta} 存在一些限制条件。首先，它必须是可逆的；其次，G_{\theta} 必须具有某种特殊形式以便于计算行列式，比如三角矩阵。由于第二个限制，单一的流模型能力不足，因此我们需要将其“加深”，即：

x = G_{\theta_{1}} \circ G_{\theta_{2}} \circ ... \circ G_{\theta_{n}}(z) \\

其对数似然为：

log p_{1}(x) = log p_{0}(z) + \sum_{i=1}^{n} log |det(J_{G_{\theta_{i}}^{-1}})| \\

连续正则流（Continuous Normalizing Flows, CNFs）

让流连续化有多个动机。据我理解，这使得变换更加平滑，“连续”可以理解为“无限深”。在 CNFs 中，变换通过一个常微分方程（ODE）定义：

\frac{d x_{t}}{d t} = u_t (x_t, \theta) \\

其中 t \in [0, 1]。x_{t} 是时间 t 时系统的状态，u_t 是向量场。在 t=0 时，p_{0}(x) 是标准高斯分布，而在 t=1 时，p_{1}(x) 是数据的真实分布。忽略一些微积分细节，我们有：

\frac{d p_{t}(x_t)}{d t} + \frac{d}{d x} (p_t(x_t)u_t(x_t)) = 0 \\\frac{d p_{t}(x_t)}{d t} = - \nabla \cdot u_{t}(x_t, \theta) p_{t}(x_t) \\\frac{d log p_{t}(x_t)}{d t} = - \nabla \cdot u_{t}(x_t, \theta) \\

对数似然为：

log p_{1}(x) = log p_{0}(x_0) + \int_{0}^{1} - \nabla \cdot u_{t}(x_t, \theta) dt \\

在该方程中，最大的问题是积分计算非常昂贵，而流匹配正是为了解决这一问题。

流匹配（Flow Matching）

通过从似然中推导损失函数，模型直接学习数据的分布。然而，这种分布完全由变换（流）定义。因此，仅仅学习流就足够了，这正是流匹配的核心思想。

在流匹配中，目标是最小化神经网络流与真实流之间的差异，其损失函数为：

L_{FM} = E_{t, p_t(x_t)} ||v_t(x_t, \theta) - u_t(x_t)||^2 \\

其中 v_t(x_t) 是神经网络流，而 u_t(x_t, \theta) 是真实流。然而，真实流是未知的，解决方法是使用条件概率。

给定一个样本 z，我们得到条件 x_1 = z。在这一条件下，所有从 x_0 流向 z 的样本定义了一个条件路径。在此路径上，u_t(x_t | x_1 = z) 是一个指向 z 的向量场。

为了保证中间状态 x_t 从 x_0 开始并最终达到 x_1，可以合理地定义：

x_t = \Psi_t(x_0 \mid x_1) = \sigma_t x_0 + \alpha_t x_1 \\

其中 \sigma_t + \alpha_t = 1。

因此，我们得到条件流匹配的损失函数：

L_{CFM} = E_{t, q(z), p_t(x_t | x_1 = z)} ||v_t(x_t, \theta) - u_t(x_t|x_1 = z)||^2 \\

其中 u_t(x_t|x_1 = z) 是已知的。

通过一些微积分技巧，我们可以得到：

\nabla_{\theta} L_{FM} (\theta) = \nabla_{\theta} L_{CFM} (\theta) \\

这完全足以进行梯度下降并训练模型。

流匹配与扩散模型

要解释流匹配和扩散模型之间的关系，有必要先说明流匹配的训练算法。

训练流匹配，我们需要如下样本：

\begin{aligned} & t \sim \mathcal{U}([0, 1]) && \quad \text{采样时间} \\ & z \sim q(z) && \quad \text{采样数据} \\ & x_0 \sim p(x_0) && \quad \text{采样噪声} \\ & x_t = \Psi_t(x_0 \mid x_1) && \quad \text{条件流} \end{aligned} \\

然后通过梯度步更新：

\nabla_\theta \left\| v_t^\theta(x_t) - u_t(x_t|x_1 = z) \right\|^2 \\

可以理解为：给定一个从标准高斯分布中采样的样本，通过函数 \Psi_t(x_0|x_1) 将其与数据点叠加以获得 中间状态 x_t。梯度步骤的目标是学习将 x_t 转化回 z 的流。

回顾扩散模型的训练过程，给定一个数据点，我们从标准高斯分布中采样一个噪声，并将其与数据点叠加以获得 噪声数据点。然后训练神经网络去预测噪声。

对比两者的叙述，可以清晰地（也许吧）看出，流匹配实际上是扩散模型的一种形式，其中去噪过程通过流来完成。

参考文献

How I Understand Flow Matching : https://www.youtube.com/watch?v=DDq_pIfHqLs&t=873s

Flow Matching: Simplifying and Generalizing Diffusion Models | Yaron Lipman : https://www.youtube.com/watch?v=5ZSwYogAxYg

An Introduction to Flow Matching : https://mlg.eng.cam.ac.uk/blog/2024/01/20/flow-matching.html#flow-matching


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-7d9d16e7201219aaab39cdb6b948fb28_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-24d29d14f04812bdef810be924a71c24.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-e96a4bab27e85a39f1d74582cf1c0c61.webp)

