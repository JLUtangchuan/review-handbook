---
title: "一步生成：Mean Flows for One-step Generative Modeling"
author: "周舒畅"
source_url: https://zhuanlan.zhihu.com/p/1908821827385562243
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 一步生成：Mean Flows for One-step Generative Modeling

> 作者: 周舒畅 | 来源: https://zhuanlan.zhihu.com/p/1908821827385562243

---

场景： 一间明亮的学术研讨室。主持人、李教授（资深AI研究员）、王博士（专攻生成模型的理论家）和张工程师（关注模型实现与性能）围坐在一张会议桌旁。桌上放着打印出来的《Mean Flows for One-step Generative Modeling》论文。

主持人： 各位专家，今天我们齐聚一堂，共同研读这篇在单步生成模型领域引起广泛关注的论文——《Mean Flows for One-step Generative Modeling》。它提出了一种名为 MeanFlow 的新框架，声称在单步生成方面取得了显著突破。

李教授： 是的，我注意到这篇论文了。单步或少步生成一直是生成模型领域追求的目标，因为它直接关系到生成效率和实际应用的可行性。传统的扩散模型和流匹配模型通常需要多步迭代采样，这在某些场景下是个瓶颈。

王博士： 正如李教授所言。论文开篇就点出了这个痛点，并与现有的少步生成方法，特别是 Consistency Models 进行了对比。Consistency Models 虽然取得了进展，但其一致性约束是施加在网络行为上的，缺乏对底层真实场（ground-truth field）的深刻理解，导致训练可能不稳定，需要精心设计的“离散化课程”。

张工程师： 我对论文中提到的“自成体系”（self-contained）特别感兴趣，它宣称无需预训练、蒸馏或课程学习，这对于实际部署和复现来说是个巨大的优势。而且，在 ImageNet 256x256 上仅用1次函数评估（1-NFE）就达到了 3.43 的 FID，这数据非常亮眼。

主持人： 那么，我们首先深入了解一下 MeanFlow 的核心思想。王博士，您能否为我们解读一下论文中提出的“平均速度”（average velocity）这个概念？

王博士： 当然。理解平均速度之前，我们需要先回顾一下论文第3节提到的背景知识：流匹配（Flow Matching）。流匹配旨在学习连接两个概率分布（通常是先验分布 p_{\text{prior}}(\epsilon) 和数据分布 p_{\text{data}}(x)）的流路径上的速度场。

一个流路径可以定义为 z_{t} = a_{t}x + b_{t}\epsilon，

其瞬时速度 v_{t} = z^{\prime}_{t} = a^{\prime}_{t}x + b^{\prime}_{t}\epsilon。

论文中常用的设定是 a_{t} = 1-t, b_{t} = t，此时 v_{t} = \epsilon - x，这被称为条件速度 v_{t}(z_{t} \mid x)。

流匹配模型学习的是边际速度场 v(z_{t},t) \triangleq \mathbb{E}_{p_{t}(v_{t}|z_{t})}[v_{t}]，通过最小化损失函数： \mathcal{L}_{\text{FM}}(\theta) = \mathbb{E}_{t,p_{t}(z_{t})}\|v_{\theta}(z_{t},t)-v(z_{t},t)\|^{2}

实践中，通常优化等价的条件流匹配损失 \mathcal{L}_{\text{CFM}}(\theta) = \mathbb{E}_{t,x,\epsilon}\|v_{\theta}(z_{t},t)-v_{t}(z_{t}\mid x)\|^{2}。

采样时，通过求解常微分方程 (ODE) \frac{d}{dt}z_{t} = v(z_{t},t) 来生成样本，例如使用欧拉法 z_{t_{i+1}} = z_{t_{i}} + (t_{i+1} - t_{i})v(z_{t_{i}},t_{i})。论文强调，即使条件流是直的，边际速度场通常也会导致弯曲的轨迹，这使得在粗略离散化下ODE求解器结果不准确。

李教授： 这就引出了 MeanFlow 的动机。如果轨迹是弯曲的，那么用单步近似瞬时速度的积分，误差自然会比较大。

