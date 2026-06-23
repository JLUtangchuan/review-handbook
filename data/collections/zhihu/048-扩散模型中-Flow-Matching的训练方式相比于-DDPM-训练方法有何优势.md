---
title: "扩散模型中，Flow Matching的训练方式相比于 DDPM 训练方法有何优势？"
author: "DILab决策实验室"
source_url: https://www.zhihu.com/question/664448167/answer/3603791665
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 扩散模型中，Flow Matching的训练方式相比于 DDPM 训练方法有何优势？

> 作者: DILab决策实验室 | 来源: https://www.zhihu.com/question/664448167/answer/3603791665

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
扩散模型中，Flow Matching的训练方式相比于 DDPM 训练方法有何优势？
已关注
​
写回答
文本生成图像
扩散模型
DDPM
AI图像生成
扩散模型中，Flow Matching的训练方式相比于 DDPM 训练方法有何优势？
新出的方法大都使用 Flow Matching，如 SD3、AuroFlow、Flux。该方法相比于传统的 DDPM 训练方法有何优势？连续时间采样跟…显示全部 ​
关注者
1,088
被浏览
412,299
周舒畅也关注了该问题
已关注​
写回答
​
邀请回答
​
好问题 59
​
1 条评论
​
分享
​
查看全部 36 个回答
DILab决策实验室
OpenDILab 开源决策智能平台知识传播星球
​
 关注
科技猛兽 等 176 人赞同了该回答

总结来说：

Flow Matching 的适用范围更广。可以用于训练包括扩散模型（Diffusion Models）在内的各种连续时间生成模型，比如基于最优传输（Optimal Transport）的生成模型。
由于 Flow Matching 生成轨迹更加平直，因此在部署时需要更少的模型评估次数（Number of Function Evaluations, NFE），从而允许更大的采样步长。
经典 DDPM 中使用的得分匹配（Score Matching）适用范围更窄，只能用于训练基于得分函数建模的生成模型。

另一个可以考虑的优势是：使用 Flow Matching 进行模型训练，一般也会出于定义方便，同时使用了速度场（velocity）作为生成模型的建模对象。这样会有两个额外的好处：

使用 Flow Matching 可以规避扩散概率模型（Denoising Diffusion Probabilistic Models, DDPM）中，当生成时间接近 0 时，得分函数 \nabla_{x_t}\log{p(x_t)} 的建模稳定性问题。而后者一般的训练范围是 t\sim [0.001,1] 。
使用速度场作为建模对象的生成模型可以有效利用 Neural Ordinary Differential Equations（Neural ODE）等技术在节省计算内存的优势。具体来说，在扩散模型预训练之后，可以后续使用连续正则化流模型的思路（Continuous Normalizing Flow, CNF）进行精细调整。比如在扩散模型结合强化学习时，使用一个价值函数 V(x) 来引导训练从 t\sim [0,1] 的连续过程的采样。而假如使用噪音函数（得分函数）建模的 \nabla_{x_t}\log{p(x_t)} ，使用上述 Neural ODE 优化方法会让梯度在接近 0 的附近发生爆炸。

延伸：在训练时，连续时间和离散时间建模的生成模型差异显著，连续时间的训练更为充分。在采样时，连续时间和离散时间建模的生成模型差异不大，因为连续时间建模的模型也是使用离散步长进行采样的。主要的区别在于，连续时间建模的生成模型在采样时，可以使用更灵活的步长。

最后，欢迎关注 OpenDILab 有关扩散模型的一系列专栏博客，以及相关的 GitHub 开源项目。

[1] Lipman Y, Chen R T Q, Ben-Hamu H, et al. Flow matching for generative modeling[J]. arXiv preprint arXiv:2210.02747, 2022.

[2] Chen R T Q, Rubanova Y, Bettencourt J, et al. Neural ordinary differential equations[J]. Advances in neural information processing systems, 2018, 31.

[3] Albergo M S, Boffi N M, Vanden-Eijnden E. Stochastic interpolants: A unifying framework for flows and diffusions[J]. arXiv preprint arXiv:2303.08797, 2023.

