---
title: "自动驾驶Diffusion+RL 研发流程"
author: "健壮壮"
source_url: https://zhuanlan.zhihu.com/p/2039667146515538016
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 自动驾驶Diffusion+RL 研发流程

> 作者: 健壮壮 | 来源: https://zhuanlan.zhihu.com/p/2039667146515538016

---

记得上次写文章的时候，还是在广州XP的时候。感恩当时遇到非常nice领导和有趣的同事。期间技术栈也发生了很大的变化，由规则驱动转化为数据驱动的范式。目前已转向RL技术栈（model-free的ocp问题），外加ai coding的提效, 后面会附demo

1 RL 应用场景
1.1 游戏：（环境已知，reward已知 ---> 效果可超越人类） 星际争霸、flappy bird
1.2 Post training:（大模型、VLA后训练微调）

预训练模仿学习（初解），基于初解，reward探索，微调；

1.3 运动控制(被控对象复杂的具身机器人)：
运动控制仿真

具身智能研究大量依赖于仿真平台。MuJoCo/Gazebo/Isaac Sim；Sim2Real迁移技术减少虚实差距(Domain Randomization)：在训练时随机关节扰动

2 强化学习理论

强化学习理论，是model free的ocp问题；我这里用一张图片来展示强化学习与优化、应用领域决策规划的关系；总体上需要较强的数学基础和理解能力。强化学习和优化领域参考资料参见：强化学习的数学原理（赵世钰），凸优化（StephenBoyd），最优控制理论方法与应用（王青），大家自行搜索

“面试造火箭”之 强化学习（具身/自驾）总结

引用知乎博主 https://zhuanlan.zhihu.com/p/695784924
ocp问题与强化学习
3 Flow matching建模

diffusion + flow matching是目前比较快的生成模型，主要应用于图像生成和自动驾驶机器人领域。生成建模学习本质：从噪声分布到真实分布的过程，本质上是一种数学建模过程。扩散模型爆火核心内因就是：它数学建模逻辑极度贴合现实世界的物理客观规律

GAN：直接凭空硬造一张图，一步到位，跳变太大
AR 自回归：从左到右逐像素硬填，不符合视觉生成逻辑
VAE：强行压缩再解压，强行拟合，不自然

Flow Mathcing过程

Flow是什么，Flow是一种连续可微变换 \phi:[0,1]\times\mathbb{R}^{d}>\mathbb{R}^{d}，并定义如下

\begin{equation} \begin{array}{c}{\frac{d}{dt}\phi_{t}(x)=v_{t}(\phi_{t}(x))}\\ {\phi_{0}(x)=x}\end{array} \end{equation}

t 这个变换是个恒等变换，随着 t 逐步增加这个变换逐渐可微的渐变。Flow matching学什么，他学习的速度场，给定任意数据 x_t 他的真实速度u_t(x) 和 v_t(x) 网络 的差的期望

\begin{equation} \mathcal{L}_{\mathtt{FM}}(\theta)=\mathbb{E}_{t,p_{t}(x)}\| v_{t}(x)-u_{t}(x)\|^{2} \end{equation}

但这个值显然不好计算，一方面 u_t(x) 未知，一方面 p_t(x) 未知，下图给出了一个示意，但符号使用上以 x_0 代表数据， x_1 代表噪声。但其实不必去求FM loss（有证明），我们只需要知道他的梯度就行，我们其实是想学极值点。可以证明下面公式的梯度和FM loss，等同。

\begin{equation} \mathcal{L}_\mathtt{CFM}(\theta)=\mathbb{E}_{t,q(x_{1}),p_{t}(x|x_{1})}\big\| v_{t}(x)-u_{t}(x|x_{1})\big\|^{2} \end{equation}

我们可以稍微展开看看

\begin{equation} \begin{array}{rl}&{\left\| v_{t}(x)-u_{t}(x)\right\|^{2}=\left\| v_{t}(x)\right\|^{2}-2\left\langle v_{t}(x),u_{t}(x)\right\rangle+\left\| u_{t}(x)\right\|^{2}}\\ &{\left\| v_{t}(x)-u_{t}(x|x_{1})\right\|^{2}=\left\| v_{t}(x)\right\|^{2}-2\left\langle v_{t}(x),u_{t}(x|x_{1})\right\rangle+\left\| u_{t}(x|x_{1})\right\|^{2}}\end{array} \end{equation}