王博士： 正是如此。MeanFlow 的核心（第4.1节）就是引入“平均速度” u，而不是流匹配中建模的“瞬时速度” v。平均速度定义为两个时间点 t 和 r 之间的位移（通过积分得到）除以时间间隔： u(z_{t},r,t) \triangleq \frac{1}{t-r}\int_{r}^{t}v(z_{\tau},\tau)d\tau \quad \cdots \text{(Eq. 3)}

这个平均速度 u 是一个依赖于 (z_t, r, t) 的场，并且是由瞬时速度 v 决定的真实场，不依赖于任何神经网络。论文指出，当 r \rightarrow t 时，\lim_{r \rightarrow t}u = v。并且它自然满足一种“一致性”： (t-r)u(z_{t},r,t) = (s-r)u(z_{s},r,s) + (t-s)u(z_{t},s,t) \quad \cdots \text{(Eq. 5)}

这是因为积分的可加性 \int_{r}^{t}vd\tau = \int_{r}^{s}vd\tau + \int_{s}^{t}vd\tau。

张工程师： 那么，如何用这个平均速度进行训练呢？直接计算 Eq. 3 中的积分在训练时是不可行的。

王博士： 这就是论文的巧妙之处。他们没有直接使用 Eq. 3，而是对其进行了变换。将 Eq. 3 改写为 (t-r)u(z_{t},r,t) = \int_{r}^{t}v(z_{\tau},\tau)d\tau，然后两边对 t 求导（视 r 为常数），利用乘法法则和微积分基本定理，得到： u(z_{t},r,t) + (t-r)\frac{d}{dt}u(z_{t},r,t) = v(z_{t},t) 整理后得到核心的“MeanFlow 恒等式”： \boxed{u(z_{t},r,t) = v(z_{t},t) - (t-r){\frac{d}{dt}}u(z_{t},r,t)} \quad \cdots \text{(Eq. 6)}

这个恒等式描述了平均速度 u 和瞬时速度 v 之间的关系。

主持人： 这个恒等式非常关键。那么，如何计算其中的时间导数项 \frac{d}{dt}u(z_{t},r,t) 呢？

王博士： 论文接着解释了这一点。\frac{d}{dt} 是全导数，可以展开为： \frac{d}{dt}u(z_{t},r,t) = \frac{dz_{t}}{dt}\partial_{z}{u} + \frac{dr}{dt}\partial_{r}{u} + \frac{dt}{dt}\partial_{t}{u} 由于 \frac{dz_{t}}{dt} = v(z_{t},t) (来自 Eq. 2)，\frac{dr}{dt} = 0（因为 r 被视为独立于 t 进行微分），\frac{dt}{dt} = 1，所以： \boxed{{\frac{d}{dt}}u(z_{t},r,t)=v(z_{t},t)\partial_{z}{u}+\partial_{t}{u}} \quad \cdots \text{(Eq. 8)}

这表明全导数可以通过 u 关于 z, r, t 的雅可比矩阵 [\partial_{z}{u},\partial_{r}{u},\partial_{t}{u}] 与切向量 [v,0,1] 的雅可比向量积 (JVP) 来计算。

张工程师： 明白了。所以训练时，神经网络 u_{\theta} 的目标就是去满足这个 MeanFlow 恒等式。损失函数定义为： \mathcal{L}(\theta) = \mathbb{E}\big{\|}u_{\theta}(z_{t},r,t)-\text{sg}(u_{\text{tgt}})\big{\|}_{2}^{2} \quad \cdots \text{(Eq. 9)}

其中目标 u_{\text{tgt}} 是： u_{\text{tgt}} = v(z_{t},t) - (t-r)\left(v(z_{t},t)\partial_{z}{u_{\theta}}+\partial_{t}{u_{\theta}}\right) \quad \cdots \text{(Eq. 10)}

这里 v(z_t,t) 是边际速度，实践中用条件速度 v_t = \epsilon - x 替代，所以目标变为： u_{\text{tgt}} = v_{t} - (t-r)\big{(}v_{t}\partial_{z}{u_{\theta}}+\partial_{t}{u_{\theta}}\big{)} \quad \cdots \text{(Eq. 11)}

