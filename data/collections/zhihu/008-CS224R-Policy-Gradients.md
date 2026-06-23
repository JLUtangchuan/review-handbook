---
title: "CS224R Policy Gradients"
author: "NeXTzhao"
source_url: https://zhuanlan.zhihu.com/p/2041526242667656710
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# CS224R Policy Gradients

> 作者: NeXTzhao | 来源: https://zhuanlan.zhihu.com/p/2041526242667656710

---

策略梯度的主要思想：Policy Gradient 是从“模仿专家动作”走向“用自己的试错数据改进策略”的第一类 online RL 方法。核心不是学习一个环境模型，而是直接调整策略 \pi_\theta(a\mid s)，让高回报轨迹中的动作概率上升、低回报轨迹中的动作概率下降。

1. 学习目标与整体结构

这部分要解决的问题很直接：已经有一个可微策略 \pi_\theta，但环境转移通常不可微、奖励也可能很稀疏，怎样还能对 \theta 做梯度上升，让期望回报变大？

模块	要回答的问题	关键结论
RL 目标	策略到底在优化什么？	最大化轨迹回报的期望 J(θ)
Policy Gradient	环境不可微时如何求梯度？	用 ∇θ log pθ(τ) 把梯度转到采样分布上
REINFORCE	真实期望算不了时怎么办？	用一批 rollout 的 Monte Carlo 均值估计梯度
方差降低	为什么训练很抖，怎么缓解？	用 reward-to-go 和 baseline 减少无关噪声
Off-policy	为什么不能复用旧数据，能不能修正？	用 importance sampling 修正采样分布差异，并用 KL 约束控制更新幅度
2. 从模仿学习到强化学习目标
对比维度	模仿学习 / Behavior Cloning	强化学习目标 / Policy Gradient	关键区别
数据来源	固定专家数据集 D，训练时不再主动与环境交互。	当前策略 πθ 与环境交互，采样得到轨迹 τ。	从“看专家怎么做”变成“自己试错再改进”。
优化目标	最大化专家动作似然，让专家动作在当前策略下概率更高。	最大化当前策略采到轨迹的累计回报期望。	BC 学“像不像专家”，RL 学“回报高不高”。
训练信号	监督标签是专家动作 a。	监督信号来自奖励 r(s_t,a_t) 和轨迹回报。	RL 的信号更弱、更吵，但能表达任务目标。
策略分布	训练分布主要由数据集决定，策略错误不会改变数据来源。	轨迹分布由初始状态、策略和环境转移共同决定，并随策略变化。	策略一变，后续采到的状态和动作分布也会变。
是否能超过示范者	通常受示范数据上限限制，难以靠训练本身超过专家。	可以通过环境反馈继续改进，理论上有机会超过初始策略或示范者。	这也是从 imitation 转向 online RL 的主要动机。
主要风险	分布偏移：模型一旦偏离专家轨迹，就可能遇到训练集中没见过的状态。	梯度高方差、采样成本高、奖励稀疏时学习慢。	前者偏“数据覆盖问题”，后者偏“估计和采样问题”。
和本节后续的关系	给出一个“加大专家动作概率”的监督学习参照系。	Policy Gradient 可以看成“回报加权的动作似然提升”。	后面推导的核心就是把动作 log probability 的梯度乘上回报权重。
3. Online RL 的基本结构

Policy Gradient 是 online RL：训练数据不是固定的，而是由当前策略不断产生。每次更新都会改变后续采样分布。

流程可以写成：

初始化策略 → 运行当前策略采样 → 得到一批轨迹和奖励 → 估计策略梯度 → 更新策略参数 → 回到采样。

步骤	做什么	容易出的问题
初始化	随机初始化，或从模仿学习、启发式策略开始	起点太差会导致有效奖励很少
采样	用当前策略 πθ 收集 batch rollout	采样成本高，且数据只代表当前策略
估计	用回报加权动作 log probability 的梯度	估计方差大，单个 batch 很不稳定
更新	沿估计梯度提升期望回报	更新太大时，新策略和旧数据不匹配
4. Policy Gradient 的核心推导
Step 1：写出要优化的目标

