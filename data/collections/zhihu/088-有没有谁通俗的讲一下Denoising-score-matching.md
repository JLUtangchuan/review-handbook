---
title: "有没有谁通俗的讲一下Denoising score matching?"
author: "消融ball"
source_url: https://www.zhihu.com/question/487904648/answer/71921952369
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 有没有谁通俗的讲一下Denoising score matching?

> 作者: 消融ball | 来源: https://www.zhihu.com/question/487904648/answer/71921952369

---

关注
推荐
热榜
专栏
圈子
AI Works
Beta
故事
​
直答
消息
私信
99+
创作中心
有没有谁通俗的讲一下Denoising score matching?
关注问题
​
写回答
人工智能
机器学习
深度学习（Deep Learning）
生成对抗网络（GAN）
生成模型
有没有谁通俗的讲一下Denoising score matching?
看了Vincent 2011年的文章A connection between score matching and denoising autoenc…显示全部 ​
关注者
69
被浏览
41,806
消融ball 也关注了该问题
关注问题​
写回答
​
邀请回答
​
好问题 6
​
添加评论
​
分享
​
查看全部 6 个回答
消融ball​
密歇根大学安娜堡分校 电子计算机工程硕士在读
已关注
21 人赞同了该回答

（本文未参考其他综述）

全文逻辑链条：Part1：score发挥的作用 ---> Part2：diffusion model的前向动力模式 ---> Part3：score-based diffusion的源头 --> Part4：score-based diffusion的合理性 ---> Part5基于score的diffusion后验采样离散流程

Part1: score matching的概念——score function不一定出现在diffusion model中

——score matching避免了归一化的计算，也可以让模型分布逼近数据分布

——1.对数梯度的优化可以校正非标准的概率模型 2.对数梯度可以在计算期望的时候，用梯度把概率给消了。

参考文章：Estimation of Non-Normalized Statistical Models by Score Matching（Apao 2005）

为了估计一个概率密度，根据基本的概率论和数理统计，我们有矩估计和极大似然估计。我们回忆一下这样的过程，当我们计算出我们得到的数据样本的均值方差，或者根据极大似然来找到我们的样本对应的最可能的参数。

这样的简单过程往往给予一个很重要的假设——已知分布类型。

正如我们在课本中看到的例子，这些估计成立的前提，是我们已知使用怎样的概率密度模型，比如高斯。

但是，在机器学习的任务中，很多时候，这样的假设并不成立，我们的目标分布不是有可解释公式的概率分布，而是基于数据的复杂分布。这个时候，为了估计概率模型，我们只能用神经网络来学习目标分布 p(x;\theta) （术语叫做参数化密度模型），一个一个样本点的学习帮助我们覆盖整个样本空间。这里就会出现一个问题，如果我们分别地，独立地学习各个样本点的 p(x;\theta) ，一定会导致最终 p(x;\theta) 之和不是1，所以这个时候就需要标准化。

——这个时候，我们只是学习了：谁比谁更容易出现，接下来需要的是，以严谨的概率进行生成。




在探究标准化之前，我先引入一套数学公式：

p_X(·) 表示我们的目标概率密度

p(·;\theta) 表示参数化的概率模型

我们使用后者得到前者，还缺一步标准化，公式如下：

p(\xi;\theta) = \frac{1}{Z(\theta)} q(\xi;\theta)

为了计算这个标准化常数，显然我们需要对于 q 进行积分，但是 q 没有解析形式，而是以模型形式出现，所以我们没有办法直接计算——概率模型不是一般的函数，并不是输入一个点，输出一个对应的概率，生成器更多是以对应的概率输出某个点。

所以为了得到一组尽可能符合概率模型的样本，我们只能通过大量采样的方法，也就诞生了MCMC蒙特卡洛方法——但是显然，MCMC超级慢的。

在标准化之前，就是非标准化模型——连续马尔可夫随机场。本文介绍了一个简单的方法来估计非标准化模型，基于最小化x的score function与模型输出之间的平方距离——score function就是log-density的梯度。

——也就是用score function来简化归一化计算，从而对于非标准化模型进行采样




以上就是score function的基本定义，接下来就是解答最关键的问题，为什么score的形式是对数密度梯度？