上式中 u_t(x) 和网络无关，代表真实的速度场，所以无需关心

\begin{equation} \mathbb{E}_{p_{t}(x)}\| v_{t}(x)\|^{2}=\int\| v_{t}(x)\|^{2}p_{t}(x)dx=\iint\| v_{t}(x)\|^{2}p_{t}(x|x_{1})q(x_{1})dx_{1}dx =\mathbb{E}_{q(x_{1}),p_{t}(x|x_{1})}\| v_{t}(x)\|^{2} \end{equation}

上式可以说明CFM和FM梯度的第一项相等，第二项证明有点绕，我们先引入场的连续性方程；类似流体力学里的连续性方程（Continuity Equation），即流体密度时间变化率加上质量通量密度的散度（梯度的加权和）等于零

\begin{equation} {\frac{d}{dt}}p_{t}(x)+\mathrm{div}(p_{t}(x)u_{t}(x))=0 \end{equation}

有了连续性条件我们得出一个中间结果：

\begin{equation} \begin{aligned} \frac{d}{dt}p_{t}(x) & =\int\Big(\frac{d}{dt}p_{t}(x|x_{1})\Big)q(x_{1})dx_{1}=-\int\mathrm{div}\Big(u_{t}(x|x_{1})p_{t}(x|x_{1})\Big)q(x_{1})dx_{1} \\ & =-\mathrm{div}\Big(\int u_{t}(x|x_{1})p_{t}(x|x_{1})q(x_{1})dx_{1}\Big)=-\mathrm{div}\Big(u_{t}(x)p_{t}(x)\Big) \end{aligned} \end{equation}

上面第一步使用了边缘分布和条件分布的关系

p_{t}(x)=\int p_{t}(x|x_{1})q(x_{1})dx_{1}

，比较等式两边散度算子内的项可得：

\begin{equation} p_{t}(x)u_{t}(x)=\int u_{t}(x|x_{1})p_{t}(x|x_{1})q(x_{1})dx_{1} \end{equation}

于是第二项相等得证：

\begin{equation} \begin{aligned} \mathbb{E}_{p_{t}(x)}\left\langle v_{t}(x),u_{t}(x)\right\rangle & =\int\left\langle v_{t}(x),\frac{\int u_{t}(x|x_{1})p_{t}(x|x_{1})q(x_{1})dx_{1}}{p_{t}(x)}\right\rangle p_{t}(x)dx \\ & =\int\left\langle v_{t}(x),\int u_{t}(x|x_{1})p_{t}(x|x_{1})q(x_{1})dx_{1}\right\rangle dx \\ & = \iint\left\langle v_{t}(x),u_{t}(x|x_{1})\right\rangle p_{t}(x|x_{1})q(x_{1})dx_{1}dx \\ & =\mathbb{E}_{q(x_{1}),p_{t}(x\mid x_{1})}\left\langle v_{t}(x),u_{t}(x|x_{1})\right\rangle \end{aligned} \end{equation}

CFM显然比FM可操作，最起码数据的分布我们知道的或者可以采样近似，我们也可以自己控制

p_{t}(x|x_{1})

，接下来用高斯函数表达probability path，我们考虑如下的概率路径:

\begin{equation} p_{t}(x|x_{1})=\mathcal{N}(x~|~\mu_{t}(x_{1}),\sigma_{t}(x_{1})^{2}I) \end{equation}

并定义 \mu_{0}(x_{1})=0,\sigma_0(x_1)=1,\mu_1(x_1)=x_1,\sigma_1(x_1) = \sigma_\mathrm{min} 。这可以理解从数据分布到一个标准正态分布的一个路径，并考虑一个特定的flow

\begin{equation} \psi_{t}(x)=\sigma_{t}(x_{1})x+\mu_{t}(x_{1}) \end{equation}

在上两个规定下的特殊情形我们有：

\begin{equation} u_{t}(x|x_{1})=\frac{\sigma_{t}^{\prime}(x_{1})}{\sigma_{t}(x_{1})}\left(x-\mu_{t}(x_{1})\right)+\mu_{t}^{\prime}(x_{1}) \end{equation}

证明 为了符号简化，记 w_{t}(x)=u_{t}(x|x_{1}) ，令 x=\psi^{-1}(y) 对于