一条轨迹记为 \tau=(s_1,a_1,\ldots,s_T,a_T)，轨迹总回报记为 R(\tau)=\sum_{t=1}^{T}r(s_t,a_t)。Policy Gradient 要最大化当前策略采样到的轨迹回报期望：

J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}[R(\tau)]

为了对这个期望求梯度，先把期望写成积分形式。离散轨迹时也可以理解成对所有轨迹求和：

J(\theta)=\int p_\theta(\tau)R(\tau)d\tau

Step 2：直接对目标求梯度

对 \theta 求导：

\nabla_\theta J(\theta)=\nabla_\theta\int p_\theta(\tau)R(\tau)d\tau

奖励函数 R(\tau) 本身不直接对 \theta 求导。参数 \theta 影响的是“会采样到怎样的轨迹”，也就是轨迹分布 p_\theta(\tau)：

\nabla_\theta J(\theta)=\int \nabla_\theta p_\theta(\tau)R(\tau)d\tau

数学技巧 1：把分布的梯度改写成 log probability 的梯度。 因为 \nabla_\theta\log p_\theta(\tau)=\frac{\nabla_\theta p_\theta(\tau)}{p_\theta(\tau)}，所以有：

\nabla_\theta p_\theta(\tau)=p_\theta(\tau)\nabla_\theta\log p_\theta(\tau)




把这个恒等式代回目标梯度：

\nabla_\theta J(\theta)=\int p_\theta(\tau)\nabla_\theta\log p_\theta(\tau)R(\tau)d\tau

这又可以写回期望形式：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}[\nabla_\theta\log p_\theta(\tau)R(\tau)]

Step 3：展开轨迹概率

轨迹概率由三部分组成：初始状态分布、策略、环境动力学。

p_\theta(\tau)=p(s_1)\prod_{t=1}^{T}\pi_\theta(a_t\mid s_t)p(s_{t+1}\mid s_t,a_t)

对它取 log，乘积会变成求和：

\log p_\theta(\tau)=\log p(s_1)+\sum_{t=1}^{T}\log\pi_\theta(a_t\mid s_t)+\sum_{t=1}^{T}\log p(s_{t+1}\mid s_t,a_t)

数学技巧 2：先取 log 再求导。 如果不取 log，轨迹概率里是一长串乘积；取 log 后变成求和，梯度就能拆成每个时间步的策略梯度。

Step 4：环境项为什么可以消失

再对 \log p_\theta(\tau) 求梯度：

\nabla_\theta\log p_\theta(\tau)=\nabla_\theta\log p(s_1)+\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)+\sum_{t=1}^{T}\nabla_\theta\log p(s_{t+1}\mid s_t,a_t)

初始状态分布 p(s_1) 和环境动力学 p(s_{t+1}\mid s_t,a_t) 不由策略参数 \theta 控制，所以它们对 \theta 的梯度为 0：

\nabla_\theta\log p(s_1)=0,\qquad \nabla_\theta\log p(s_{t+1}\mid s_t,a_t)=0

关键结论：Policy Gradient 不需要环境可微，也不需要知道环境转移概率的具体形式。推导后只剩策略项：

\nabla_\theta\log p_\theta(\tau)=\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)




Step 5：代回目标梯度

把上面的结果代回 \nabla_\theta J(\theta)=\mathbb{E}[\nabla_\theta\log p_\theta(\tau)R(\tau)]：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\left(\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\right)R(\tau)\right]

也可以把回报乘进求和里写成：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)R(\tau)\right]

Step 6：用采样轨迹估计期望

真实期望算不了，就用当前策略采样 N 条轨迹 \tau_1,\ldots,\tau_N，用样本均值估计：

\nabla_\theta J(\theta)\approx \frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_{i,t}\mid s_{i,t})R(\tau_i)

这就是 REINFORCE / Vanilla Policy Gradient 的基础梯度估计。