首先，密度是 p(\xi;\theta) ，对数密度是 log p(\xi;\theta) ，对数密度的梯度，就是基于向量 \xi 中的某一个变量 \xi_i 求偏导数，也就得到如下的式子

其次，估计的手段是最小化模型的score function和数据的score function的平方距离，公式如下：

因此我们的score matching估计的目标就是： \hat{\theta} = \mathop{argmin}_\limits{\theta} J(\theta)

那么为什么要用对数密度来估计呢，因为好算，上述都是基本范式，我们来看看具体的计算步骤。

——以下的证明是理解对数概率梯度发挥作用的关键，所以不能跳过。




我们要证明的是理论1：化简后的优化目标

我们把差的平方展开，会得到

因为第一项 \psi_x(\xi) ，并不基于模型参数 \theta ，来自于数据集数据 x 本身的性质，所以在优化的时候无法考虑，也不需要考虑，所以忽略。第二项 \psi(\xi;\theta) 的积分就是对于 \Sigma_{i=1}^{n}[ \frac{1}{2} \psi_i(\xi,\theta)^2] 进行积分，那么表达式中比较难确定的就是最后一个式子。

推导如下：

——对数梯度的意义就此体现，它可以消掉计算期望时候要乘的概率，然后大大简化计算，作者给出的更简化的形式如下：

对应的 p(x) = p_x(\xi) ， f(x) = \psi_i(\xi;\theta)，至于为什么等式最后一步成立，那就是分部积分， p(x)f(x)|_{-\infty}^{+\infty} = 0 。

于是 p(x)f'(x) = \partial_i \psi_i(\xi;\theta) ，得证。

把对数带入的形式就是：

J(\theta) = \int_{\xi \in R^n} p_x(\xi) \Sigma_{i=1}^{n} [\frac{\partial^2 log q(\xi;\theta)}{\partial \xi^2_i} + \frac{1}{2}(\frac{\partial log q(\xi;\theta)}{\partial \xi_i})^2] d\xi + const

(证毕)




如上，证明了模型和数据的score function的平方距离，可以通过一个简单的期望计算（这个模型没有经过标准化，仅仅经过了参数化学习），但是却基于这个平方距离优化，实现了模型概率到目标数据概率的收敛。如果我们有 q 是有解析形式的，那么导数就更好求了（比方说一个高斯，仅仅用theta确定均值方差）

实际上来说，积分也是不好求的，所以需要采集大量的样本，

综上，本文的主要贡献就是定义了score，且定义了一个基于score的优化框架，但是缺点是其实这个score并不好求，因为它没有直接使用神经网络来拟合score，而是用神经网络拟合了概率模型之后再求score。




Part2: Fokker-Planck方程

参考Optimal transport的经典论文JKO（1998）：THE VARIATIONAL FORMULATION OF THE FOKKER–PLANCK EQUATION

直接看结论：Jordan的结论实际上就是，Fokker-Planck方程描述的是吉布斯自由能的在Wasserstein距离定义下的最陡下降梯度，即Wasserstein gradient flow的方向。 在我看来这个结论的关键就在于，对于自由能焓变和熵变的公式推导，使得其可以和Fokker planck的确定性和随机性在形式上匹配起来。

fokker-planck有很多形式，但是逃不开的就是动能+势能的框架。

接下来我会一步一步引入fokker-planck的形式：

1.什么是熵变和焓变？

维纳过程就是熵变，每时每刻都以某种随机的概率进行游走，实现一种熵增的效果，那么我们可以使用一般diffusion方程来表示

\frac{\partial \rho(t,x)}{\partial t} = \Delta \rho(t,x), t \in (0,\infty), x\in R

（这是一个热力学基本得不能再基本的方程，定义了热力学变量变化的规律）

根据这个diffusion方程，我们可以获得一个最简单的最小化分布距离 + 动能框架

——diffusion的动力根据目标分布来确定

\frac{1}{2}||\rho^{(k-1)} - \rho||^2_{L^2(R^n)} + \frac{h}{2} \int_{R^n} |\nabla \rho|^2 dx

——如何获得：分布距离+动能进行一个变分，就是diffusion方程，所以diffusion为焓变熵变提供动力。

（简单证明在该链接：什么是变分法？ - 知乎，变分就是高数里面的差商极限）

上一时刻和当前时刻的温度差（这里用平方期望定义）就是分布距离，即第一项。