{\frac{d}{dt}}\psi_{t}(x)=w_{t}(\psi_{t}(x))

，整理为 \psi_{t}^{\prime}(\psi^{-1}(y))=w_{t}(y) 对于 \psi_t^{-1}(y) 他的表达式为

\psi_{t}^{-1}(y)=\frac{y-\mu_{t}(x_{1})}{\sigma_{t}(x_{1})}

同时我们有

\psi_{t}^{\prime}(x)=\sigma_{t}^{\prime}(x_{1})x+\mu_{t}^{\prime}(x_{1})

整理上面结果可得

\begin{equation} w_{t}(y)=\frac{\sigma_{t}^{\prime}(x_{1})}{\sigma_{t}(x_{1})}\left(y-\mu_{t}(x_{1})\right)+\mu_{t}^{\prime}(x_{1}) \end{equation}

到这一步CFM中的所有东西都能给出，但为了更加简单，我们可以进一步

\begin{equation} \mu_{t}(x)=tx_{1},\sigma_{t}(x)=1-(1-\sigma_\mathrm{min})t \end{equation}

在这种简化下

\begin{equation} \begin{aligned} &u_{t}(x|x_{1})=\frac{x_{1}-(1-\sigma_{\operatorname*{min}})x}{1-(1-\sigma_{\operatorname*{min}})t} \\ &\psi_{t}(x)=(1-(1-\sigma_{\operatorname*{min}})t)x+tx_{1} \end{aligned} \end{equation}

也就是Flow是一条直线路径，速度就是噪声到数据的距离，从这里我们看到了问题从泛化到特化，从复杂到简单，最后的算法其实非常简单直接，他的算法流程如下：

数据集 \{x_1^{(i)}\}
向量场模型 v_\theta(x,t)
基分布 p_{\text{base}}
Step 1. 采样
从数据分布采样： x_1 \sim p_{\text{data}}
从基分布采样： x_0 \sim p_{\text{base}}
采样时间： t \sim \mathcal U(0,1)
Step 2. 构造中间状态 x_t = (1-t)x_0 + t x_1
Step 3. 构造监督信号 真实速度： u = x_1 - x_0
Step 4. 计算 Flow Matching Loss \mathcal L_{\text{FM}}(\theta) = \mathbb E_{x_0,x_1,t} \left[ \| v_\theta(x_t,t) - (x_1 - x_0) \|^2 \right]
Step 5. 参数更新 \theta \leftarrow \theta - \eta \nabla_\theta \mathcal L_{\text{FM}}
4 Diffusion + NFT(强化学习微调)

我们使用Flow Matching的Diffusion planner 并用 Diffusion NFT来做微调，在nuplan上实现离线开环微调初步效果。

diffusion r过程对比

FlowGRPO 将去噪采样过程离散化为马尔科夫过程，通过近似相邻步骤之间的高斯转移核近似GRPO算法；算法专注反向过程，破坏正向一致性；依赖SED采样，无法使用ODE等确定性采样器；需存储完整的采样轨迹（包括中间状态），以计算策略梯度，存储和计算开销大。
DiffusionNFT 使用监督模型范式，通过对比正负样本定义策略模型改进方向，将强化信号直接融入到标准的扩散过程中，无需似然估计；保持正向一致性，同时完全解耦策略训练与数据采样，允许使用任意黑箱求解器（包括ODE和高阶方法），提升采样效率与质量。有下列优点：

不需要走反向生成轨迹
不需要似然、不需要概率
训练只看「清晰样本 + 前向加噪」，和你用什么采样器完全无关
采样可以随便换黑箱 ODE、高阶求解器，不受训练约束

扩散模型通过前向过程逐步对干净数据添加高斯噪声，学习连续数据分布；再学习逆过程生成数据。 前向加噪过程存在闭式转移核，可重参数化为：

\begin{equation} x_{t}=\alpha_{t} x_{0}+\sigma_{t} \epsilon, \epsilon \sim \mathcal{N}(0, I) \end{equation}

扩散模型的一种学习方式是采用速度参数化v_\theta(x_t, t)，预测轨迹切线，通过最小化目标损失训练：

\begin{equation} \mathbb{E}_{t, x_0 \sim \pi_0, \epsilon \sim \mathcal{N}(0, I)} \left[ w(t) \left\| v_\theta(x_t, t) - v \right\|_2^2 \right] \end{equation}