论文中提到了 stop-gradient (sg) 操作，这避免了通过JVP进行二阶优化，降低了计算复杂性。Algorithm 1 给出了训练伪代码，其中 jvp(fn, (z, r, t), (v, 0, 1)) 计算了 u_{\theta} 的输出和 \frac{d}{dt}u_{\theta}。论文还提到，JVP的开销不大，大约只占总训练时间的不到20%。

李教授： 这种设计确实很巧妙。它将原本需要积分的目标转化为了一个只依赖瞬时速度和 u_{\theta} 自身导数的目标。如果 r=t，那么第二项消失，就退化为标准的流匹配了。这解释了为什么在消融实验中（Table 1a），当 r \neq t 的比例为0%时，模型性能很差。

主持人： 训练部分清楚了，那么采样呢？这应该是 MeanFlow 的一大优势所在。

张工程师： 是的，采样非常直接（第4.1节末尾和Algorithm 2）。因为 u_{\theta} 直接建模了平均速度，所以从 z_t 到 z_r 的更新可以表示为： z_{r} = z_{t} - (t-r)u(z_{t},r,t) \quad \cdots \text{(Eq. 12)}

对于单步采样，就是从 z_1 = \epsilon \sim p_{\text{prior}}(\epsilon) 开始，直接计算： z_{0} = z_{1} - u(z_{1},0,1) 这正是 Algorithm 2 的内容：x = e - fn(e, r=0, t=1)，其中 fn 就是 u_{\theta}。这真正实现了单次网络评估生成。

李教授： 论文还讨论了如何将无分类器指导（Classifier-Free Guidance, CFG）融入这个框架（第4.2节），并且在采样时仍然保持1-NFE。这是一个重要的实用特性。

王博士： 他们不是在采样时简单地组合有条件和无条件模型的输出，而是在定义真实场时就引入CFG。首先定义了一个新的真实瞬时速度场 v^{\text{cfg}}： v^{\text{cfg}}(z_{t},t\mid\mathbf{c}) \triangleq \omega\,v(z_{t},t\mid\mathbf{c})+(1-\omega)\,v(z_{t},t) \quad \cdots \text{(Eq. 13)}

其中 v(z_{t},t\mid\mathbf{c}) 是类别条件下的边际速度，v(z_{t},t) 是无条件的边际速度，\omega 是指导强度。然后，对应的平均速度 u^{\text{cfg}} 必须满足MeanFlow恒等式： u^{\text{cfg}}(z_{t},r,t\mid\mathbf{c})=v^{\text{cfg}}(z_{t},t\mid\mathbf{c})-(t-r){\frac{d}{dt}}u^{\text{cfg}}(z_{t},r,t\mid\mathbf{c}) \quad \cdots \text{(Eq. 15)}

在构建训练目标时，他们将 v^{\text{cfg}} 中的无条件项 v(z_t,t) 用 u^{\text{cfg}}_{\theta}(z_t,t,t) （即 r=t 时的平均速度，等价于瞬时速度）来近似，得到修改后的瞬时速度目标 \tilde{v}_{t}： {\tilde{v}_{t}}\triangleq\omega\,v_{t}\,+\,(1-\omega)\,u^{\text{cfg}}_{\theta}(z_{t},t,t) \quad \cdots \text{(Eq. 19)}

这里的 v_t 是样本条件的瞬时速度。然后，训练损失函数 \mathcal{L}(\theta) 的形式与 Eq. 9 类似，只是 u_{\text{tgt}} 中的 v_t 被 \tilde{v}_t 替换： u_{\text{tgt}} = {\tilde{v}_{t}}-(t-r)\big{(}{\tilde{v}_{t}}\partial_{z}{u^{\text{cfg}}_{\theta}}+\partial_{t}{u^{\text{cfg}}_{\theta}}\big{)} \quad \cdots \text{(Eq. 18)}

