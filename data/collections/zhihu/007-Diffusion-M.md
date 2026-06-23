---
title: "Diffusion Models 基础知识总结回顾"
author: "董子斌"
source_url: https://zhuanlan.zhihu.com/p/682151286
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Diffusion Models 基础知识总结回顾

> 作者: 董子斌 | 来源: https://zhuanlan.zhihu.com/p/682151286

---

Diffusion models 在新理论的支持下已经取得越来越惊人的表现，这些前沿工作基本都围绕着SDE/ODE展开，我非常希望有一个统一的视角能够囊括所有的主流模型，以便直观地分析与改进。《Elucidating the Design Space of Diffusion-Based Generative Models》这篇文章提供了一个相当优美（起码我个人会这么认为）的框架，激发了我想把这些理论梳理整合的欲望。这篇知乎文章可以当作EDM的阅读笔记但不止是对原文的摘录，也可以当作Diffusion models 入门的学习资料（希望能达到这个质量）。

EDM的新视角
背景与研究的问题

记数据集分布为 p_{\text{data}}(x)，我们先设想其中的样本可以随着时间 t 发生变化，这种变化可以用一个SDE来描述：

\begin{equation} {\rm d}x=f(t)x{\rm d}t+g(t){\rm d}w \end{equation}

其中的 f,g 都是预先设计好的已知量，如何设计稍后会详细讨论，但是设计的原则就是希望上面的前向过程能够随着时间渐近地将数据集分布中的样本转化成一个高斯分布。这个SDE有一个对应的逆向SDE，和一个逆向的ODE（由于ODE有更多的求解器方案，所以本文目前只考虑ODE）：

{\rm d}x = [f(t)x-\frac{1}{2}g^2(t)\nabla_{x}\log p_t(x)]{\rm d}t

我们发现只有score function \nabla_x\log p_t(x) 是未知的，那么显然如果我们能够得到这个score function的估计，就可以求解这个逆向过程，从而使得高斯分布的样本随着时间转化为数据集分布的样本，也就实现了数据生成。

因此所有Diffusion models的工作都几乎可以划分为两个部分，先通过score matching用神经网络学习一个score function的估计（训练过程），再使用某种ODE求解器求解高斯分布样本转化得到的数据集样本（推理过程）。

如何设计 f,g ?

为了方便，我们希望设计的 f,g 可以满足 x_t=s_tx_0+s_t\sigma_t\epsilon, ~\epsilon\sim\mathcal N(0,I) ，其中 x_0 表示数据集分布中的样本， x_t 是 t 时刻的带噪声样本， s_t 可以理解为对样本的缩放因子， \sigma_t 是注入噪声的标准差，我们希望当时间充分长的时候注入的噪声远远大于原样本数据，以至于 x_t 的分布几乎就变成了高斯分布。

为了满足这个要求，我们可以计算得到， f(t)=\dot s_t/s_t ， g(t)=s_t\sqrt{2\dot\sigma_t\sigma_t} ，带点的上标表示对时间 t 求导。通过调整 s,\sigma 在不同时间的取值，我们可以调整整个概率流的分布变化过程。对这个变化过程的合理设计能够让学习或者求解过程简化，当Diffusion models最终性能更好。

这是EDM的选择。实际上在很多其他工作里，例如DDIM和DPM solver，都选择要求 x_t=\alpha_tx_0+\sigma_t\epsilon 。但是在后面的内容中我们会发现EDM的定义能够更好地解释并建立一个统一框架。

到目前为止我们看到了很多关于 t 的变量了，这其实很不直观，当说出某一个时刻 t ，我们无法直观想象此时数据到底涵盖了多少噪声，因此EDM的作者们希望用 \sigma 这个最直观的变量（它直接表明此时的数据被添加了多少的噪声）表示所有的过程。 f,g 都已经可以用 s,\sigma 代换掉了，我们现在看如何把score function中的 t 换掉。

