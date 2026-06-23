---
title: "系数保持采样：Flow Matching随机性注入的正确打开方式"
author: "王峰"
source_url: https://zhuanlan.zhihu.com/p/1948388095151026330
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 系数保持采样：Flow Matching随机性注入的正确打开方式

> 作者: 王峰 | 来源: https://zhuanlan.zhihu.com/p/1948388095151026330

---

阅读本文之前，建议先阅读：零推导理解Diffusion和Flow Matching 和 零推导理解Diffusion Flow Matching（二）：随机性 。本文因为涉及到很多推导，没办法作为零推导理解系列的文章了，后面有机会再更新这一系列。

本博客对应论文：Coefficients-Preserving Sampling for Reinforcement Learning with Flow Matching

代码（整理中）：https://github.com/IamCreateAI/FlowCPS

一、Flow-SDE的噪声问题

最近在做Diffusion-RL相关的研究，借着LLM-RL的东风，将各种方法迁移到Diffusion或者Flow Matching的研究也是逐渐兴起了。我一开始是基于Flow-GRPO[1]做的，抛开reward hacking暂且不谈，这reward分数确实是嗷嗷涨：

Flow-GRPO文章中的图，代码开源可复现，点赞

但我在做实验的时候发现一个问题，怎么训练时采样出来的图片上噪声这么大：

训练时采样到的图片，有显著的噪声

按理说就算训练时减少了采样步骤，这图像应该是变糊才对，不应该像这样有这么多噪声，这反而像是去噪不彻底的表现。后来直接在4步的FLUX.1-schnell上进行实验，也发现了类似的现象，说明不是步数少带来的问题。

那问题就只能出在采样方法上了，RL训练需要多样性的样本，众所周知Flow Matching直接建模了一个ODE，为了引入随机性，改用SDE是非常自然的想法。Flow-GRPO中使用了Flow-SDE[2]作为采样器，采样公式为：

\bm{x}_{t-\Delta t} = \bm{x}_t - [\hat{\bm{v}}_{\theta}(\bm{x}_t, t) + \frac{\sigma_t^2}{2t}\underbrace{(\bm{x}_t+(1-t)\hat{\bm{v}}_{\theta}(\bm{x}_t, t))}_{\text{predicted noise} }]\Delta t + \sigma_t \sqrt{\Delta t} \bm{\epsilon}

中间的 \bm{x}_t+(1-t)\hat{\bm{v}}_{\theta}(\bm{x}_t, t) 我们上篇文章说过，其实就是预测的噪声项。这个公式看起来比较复杂，我们需要将其像上篇文章一样拆解成预测样本、预测噪声、新加入噪声三项。首先对一个ODE的Flow Matching采样进行分解：

\begin{align} \hat{\bm{x}}_{t - \Delta t} &= \bm{x}_t - \hat{\bm{v}}_{\theta}(\bm{x}_t,t) \Delta t \notag\\ &= \left(1-(t-\Delta t)\right)\underbrace{\left(\bm{x}_t - t\hat{\bm{v}}_{\theta}(\bm{x}_t,t)\right)}_{\text{predicted }\hat{\bm{x}}_0 } + (t-\Delta t)\underbrace{\left(\bm{x}_t + (1-t)\hat{\bm{v}}_{\theta}(\bm{x}_t,t)\right)}_{\text{predicted }\hat{\bm{x}}_1 } \notag\\ &= \underbrace{\left(1-(t-\Delta t)\right)}_{\text{coefficient of sample}} \hat{\bm{x}}_0 + \underbrace{(t-\Delta t)}_{\text{coefficient of noise}}\hat{\bm{x}}_1, \end{align}

有了这个公式之后，对Flow-SDE也进行分解：