送礼物
还没有人送礼物，鼓励一下作者吧
编辑于2024-08-23 16:47
・上海
​
赞同 176​
​
1 条评论
​
281
​
11
​
分享
​
​
收起​
pmp真的值得考吗？
我们衡量一件事情值不值得的时候，往往会考虑以下几个因素：1，成本与回报：成本又分时间成本和金钱成本，这件事会占你多少时间？与此同时，你做这件事可能会错过哪些机会（机会成本）？这件事要投入多少资金...
长弓张
100+热议
更多回答
华年ss
Physics works, I guess

本笔记根据MIT何恺明在CVPR2025上的教程整理《Towards end2end generative modeling》，原始ppt可在何恺明个人主页上找到，内容包括：
深度学习计算机视觉历史
识别&生成：一体两面
流匹配
同行工作
未来工作
1 深度学习计算机视觉历史
在讲生成模型之前，先讲了深度网络发展历史。自从AlexNet之后视觉识别模型就倾向于端到端式，即使用单个网络直接建模图像到类别的映射。

而在AlexNet出现之前的做法基本上是逐层训练，例如深度信念网络DBN，降噪自编码器DAE等。Deep Belief Nets (DBN) [Hinton et al, 2006] Denoising Autoencoders (DAE) [Vincent et al, 2010, 2011]

那么在生成模型中是如何呢？现在的扩散模型，自回归模型都像是在做逐层训练。例如扩散模型将噪声转换为图像使用了很多步，可以认为是一个非常深的网络。而在训练时候是分开每个时间步训练的，相当于训练了某些层。

2 识别&生成：一体两面
那么识别模型与生成模型是否是同一硬币的两面？识别是将图像逐渐抽象化为类别，而生成是将类别或者噪声逐渐具象化为图像。

从流形上讲，将数据映射为嵌入就是表示学习，从嵌入向量映射为图像就是生成模型。变分自编码器也是这样，编码=表示，解码=生成。

如果在空间中有一些点的话，这些点可构成一种概率分布。每次对分布进行映射时，可以将其转化为另外一个分布。例如下图使用不同函数对分布进行变换。

而深度网络即是由这些线性变换、非线性激活函数构成。从下到上是识别，是确定性的数据到标签的映射；从上到下是生成，不确定的映射。构建映射的方法有连续归一化流（在神经ODE中）和流匹配（和上面两图表示一个意思）

3 流匹配
这里的三个参考文献是

Flow matching for generative modeling
Flow straight and fast: learning to generate and transfer data with rectified flow
Building normalizing flows with stochastic interpolants




在Yaron Lipman, “Flow Matching: Simplifying and Generalizing Diffusion Models” 中还明确了从属关系，扩散模型属于流匹配属于流模型属于生成模型。

Fjelde, Mathieu, Dutordoir, “An Introduction to Flow Matching” 中介绍了一些流匹配的知识。即使约束模型路径走直线，实际学到的路径-边缘速度沿着曲线。

流模型可以看做是学习如下常微分方程ODE: dz_t/dt=v(z_t,t)，训练时以v(z_t,t)的真实值作为标签，使用网络v_\theta (z_t,t)逼近。理想情况下，最终的解由积分给出z_r=z_t-\int_r^tv(z_\tau,\tau)d\tau，但是实际上需要进行离散化,积分通过函数值与时间间隔的乘法近似：z_r=z_t+(r-t)v(z_t,t)

这里可将残差网络和常微分方程ODE进行对比。

残差网络：建模离散的h_{t+1}=h_t+f(h_t,\theta_t)，每个时间步（每个残差块）参数不同
ODE：建模连续时间的dh(t)/dt=f(h(t),t,\theta)，不同时间步参数共享，f通常为残差网络
小结：

