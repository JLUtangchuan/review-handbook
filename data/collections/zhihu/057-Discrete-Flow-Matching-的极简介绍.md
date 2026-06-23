---
title: "Discrete Flow Matching 的极简介绍"
author: "柯国霖"
source_url: https://zhuanlan.zhihu.com/p/1910038443599303559
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Discrete Flow Matching 的极简介绍

> 作者: 柯国霖 | 来源: https://zhuanlan.zhihu.com/p/1910038443599303559

---

近期 Diffusion LLM 热度骤增，刚好也看了不少离散Diffusion的工作，简单写一个离散Flow Matching的简介。相关的论文里公式其实比较多，但拆开来看，核心的部分依然很简单，这里依然争取用最少的文字来说清楚。




连续的Flow Matching(FM)大家都很清楚了，这里简单复述下。

训练时随机采样 t \in [0, 1) , 然后线性插值得到t时刻的输入， x_t = (1-t)x_0 + tx_1 ，x_0 是初始随机噪声， x_1 是目标分布。

训练目标是瞬时速度，也就是 x_t 对于 t 的导数，即 v_t = dx_t/dt = x_1 - x_0 。

推理时用ODE求解，最简单的是一阶Euler：从随机噪音开始，用 x_{t+dt} = x_t + v_t dt 更新，其中 dt 是步长， v_t 是模型预测的速度。




离散FM其实和连续版本差不多，主要区别是目标分布为一个 [..., d] 的one-hot分布（记为 p_1 )， d 是类别数量。

初始分布(记为 p_0 )可以全是mask（目前比较常用），也可以是随机的one-hot分布。

训练时，依然是随机采样 t \in [0, 1) ，然后线性插值得到中间概率 p_t = (1-t)p_0 + tp_1 ，然后用它做类别采样，得到离散的输入 x_t 。

重点来了，和连续FM不一样的是，离散FM的训练目标不是瞬时速度，而是 p_1 。

原因也很简单：因为瞬时速度是个软标签，处理麻烦一点；而用硬标签 p_1的话，可以直接用交叉熵。

这个区别，导致了离散FM的推理和连续FM不一样：因为模型没有直接预测速度，需要推导一下速度的形式。

具体来说，在 t 时刻，我们知道 p_t ，以及模型预测的 p'_1 ，利用 p_t = (1-t)p_0 + tp_1 ，以及 v_t = p_1 - p_0 ，容易得到 v_t = \frac{p'_1 - p_t}{1-t} 。

然后就可以用ODE求解来进行更新了： p_{t+dt} = p_t + \frac{p'_1 - p_t}{1-t}dt 。
这个式子稍微化简一下，会得到一个类似 (1-k)p_t + kp'_1, (k=\frac{dt}{1-t}) 的形式，因为 p_t 和 p'_1 都满足概率和为1，加权平均后，概率和依然是1。所以直观上，这个更新也是合理的。

到这里，离散FM的基本框架就说完了，可以看到它的核心是逐步逼近一个离散的one-hot分布。这点也和离散Diffusion模型有些区别：后者主要建模转移的概率；而FM是直接建模目标分布，然后构造瞬时速度来迭代逼近。

相信不久就会有基于离散FM的LLM出来，期待一下吧。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/97b2a98e4_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/97b2a98e4_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-7da40d108e7f3ab1444edb3a15b01585.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-6db8ac0c4b232287eb50f0028f449de8.webp)

![图片](https://pic1.zhimg.com/v2-c58295ebcb7acb1341d57c3f92d515b0_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://pica.zhimg.com/v2-1f405e5020a16fa2d63551a205e0bebf_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-501ff2e1fb7cf3f9326ec5348dc8d84f.png)

![图片](https://pica.zhimg.com/97b2a98e4_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/808d32dd75621783c3bf3414d8b2eb2b_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-bffb2bf11422c5ef7d8949788114c2ab.png)

![图片](https://picx.zhimg.com/v2-1f405e5020a16fa2d63551a205e0bebf_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-b0c6e2995fe120e8996f8838184c5d85_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-86b474de1dfc4ea04cd1b257a6f3ef55_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4940d712eda090e3f3e1ef10f9d9afad_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-438ab842f0fdbfb46be0bf989d6513fc_250x0.jpg?source=172ae18b)