\begin{align} \bm{x}_{t-\Delta t} & = \bm{x}_t - [\hat{\bm{v}}_{\theta}(\bm{x}_t, t) + \frac{\sigma_t^2}{2t}\underbrace{(\bm{x}_t+(1-t)\hat{\bm{v}}_{\theta}(\bm{x}_t, t))}_{\text{predicted }\hat{\bm{x}}_1 }]\Delta t + \sigma_t \sqrt{\Delta t} \bm{\epsilon} \notag\\ &=\underbrace{\bm{x}_t - \hat{\bm{v}}_{\theta}(\bm{x}_t, t) \Delta t}_{\text{above equation}} - \frac{\sigma_t^2 \Delta t}{2t}\hat{\bm{x}}_1+ \sigma_t \sqrt{\Delta t} \bm{\epsilon} \notag\\ &= \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + (t-\Delta t - \frac{\sigma_t^2 \Delta t}{2t})\hat{\bm{x}}_1+ \sigma_t \sqrt{\Delta t} \bm{\epsilon} \end{align}

对于噪声这里，也是像DDIM那样减去了一项，后面再加入了新的一项，看起来没什么大问题...吗？

其实问题还挺严重的，DDIM两个噪声项系数的平方和，恰好等于它当前步骤应该有的噪声方差水平，但这里后两项的平方和，显然不等于 (t - \Delta t)^2 ，如果这里加得比 (t - \Delta t)^2 高了，相当于每一步都加了更多的噪声，那最终生成的图像岂不是也会多很多噪声？我们推导一下，这里后两项相加的噪声标准差为：

\begin{align} \sigma_{total} &= \sqrt{(t-\Delta t - \frac{\sigma_t^2 \Delta t}{2t})^2 + \sigma_t^2 \Delta t} \notag\\ &= \sqrt{(t-\Delta t)^2 -\frac{\sigma_t^2 \Delta t}{t}(t-\Delta t)+ (\frac{\sigma_t^2 \Delta t}{2t})^2 + \sigma_t^2 \Delta t} \notag\\ &=\sqrt{(t-\Delta t)^2 +\frac{(\sigma_t \Delta t)^2}{t}+ (\frac{\sigma_t^2 \Delta t}{2t})^2} \notag\\ &\ge t-\Delta t, \end{align}

这里虽然写的是大于等于，但其实等于号只有在 \sigma_t = 0 时，也就是没有随机性时能取到。所以说Flow-SDE每一步都多加了 \sqrt{\frac{(\sigma_t \Delta t)^2}{t}+ (\frac{\sigma_t^2 \Delta t}{2t})^2} 这么多的噪声！尤其是这个误差项还会除以t，在t很小的时候，这个误差还是非常大的。

二、解决方案

发现问题之后，解决问题就简单很多了。如果说SDE减少的那项 \frac{\sigma_t^2 \Delta t}{2t}\hat{\bm{x}}_1 跟后面新加入的噪声 \sigma_t \sqrt{\Delta t} \bm{\epsilon} 不匹配的话，我们换掉它，让第二项减去的幅度与新加入的噪声幅度相符就好了：

\bm{x}_{t-\Delta t} = \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + \sqrt{(t-\Delta t)^2 - \sigma_t^2\Delta t}\hat{\bm{x}}_1+ \sigma_t\sqrt{\Delta t}\bm{\epsilon}

这个公式形式其实跟DDIM蛮像的，在每一步，样本前的系数和噪声前的系数（多个噪声要取平方和开根号）都完美符合scheduler。其实这也与训练相符，因为训练时是按 \bm{x}_t = (1-t) \bm{x}_0 + t \bm{x}_1 采样网络输入的，那在测试时每一步网络的输入也应该符合这样一个形式。神经网络是个黑盒，OOD的样本输出会带来的什么样的输出是不可预知的，大概率不会有什么好结果。

为了能够做到训练和测试一致，我们提出“系数保持采样（Coefficients-Preserving Sample，CPS）”的概念，只有当一个采样过程中每一步的样本前系数与噪声前系数都与scheduler一致的情况下，才可以称之为“系数保持采样”。可以看到DDIM和我们提出的采样算法，都是符合系数保持采样要求的，而Flow-SDE有一定的误差，不能被称作系数保持采样。