在线强化学习：给定预训练扩散策略\pi^{old}和提示词\{c\}, 每轮迭代为提示c采样K张图像x_0^{1:K}，用标量奖励函数

r \in [0,1]评估每张图像，代表最优概率。 采集数据可随机划分为两个虚拟子集：图像 x_{0}以概率r归入正样本集

D+，否则归入负样本集 D-。无限样本下，两个子集的底层分布分别为：

\begin{equation} \pi^{+}(x_0|c) := \pi^{\text{old}}(x_0|\mathbf{o}=1,c) = \frac{p(\mathbf{o}=1|x_0,c)\pi^{\text{old}}(x_0|c)}{p_{\pi^{\text{old}}}(\mathbf{o}=1|c)} = \frac{r(x_0,c)}{p_{\pi^{\text{old}}}(\mathbf{o}=1|c)} \pi^{\text{old}}(x_0|c) \\[1em] \end{equation}

\begin{equation} \pi^{-}(x_0|c) := \pi^{\text{old}}(x_0|\mathbf{o}=0,c) = \frac{p(\mathbf{o}=0|x_0,c)\pi^{\text{old}}(x_0|c)}{p_{\pi^{\text{old}}}(\mathbf{o}=0|c)} = \frac{1 - r(x_0,c)}{1 - p_{\pi^{\text{old}}}(\mathbf{o}=1|c)} \pi^{\text{old}}(x_0|c) \end{equation}

强化学习要求每轮迭代执行策略提升，优化策略 \pi^{*}满足：

\begin{equation} \mathbb{E}_{\pi^{*}(\cdot|c)} r(x_0, c) > \mathbb{E}_{\pi^{\text{old}}(\cdot|c)} r(x_0, c) \end{equation}

同样容易证明：

\pi^{+} \succ \pi^{\text{old}} \succ \pi^{-}

为了利用 D-，强化引导我们认为负反馈对策略提升至关重要。不将\pi^{+} 作为优化点，而是同时利用正负数据推导提升方向 \Delta，训练目标定义为：

\begin{equation} v^{*}(x_t, c, t) := v^{\text{old}}(x_t, c, t) + \frac{1}{\beta} \Delta(x_t, c, t) \end{equation}

其中 c是扩散模型速度预测器，\beta为超参数。该形式与 CFG 等扩散引导类似，我们称 \Delta为强化引导， \frac{1}{\beta} 为引导强度。 根据公式（18-19）可定义和证明：

\begin{equation} \Delta := [1 - \alpha(x_t)] \left[ v^{\text{old}}(x_t, c, t) - v^-(x_t, c, t) \right] \\ = \alpha(x_t) \left[ v^+(x_t, c, t) - v^{\text{old}}(x_t, c, t) \right] \end{equation}

其中

0 \le \alpha(x_t) := \frac{\pi_t^{+}(x_t|c)}{\pi_t^{\text{old}}(x_t|c)} \mathbb{E}_{\pi^{\text{old}}(x_0|c)} r(x_0, c) \le 1

为为标量系数； 该式给出提升 \pi^{old}的理想引导方向 \Delta，适当引导强度可保证策略提升； （策略优化）：训练目标为：

\begin{equation} \mathcal{L}(\theta) = \mathbb{E}_{c, \pi^{\text{old}}(x_0|c), t} r \left\| v_{\theta}^{+}(x_t, c, t) - v \right\|_2^2 + (1 - r) \left\| v_{\theta}^{-}(x_t, c, t) - v \right\|_2^2 \end{equation}

其中：

\begin{equation} v_{\theta}^{+}(x_t, c, t) := (1 - \beta) v^{\text{old}}(x_t, c, t) + \beta v_{\theta}(x_t, c, t), \\[1em] \end{equation}

\begin{equation} v_{\theta}^{-}(x_t, c, t) := (1 + \beta) v^{\text{old}}(x_t, c, t) - \beta v_{\theta}(x_t, c, t). \end{equation}

训练目标梯度：

\begin{equation} \nabla_{v_\theta} \mathcal{L} = 2 \beta (2r - 1) (v^{\text{old}}(x_t, c, t) - v) + 2 {\beta}^2 (v_{\theta}(x_t, c, t) - v^{\text{old}}(x_t, c, t)) \end{equation}

那么将训练目标梯度积分从优化器方向理解：