而第二项，显然就是一个梯度平方积分，也就代表了整个系统的能量泛函——迪利克雷积分。




如果我们使用L2距离来进行变分，那么就会得到上述结果，但是所谓熵变，其实在于\int \rho log \rho dx

好接下来十分重要，是本文的核心变化：

实际上，我们衡量两个（温度）分布之间的距离—— \rho^{(k)} 和 \rho^{(k+1)} ，有两种方式：

1.L2距离（根据同一位置来作差）：

\int (\rho^{(k+1)}(x) - \rho^{(k)}(x))^2 dx

2.Wasserstein距离（有一步匹配最优点的操作，而不是使用对应的位置）：

d(\rho_1, \rho_2) = \mathop{inf}_\limits{\gamma \in (\rho_1,\rho_2)} \int_{R^n \times R^n} |x-y| d \gamma (x,y)

这个公式可能比较抽象，看看下面这个示意图你就懂了：

也就是说，实际上相比基于同一位置的L2距离，Wasserstein是更加恰当的，因为它更能反应分布本身的性质。

显然，Wasserstein没法推变分法，Wasserstein有一个inf下确界在里面，所以不能直接计算，我们只能以其为目标。




于是得到了本文的一大核心结论：

diffusion过程如果使用Wasserstein度量，那么会得到如下的分布距离 + 熵变：

\frac{1}{2} d(\rho^{(k-1)},\rho)^2 + h \int_{R_n} \rho log \rho dx

其中 d 对应的距离就是Wasserstein距离。

——接下来阐述这个结论是怎么得到的

这个结论不是使用变分法得到的，而是作者借助Fokker-planck揭示的

Fokker-planck有两个简单形式：

形式1：动能势能形式——宏观层面

\frac{\partial \rho}{\partial t} = div(\nabla \Psi(x) \rho) + \beta^{-1} \Delta \rho, \space \space \rho(x,0) = \rho^0 (x)

这个形式就是在diffusion的基础上，再加上了势能变化（一个源变成了两个源）——diffusion决定随机动力，势能变化决定确定的动力，同样，一个是动能源，一个是势能源。

势能函数 \Psi(x) : R^n \rightarrow [0,\infty)




形式2：随机微分方程形式SDE——微观层面

dX(t) = -\nabla \Psi(X(t)) dt + \sqrt{2 \beta^{-1}} dW(t)

X^0 就是一个n维的随机向量，其对应的概率密度为 \rho^0 。

这个形式是描述微观层面粒子在势场中的变化，因为粒子运动一定会伴随一个维纳随机过程 W(t) ，这是因为粒子是以群为整体移动的，所以会有相互碰撞的作用。




如果势场满足合适的增长条件，那么Fokker-Planck就会有一个独特的平稳解 \rho_s(x) ，对应于吉布斯分布的形式： \rho_s(x) = Z^{-1} exp(-\beta \Psi(x)) , 其中 Z 是标准化常数。为什么说它平稳，因为求 \Delta \rho_s 就是求两个阶的梯度，因为我们的势能场本身不发生变化，所以 \Delta \Phi(x) = 0 ，所以当梯度的 \nabla \Psi = 0 的时候就会得到平稳解，对应的 \Delta\rho_s = 0 ，动力为0，故为平稳解（参考动能势能形式，代入即可理解）。




这个概率密度的平稳解，就对应了吉布斯自由能最小化之后的结果：

正如diffusion方程

\frac{\partial \rho(t,x)}{\partial t} = \Delta \rho(t,x), t \in (0,\infty), x\in R

和 \frac{1}{2} d(\rho^{(k-1)},\rho)^2 + h \int_{R_n} \rho log \rho dx 的对应关系。

带有势场的Fokker-Planck方程

\frac{\partial \rho}{\partial t} = div(\nabla \Psi(x) \rho) + \beta^{-1} \Delta \rho, \space \space \rho(x,0) = \rho^0 (x)

对应于（对应关系）

F(\rho) = E(\rho) + \beta^{-1} S(\rho) = \int_{R_n} \Psi \rho dx + \beta ^{-1} \int_{R_n} \rho log \rho dx

两个情况都是基于Wasserstein度量，而上面diffusion方程的对应关系，就来自于下面Fokker-Planck方程和吉布斯自由能的对应关系。