推导节点	公式	作用
目标函数	期望轨迹回报 J(θ)	定义策略要最大化什么。
积分形式	把期望写成对所有轨迹的积分或求和	把对期望求梯度变成对分布求梯度。
log-gradient trick	把分布梯度改写成 log probability 梯度	把梯度写成能用采样估计的期望。
轨迹展开	初始状态分布 × 策略概率 × 环境转移概率	看清楚哪些项含有 θ。
环境项消失	只剩每个时间步的策略 log probability 梯度	只需要策略可微，不需要环境可微。
采样估计	用多条 rollout 的样本均值近似真实期望	得到可实现的 Policy Gradient。

直觉：这条公式很像“回报加权的行为克隆”。高回报轨迹里的动作会被提高概率，低回报轨迹里的动作会被降低概率。后面引入 reward-to-go 和 baseline，本质上是在让这个“回报权重”更合理、更稳定。

5. REINFORCE / Vanilla Policy Gradient

真实期望无法精确计算，所以用 N 条采样轨迹做 Monte Carlo 估计：

\nabla_\theta J(\theta)\approx \frac{1}{N}\sum_{i=1}^{N}\left(\sum_{t=1}^{T}\nabla_\theta\log \pi_\theta(a_{i,t}\mid s_{i,t})\right)R(\tau_i)

阶段	操作	对应数学量
1	用当前策略运行环境，采样 N 条轨迹	轨迹来自当前策略分布
2	计算每条轨迹的累计回报	R(τ_i)
3	计算动作 log probability 的梯度	对所选动作的 log probability 求梯度
4	用回报加权梯度并更新参数	沿 policy gradient 方向更新 θ

这就是 REINFORCE，也常叫 vanilla policy gradient。它非常直接，但也把“整条轨迹的总回报”分配给每个动作，因此噪声会很大。

高方差是 Policy Gradient 的主要痛点。比如机器人先后退一大步、再向前一小步，如果只看整条轨迹回报，早期错误动作也可能被正回报“奖励”到；稀疏奖励任务里，大多数轨迹回报相同，梯度也会缺少区分度。

6. 高方差问题与缓解方法

问题：Vanilla Policy Gradient 的估计是无偏的，但样本方差很大。同一条轨迹的总回报会被分配给每个动作，导致早期动作、无关动作、偶然奖励都可能影响梯度方向。

从基础估计式看，噪声主要来自权重 R(\tau)：它既包含当前动作之后可能受到影响的奖励，也包含当前动作之前已经发生、与当前动作无关的奖励。

\nabla_\theta J(\theta)\approx \frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_{i,t}\mid s_{i,t})R(\tau_i)

噪声来源	现象	对应缓解思路
过去奖励	当前动作无法影响已经发生的奖励	用 reward-to-go 只保留未来奖励
绝对回报尺度	所有动作都被大正数或大负数统一推动	减去 baseline，改成相对优势
方法一：Causality 与 Reward-to-go

一个动作只会影响它之后的奖励，不会改变已经发生的奖励。于是时间 t 的动作不应该被 t 之前的奖励加权。

定义 reward-to-go：

G_t=\sum_{t'=t}^{T}r(s_{t'},a_{t'})

把整条轨迹回报 R(\tau) 换成从当前动作开始的未来回报 G_t：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)G_t\right]

写法	权重	影响
整条轨迹回报	整条轨迹的总奖励 R(τ)	每个动作都吃到整条轨迹的噪声
Reward-to-go	从当前时刻 t 到终点的未来奖励 G_t	去掉过去奖励带来的无关方差

Reward-to-go 不改变期望梯度的方向，但通常会明显降低方差。它相当于更精确地把“功劳”分配给可能真正影响奖励的动作。

为什么只看未来奖励仍然无偏

从基础形式出发，把总回报按时间 t 切成过去奖励和未来奖励：

R(\tau)=\sum_{t'=1}^{t-1}r(s_{t'},a_{t'})+\sum_{t'=t}^{T}r(s_{t'},a_{t'})