这样训练出来的 u^{\text{cfg}}_{\theta} 就直接建模了带有CFG的平均速度，采样时直接用 u^{\text{cfg}}_{\theta}，无需额外计算，保持了1-NFE。

张工程师： 实验部分（第5节）也很有说服力。Table 1的消融研究非常细致：

(a) % of r \neq t: 表明 r \neq t 的样本对于学习平均传播至关重要，0%（即标准Flow Matching）在1-NFE下效果很差。25%的比例效果最好。

(b) JVP tangent: 验证了Eq. 8中JVP计算的正确性。如果切向量 [v,0,1] 中的某一项被错误设置（例如设为0或1），性能会急剧下降，说明 z, r, t 三个变量的偏导都重要。

(c) Positional embedding for (r,t): 探索了如何向网络输入 r 和 t。(t, t-r) 的组合效果最好，但其他组合如 (t,r) 也能工作。

(d) t,r sampler: Logit-normal采样器优于均匀采样器。

(e) Loss metrics (p value): 论文中讨论了 \mathcal{L} = \|\Delta\|^{2\gamma}_{2} 形式的损失，通过自适应权重 w = 1/(\|\Delta\|_{2}^{2}+c)^{p} (其中 p=1-\gamma) 实现。p=1 效果最好，p=0.5 (类Pseudo-Huber) 也不错，p=0 (标准L2损失) 效果稍差但仍有效。

(f) Guidance scale \omega: CFG显著提升了1-NFE的生成质量，\omega=3.0 时FID从61.06降至15.53。

李教授： Figure 4 展示了模型大小和训练时长对性能的影响，显示出良好的可扩展性。Table 2 的对比结果非常震撼。MeanFlow-XL/2 在 ImageNet 256x256 上用 1-NFE 达到了 3.43 FID，大幅超越了之前的SOTA模型如 iCT (34.24 FID) 和 Shortcut (10.60 FID)。其2-NFE结果 (2.20 FID) 甚至可以媲美许多多步模型（如DiT 2.27 FID, SiT 2.06 FID，但它们用了250x2 NFE）。

王博士： 论文强调其方法是“原则性的”（principled）。与Consistency Models依赖施加在网络行为上的一致性约束不同，MeanFlow的核心是平均速度 u 和瞬时速度 v 之间的函数关系（MeanFlow恒等式），这个关系不依赖于神经网络。这种从第一性原理出发的推导，使得理论基础更为坚实。

主持人： 论文在结论中也提到，希望这项工作能激励未来的研究重新审视这些强大模型的基础。那么，各位对这篇论文的整体评价如何？

李教授： 我认为这是一项非常扎实且具有影响力的工作。它不仅提出了一个新颖的理论框架，并通过严谨的数学推导将其与现有的流匹配方法联系起来，更重要的是，它在实验上取得了SOTA的结果，显著推动了单步生成模型的发展。它成功地缩小了单步/少步模型与多步模型之间的性能差距。

王博士： 我同意。从理论角度看，“平均速度”的概念和“MeanFlow恒等式”的推导是核心创新。这种将积分操作通过微分关系转化为可学习目标的思路非常精妙。它为理解和构建高效生成模型提供了一个新的视角。

张工程师： 从工程和应用角度看，其“自成体系”、无需复杂训练技巧的特性，以及1-NFE下就能达到极高质量的生成效果，都极具吸引力。JVP的计算开销控制得也很好。当然，论文的附录C也提到了JVP的计算复杂度是 O(Ld^2)，虽然实际开销不大，但在极大模型或极大维度数据上仍需关注。附录D也坦诚地讨论了模型大小、指导调优和向其他领域泛化等局限性。

主持人： 感谢各位专家的精彩解读。总的来说，《Mean Flows for One-step Generative Modeling》通过引入平均速度的概念和MeanFlow恒等式，为单步生成模型提供了一个坚实的理论基础和高效的实现方案，其实验结果也证明了其有效性和巨大潜力。这无疑是生成模型领域的一大步。

(众人点头表示赞同)

这篇论文《MeanFlows for One-step Generative Modeling》的核心贡献和主要内容可以总结如下：