识别与生成就是在不同分布之间构建流
流匹配：构建标签路径用于训练。隐式，预先设定的，与网络无关的。
想建模的最终要用的积分，但是实际上大家都在做离散化，并且使用数值ODE求解器进行生成。
接下来就该端到端式生成建模出场。
4 平均流
4.1 一步生成
既然要的是用于数据生成的积分：z_r=z_t-\int_r^tv(z_\tau,\tau)d\tau，但是实际上又使用的积分的离散z_r=z_t+(r-t)v(z_t,t)，注意这个式子是个迭代式，通常从r时刻到t时刻要进行多次迭代。讲者合作团队提出直接建模r到t的平均速度u(z_t,r,t)=\frac{1}{t-r}\int_r^t v(z_\tau,\tau)d\tau，等式左边是新引入的平均速度，等式右边积分号里面是原来使用的瞬时速度。从示意图上看就是直接学习橙色箭头“一步登天”，而原来需要按照蓝色箭头路径“步步为营”。

引入平均速度后的性质：

平均速度与起点、终点两个时刻有关。
网络无关。
流场真实值是预先设定的。
4.2 积分转变为差分
积分难以求解，通过一些公式推导将平均速度的积分转换为差分。
平均速度u(z_t,r,t)=\frac{1}{t-r}\int_r^t v(z_\tau,\tau)d\tau
将时间分布移到右边 ({t-r})u(z_t,r,t)= \int_r^t v(z_\tau,\tau)d\tau
两边对t求导数 \frac{d}{dt}({t-r})u(z_t,r,t)= \frac{d}{dt}\int_r^t v(z_\tau,\tau)d\tau
左边使用求导乘法规则，右边使用对含参积分求导规则，可得u(z_t,r,t)+({t-r})\frac{d}{dt}u(z_t,r,t)=v(z_t,t)
移项 u(z_t,r,t)=v(z_t,t)-({t-r})\frac{d}{dt}u(z_t,r,t)
上式每一项含义为：平均速度=瞬时速度-（时间间隔）*平均速度对时间的导数
前几项都意义明确，最后一项还需要化简。平均速度u(z_t,r,t)对t导数为 \frac{d}{dt}u(z_t,r,t)=\partial_z u \frac{dz_t}{dt}+\partial_r u \frac{dr}{dt}+\partial_t u \frac{dt}{dt} 写为矩阵乘法形式[\partial_z u,\partial_r u,\partial_t u][v(z_t,t),0,1]^\mathrm {T} 这个乘法第一项为输出对各个输入变量的导数，叫作雅可比矩阵；第二项为瞬时速度和常量。他们的乘积叫作雅可比-向量积（Jacobian-vector product, JVP），现在深度学习框架中很多都支持计算这一项 jvp(fn,(z,r,t),(v,0,1))。反向传播时候计算的是向量-雅可比积VJP
4.3 训练平均Flow
训练使用的损失函数如下
\mathcal{L}(\theta)=\mathbb{E}||u_\theta(z_t,r,t)-\text{sg}(u_{tgt})||^2_2 \\

第一项为网络建模，第二项为目标值，这里的sg表示梯度中断。目标值为

u_{tgt}=v(z_t,t)-({t-r}) (v(z_t,t)\partial_z u_\theta+\partial_t u_\theta) \\

几点说明：

如果u_\theta估计没有误差，那么他就是平均速度
无需积分，只有导数 两者等价，详细看论文
使用中断导数是为了组织深度学习框架求高阶导数
只建模含有单个时间的函数是不行的




一般情况下边缘速度无法显示获取，这里也使用条件速度进行替代。将v_t=\epsilon -x带入损失函数

相较于经典流匹配做出的改动为加阴影的两行

采样：直接使用估计出的平均速度 z_r=z_t-(t-r)u_\theta(z_t,r,t)采样即可。带入r=0,t=1，采样随机数e=randn(x_shape)，一步采样x=e-fn(e,r=0,t=1)

4.4 生成性能
在256x256图像数据集上，使用不同参数量模型1步生成性能随着优化的下降情况
计算量对比：相较于先前的短步数采样模型平均流计算量又低，性能又好。

相比Shortcut模型1步采样 FID指标提升70%