\begin{align} p_t(x)&=\int p_{ot}(x|x_0)p_{\text{data}}(x_0){\rm d}x_0 \\ &=\int p_{\text{data}}(x)\mathcal N(s_tx_0;s^2_t\sigma^2_tI){\rm d}x_0 \\ &=\int p_{\text{data}}(x)[s^{-d}_t\mathcal N(x_0;\sigma^2_tI)]{\rm d}x_0 \\ &=s^{-d}_t[p_{\text{data}}(x)*\mathcal N(x_0;\sigma^2_tI)]\\ &=s^{-d}_tp(\frac{x}{s_t};\sigma_t) \\ \end{align}

然后我们得到了 \nabla_x\log p_t(x)=\nabla_x\log p(x/s_t;\sigma_t) ，代入到逆向过程的ODE中得到：

{\rm d}x=[\frac{\dot s_t}{s_t}x-s^2_t\dot\sigma_t\sigma_t\nabla_x\log p(\frac{x}{s_t};\sigma_t)]{\rm d}t

在很多其他资料中（例如苏神的ODE推导），我们可能还会见到另一种：

{\rm d}x=-\dot\sigma_t\sigma_t\nabla_x\log p(x;\sigma_t){\rm d}t

这其实等价于 s_t\equiv1 ，或者换一种理解，如果我们让整个过程中的 x_t 都是一个缩放版本的非缩放变量 x_t=s_t\hat x_t ，那么就可以又还原回前面的ODE。因此我们可以发现，所有Diffusion models 工作中对 s_t 的修改都等价于对缩放的重参数化，对 \sigma_t 的修改都等价于对噪声schedule的重参数化。我们只需要关注 s,\sigma 而不用管其他任何参数了！

Denoising Score Matching （如何训练？）

由于score function做了点小改变，需要重新计算一下score matching的loss。我们将 p(x/s;\sigma) 代替 p_t(x) ，并且用一个神经网络 D_\theta(x;\sigma) 来预测真实样本，就可以得到score matching loss：

\mathcal L=\mathbb E_{y\sim p_{\text{data}},n\sim\mathcal N(0,\sigma^2I)}[\lambda_\sigma||D_\theta(y+n;\sigma)-y||^2_2]

其中 \lambda_\sigma 是一个权重，平衡不同噪声下的训练损失，我们可以暂时忽略它。训练好的 D_\theta 满足

\begin{align} \nabla_x\log p(x;\sigma_t)&=\frac{1}{\sigma_t^2}[D_\theta(x;\sigma_t)-x]\\ \nabla_x\log p(\frac{x}{s_t},\sigma_t)&=\frac{1}{s_t\sigma^2_t}[D_\theta(\frac{x}{s_t};\sigma_t)-\frac{x}{s_t}] \end{align}

就可以对逆向过程ODE进行求解了。具体来说，我们将 D_\theta 代替掉score function，就可以得到以下的ODE：

{\rm d}x=[(\frac{\dot\sigma_t}{\sigma_t}+\frac{\dot s_t}{s_t})x-\frac{\dot\sigma_t s_t}{\sigma_t}D_\theta(\frac{x}{s_t};\sigma_t)]{\rm d}t

EDM到这里进一步对 D_\theta 的设计提出了precondition，我们可以发现在训练时 D_\theta 的输入 y+n 包含了一个干净的数据集样本和一个噪声，噪声项的大小随着标准差的不同差异相当大，所以作者希望能够将它拆解开，让神经网络的输入数值相对稳定一些，更有利于训练，于是有了如下拆解：

D_\theta(x;\sigma)=c_{\text{skip}}(\sigma)x+c_{\text{out}}(\sigma)F_\theta(c_{\text{in}}(\sigma)x;c_{\text{noise}}(\sigma))