对第 t 个动作的梯度项来说，过去奖励在采样 a_t 之前已经确定。记过去奖励为 C_t=\sum_{t'=1}^{t-1}r(s_{t'},a_{t'})，则：

\mathbb{E}_{a_t\sim\pi_\theta(\cdot\mid s_t)}\left[\nabla_\theta\log\pi_\theta(a_t\mid s_t)C_t\right]=C_t\mathbb{E}_{a_t\sim\pi_\theta(\cdot\mid s_t)}\left[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\right]

而 score function 的期望为 0：

\mathbb{E}_{a_t\sim\pi_\theta(\cdot\mid s_t)}\left[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\right]=\sum_a \pi_\theta(a\mid s_t)\frac{\nabla_\theta\pi_\theta(a\mid s_t)}{\pi_\theta(a\mid s_t)}

=\sum_a \nabla_\theta\pi_\theta(a\mid s_t)=\nabla_\theta\sum_a\pi_\theta(a\mid s_t)=\nabla_\theta 1=0

所以过去奖励项对期望梯度没有贡献，可以删掉，只保留未来奖励：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\sum_{t'=t}^{T}r(s_{t'},a_{t'})\right]

这个推导的重点是“过去奖励不是错的，只是对当前动作的梯度期望贡献为 0”。删掉它不会改变期望，但会减少样本估计里的噪声。

方法二：Baseline 与 Advantage

Baseline 的出发点不是直接取均值，而是在不改变期望梯度的前提下，选择一个能降低梯度估计方差的参照项。先写含 baseline 的形式：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)(G_t-b)\right]

核心约束：baseline 可以是常数 b，也可以是状态函数 b(s_t)，但不能依赖当前采样动作 a_t。只要满足这个条件，它就只改变方差，不改变期望梯度。

baseline 无偏性的细化推导

对单个时间步，baseline 项的期望为：

\mathbb{E}_{a_t\sim\pi_\theta(\cdot\mid s_t)}\left[\nabla_\theta\log\pi_\theta(a_t\mid s_t)b(s_t)\right]

由于 b(s_t) 不依赖当前动作 a_t，可以把它提出期望：

=b(s_t)\sum_a\pi_\theta(a\mid s_t)\nabla_\theta\log\pi_\theta(a\mid s_t)

再用 \nabla_\theta\log\pi_\theta(a\mid s_t)=\frac{\nabla_\theta\pi_\theta(a\mid s_t)}{\pi_\theta(a\mid s_t)}：

=b(s_t)\sum_a\nabla_\theta\pi_\theta(a\mid s_t)

因为策略分布归一化，\sum_a\pi_\theta(a\mid s_t)=1，所以：

=b(s_t)\nabla_\theta\sum_a\pi_\theta(a\mid s_t)=b(s_t)\nabla_\theta 1=0

因此可以把 G_t 换成 G_t-b(s_t)。baseline 项不会改变期望梯度，只会影响采样估计的方差。

最小方差 baseline 的精确解

为了看清“最优 baseline”从哪里来，先看轨迹级别的简化形式。令 g(\tau)=\nabla_\theta\log p_\theta(\tau)，带 baseline 的单样本梯度估计为：

\hat g_b=(R(\tau)-b)g(\tau)

由于 baseline 不改变 \mathbb{E}[\hat g_b]，最小化方差时只需要最小化与 b 有关的二阶矩：

\operatorname{Var}[\hat g_b]=\mathbb{E}\left[\left\|\hat g_b\right\|_2^2\right]-\left\|\mathbb{E}[\hat g_b]\right\|_2^2

\min_b\ \mathbb{E}\left[(R(\tau)-b)^2\left\|g(\tau)\right\|_2^2\right]

数学技巧：把方差最小化变成二次函数最小化。 上式对 b 是一个二次函数。对 b 求导并令其为 0，就能得到最优常数 baseline。

\frac{\partial}{\partial b}\mathbb{E}\left[(R(\tau)-b)^2\left\|g(\tau)\right\|_2^2\right]

=-2\mathbb{E}\left[(R(\tau)-b)\left\|g(\tau)\right\|_2^2\right]=0

移项得到精确的最优常数 baseline：

b^\star=\frac{\mathbb{E}\left[R(\tau)\left\|g(\tau)\right\|_2^2\right]}{\mathbb{E}\left[\left\|g(\tau)\right\|_2^2\right]}

也就是说，最优 baseline 不是普通平均回报，而是按 score function 范数 \left\|g(\tau)\right\|_2^2 加权后的回报平均。