提出了MeanFlow框架： 这是一个为单步生成模型设计的原则性且有效的框架。其核心思想是引入“平均速度”（average velocity, u）的概念，以区别于传统流匹配（Flow Matching）方法中建模的“瞬时速度”（instantaneous velocity, v）。

定义了平均速度 u： 平均速度被定义为在时间间隔 [r, t] 内位移（瞬时速度的积分）与该时间间隔的比值： u(z_{t},r,t) \triangleq \frac{1}{t-r}\int_{r}^{t}v(z_{\tau},\tau)d\tau

推导了MeanFlow恒等式： 为了避免在训练中直接计算积分，论文通过对平均速度定义式进行微分和变换，得到了一个关键的“MeanFlow恒等式”，它建立了平均速度 u、瞬时速度 v 以及平均速度对时间的全导数之间的关系： u(z_{t},r,t) = v(z_{t},t) - (t-r){\frac{d}{dt}}u(z_{t},r,t) 其中，全导数项 \frac{d}{dt}u(z_{t},r,t) 可以通过雅可比向量积（JVP）高效计算： {\frac{d}{dt}}u(z_{t},r,t)=v(z_{t},t)\partial_{z}{u}+\partial_{t}{u}

构建了训练目标： 基于MeanFlow恒等式，训练神经网络 u_{\theta} 来逼近真实的平均速度场。损失函数的目标 u_{\text{tgt}} 由瞬时速度 v_t （实践中用条件速度 \epsilon-x）和 u_{\theta} 的导数项构成，避免了积分计算，并使用 stop-gradient 技巧简化优化： u_{\text{tgt}} = v_{t} - (t-r)\big{(}v_{t}\partial_{z}{u_{\theta}}+\partial_{t}{u_{\theta}}\big{)}

实现了高效单步采样： 由于 u_{\theta} 直接建模了平均速度，因此从噪声 \epsilon (即 z_1) 到生成样本 x (即 z_0) 仅需一步计算： z_{0} = z_{1} - u_{\theta}(z_{1},0,1)

集成了单NFE的无分类器指导（CFG）： 论文将CFG的思想融入到真实场定义中，使得训练出的模型 u^{\text{cfg}}_{\theta} 在采样时能够直接生成带指导效果的样本，而无需像传统CFG那样进行两次模型评估，保持了1-NFE的特性。

自成体系且性能卓越： MeanFlow模型无需预训练、知识蒸馏或课程学习等复杂技巧。在ImageNet 256x256图像生成任务上，仅用1次函数评估（1-NFE）即达到了3.43的FID，显著优于先前SOTA的单步扩散/流模型，并大幅缩小了与多步模型之间的性能差距。

坚实的理论基础： 与一些依赖启发式一致性约束的方法不同，MeanFlow的训练目标源自平均速度和瞬时速度之间内在的、不依赖于特定网络的数学关系，这为其提供了更强的理论支撑。


总之，MeanFlow通过引入平均速度的概念并推导出可操作的训练目标，为高效、高质量的单步生成建模提供了一个强大且具有里程碑意义的框架。

人类评论：用小模型多步生成效果如何呢？小模式权重少，更加硬件友好。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-51ed84ffc77e7a595e3ada71327da5a9_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-930c0bba069566145831cbf44d201129_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

![图片](https://picx.zhimg.com/v2-b16faaf2e89af6c6f4428758d3fcded6_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-41f74f3795489083630fa29fde6c1c4d.png)

![图片](https://pica.zhimg.com/v2-b16faaf2e89af6c6f4428758d3fcded6_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-8b9e95b8079167db926bd2cff5e0fd1b_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-3e36d546a9454c8964fbc218f0db1ff8.png)

![图片](https://pic1.zhimg.com/v2-0942128ebfe78f000e84339fbb745611.png)

![图片](https://pic4.zhimg.com/v2-c96dd18b15beb196b2daba95d26d9b1c.png)

![图片](https://pica.zhimg.com/v2-3a492d7e14541faf7ba03e0da7cede55_250x0.jpg?source=172ae18b)