其中 F_\theta 是待训练的神经网络， c_{\text{skip}} 表示了skip项的权重， c_{\text{in}},c_{\text{out}} 分别对神经网络的输入输出进行缩放， c_{\text{noise}} 对噪声大小进行一定的处理方便神经网络理解。这四个参数可以随意设计，EDM也计算了一种他们认为的合理选择。

DDPM中最开始提出了不去用神经网络预测带噪声的数据，而是去预测每一步应该添加的噪声，如果我们写开会发现这就是上述precondition的一种实现形式，precondition开阔了我们的思路去设计多种方式来向神经网络注入有关输入数据的先验知识。
ODE solvers （如何采样？）

ODE求解器非常多，最简单粗暴的就是Euler solver，直接将 {\rm d}x,{\rm d}t 换成 \Delta x,\Delta t ，从 x\sim\mathcal N(0,\sigma_N^2I) 开始进行ODE求解。显然当 \Delta t 过大的时候精度很差，但却能减少神经网络 forward 的次数，需要权衡。其他的高阶方法基本就是通过多次forward神经网络来换取更高精度的梯度估计。DPM solvers比较特殊，它注意到了Diffusion ODE的特殊结构，进而计算出了 t 在一个区间内变化导致的 x 变化的真实解，而不是估计，不过这个真实解也不能直接计算，需要泰勒展开，其一阶展开就等价DDIM的Euler solver，高阶展开能带来更好的精度。

条件采样

条件采样是 Diffusion models 很基本也很必要的能力，相当于对 p_{\text{data}}(x|c) 进行采样， c 是某种条件准则，我们只希望采样符合条件的样本。我们可以将它理解为AI文生图中的文字等等。一直以来 Diffusion models 的条件采样方式有两种 classifier-guidance (CG) 和 classifier-free-guidance (CFG)。

前者（CG）需要训练一个额外的分类器进行引导（严格说是估计 \log p(c|x/s_t;\sigma_t) ，然后用它的梯度进行引导，所以我觉得“分类器”这个说法是低估了这个网络的设计灵活性的），好处是分类器和生成模型是完全隔离的，当我需要其他条件生成标准时可以重新训练一个分类器，而不需要改变生成模型本身，这非常节省运算资源，坏处是需要额外训练一个分类器，并且采样的时候要不断计算这个神经网络的梯度，当分类器网络很大的时候运算消耗还是挺大的。

后者（CFG）不需要训练一个额外分类器，直接将条件生成和生成模型绑定在一起，坏处也显而易见，那就是当条件生成准则改变的时候需要重新训练整个生成模型。

CG： 我们计算带条件的 score function

\begin{align} \nabla_x\log p(x/s_t|c;\sigma_t)&=\nabla_x\log p(x/s_t;\sigma_t)+\nabla_x\log p(c|x/s_t;\sigma_t) \\ &=\frac{1}{s_t\sigma_t^2}(D_\theta(x/s_t;\sigma_t)-x/s_t)+\nabla_x\log p(c|x/s_t;\sigma_t) \\ &=\frac{1}{s_t\sigma_t^2}(D_\theta(x/s_t;\sigma_t)+s_t\sigma_t^2\nabla_x\log p(c|x/s_t;\sigma_t)-x/s_t) \\ &=\frac{1}{s_t\sigma_t^2}(\hat D_\theta(x/s_t;\sigma_t)-x/s_t) \\ \end{align}

即我们只需要训练一个 \log p(c|x/s_t;\sigma_t) ，然后在每次计算 D_\theta 时加上一个额外的梯度项：

\hat D_\theta(x/s_t;\sigma_t)=D_\theta(x/s_t;\sigma_t)+s_t\sigma_t^2\nabla_x\log p(c|x/s_t;\sigma_t)

就实现了条件采样。

CFG：我们直接训练包含 p_{\text{data}}(x|c)，p_{\text{data}}(x) 两个分布的 score function！这里 p_{\text{data}}(x) 可以当作 p_{\text{data}}(x|c),c=\emptyset 。实践中的操作方法就是在训练的时候指定一个概率（一般是0.25），小于这个概率的时候将条件置于空，即 c=\emptyset 。在每次计算 D_\theta 时用有条件和无条件的加权和（原理上和CG是一样的）：