从精确解到常用近似

如果给每个状态单独设置 baseline，对条件在 s_t 下做同样推导。令 g_t=\nabla_\theta\log\pi_\theta(a_t\mid s_t)，则状态相关的最优 baseline 为：

b^\star(s_t)=\frac{\mathbb{E}\left[G_t\left\|g_t\right\|_2^2\mid s_t\right]}{\mathbb{E}\left[\left\|g_t\right\|_2^2\mid s_t\right]}

这个式子通常无法精确计算，因为它需要知道当前策略下的条件期望，还要估计 score 范数和回报之间的关系。实际实现里常做两种近似：

baseline 形式	公式	含义
精确最优常数 baseline	按 score function 范数加权的回报平均	理论上最小化梯度估计方差，但通常难以精确估计。
batch 平均回报	当前 batch 里的平均 reward-to-go	忽略 score 范数权重，把最优 baseline 简化成样本均值。
状态价值函数	b(s_t)≈ V^π(s_t)=E[G_t	s_t]
优势估计	reward-to-go 减去 baseline	表达动作相对当前状态平均水平有多好。

常用的均值 baseline 可以理解为对 b^\star 的粗略近似；value baseline 可以理解为对 b^\star(s_t) 的状态相关近似。前者简单，后者更贴近后续 Actor-Critic 的做法。

如果 baseline 取真实状态价值函数 V^\pi(s_t)，则理论上的 advantage 为：

A^\pi(s_t,a_t)=Q^\pi(s_t,a_t)-V^\pi(s_t)

用 Monte Carlo reward-to-go 估计 Q^\pi(s_t,a_t) 时，就得到：

\hat A_t=\sum_{t'=t}^{T}r(s_{t'},a_{t'})-V^\pi(s_t)

把 causality 和 baseline 合起来，常用的梯度形式是：

\nabla_\theta J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\left(G_t-b(s_t)\right)\right]




7. 用 Surrogate Objective 高效计算 Policy Gradient

Surrogate Objective 的核心作用是提高计算效率。它把前面推出来的策略梯度，改写成一个可以直接丢给自动微分框架的 loss；这样训练时只需要计算动作的 log probability 和 advantage 权重，不需要对环境采样过程做反向传播。

如果用 \hat A_{i,t}=G_{i,t}-b(s_{i,t}) 表示 advantage 估计，常用 loss 写成：

\mathcal{L}_{\mathrm{PG}}(\theta)=-\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\log\pi_\theta(a_{i,t}\mid s_{i,t})\hat A_{i,t}

这里写负号，是因为深度学习框架通常做 loss minimization；最小化 \mathcal{L}_{\mathrm{PG}} 等价于最大化期望回报。

为什么这个 surrogate loss 能高效计算梯度

把 advantage 看作当前 batch 上已经算好的权重，并在实现时停止梯度传播，记作 \operatorname{sg}(\hat A_{i,t})：

\mathcal{L}_{\mathrm{PG}}(\theta)=-\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\log\pi_\theta(a_{i,t}\mid s_{i,t})\operatorname{sg}(\hat A_{i,t})

对 \theta 求梯度：

\nabla_\theta\mathcal{L}_{\mathrm{PG}}(\theta)=-\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_{i,t}\mid s_{i,t})\hat A_{i,t}

梯度下降更新为：

\theta\leftarrow\theta-\alpha\nabla_\theta\mathcal{L}_{\mathrm{PG}}(\theta)

代入上式后得到：

\theta\leftarrow\theta+\alpha\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\nabla_\theta\log\pi_\theta(a_{i,t}\mid s_{i,t})\hat A_{i,t}

这正是沿着 policy gradient 的方向做梯度上升。

离散动作与连续动作的对应

离散动作下，所选动作的 negative log likelihood 可以写成交叉熵：

-\log\pi_\theta(a_t\mid s_t)=\mathrm{CE}(\mathrm{onehot}(a_t),\pi_\theta(\cdot\mid s_t))

连续动作常用高斯策略 \pi_\theta(a\mid s)=\mathcal{N}(a;\mu_\theta(s),\sigma^2I)，其 negative log likelihood 为：