递推，而上述Fokker-Planck的对应关系，就来自于1.吉布斯分布是Fokker-Planck的平稳解 2.吉布斯分布是最小化吉布斯自由能得到的结果。

（本文阐述完毕）




Part3：diffusion model

参考：REVERSE-TIME DIFFUSION EQUATION MODELS（1982）——这个时候score还没发明出来

diffusion model和热力学的diffusion过程的区别就在于——diffusion model使用的是Fokker-Planck进行驱动

diffusion model对应的随机微分方程就是：

1.前向时间模型

dx = Axdt + B dw ——对应上文的 dX(t) = -\nabla \Psi(X(t)) dt + \sqrt{2 \beta^{-1}} dW(t)

根据这个前向模型，我们可以得到位置函数 x(t) = \int_{-\infty}^{t} e^{A(t-s)} B d w(s)

小证一下：引入积分因子 e^{-At}dx(t) - A e^{-At} x(t) dt = e^{At} BdW(t) ，左边积分正好是分部积分形式，得到

\int_{-\infty}^{t} d(e^{-As}x(s)) = \int_{-\infty}^{t}e^{-As} BdW(s) ，显然最后得证。

2.反向时间模型

dx = \bar{A} x dt + \bar{B}d\bar{w} ——这里加一个杠就是共轭矩阵的意思




为了得到前向时间模型的终点，也就是根据一个已知的前向方程得到逆向表示，需要进行矩阵求解。

P = E[x(t) x^T(t)]

协方差矩阵P就是线性方程 PA^T + AP = -BB^T ，并且是非奇异的，如果 rank [B \space AB \space ... \space A^{n-1} B] = n

——这个一出来我就知道是现代控制理论可控秩判据了，接下来我构建一个系统来解释

考虑定常系统 \dot{x}(t) = Ax(t) + B w(t) ，我们的目标是得到系统的平稳解，这个平稳解对应矩阵 \dot{P} = 0

这个方程叫做Riccati方程，具体证明如下：

因为是对于t求导，所以漂移项dw，就被省略，于是得到 PA^T + AP = -BB^T ，作为系统平稳解。




为了保证反向的漂移项 \bar{w}(t) 和反向移动的 x 是无关的，且能够实现反向传播，我们定义

d \bar{w} = d w - B^TP^{-1} x dt, \space \space \bar{w} = 0 ， 其能够保证 E[x(t) d\bar{w}^T] = 0 ，这也就是修正项。

——因为如果任选一个维纳过程，可能会和原先的x相关，因为x的轨迹在前向过程已经融入了dw

基于这个修正项和P的表达式，我们可以得到

dx = (A + B B^T P^{-1})dt + B d\bar{w}

——这一步就是把前向过程的 dw 换成 d\bar{w} ，我们就能得到反向过程，反向本质就是维纳的反向。




这个形式各位可能不熟悉，因为这是线性模型，当我们做非线性的推广之后，如下这个形式，想必各位就熟悉了。

dx = [f(x,t) - g^2(t) s(x,t,\theta)] dt + g(t) d\bar{w}

这两个形式实际上就是完全一致的，这里的 -P^{-1} 就对应了score function s

f(x,t) 是漂移项，控制势能场， g(x,t) 是扩散项，控制随机游走的幅度。

——结合上述的 d \bar{w} = d w - B^TP^{-1} x dt, \space \space \bar{w} = 0 ，我们可以得到进一步的解释， -g^2(t) s(x,t,\theta) 的存在是为了让反向过程的 x_t 和反向的Wiener过程相互独立，是一个修正项




Part4：score matching和diffusion

——用逼近score function的方式来逼近最合适的数据分布，游走的动力由diffusion来确定。

在SCORE-BASED GENERATIVE MODELING THROUGH STOCHASTIC DIFFERENTIAL EQUATIONS直接使用了上述的score function结论，但是他没有解释，仅仅是做了个引用

（是的没错整个3.2就这些内容，这个最核心的结论是没有附录证明的，根据我们上文的时间判断，Anderson的这篇文章提出的时候不可能考虑什么score function）

那我们其实可以把对数概率梯度 s = \nabla_x log_x(p(x)) 和协方差矩阵 P 建立一个关联性，建立在高斯性的前提上。