\hat D_\theta(x/s_t,c ;\sigma_t)=wD_\theta(x/s_t,c;\sigma_t)+(1-w)D_\theta(x/s_t;\sigma_t)

就实现了条件采样。

很难说两种方式哪个更好。尽管在文生图中基本都在用CFG了，但是在有些场景CG也有独特优势。在我看来CFG在做一种匹配，让生成 x 匹配 c ；但是 CG 是在实打实最大化 \log p ，所以在决策场景，例如让生成的策略最大化一段轨迹或者当前的回报，CG就可以更漂亮地处理，如果使用CFG的话就必须明确指定你需要让策略拿到多么高的回报（这往往是不可知的），实在不知道的话就只能随便写一个合理的又足够高的回报，祈祷模型能够通过泛化跑出一个尽可能满足你要求的轨迹。但是CG要不断计算梯度的要求实在对运算要求高。
从新的视角重新理解以往的 Diffusion models
VP ODE (Variance Preserving)

VP SDE 其实就是 DDPM，后来发现 DDPM 可以被等价于一个 SDE，根据方差特性被称为 VP SDE，由于我们这里在求解的时候暂时只考虑 ODE 的逆向过程，所以这里就不正式地称为 VP ODE 了。

在原文的定义中，SDE为：

{\rm d}x=-\frac{1}{2}\beta_t x{\rm d}t+\sqrt{\beta_t}{\rm d}w

即 f_t=\frac{1}{2}\beta_t, g_t=\sqrt{\beta_t} ，其中 \beta_t = \beta_{\text{min}}+(\beta_{\text{max}}-\beta_{\text{min}})t ，DDPM在实践中设置 \beta_{\text{min}}=0.1, \beta_{\text{max}}=20 ，在采样过程中时间取值为 t_{i<N}=1+\frac{i}{N-1}(\epsilon_s-1) ，其中 N,i 分别是总采样步数和具体某一步的序号。在新框架中我们希望用schedule代替掉这些变量，即得到 s_t=1/\sqrt{\exp(\frac{1}{2}\beta_dt^2+\beta_{\text{min}})}, \sigma_t=\sqrt{\exp(\frac{1}{2}\beta_dt^2+\beta_{\text{min}})-1} ，其中 \beta_d=\beta_{\text{max}}-\beta_{\text{min}} 。为了便于求解ODE，我也事先计算好了两个时间导数 \dot s_t=-\frac{\sigma_t\dot\sigma_t}{(1+\sigma^2_t)^{3/2}}, \dot\sigma_t=\frac{(1+\sigma_t^2)(\beta_dt+\beta_{\text{min}})}{2\sigma_t} 。

在DDPM原文中用神经网络拟合了每一步应该添加的噪声，这个值是 score function 的一个倍数，具体看就是

\nabla_x\log p_t(x)\approx\frac{-1}{s_t\sigma_t}F_\theta(x;(M-1)t)

其中 M 是 diffusion steps，相当于把连续过程离散成多少个离散过程，一般都设置为 M=1000 ， 我们用带噪分布的 score function \nabla_x\log p(x/s_t;\sigma_t) 和 unscaled \hat x=s_tx 代入进去拼凑 D_\theta ，就可以得到

D_\theta(\hat x;\sigma_t)\approx\hat x-\sigma_t F_\theta(\frac{1}{\sqrt{1+\sigma_t^2}}\hat x;(M-1)\sigma^{-1}(\sigma_t))

其中 \sigma^{-1} 将标准差映射为它对应的时间。我们发现这个形式就是之前定义的 precondition 的一种设计，对应于