-\log\pi_\theta(a_t\mid s_t)=\frac{1}{2\sigma^2}\left\|a_t-\mu_\theta(s_t)\right\|_2^2+\frac{d}{2}\log(2\pi\sigma^2)

当 \sigma 固定时，后面的常数项不影响梯度，所以它等价于加权平方误差：

\mathcal{L}_{\mathrm{PG}}(\theta)\propto \sum_{i,t}\left\|a_{i,t}-\mu_\theta(s_{i,t})\right\|_2^2\hat A_{i,t}

动作空间	策略输出	实现方式
离散动作	每个动作的概率分布 πθ(a∣s)	计算所选动作的 cross entropy / negative log likelihood，再乘 advantage 权重
连续动作	常用高斯策略 N(μ_θ(s),σ^2 I)	计算动作的 Gaussian log probability；固定方差时等价于加权平方误差

实现细节上，\hat A_{i,t} 通常要从计算图中 detach。它是当前 batch 的权重，不希望反向传播再穿过回报计算或 value baseline 的估计过程。

8. On-policy 的两个核心问题

Vanilla Policy Gradient 是 on-policy：用于更新的数据必须来自当前策略 \pi_\theta。问题是更新一次参数后，策略就变成了新的分布，旧 batch 不再严格匹配当前策略。

优点

推导干净，采样分布和优化目标一致。
实现简单，适合作为策略梯度的基础版本。

代价

每次更新后都要重新采样，样本效率低。
梯度高方差，通常需要大 batch 和较密集的奖励。

因此 On-policy 方法后面主要围绕两个问题展开：第一，如何提高样本利用率；第二，如何防止策略一次更新变化太大。

问题	为什么会出现	对应方法
如何提高样本利用率	旧 batch 来自旧策略，更新后不再严格 on-policy	Off-policy 修正与 Importance Sampling
如何防止策略变化太大	策略变化过大时，旧数据和新策略分布差异太大	KL Constraint / Trust Region
问题一：如何提高样本利用率