相比iMM模型2步采样 FID指标提升70%

相较于250步采样的DiT 和SiT ，指标非常接近了。

1步采样 FID指标3.43 可视化结果

5 同行工作
一致性模型Consistency Models • Consistency Models (CM) [Song+ 2023] • improved Consistency Training (iCT) [Song & Dhariwal 2024] • Easy Consistency Training (ECT) [Geng+ 2024] • simple/stable/scalable Consistency Models (sCM) [Lu & Song 2024]
双时间步模型Two-time-variable Models • Consistency Trajectory Models (CTM) [Kim+ 2023] • Flow Map Matching [Boffi+ 2024] • Shortcut Models [Frans+ 2024] • Inductive Moment Matching [Zhou+ 2025]
再看归一化流Revisiting Normalizing Flows • TarFlow [Zhai+ ’24]
6 未来工作
在生成模型中，我们是否还处在像是识别模型中AlexNet之前的时代
平均流仍然是根据迭代流匹配推导出的
平均流扮演2个角色：构建噪声到数据的路径，预定义的，隐式的；使用平均速度大致概括这个路径。
端到端生成式建模的好方法是什么？

阅读全文​
​
赞同 563​
​
6 条评论
​
1258
​
21
​
分享
​
Takina

当初看rectified flow，知乎上有篇文章叫《扩散模型大道至简》，我觉得非常恰当；在看了那么多恶心的noise schedule，score function和sde，深以为扩散模型就是这么复杂的东西，搞出这些数学的人真牛逼的时候，突然发现一个这么简单直接的家伙——插值做输入，两个point之差为目标，而且可以用optimal transport解释原理，实现起来只要几行代码，随便训练一下跑图效果吊打ddpm时（当时我只在imagenet上训练了几千步，很多物体已经可以看出大概，同期ddpm还是一坨），我被这篇文章深深的震惊到了；我认为这大概就是科学的美感吧，就好像地心说复杂的行星轨道，被日心说的椭圆优美地替代一样

阅读全文​
​
已赞同 775​
​
46 条评论
​
1092
​
18
​
分享
​
查看全部 36 个回答
关于作者
DILab决策实验室
OpenDILab 开源决策智能平台知识传播星球
​
谭日成、周舒畅也关注了她
回答
13
文章
181
关注者
6,390
​
关注她
​
发私信
大家都在搜
换一换
英国首相斯塔默辞职
396 万
热
刘强东说将来根本不需要快递员
300 万
热
2026 上海高考分数线
297 万
新
人民日报批烂梗泛滥
293 万
热
懂车帝京沪续航测试
287 万
多品牌婴幼儿纸尿裤检出甲酰胺
283 万
14岁国少球员遭成年队围殴骨折
280 万
法国3-0伊拉克
265 万
13岁女孩称遭强奸未被立案
255 万
恋与深空新男主致大规模退游
241 万
 
帮助中心
服务热线：400-919-0001
帮助与客服
联系我们
更多
 
举报中心
违法和不良信息举报：010-82716601
我的举报
更多
 
关于知乎
知乎个人信息保护指引
知乎协议
下载知乎
Investor Relations
网站资质信息
更多
京ICP证110745号 · 京ICP备13052560号-1 · 京公网安备 11010802020088 号 · 京网文[2025]0422-132 号 · 药品医疗器械网络信息服务备案（京）网药械信息备字（2022）第00334号


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=fdaf910d)

![图片](https://pic1.zhimg.com/v2-0c64e9a744469093bbcd164d7d66d258_l.jpg?source=2c26e567)

![图片](https://pic4.zhimg.com/v2-309b8095c3b5bd70a250f0ecc832962a.webp)

![图片](https://picx.zhimg.com/v2-ad6fd7f04875e21d81e07f8cb942cc36_l.jpg?source=1def8aca)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=1def8aca)

![图片](https://picx.zhimg.com/v2-0c64e9a744469093bbcd164d7d66d258_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/80/v2-ccdb7828c12afff31a27e51593d23260_720w.png)

