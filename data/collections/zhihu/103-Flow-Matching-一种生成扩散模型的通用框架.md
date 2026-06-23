---
title: "Flow Matching 一种生成扩散模型的通用框架"
author: "tupando"
source_url: https://zhuanlan.zhihu.com/p/11314592178
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Flow Matching 一种生成扩散模型的通用框架

> 作者: tupando | 来源: https://zhuanlan.zhihu.com/p/11314592178

---

完全从ODE出发

看了[https://arxiv.org/abs/2011.13456]这篇论文，但我不太会SDE，但是里面说用 ODE 就可以做，而且看到里面的那个图我就感觉，什么生成式扩散模型，原来是个场的拟合。最后看到泊松流模型，才发现这个是个大一统的生成式扩散模型

生成式模型本质是一个 (x, t) 维的场的拟合，生成过程沿着场线的方向

重构问题

如果我们把问题当作是一个纯粹的不含任何随机性的问题，把概率密度函数仅仅当作一个函数，不赋予任何概率的概念

假设如下变量：

引入时间变量 t 当作是一个空间变量

原始数据的分布为 p(x_0,t_0)

要迁移到的目标分布为 p(x_1,t_1)

把 (x_{0},t) 当成是一体的一个空间，假设从任意一个原始数据 (x_0,t_{0}) 都能沿着某条曲线，以某种固定的方程形式变化到 (x_1,t_{1}) ，同时这个过程是可逆的，那么画成图就是

扩散过程

中间的线就是扩散过程中每条数据要沿着走的线，按照 t 的不同，流动过去，那么很显然

1. 线不能交叉（因为交叉处会造成困惑，算法并不清楚沿着哪条线继续走下去）

2. 一个头对一个尾（扩散过程是 1 对 1 的）

这个东西和电场线非常像，按照电场线的特点：

1. 电场线从电荷到电荷

2. 中间没有电荷时，电场线不中断，不交叉

把这个图完全当作是一个电场的图，那么因为电场线两端都是连的数据，电场线的疏密程度就是数据的疏密程度，也就是概率密度，而电场线的疏密程度本身的名字叫做场强

所以问题从此转换为： 假设有一电场，把t也当作是该电场的一个空间维度，将原来 x 所属的 d 维问题扩展为 (x, t) 的 d+1 维问题，其电势分布为 \varphi(x,t) ,则场强为

E_x=-\nabla_x\varphi(x,t),E_t=-\nabla_t\varphi(x,t)=p(x,t)

t 方向的场强大小是概率密度函数，因为中间没有电荷分布，所以该电场满足拉普拉斯方程，或者说散度定理 \nabla^2\varphi=0

其中边界条件为

\begin{aligned} \nabla_t\varphi|_{t=t_0}=p(x,t_0) \\ \nabla_t\varphi|_{t=t_1}=p(x,t_1) \end{aligned}

根据唯一性定理，只要确定了两个边界的边界条件 p(x_0,t_0) 和 p(x_1,t_1) 那么这个电场就是唯一的，是确定的，就可以求出它的电场线方程，也就是 x_0 和 x_1 之间的迁移方程，就可以实现两个分布之间数据的一一对应，而且很容易知道，这样的一个迁移过程，是一个双射，即二者之间是完全一一对应的，因为电场线不遇到电荷是不会中断的

电场线方程是

\frac{dx}{dt}=\frac{E_x}{E_t}=\frac{\nabla_x\varphi}{\nabla_t\varphi}=f(x,t)

连续性方程

\begin{array}{c} \nabla^2\varphi=0 \\ \nabla_x^2\varphi+\nabla_t^2\varphi=0 \\ \nabla_x(f(x,t)\nabla_t\varphi)+\nabla_t^2\varphi=0 \\ \nabla_x(f(x,t)p(x,t))+\frac{\partial p(x,t)}{\partial t}=0 \end{array}

换个视角看扩散过程

扩散过程是这样的，原始数据是存在样本的，但不能感知具体的概率分布，经过某种迁移，变成了另一个分布 p(x_1,t_1) ，新的分布是有表达式的，可以被采样的，这样就可以从 p(x_1,t_1) 中采样一个值，经过逆向过程生成新的数据

所以扩散问题的本质是，如何定义一个电场 \varphi 使得它满足两个边界条件，其中一个是原始边界条件 p(x_0,t_0) 也是原始数据的概率密度函数，另一个边界条件 p(x_1,t_1) 是最终迁移到的也是逆向过程的起点 ，且新的这个边界条件是可以求出来的，比较容易被采样的

这里还是要记得，t在这个电场里是一个类比的塞进去的空间维度，不是时间项，是和 x 完全一致的项 更一般的，可以把电场 \varphi 称为场，把 \frac{dx}{dt}=\frac{E_x}{E_t}=\frac{\nabla_x\varphi}{\nabla_t\varphi}=f(x,t) 称为场线，任何无源场的物理过程都可以被这个方案所类比

所谓扩散过程，也就是在给定的两个边界条件下，如何用神经网络去拟合场的分布（也可以是场强、场线），其中一个边界条件是原始数据的概率密度函数，另一个边界条件是一个常见比如高斯分布等等，因为另一个边界条件是可以被简单采样的，我们就可以通过从另一个边界条件中采样，沿着场线逆向找到对应的原始数据分布中的对应点，那个点就是生成的数据

NCSN做了什么

首先定义分布函数是一个条件高斯分布

p(x_{t}|x_{0})=N(x_{0},\sigma_{t}^2I)

则真实的分布函数为高斯分布

\nabla_{t}\varphi=-p(x,t)=-\int N(x_{0},\sigma_{t}^2I)p(x_{0})dx_{0}

这里的 \sigma_{t} 是已知的和 t 相关的超参数，人工定义的

这个定义相当于直接定义了场强的分布，因为

根据拉普拉斯方程

\begin{aligned} \nabla _{t}^2\varphi+\nabla _{x}^2\varphi &=0 \\ \nabla _{x}^2\varphi=-\nabla_{t}^2\varphi &=\frac{\partial p}{\partial t} \end{aligned}

其中 p 对 t 的偏导求的是对 \sigma_{t} 的偏导，因为只有这一项里含有时间 t

对 x 进行积分，忽略常数项，我们只是需要一个满足条件的方程，而不是得到所有的通解

\nabla _{x}\varphi = \sigma \frac{d\sigma}{dt}\nabla _{x}p

这就相当于电场为

E=-\nabla \varphi=(-\nabla_{x} \varphi,-\nabla_{t}\varphi)

那么场线方程为

f(x,t) = \frac{\nabla {x}\varphi}{\nabla {t}\varphi}=\frac{d\sigma}{dt}\sigma \frac{\nabla_{x}p}{p}=\frac{d\sigma}{dt}\sigma \nabla {x}\log{p}=-\frac{d\sigma}{dt} \int \frac{(x - x{0})}{σ}p(x_{0})dx_{0} f(x,t)=E_{x_{0}-p(x_{0})}\left[-\frac{d\sigma}{dt} \frac{x-x_{0}}{\sigma} \right]

此外，根据高斯分布的求和公式，真实的目标分布函数 p(x_{t}) 仍为高斯分布，其均值和方差为

\mu=\int x_{0}p(x_{0})dx_{0}=E_{x_{0}-p(x_{0})}[x_{0}]

\sigma_{new}^2=\sigma_{t}^2+\int x_{0}^2p(x_{0})dx_{0}-\mu^2=\sigma_{t}^2+D_{x_{0}-p(x_{0})}[x_{0}^2]

取 t=t_1 就可以得到目标分布函数，也是最后逆向过程中我们从中采样的那个东西

所以这个训练过程就是

1、根据高斯分布从x_{0}中采样 {x_{t},t} ，所以采样方式为 x_{t}=x_{0}+\sigma_{t} z

2、训练场线方程 f(x,t) (把超参的那个系数去掉了)

逆向过程就是

1、从高斯分布{\mu,\sigma_{new}}中采样，但是看公式这个均值和方差包含了原数据的均值和方差，真要采样的化只能用估计值，这不太好，所以原论文换用朗之万动力学采样去逼近这个分布的采样，这就是为什么 NCSN 里逆向的采样很复杂

2、根据场线方程，逆向积分回去，这个无论用欧拉法还是高阶龙格库塔法都好

这里要多说一句，训练过程中构建样本的那个，在别的视角下大家都叫做加噪，但是在我们这个框架的视角下，是采样求期望的一部分，本质其实是对 x 的采样

看到这个正向过程，有的人可能会疑惑，我们已经定义了场强分布，为什么还要用神经网络拟合它，这是因为这个场强分布的表达式

-\nabla_{t}\varphi=p(x,t)=\int N(x_{0},\sigma_{t}^2I)p(x_{0})dx_{0}=E_{x_{0}-p(x_{0})}[N(x_{0},\sigma_{t}^2I)]~~

是显含 x_0 的，所以需要用神经网络去把这个里面的 x_0 去掉，同时通过采样的方式，类似于 sgd 那种，用采样，用期望去拟合

所以从这里不难看出，扩散过程里最重要的是两项内容

1. 场线方程，也是逆向过程遵循的方程，也是正向构建样本的依据

2. 最终的概率分布，这个概率分布必须是容易采样的，是逆向过程的起点

DDPM 做了什么

DDPM 中将目标分布函数定义为

p(x|x_{0})=N(\sqrt{ \alpha_{t} }x_{0},1 - \alpha_{t})

所以它的目标分布函数的真实意义上是

p(x,t)=\int p(x|x_{0})p(x_{0})dx_{0}

根据高斯分布的求和公式，这个本质上也是一个高斯分布，它的均值和方差分别是

\mu=\sqrt{ \alpha {t} } E{x_{0}-p(x_{0})}[x_{0}]

\sigma^2=1-\alpha_{t}+\alpha_{t}E_{x_{0}-p(x_{0})}[x_{0}^2]-\mu^2=1-\alpha_{t}+\alpha_{t}D_{x_{0}-p(x_{0})}[x_{0}]

如果 \alpha_{t} 趋向于 0，则最后的分布是一个 N (0,1) 的高斯分布，从这个高斯分布中采样来做逆向过程的初始

同样套拉普拉斯方程，可以得到（这里用 mathematica 脚本）

sol = Solve[Sqrt[s] * x0 + Sqrt[1-s] * z==x, x0]
p = PDF[NormalDistribution[Sqrt[s] x0, Sqrt[1-s]], x]
Ex = Integrate[D[p, s], x]
f = Ex / -p // Simplify
f /. sol // Simplify // Collect[#, z]&

最终得到

f(x,t)=E_{x_{0}-p(x_{0})}[\frac{1}{2\alpha_{t}}\left( x-\frac{z}{\sqrt{ 1-\alpha_{t}}} \right) \frac{d\alpha_{t}}{dt}]

PFGM 做了什么

不同于前两组选手仅仅定义一个 t 方向的场强分布，因为他们都希望另一个边界条件是一个高斯分布比较简单可以采样，然后我们自己去求全场强的分布，PFGM 直接定义了一个电场的分布，然后发现另一个边界也是比较简单的一个分布

PFGM 直接定义了一个电场的分布，就是将原始数据的每个点都当作是点电荷，概率密度函数就是电荷密度分布，然后就有了全空间的电场分布

E=k\int\frac{(\boldsymbol{x} - \boldsymbol{x}_0, t)}{(\Vert\boldsymbol{x} - \boldsymbol{x}_0\Vert^2 + t^2)^{(d+1)/2}}{p}(\boldsymbol{x}_0) d\boldsymbol{x}_0

d 是 x 的维数，d+1 是因为我们把 t 塞了进去多了一维，这个是高维空间的分布，和我们平时学的三维空间的公式略有差异。这样就得到了电场的分布，t 方向的分量是概率密度函数，把常量那个系数删掉，没什么意义，只影响归一化

-\nabla_{t}\varphi=p(x,t)=E · e_{t}=\int\frac{t}{(\Vert\boldsymbol{x} - \boldsymbol{x}_0\Vert^2 + t^2)^{(d+1)/2}}{p}(\boldsymbol{x}_0) d\boldsymbol{x}_0

这里多说一句，对比前面的 NCSN 和 DDPM，这里 PFGM 相当于定义了条件概率分布为

p(x_{t}|x_{0})=\frac{t}{(\Vert\boldsymbol{x} - \boldsymbol{x}_0\Vert^2 + t^2)^{(d+1)/2}}

这个分布是柯西分布，关于柯西分布的特点，这里并不赘述

NCSN 和 DDPM 都是拟合的场线方程，而 PFGM 拟合的是场强分布方程，二者有略微的不同，但是本质都是一致的，NCSN 和 DDPM 也可以拟合场强分布，最后还要再多一步除法就没什么必要就是了

NCSN 逆采样的那个初始分布是高斯分布，但是因为方程未知，只好通过朗之万采样法采样

DDPM 逆采样的那个初始分布是高斯分布，均值为 0，方差为 1，可以直接采样

而 PFGM 逆采样的这个分布要更特别，这里假设x_{0}的取值空间要远小于 x 的取值空间，这样一来，当 t 很大时，PFGM 的渐进分布就与 x_{0} 没有关系了

p(x,t)=\frac{t}{(\Vert\boldsymbol{x}\Vert^2 + t^2)^{(d+1)/2}}

有了公式，其实从采样的角度来说，我们有很多种方法去采样了，而且因为是柯西分布，所以假设 x_{0} 的取值空间要远小于 x 的取值空间是比较合理的

从构建样本的角度来看，大家构建样本的方式都是按照场强分布为概率分布来做的，保持一致，所以这里 PFGM 构建样本使用

\boldsymbol{x} = \boldsymbol{x}0 + \Vert \boldsymbol{\varepsilon}{\boldsymbol{x}}\Vert (1+\tau)^m \boldsymbol{u},\quad t = |\varepsilon_t| (1+\tau)^m

把 t 代进去，就是两个正态分布的除法，用两个正态分布的除法模拟柯西分布是一种常见的做法

Rectified Flow

Rectified flow 主要目的是解决采样效率慢的问题，首先我们看一下为什么采样慢

采样遵循的是场线的方程，是个微分方程

\frac{dx_{t}}{dt}=f(x_{t},t)

对于这个微分方程，要得到 x_{t} 的变化曲线，得积分，所以后续有人参考了积分的方法，用欧拉法或者 RK 45 等高阶积分的方法做过优化，加速了采样过程，也有的尝试根据这个微分方程，求出一个近似的解析解，实现一步或者多步逆采样回来，但是这些方法都是有误差的，产生误差的主要来源就是这条场线是一个曲线，而所有的方案基本都是以直代曲，而累积误差越大，效果会越差，所以本质上限制采样步数的其实是曲线的弯曲程度

那么一个很朴素的思想就是，如果场线是一条直线，那么逆采样就可以一步到位，因此假设 t_{0}=0,t_{1}=1 则

x_{t}=(1-t)x_{0}+tx_{1}

就是个直线，在这样的场线下，进一步假设

p(x_{1},t)=N(0,1)

那么 x_{1} 其实就是 z，就是那个噪声

则 x_{t} 满足分布

p(x_{t},t|x_{0})=N((1-t)x_{0},t^2)

p(x_{t},t)=\int N((1-t)x_{0},t^2)p(x_{0})dx_{0}

场线方程为

\frac{dx_{t}}{dt}=f(x_{t},t)=x_{1}-x_{0}=\frac{x_{t}-x_{0}}{t}

总结

至此，使用场的观点就可以解决扩散过程

1、定义一个空间 (x, t) ，也就是对 x 升维

2、在这个空间下，定义一个场，场强的分布形式是概率分布，该场强在 t 方向的分量的值是数据在 t 下的概率密度函数的值，同时场强的分布的表达式本质上是 x_{0} 的期望，也就是

E= \int (E_{x},E_{t})p(x_{0})dx_{0}

3、在x_0, t_0是原始数据分布，一般取 t_{0}=0

4、在 x_{t_{1}},t_{1} 是另一种数据分布，是逆采样的起点，求出这个起点的具体表达式，使得我们可以采样它

整体流程上：

1、构建样本，即定义 x=g(x_{0},t) ，其中这个定义要使得x 的分布要和场强的分布一致

2、使用神经网络拟合场强分布方程

3、从 p(x_{t_{1}},t_{1}) 中采样某个值，然后根据场强分布方程求场线方程，从这个值为起点，沿着场线逆向回去

干完了，收工


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-8a4028398418373cefb41ab8a95a16f4_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-5d11ce4f5cbc3d9f002b4b1d00ceb139.webp)

![图片](https://pica.zhimg.com/1d4e5d71e1b477d7e5449f8684ca7737_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-c71427010ca7866f9b08c37ec20672e0.png)

![图片](https://pic1.zhimg.com/v2-a49c69bfc051eb0c7f25b486dd5fa8d3_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://pic1.zhimg.com/v2-3a9825aab579fb0197b0b022d4a0167f_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-aa15ce4a2bfe1ca54c8bb6cc3ea6627b.png)