第一项：优化方向v^{\text{old}}(x_t, c, t) - v

第二项：约束松弛项v_{\theta}(x_t, c, t) - v^{\text{old}}(x_t, c, t)

无限数据与模型容量下，最优解满足：

\begin{equation} v_{\theta^*}(x_t, c, t) = v^{\text{old}}(x_t, c, t) + \frac{2}{\beta} \Delta(x_t, c, t). \end{equation}

5 Diffusion Planner（预训练） + Diffusion NFT （RL微调）Demo

https://github.com/ZhengYinan-AIR/Diffusion-Planner

https://github.com/NVlabs/DiffusionNFT

Diffusion Planner 是基于扩散模型与 Transformer 的自动驾驶闭环规划器，核心特点是统一预测与规划、多模态生成、灵活引导、高速推理、强泛化与低后处理依赖；
核心架构：DiT 扩散 Transformer、Flow matching

开源diffusion planner

Diffusion 的多模建模天然适合RL

（向后）多步降噪过程看成MDP，然后套到强化学习框架里，比如GRPO，或者策略梯度法，PPO，我们知道flow matching的过程是一个ODE过程，为了获得随机性，将ODE过程转换为SDE，然后就可以生套强化学习框架了。这套框架本质上是把 PPO/GRPO 移植到 diffusion model 的去噪过程上：把每条去噪轨迹看作一episode，每个 timestep 的 SDE 采样步骤看作一个 action，用 importance sampling 做 off-policy 修正，用 per-prompt 归一化稳定训练。LoRA 减少可训练参数，FSDP 支持大模型分布式，GRPO-Guard 防止 reward hacking。
（向前）DiffusionNFT， 在采样到样本之后，对样本重新进行加噪来训练，加噪方式和loss都与Diffusion基本一致，只是在最终loss的前边套上了advantage作为loss weight，只不过存在类似拉格朗日项（约束项），DiffusionNFT略慢但优化稳定
我们使用Flow Matching的Diffusion planner 并用 Diffusion NFT来做微调，在nuplan上实现离线开环微调初步效果如下；（左边:预训练；右边:RL微调）（bokeh交互式工具可视化）
bokeh交互式可视化工具（左：预训练，右：RL 微调）

下面是RL架构简略图（目前demo设定的是离线强化学习，后续可引入闭环强化学习架构，一段式模型引入3DGS）

demo链接（comming soon大约一周时间）：https://github.com/chaoren718718-jpg/diffusion-rl

6 研发流程及评测重要性

https://www.zhihu.com/question/1964369389823427262/answer/1964907507454550287
参考FSD AI研发范式：

端到端模型架构的必要性：对人类价值观进行编码极其困难 \ 感知、预测与规划之间的接口定义模糊。FSD介绍比较关键内容：

维度灾难；（丰富的数据资源、NN挖掘各种corn case）
高维到低维的映射很难
人类价值观进行编码极其困难
解决方案：挖掘数据
可解释性和如何保证安全性；
推理语言输出解释性
feedforward 3dgs
(最难) 如何正确合理评估自动驾驶系统的能力:
仿真评测、3Dgs重建闭环评测
世界模型生成场景评测

Ai是第四次工业革命，意味着生产效率的提升，AI开发的产品线符合工业流水线（本质上兼顾效率和质量）；有些部分工具可以无人自动化，有些部分还需要人类；但所有生产者生成的内容都需要有个质量检查体系来校验；其背后的核心原理本质是: 效率和质量极致管理，这条流水线的各个部分不能有明显的短板，否则就会影响效率和质量，折射出一号位对工程和产品、技术的理解和管理水平，也就是所谓的“体系”。为啥需要这套流水线？ 人不是神，代码肯定会犯错。如果不有效（自动化）仿真拦截错误，直接现实中测试，效率极低，本质上是提高生产效率。
例子1：开发手机软件的一个小模块，开发人员无法保证该改动会不会对其他模块性能有影响；实际测试可能又测试不到该场景。那就需要有性能监控和反馈，导致进度有问题
例子2：Ai Coding类似的逻辑：
人类是总监，提出详细需求，将问题拆解，将“工产流水线”系统流程搭建好；
AgentA , AgentB提出方案 ----> AgentC , AgentD review方案 ----> AgentE , AgentF实施方案 ----> AgentG , AgentH 质量检查 ----> 反馈