上边这个采样公式其实还是保守了一些，其中 \sqrt{\Delta t} 项是为了形成维纳过程（Wiener Process，也叫布朗运动），加入这一项之后，可以保证在整个采样过程中，加入的总噪声幅度不超过1。但在RL中，我们希望的是多样性越高越好，所以完全不必加入这个限制，我每一步都采样一个新鲜的噪声一样能正常的产生图像。所以拿掉 \sqrt{\Delta t} 之后采样公式变为：

\bm{x}_{t-\Delta t} = \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + \sqrt{(t-\Delta t)^2 - \sigma_t^2}\hat{\bm{x}}_1+ \sigma_t\bm{\epsilon}

之后我又注意到这个公式其实不太好用， \sigma_t 如果设置成全局一致的话，前几步就太小了，而后几步又加得太多，如果设置得过大超过了 t - \Delta t 还会导致根号下出现负数的问题。考虑到这就是一个圆形公式，没有什么形式比sin cos更适合的了，令 \sigma_t = (t - \Delta t ) \sin(\frac{\eta \pi}{2}) ：

\bm{x}_{t-\Delta t} = \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + (t - \Delta t)\cos(\frac{\eta \pi}{2})\hat{\bm{x}}_1+ (t - \Delta t)\sin(\frac{\eta \pi}{2})\bm{\epsilon}

这里 \eta \in [0,1] ，代表的物理意义就是噪声总和与预测噪声之间的夹角，画出图来也很好看：

跟上篇文章的区别就在于这里加入多少新噪声由角度来控制了
三、误差的根源

如果只是做工程的话，问题已经解决，这篇文章到这里也就结束了。但我仍然有一个疑问：SDE采样究竟错在哪了？这可是Diffusion的理论基石之一，怎么会有问题？

于是我打开了Score-SDE这篇文章[3]，开始认真地啃它的理论推导，其实也不算很难：

来自于[3]的Appendix B, VP SDE对应DDPM

微分方程大致上应该符合这么一个形式： dx = f(x,t)dt ，Eq. 24里有两个约等于，第一步是为了凑出来一个x(t)移到左边形成dx而使用了泰勒展开，另一个是为了消除掉一个 \Delta t 避免同一项里出现两个 \Delta t ，这样进行了两步近似之后，形成了一个微分方程Eq. 25。

注意到这里的两个约等于成立的条件都是 \Delta t \to 0 ，这对于当年的DDPM的1000步采样来说自然是没问题的，但对于目前大家用的十几步甚至蒸馏到4步的模型来说，就不再成立了。其中的泰勒展开用的还只是一阶展开，其误差在 \Delta t 较大的时候确实会比较大。

那对于Flow Matching的SDE来说是不是也是这样近似出来的呢？利用泰勒展开：\sqrt{t^2 - x} = t - \frac{x}{2t} + O(x) ，对我们上边提出的采样公式做一下变形：

\begin{align} \bm{x}_{t-\Delta t} &= \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + \sqrt{(t-\Delta t)^2 - \sigma_t^2\Delta t}\hat{\bm{x}}_1+ \sigma_t\sqrt{\Delta t}\bm{\epsilon} \\ & \approx \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + \left(t-\Delta t - \frac{\sigma_t^2\Delta t}{2(t-\Delta t)}\right)\hat{\bm{x}}_1+ \sigma_t\sqrt{\Delta t}\bm{\epsilon} \notag\\ & \approx \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + \left(t-\Delta t - \frac{\sigma_t^2\Delta t}{2t}\right)\hat{\bm{x}}_1+ \sigma_t\sqrt{\Delta t}\bm{\epsilon}, \end{align}

与VP SDE的推导一样，第一步我也是用了泰勒展开，第二步也是省略掉了一个 \Delta t ，最后竟然能得到跟Flow-SDE一模一样的采样公式！所以说Flow-SDE其实也只能用于 \Delta t \to 0 的情况，对于较大的步长，误差会比较明显。

这里我们画出了Flow-GRPO和一个同期工作Dance-GRPO[4]的采样误差图：

分别是1000步、16步和4步