如果希望用旧策略 \pi_\theta 采到的数据来更新新策略 \pi_{\theta'}，就需要修正“数据来自旧分布，但目标是新分布”的差异。基本工具是 importance sampling：

\mathbb{E}_{x\sim p(x)}[f(x)]=\mathbb{E}_{x\sim q(x)}\left[\frac{p(x)}{q(x)}f(x)\right]

放到轨迹上，就是用轨迹概率比修正：

\frac{p_{\theta'}(\tau)}{p_\theta(\tau)}=\prod_{t=1}^{T}\frac{\pi_{\theta'}(a_t\mid s_t)}{\pi_\theta(a_t\mid s_t)}

完整轨迹比在长 horizon 下容易变得极大或极小，所以实践里常使用每个时间步的概率比，得到常见近似形式：

\nabla_{\theta'}J(\theta')\approx \frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\frac{\pi_{\theta'}(a_{i,t}\mid s_{i,t})}{\pi_\theta(a_{i,t}\mid s_{i,t})}\nabla_{\theta'}\log\pi_{\theta'}(a_{i,t}\mid s_{i,t})\left(\sum_{\ell=t}^{T}r(s_{i,\ell},a_{i,\ell})-b\right)

off-policy 公式从哪里来

目标是更新新策略 \pi_{\theta'}，理想梯度应该在新策略的轨迹分布下取期望：

\nabla_{\theta'}J(\theta')=\mathbb{E}_{\tau\sim p_{\theta'}(\tau)}\left[\sum_{t=1}^{T}\nabla_{\theta'}\log\pi_{\theta'}(a_t\mid s_t)(G_t-b)\right]

但手头数据来自旧策略 \pi_\theta。把期望写成积分：

\nabla_{\theta'}J(\theta')=\int p_{\theta'}(\tau)f_{\theta'}(\tau)d\tau

其中：

f_{\theta'}(\tau)=\sum_{t=1}^{T}\nabla_{\theta'}\log\pi_{\theta'}(a_t\mid s_t)(G_t-b)

乘除一个旧策略轨迹分布 p_\theta(\tau)：

\nabla_{\theta'}J(\theta')=\int p_\theta(\tau)\frac{p_{\theta'}(\tau)}{p_\theta(\tau)}f_{\theta'}(\tau)d\tau

于是可以改写为旧数据分布下的期望：

\nabla_{\theta'}J(\theta')=\mathbb{E}_{\tau\sim p_\theta(\tau)}\left[\frac{p_{\theta'}(\tau)}{p_\theta(\tau)}f_{\theta'}(\tau)\right]

轨迹概率比中，初始状态分布和环境动力学会相互抵消：

\frac{p_{\theta'}(\tau)}{p_\theta(\tau)}=\frac{p(s_1)\prod_{t=1}^{T}\pi_{\theta'}(a_t\mid s_t)p(s_{t+1}\mid s_t,a_t)}{p(s_1)\prod_{t=1}^{T}\pi_{\theta}(a_t\mid s_t)p(s_{t+1}\mid s_t,a_t)}

所以：

\frac{p_{\theta'}(\tau)}{p_\theta(\tau)}=\prod_{t=1}^{T}\frac{\pi_{\theta'}(a_t\mid s_t)}{\pi_\theta(a_t\mid s_t)}

完整轨迹比对应的 Monte Carlo 估计是：

\nabla_{\theta'}J(\theta')\approx\frac{1}{N}\sum_{i=1}^{N}\left(\prod_{t=1}^{T}\frac{\pi_{\theta'}(a_{i,t}\mid s_{i,t})}{\pi_\theta(a_{i,t}\mid s_{i,t})}\right)\sum_{t=1}^{T}\nabla_{\theta'}\log\pi_{\theta'}(a_{i,t}\mid s_{i,t})\left(\sum_{\ell=t}^{T}r(s_{i,\ell},a_{i,\ell})-b\right)

不过完整轨迹比在 T 很大时极不稳定，所以常见实现会用每个时间步的概率比做局部修正。先把所有记号写完整：

\nabla_{\theta'}J(\theta')\approx\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\frac{\pi_{\theta'}(a_{i,t}\mid s_{i,t})}{\pi_{\theta}(a_{i,t}\mid s_{i,t})}\nabla_{\theta'}\log\pi_{\theta'}(a_{i,t}\mid s_{i,t})\left(\sum_{\ell=t}^{T}r(s_{i,\ell},a_{i,\ell})-b\right)

为了让公式更短，定义两个简写：

\rho_{i,t}(\theta')=\frac{\pi_{\theta'}(a_{i,t}\mid s_{i,t})}{\pi_\theta(a_{i,t}\mid s_{i,t})},\qquad G_{i,t}=\sum_{\ell=t}^{T}r(s_{i,\ell},a_{i,\ell})

代回后得到简化版本：

\nabla_{\theta'}J(\theta')\approx\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\rho_{i,t}(\theta')\nabla_{\theta'}\log\pi_{\theta'}(a_{i,t}\mid s_{i,t})(G_{i,t}-b)

importance sampling 有一个隐含条件：旧策略要覆盖新策略想学习的重要动作。形式上，如果 p_{\theta'}(\tau)>0，需要 p_\theta(\tau)>0；否则概率比没有意义。

概念	含义	风险
行为策略	产生数据的旧策略 πθ	如果它几乎不会采到某些动作，新策略也很难从这些动作上学习
目标策略	正在更新的新策略 πθ’	变化太快会导致概率比不稳定
支持集	旧策略必须对新策略重要的动作有非零概率	若 πθ(a∣s)=0，概率比无法修正

Importance sampling 能把旧数据“校正”成新策略下的估计，但不是免费午餐。策略差异越大，概率比越容易爆炸或坍


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/a300b610ab7113afb104f25e72fc015e_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic2.zhimg.com/v2-e0d90b2e7b5cd83c0db4b934b67300d9_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-37e42a45c16a1008b873138d4069c20d_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-afbc981210dfad2d9fdf9738e067d607_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/a300b610ab7113afb104f25e72fc015e_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://pic1.zhimg.com/v2-919db2872e2282de46344f30e5fca00f_250x0.jpg?source=172ae18b)