我们会发现其实就相差了一个 (x-\mu) ，对于一步步进行后验采样的diffusion model，实际上这里相差的就是 x(t) 。我们仔细想一下就可以知道，协方差矩阵 P 不是一个自变量为某个具体x的函数，而是一个基于整个时间t上的x空间，即 x(t) 的统计量。但是这里的score是基于具体样本的，以 x_t 为自变量，得到对应于 p_t(x) 对数梯度。

——这就是score的引入和基本的diffusion model的区别，我们需要基于具体的样本 x(t) ，加上神经网络的作用，反复迭代得到合适的协方差。而上文基于的Riccati方程的线性基本diffusion model，其协方差矩阵是在反向过程之前就已经确定好了，是根据平稳解的存在性得到的，每一个A，B，t都会对应一个平稳解 P_t 。这种基本的diffusion model是自然运行的，不经过学习的，仅仅保证了前向过程和反向过程的对应性。但是基于score的diffusion model需要根据数据集进行学习，所以A和B矩阵并不是提前确定好的。




至于优化的过程，实际上和score matching原文（Part1）的说法是一样的。

这个框架为一些后续的任务比如DPS（diffusion model + 逆问题）提供了证明的标准，因为对数梯度结合贝叶斯公式就变成了加减法，但是显然我们如果要求对数梯度，就不能抛弃高斯假设，比如DPS的证明。

DPS的思路就是DDPM的后验采样 + 基于Tweetie的观测校正




Part5: scheme的设计

其实我们必须提出一个问题，score matching能直接帮助我们完成逆向的采样过程吗？

如果要知道这一点，不妨把一个现有的scheme DDPM带入到score 框架中理解。

代码框架如下，训练的时候在数据集上加噪声，采样的时候一步一步从高斯map x_T 回到数据域

代码中补充的一点就是UNet的使用，体现在还原高斯map \epsilon_\theta(x_t,t)

# training：训练直接抽时间
def q_sample(self, x_0, t):
	"""前向扩散过程: 给定一个真实样本 x_0 和时间步 t, 计算加噪后的样本 x_t"""
	noise = torch.randn_like(x_0)
	sqrt_alphas_t = torch.sqrt(self.alpha_cumprod[t])
	sqrt_one_minus_alphas_t = torch.sqrt(1 - self.alpha_cumprod[t])
	return sqrt_alphas_t * x_0 + sqrt_one_minus_alphas_t * noise
	

t = torch.randint(0, self.num_timesteps, (batch_size,), device=x_0.device)              # 随机选择时间步
x_t = self.q_sample(x_0, t)
optimizer.zero_grad()
predicted_noise = self.model(x_t,t)
loss = ((predicted_noise - (x_t - torch.sqrt(self.alpha_cumprod[t]) * x_0)) ** 2).mean()

我给DDPM画了一个示意图：

起点高斯map是不断预测出来的，因为对于起点高斯map的学习就是对于递推均值的学习

再参考llama对应flow matching综述给出的示意图，我觉得很恰当

把学习均值ut-1，转移到了学习初始高斯map xT，这就是DDPM的核心传播思路。

为什么要这么做，不能直接以 x_t 为输入学习均值吗？

简单想想就知道，如果我们的神经网络的输入是xt和t，输出直接是ut，我们是没有办法建立训练的，因为这几个全都是局部变量，而DDPM学习得到的初始高斯map是全局变量。

这就是为什么我们不直接用xT来进行迭代，如果这么做，我们将无法使用神经网络学习的结果。

为什么使用UNet?

因为UNet有去噪声的功能，我们要去掉的是叠加在原始高斯map上的噪声，这样可以回到起点。

DDPM里，一个高斯map的输入，可以得到多样的输出，因为我们的学习是相对的（仅仅针对于均值，而不是实际值），而不是绝对的，所以


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-9bc4ee5ac4126cb645f86373b87848e9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-9bc4ee5ac4126cb645f86373b87848e9_l.jpg?source=2c26e567)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://pica.zhimg.com/v2-a1607b526d12f889fb136aaa7b0448d0_l.jpg?source=1def8aca)

![图片](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pica.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://pic1.zhimg.com/v2-79d30753eaf15464efc4b637204f1d26_l.jpg?source=1def8aca)

![图片](https://pica.zhimg.com/80/v2-ccdb7828c12afff31a27e51593d23260_720w.png)