所以ai时代，面向产品的开发，更加考验组织团队的效率，工具的效率和工程细节打磨(真正优秀的产品是无数个细节累加而成，这些可以说都是脏活累活)；而非期待有颗银子弹搞定一切。

简要开发流程（form 公开图片）
7 强化学习和预训练的如何分工？

Scaling Test-Time Compute Without Verification or RL is Suboptimal

基座模型必须具备的 4 个核心先决能力：
基座已有的能力里 “挑出最好的解”。所以基座必须：会很多解法、偶尔能做对。


预训练是模仿学习，泛化弱，未见场景极易出错，只能复刻已有数据，无法自主探索优化；RL强化学习，可提高模型泛化性；可在线交互试错，动态适配变化环境；能探索最优策略，突破人类现有经验；
那么RL 取决于环境和reward；

游戏领域（已知，real环境），reward(已知)，可以学习出超越人类的game player
运动控制领域（已知 , sim环境），reward(已知, 轨迹跟踪相对简单)，但需要解决sim2real问题；有时候只要被控对象模型精确，传统算法更加有优势，比如汽车轨迹跟踪控制（MPC算法等）
自动驾驶领域（已知，sim环境），reward(人类定义,高维reward难以设计)， 需要解决sim2real和reward问题


自动驾驶领域；完全靠强化学习非常难
1, sim2real技术难度非常，相当于要把真实的世界模型建立出来;如果用规则建立真实的世界模型，那么就不会用ai来实现了，直接用规则可实现自动驾驶;世界模型训练，会出现ai 训练 ai的问题，可能结果不可信
2, real中训成本高（会撞车或者生命危险）
3, 强化学习的reward比较难设计;规则时代，3维的人类设计高维的reward本身就非常困难，而且从感知bev特征就存在传递消息缺失，也不好建模，比如盲区监测限速，绕水坑等;规则设计的reward也不一定sim2real(非常精准表达人类价值观优势)；可能有个比较好的方式采用专家数据fit reward


预训练"初解" + RL "优化微调"
与纵向规划一样，算法模块提供ref ，在经过动力学优化器（apollo）。预训练的初始结果就比较好，然后通过强化学习微调（这样可大大降低reward设计的复杂性和精细度）；或结果不好，看是否通过强化学习微调修掉，过度依赖reward 就会陷入设计规则的跷跷板；如果信息传递存在丢失的场景或者需要高级语义理解的场景，大概的解决方案：挖掘数据，调节分布；否则可以通过rl微调解决。总之预训练和rl应该是相辅相成的，但在自动驾驶领域预训练还是大头，远没有预训练和强化学习55开的情况。

8 个人总结

Ai 可以把原来的差异成倍的放大，专业能力极其重要（PS: demo中没有一行代码是我自己写的）

Lecun "我们应该学习数学、建模的基础知识， 学习如何学习"，保持对基础知识的掌握会让你事倍功半

备注：如有侵权，实属无心，请联系


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-6532db27969756feb5a5380a1d68dfb0_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-e75a45feac553c5b7d36e844c1ebda4a_1440w.jpg)

![图片](https://pica.zhimg.com/v2-51812107fbed6a839ff62e5562f4ac86_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-1863db83fa366e14288f044695bc9596_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-1936d331dfebb165f3195eff3b13c6d9_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-91bcf28ad604db0c2a6490d527c21d05_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-edf8f41fbe95e73e421433df1e5b1caa_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-7e20ed7b111937e001b209fc8e7ce720_1440w.jpg)

![图片](https://pica.zhimg.com/v2-cedfb481a81bbb41b20afdcd9bc0837a_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-255165f50860a5635873d8b3129cec43_1440w.jpg)

![图片](https://pica.zhimg.com/v2-05ea63ac3053e44b443755edb49b3254_1440w.jpg)

![图片](https://pica.zhimg.com/v2-5f6dd46ace94af40e503c1e6a8c0a34d_bh.webp?source=d6434cab)

![图片](https://pic2.zhimg.com/v2-25d9de2e2b8d4971d2c24574387ab4c0_xl.webp?source=d6434cab)

![图片](https://picx.zhimg.com/v2-10b20470e80a6274affe25aeba407dce_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-3ac403672728e5e91f5b2d3c095e415a.png)

![图片](https://pica.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-6532db27969756feb5a5380a1d68dfb0_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