可以看到误差随着步数的降低而显著增加。另外注意到，Flow-GRPO在t=1处（第1步）有较高的误差，而Dance-GRPO在t=0附近（最后几步）有较高的误差，这个误差的罪魁祸首也是泰勒展开带来的这一项 \frac{\sigma_t^2 \Delta t}{2t}\hat{\bm{x}}_1 ，Flow-GRPO对 \sigma_t 的定义为 \sigma_t = \eta\sqrt{\frac{t}{1-t}} ，恰好抵消掉了一个t，变成除以 1-t ，所以它在t=1处误差较大；而Dance-GRPO定义 \sigma_t = \eta ，所以它在t=0处误差较大。

后来我又翻阅了更多的资料，发现泰勒展开其实在微分方程中有很广泛的应用，包括Ito's Lemma、Fokker-Planck方程等，都在使用泰勒展开，所以在应用这些理论的同时，不自觉就已经做了某种近似，毕竟 \Delta t \to 0 这个条件在微分方程中天然是满足的，这么做一般不会有什么问题。但如果这个条件不再满足了，就会出现误差。使用SDE采样且步长较长时，应该使用积分形式来避免这个误差，而不是直接离散化求解。

ps：其实我也尝试了用LLM帮我推导一个积分形式出来，结果发现虽然误差小了，但/t带来的数值问题依旧，所以泰勒展开也会带来一些工程上的副作用，仍然不能随便乱用。。

四、实验结果

按照我们的采样公式Flow-CPS，即使过程中新注入的随机性再大，也不会让输出的图片上带有显著的噪声：

而这对GRPO的训练也很有帮助，毕竟很多reward model都是基于人类对美学的判断进行训练的，而带噪的图像我们很难说它是美观的。

PickScore作为reward，它是根据人类偏好训练的一个模型

注意到这里的训练曲线，我们提出的方法Flow-CPS的reward几乎一直比Flow-SDE的reward要高，最终的结果也是我们的方法得到的更高的验证集reward值。在其他的一些任务上，我们也取得了比Flow-SDE更好的结果：

五、总结

本文中，我们首先发现了Flow-SDE采样图像带有显著噪声的问题，随后我们通过分析提出了系数保持采样的概念，并证明了Flow-SDE不符合系数保持采样的要求。之后我们提出了一个符合系数保持采样的公式，它在高噪声强度下仍然能产生干净的图像。我们还分析了Flow-SDE采样会过噪的原因，根源来自于其推导过程中的泰勒展开，而且泰勒展开不仅带来了误差，还引入了/t项带来了数值问题，所以要尽量避免使用。最后，我们通过实验验证了我们方法对于reward的计算和优化都有很大的帮助，显著高于基于Flow-SDE采样的结果。




参考文献

[1] Flow-GRPO: Training Flow Matching Models via Online RL

[2] Diffusion Meets Flow Matching

[3] Score-Based Generative Modeling through Stochastic Differential Equations

[4] DanceGRPO: Unleashing GRPO on Visual Generation


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://pic1.zhimg.com/v2-4d98890d88cb0457415f7d3e9607d70c_1440w.jpg)

![图片](https://pica.zhimg.com/v2-aa27b26d913ea0b01cbcdad4f74df348_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-a11268da89fe3524bdb69b6ec09e781f_1440w.jpg)

![图片](https://pica.zhimg.com/v2-1bd71f06b38c7e11986430ea4579b9fe_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-fa127207d1b66a4df2bd6bf26e4d0f39_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-c4400ff5de950e172564380fc8015ae1_1440w.jpg)

![图片](https://picx.zhimg.com/v2-78a36fb29ce1b41c4aed530220a18f7d_1440w.jpg)

![图片](https://picx.zhimg.com/v2-d824ce645edcc17d485cf4d1d7885103_1440w.jpg)

![图片](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://pic1.zhimg.com/v2-808e7a8691bfb9ae1da3d58d6d027b86_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://picx.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-3b624b3b752761c3d632ac275d20d15f_l.jpg?source=06d4cd63)