\left\{ \begin{align} c_{\text{skip}}&=1 \\ c_{\text{out}}&=-\sigma_t \\ c_{\text{in}}&=1/\sqrt{1+\sigma_t^2} \\ c_{\text{noise}}&= (M-1) \sigma^{-1}(\sigma_t)\\ \end{align} \right .

由于这个 precondition 和之前的 denoising score matching 都是用相同的方式，即用噪声分布 score function 代换得到，所以可以预见的是用这个 precondition 代入到 DDPM 的 loss 中就能得到相同的形式：

\begin{align} \mathcal L&=\mathbb E_{t\sim\mathcal U(\epsilon_t,1),y\sim p_{\text{data}},\bar n\sim \mathcal N(0,I)}[||F_\theta(s_ty+s_t\sigma_t\bar n;(M-1)t)-\bar n||_2^2] \\ &=\mathbb E_{t,y,\bar n}[\frac{1}{\sigma^2_t}||y+\sigma_t\bar n-\sigma_tF_\theta(s_t(y+\sigma_t\bar n);(M-1)t)+\sigma_t\bar n-y-\sigma_t\bar n||_2^2]\\ &=\mathbb E_{t,y,n\sim\mathcal N(0,\sigma^2_tI)}[\frac{1}{\sigma^2_t}||(y+n)-\sigma_tF_\theta(s_t(y+n);(M-1)t)-y||_2^2]\\ &=\mathbb E_{t,y,n\sim\mathcal N(0,\sigma^2_tI)}[\frac{1}{\sigma^2_t}||D_\theta(y+n;\sigma_t)-y||_2^2]\\ \end{align}

我们得到了完全相同的形式，正如所预料的，并且权重 \lambda_\sigma=\frac{1}{\sigma^2} 。

至此我们已经完成了旧方法在新框架下的重建，已经可以完成正常训练和采样了。

VE ODE (Variance Exploding)

VE SDE 对应与 SMLD 这篇工作，原定义的正向 SDE 为 {\rm d}x=\sqrt{{\rm d}\bar \sigma_t^2/{\rm d}t}\cdot{\rm d}w ，其中 \bar\sigma_t 是文章中定义的一个参数，和噪声方差 \sigma 不一样。这个定义同样可以算出来 s_t=1, \sigma_t=\bar \sigma_t 。在采样的时候 SMLD 使用 x_{i+1}-x_i=\frac{1}{2}(\bar\sigma_i^2-\bar\sigma_{i+1}^2)\nabla_{x_i}\log p_t (x_i) ，EDM 的一般框架在此时的逆向 ODE 为 {\rm d}x/{\rm d}t=-\bar\sigma_t\dot{\bar\sigma_t}\nabla_x\log p_t(x) ，为了将 SMLD 统一到这个框架里，我们将 ODE 进行同样的离散化并且让这两个表达等价，就可以直接计算得到 \sigma_t=\sqrt{t} 。在采样过程中时间 t 取值为 \sigma_{\text{max}}^2(\sigma_{\text{min }}^2/\sigma_{\text{max}}^2)^{\frac{i}{N-1}} （由于 t=\sigma_t^2 ，把这个schedule的平方都去掉就是 \sigma_t 的取值，从最小值到最大值非线性增大；另外这个 schedule 并没有数学上的设计，全都是原文的工程考虑，读者在实现的时候也可以看心情设计别的 schedule。对了，作者用的是 \sigma_{\text{min}}=0.02, \sigma_{\text{max}}=100 ）

在训练时，原文用 \frac{1}{\sigma}F_\theta(2x-1;\log \sigma) 去估计 score function，但是原文假设数据集分布的取值范围在 [0,1] ，EDM假设的分布取值范围在 [-1,1] ，因此用 x\rightarrow\frac{1}{2}(x+1), \sigma\rightarrow\frac{1}{2}\sigma 代换掉原文的设计，有

\frac{2}{\sigma}F_\theta(x;\log\frac{\sigma}{2})=\nabla_{\frac{1}{2}(x+1)}\log p_t(x)=2\nabla_x\log p_t(x)

(D_\theta(x;\sigma)-x)/\sigma^2=\nabla_x\log p(x;\sigma)=\frac{1}{\sigma}F_\theta(x;\log\frac{\sigma}{2})

D_\theta(x;\sigma)=x+\sigma F_\theta(x;\log\frac{\sigma}{2})

因此 SMLD 的设计等价于下面的 precondition

\left\{ \begin{align} c_{\text{skip}}&=1 \\ c_{\text{out}}&=\sigma_t \\ c_{\text{in}}&=1 \\ c_{\text{noise}}&= \log\frac{\sigma}{2}\\ \end{align} \right .

且由于 SMLD 的 loss 和 DDPM 相同，我们代入后同样可以得到 \lambda_\sigma=1/\sigma^2 。另外在我们取采样时标准差的 schedule 的对数，可以看到 \log \sigma_i=\log \sigma_{\text{min}} + \frac{i}{N-1}(\log \sigma_{\text{max}}-\log \sigma_{\text{min}}) ，即标准差就是在对数尺度下均匀选择，因此在训练时对标准差采样的分布也相应设计为 \log \sigma_t\sim\mathcal U(\log \sigma_{\text{min}},\log \sigma_{\text{max}}) 。

DDIM

DDIM 在原文中显示提出了一个新的 DDIM sampler，随后在讨论中又介绍道 DDIM sampler 其实等价于对 ODE {\rm d}x=\epsilon^t_\theta(x/\sqrt{1+\sigma^2}){\rm d}\sigma 使用 Euler 求解器。由于 \epsilon^t_\theta(x/\sqrt{1+\sigma^2}) 用于预测 x=y+n 对应的标准高斯噪声 \bar n=n/\sigma ，且 D_\theta(x;\sigma) 用于预测 x 对应的数据集样本 y ，我们可以将这两者联系到一起，显然

\begin{align} \sigma\epsilon^t_\theta(x/\sqrt{1+\sigma^2})&=-D_\theta(x;\sigma)+x \\ \epsilon^t_\theta(x/\sqrt{1+\sigma^2})&=-\sigma((D_\theta(x;\sigma)-x)/\sigma^2) \\ &=-\sigma\nabla_x\log p(x;\sigma) \end{align}

由此我们可以得到两个结果，第一，通过代入到采样公式得到 {\rm d} x=-\sigma\nabla_x\log p(x;\sigma){\rm d}\sigma ，这在同一框架下等价于 s_t=1,\sigma_t=t 。第二，我们直接得到了precondition

D_\theta(x;\sigma)=x-\sigma F_\theta(\frac{1}{\sqrt{1+\sigma^2}}x;\sigma)

\left\{ \begin{align} c_{\text{skip}}&=1 \\ c_{\text{out}}&=-\sigma_t \\ c_{\text{in}}&=1/\sqrt{1+\sigma_t^2} \\ c_{\text{noise}}&= \sigma_t\\ \end{align} \right .

至于标准差和时间的 schedule，DDIM 使用的是经典的设计 x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon ， \bar\alpha_t=f(t)/f(0),f(t)=\cos^2(\frac{s+t/M}{s+1}\cdot\frac{\pi}{2}),s=0.008,M=1000 ，我们可以以此进一步计算标准差的schedule。过程很麻烦，直接给出结果。先定义 u_j=\sqrt{\frac{u_j^2+1}{\max(\bar\alpha_{j-1}/\bar\alpha_j,C_1)}-1}, \bar\alpha_j=\sin^2(\frac{\pi}{2}\frac{j}{M(C_2+1)}), C_1=0.001,C_2=0.008,M=1000 。在采样时，时间 t 的取值为 u_{\lfloor j_0+\frac{M-1-j_0}{N-1}i+\frac{1}{2}\rfloor} ，其中 \lfloor\cdot\rfloor 表示向下取整， j_0=8 是超参数。

在训练时，采样 \sigma=u_j,j\sim\mathcal U(0,M-1) ，且由于loss相同，仍然是 \lambda=1/\sigma^2 。

EDM

EDM既然建立了这个统一框架，那么它当然会在这个框架的整体视角下推导一套自己认为更优的设计方案。首先，在ODE设计上，EDM认为 s_t=1,\sigma_t=t 就是最佳设计方案（这与DDIM的选择相同），这使得噪声标准差随着时间线性变化，ODE中的标准差和时间相互直接可以替换。其次，在 precondition 的设计上 EDM 加入了一些先验的设计理念，为了具体说清楚，我们需要先将 precondition 代入到 loss 中：

\mathbb E_{\sigma,y,n}[\lambda_\sigma c^2_{\text{out}}(\sigma)||F_\theta(c_{\text{in}}(\sigma)(y+n);c_{\text{noise}}(\sigma))-\frac{1}{c_{\text{out}}(\sigma)}(y-\frac{1}{c_{\text{skip}}(\sigma)}(y+n))||^2_2]

理念一：EDM 希望神经网络的输入有稳定的标准差 1

Var[c_{\text{in}}(\sigma)(y+n)]=c^2_{\text{in}}(\sigma)Var[y+n]=c^2_{\text{in}}(\sigma)(\sigma^2_{\text{data}}+\sigma^2)=1

得到 c_{\text{in}}(\sigma)=1/\sqrt{\sigma^2_{\text{data}}+\sigma^2}

理念二：EDM 希望神经网路的拟合目标有稳定的标准差 1

Var[\frac{1}{c_{\text{out}}(\sigma)}(y-\frac{1}{c_{\text{skip}}(\sigma)}(y+n))]=\frac{1}{c^2_{\text{out}}(\sigma)}[(1-c_{\text{skip}}(\sigma))^2\sigma_{\text{data}}^2+c^2_{\text{skip}}(\sigma)\sigma^2]=1

这里面有两个未知量（skip和out），所以不能直接得到，所以作者对上式微分，计算 out对skip的导数，希望找到一个skip来最小化out，这个直觉是希望神经网络的拟合误差尽量小地影响采样过程

{\rm d}c_{\text{out}}^2/{\rm d}c_{\text{skip}}=2(\sigma_{\text{data}}^2+\sigma^2)c_{\text{skip}}-2\sigma_{\text{data}}^2=0

得到 c_{\text{skip}}(\sigma)=\sigma^2_{\text{data}}/(\sigma^2_{\text{data}}+\sigma^2), c_{\text{out}}(\sigma)=\sigma\sigma_{\text{data}}/\sqrt{\sigma^2+\sigma^2_{\text{data}}}

理念三：EDM 希望 loss 对不同的标准差分配的权重是均等的

\lambda_\sigma c^2_{\text{out}}(\sigma)=1

得到 \lambda_\sigma=(\sigma^2+\sigma^2_{\text{data}})/(\sigma\sigma_{\text{data}})^2

综上，我们得到了一下的 precondition 设计

\left\{ \begin{align} c_{\text{skip}}&=\sigma^2_{\text{data}}/(\sigma^2_{\text{data}}+\sigma^2) \\ c_{\text{out}}&=\sigma\sigma_{\text{data}}/\sqrt{\sigma^2+\sigma^2_{\text{data}}} \\ c_{\text{in}}&=1/\sqrt{\sigma^2_{\text{data}}+\sigma^2} \\ c_{\text{noise}}&= \frac{1}{4}\log \sigma\\ \end{align} \right .

（noise是哪来的？为什么没讲？我也不知道，作者也没说，他就是这么选的，我也没猜出来为什么要这么选。）

在标准差的 schedule 上，作者选择了在指数上均匀选取：

\sigma_i=(\sigma_{\text{max}}^{\frac{1}{\rho}}+\frac{i}{N-1}(\sigma^{\frac{1}{\rho}}_{\text{min}}-\sigma^{\frac{1}{\rho}}_{\text{max}}))^\rho

训练时从 \log \sigma\sim\mathcal N(P_\text{mean}，P^2_\text{std}), P_\text{mean}=-1.2,P_\text{std}=1.2 采样标准差。（为什么这么选择？作者也没说，我也猜不到，如果是我我会选择在指数区间上均匀采样，不知道这个高斯分布采样是哪里来的。）

toy example 代码以及可视化

我在 github 上实现了一个极简的 toy example，代码的任务是拟合一个相当简单的概率分布：均匀的概率采样到 {-1,0,1} 三个数，代码实现了上面提到的四种 ode，如果抛去条件采样的代码以及可视化的代码，整体的代码实现应该是相当简单的。神经网络都是相当小的 MLP，一次训练只要4分钟。如有图片生成的需要，将神经网络改成你喜欢的 backbone，例如UNet，再修修张量的形状，应该也是完全没有问题的。

那么直接来看看可视化吧

图一是无条件采样，所有的ode都能轻松完成，edm似乎能早早地收敛并且概率流非常平滑。图二是采样步数不断变少是得到的分布变化情况，采样步数越少理应效果越差，其中edm似乎效果是最好的。图三和图四分别是CG和CFG引导生成强度不断变大时的采样过程情况，感觉CFG更加平滑呢，可能是网络太小了又容易过拟合，分类器的梯度并不是很平滑导致的。

（图一）无条件采样可视化，横轴是采样步数，随着采样步数增加，分布由高斯噪声变成目标分布。
（图二）采样结果随着采样步数的变化，横坐标标得有问题，最左边采样200步，最右边采样2步，能感觉edm是效果最好的。
（图三）采样过程随着 classifier-guidance 不断变强的效果，感觉没有 CFG 平滑稳定。
（图四）采样过程随着 classifier-free-guidance 不断变强的效果，感觉比 CG 平滑稳定。
结语

感谢阅读！如果时间充裕或者兴趣很足，推荐直接阅读原文 Elucidating the Design Space of Diffusion-Based Generative Models，真的是太好的一篇文章。由于我很菜，我也不知道文章和代码实现有没有什么问题，如果发现问题欢迎批评指正！


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-51b89806a0a940c1b34f68ee45e6f780_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pica.zhimg.com/v2-c79d4e51fa8ebe6cdd1db65908bfc406_1440w.jpg)

![图片](https://picx.zhimg.com/v2-69e4cafec5cd2d9475c1a99b5ac99f4d_1440w.jpg)

![图片](https://picx.zhimg.com/v2-d5e741db527c0abef2d8c944d94e8901_b.jpg)

![图片](https://pic2.zhimg.com/v2-db1d852e9c5aff0aa62dafc0b482f12b_b.jpg)

![图片](https://picx.zhimg.com/v2-63474c323b30cf99061a3e9633e756ca.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-f61f746b4afa6be578e862169f2ef83d.webp)

![图片](https://picx.zhimg.com/v2-5a80fd4f99ad776e16c51cd8d45bee2b_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-52f8c87376792e927b6cf0896b726f06.png)

![图片](https://pica.zhimg.com/v2-f706e69712197efd32e26867ef655730_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-66e5de3da039ac969d3b9d4dc5ef3536.png)

![图片](https://pic1.zhimg.com/v2-51b89806a0a940c1b34f68ee45e6f780_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-0942128ebfe78f000e84339fbb745611.png)

![图片](https://picx.zhimg.com/v2-29c3437c7a3358538c104c095576e2b8_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-673ef08c908402c054ae8badd49947c7_xld.jpg?source=1d2f5c51)

![图片](https://picx.zhimg.com/v2-377ad888596e88830d52c30bdebb001a_l.jpg?source=06d4cd63)

