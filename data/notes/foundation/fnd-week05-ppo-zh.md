---
id: fnd-week05-ppo-zh
title: "一文吃透 PPO / DPO / GRPO / GSPO:从公式推导到 verl 源码逐行拆解"
type: foundation
week: 5
topics: ["ppo-variants"]
tags:
- name: "来自知乎"
  initial_weight: 1.0
difficulty: 3
status: pending
rating: 0
created_at: "2026-06-23"
updated_at: "2026-06-23"
sources:
- platform: zhihu
  url: "https://zhuanlan.zhihu.com/p/2047023571269165830"
  title: "一文吃透 PPO / DPO / GRPO / GSPO:从公式推导到 verl 源码逐行拆解"
  saved_at: "2026-06-23"
recommendations: []
---

# 一文吃透 PPO / DPO / GRPO / GSPO:从公式推导到 verl 源码逐行拆解

> 作者: Tim在路上 | 来源: https://zhuanlan.zhihu.com/p/2047023571269165830

---

OpenAI 用 PPO 训练了 InstructGPT，Anthropic 用 DPO 简化了流程，DeepSeek 用 GRPO 拿掉了 Critic，阿里千问将 GRPO 升级为适配 MoE 的 GSPO，字节跳动则推出 DAPO 为 GRPO 打上补丁，RL算法一直在发展进化。但市面上的资料常常两端跑偏:

一种是公式堆山, 只讲推导, 不告诉你工程上到底怎么实现;
另一种是 demo 调包, 只会 trainer.train()；

这篇文章想做的事很简单: 把每个算法的原理讲清楚, 然后立刻翻到 verl 里看它是怎么实现的。

为了让阅读不痛苦,我会:

每节先讲”这算法解决什么问题”,再讲公式,最后看代码;
代码片段尽量控制在 5-10 行,带文件行号,可复核;

verl 仓库地址: https://github.com/volcengine/verl

1. verl 设计哲学
1.1 先把 verl 的”工程脊柱”摸清

理解 4 个算法之前,先看一眼 verl 是怎么组织代码的 —— 这非常重要,因为 verl 的设计哲学就是把”算法”做成可插拔模块,所有算法共用同一套训练循环,只是替换其中两个组件:

优势估计器(adv_estimator)—— 怎么算 advantage
策略损失函数(policy_loss)—— 怎么把 advantage 变成 loss
1.2 注册表设计: 算法就是一个装饰器

打开 verl/trainer/ppo/core_algos.py, 会看到这样的模式:

# core_algos.py:115
  def register_adv_est(name_or_enum):
      def decorator(fn):
          name = name_or_enum.value if isinstance(name_or_enum, Enum) else name_or_enum
          ADV_ESTIMATOR_REGISTRY[name] = fn
          return fn
      return decorator

  # core_algos.py:53
  def register_policy_loss(name):
      def decorator(func):
          POLICY_LOSS_REGISTRY[name] = func
          return func
      return decorator

两个注册表,所有算法都通过装饰器挂上去:

# core_algos.py 中典型的注册写法
  @register_adv_est(AdvantageEstimator.GAE)         # ← PPO 用的
  def compute_gae_advantage_return(...): ...

  @register_adv_est(AdvantageEstimator.GRPO)        # ← GRPO/Dr.GRPO 用的
  def compute_grpo_outcome_advantage(...): ...

  @register_policy_loss("vanilla")                  # ← PPO 用的
  def compute_policy_loss_vanilla(...): ...

  @register_policy_loss("gspo")                     # ← GSPO 用的
  def compute_policy_loss_gspo(...): ...

这意味着什么? 你想跑 GRPO,只需要在配置文件里写:

algorithm:
    adv_estimator: grpo          # 切换优势估计
  actor_rollout_ref:
    actor:
      policy_loss:
        loss_mode: vanilla       # 用普通 PPO 风格的 clip loss

想跑 GSPO?改一行:

policy_loss:
        loss_mode: gspo          # 改成 GSPO 序列级 loss

整个训练流程一行代码都不用改。这种设计是后面我们能轻松对比算法的基础。

1.3 训练主循环长什么样

verl 的 PPO 训练循环在 verl/trainer/ppo/ray_trainer.py 的 fit() 方法,我把它精简成伪代码:

for batch in dataloader:
      # 1. Rollout:用当前策略生成回答
      responses = actor.generate_sequences(batch)

      # 2. 算 old_log_probs(为重要性采样准备)
      old_log_prob = actor.compute_log_prob(responses)

      # 3. 算 ref_log_prob(为 KL 约束准备)
      if use_reference_policy:
          ref_log_prob = ref_policy.compute_log_prob(responses)

      # 4. 算 values(仅 PPO 需要,GRPO/GSPO 不需要)
      if use_critic:
          values = critic.compute_values(responses)

      # 5. 算 reward(可能来自 RM 或 rule)
      reward = reward_fn(responses)

      # 6. (可选)把 KL 加进 token-level reward
      if use_kl_in_reward:
          reward = apply_kl_penalty(reward, old_log_prob, ref_log_prob)

      # 7. 算 advantage(GAE / GRPO / RLOO / ...)
      advantages = compute_advantage(reward, values, adv_estimator=...)

      # 8. 更新 critic(GRPO/GSPO 跳过)
      if use_critic:
          critic.update(advantages, returns)

      # 9. 更新 actor
      actor.update(advantages, old_log_prob, policy_loss=...)

这是所有算法共用的骨架。PPO、GRPO、GSPO 的区别就是第 4、7、8、9 步用不用, 以及用哪个实现。

下面我们正式进入算法。

2. PPO: 经典中的经典但贵
2.1 它要解决什么问题

策略梯度算法最朴素的形式是 REINFORCE:




\nabla_\theta J = \mathbb{E}{\tau \sim \pi\theta}\left[\sum_t \nabla_\theta \log \pi_\theta(a_t | s_t) \cdot R(\tau)\right]




直接拿去训,会爆。原因有两个:

方差太大:用整条轨迹的回报当系数,噪声极强;
步长难控:一次更新可能把策略推到离原来很远的地方,新策略采样的数据不再可靠,训练崩盘。

TRPO(Trust Region Policy Optimization)用”信赖域”约束新旧策略 KL 距离,理论漂亮但要算 Hessian、用共轭梯度,工程上太重。

PPO 的思路:用一阶方法近似 TRPO 的信赖域。具体来说:

• 降低方差:引入 value function 做 baseline,改用 advantage(GAE); • 限制步长:用 clip 把重要性比 r_t(\theta) = \pi_\theta(a_t|s_t) / \pi_{\theta_{old}}(a_t|s_t) 截断在 [1-\epsilon, 1+\epsilon] 内。

### 2.2 PPO 涉及的 4 个模型

这是 PPO 最被诟病的地方 —— 4 个模型同时在线:

模型	作用	训练时	显存压力
Actor（策略模型）	生成回答	更新参数	高
Critic（价值模型）	估计 V(s)，给 baseline	更新参数	高
Reward Model	给回答打分	冻结	中（可量化）
Reference Model	约束 actor 不要跑偏	冻结	高（全精度）

注意：参考模型主要是约束 KL,让策略不要离 SFT 太远,从而防止 reward hacking。KL 约束本身不直接判断”无意义”,而是通过”不让你离SFT 分布太远”这个间接手段来防止策略学到无意义但高分的 token 序列。

2.3 GAE 的核心: 递推算 advantage

GAE(Generalized Advantage Estimation)是 PPO 算 advantage 的标配。直接看 verl 实现:

# core_algos.py:243
  with torch.no_grad():
      nextvalues = 0
      lastgaelam = 0
      advantages_reversed = []
      gen_len = token_level_rewards.shape[-1]

      for t in reversed(range(gen_len)):
          delta = token_level_rewards[:, t] + gamma * nextvalues - values[:, t]
          lastgaelam_ = delta + gamma * lam * lastgaelam
          # ... 处理 mask
          advantages_reversed.append(lastgaelam)
      advantages = torch.stack(advantages_reversed[::-1], dim=1)
      returns = advantages + values
      advantages = verl_F.masked_whiten(advantages, response_mask)

10 行代码,核心就两个公式:




\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)

A_t^{GAE} = \delta_t + \gamma\lambda A_{t+1}^{GAE}




\delta_t 是 TD-error,\lambda 控制偏差-方差权衡:

• \lambda = 0 → 退化成 TD(0),高偏差低方差 • \lambda = 1 → 退化成蒙特卡洛,低偏差高方差 • 一般取 \lambda = 0.95

注：这里的 TD 误差，可以理解为实际收到的 - 之前预期的； GAE 可以理解为 当前的 advantage = 当前的 TD error + 衰减后的下一个 advantage

最后一行 masked_whiten 是把 advantage 做 batch 内归一化(均值 0、方差 1),这是 PPO 训练稳定性的小技巧,很多复现忘了加就训不起来。

2.4 Reward 计算 + KL 注入

要把”RM 输出的标量分”变成”token-level reward 序列”,中间至少要做两件事:

verl 默认把 RM 给出的序列级标量直接写到最后一个 valid token 的位置上,其他 token 都是 0。

reward_tensor[i, valid_response_length - 1] = reward

所以 reward 张量的 shape 是 (batch_size, response_length),但只有 EOS 那个位置非零。GAE 是从后往前递推的,这个稀疏 reward 会沿时间步反向传播,自然就分布到了前面的 token 上。

KL 进 reward(经典 PPO)

\tilde{r}t = r_t - \beta \cdot \text{KL}(\pi\theta | \pi_{ref})_t

verl 实现:

# core_algos.py:1009
  def compute_rewards(token_level_scores, old_log_prob, ref_log_prob, kl_ratio):
      kl = old_log_prob - ref_log_prob
      return token_level_scores - kl * kl_ratio

  # ray_trainer.py:149
  kld = core_algos.kl_penalty(
      data.batch["old_log_probs"], data.batch["ref_log_prob"], kl_penalty=kl_penalty
  )
  kld = kld * response_mask
  beta = kl_ctrl.value
  token_level_rewards = token_level_scores - beta * kld
2.5 Clip 机制: PPO 的精髓

看 vanilla policy loss:

# core_algos.py:1210
  negative_approx_kl = log_prob - old_log_prob
  ratio = torch.exp(negative_approx_kl)              # r_t(θ) = π_new / π_old

  pg_losses1 = -advantages * ratio                   # 不 clip 的项
  pg_losses2 = -advantages * torch.clamp(
      ratio, 1 - cliprange_low, 1 + cliprange_high
  )                                                  # clip 后的项
  clip_pg_losses1 = torch.maximum(pg_losses1, pg_losses2)  # 取更"保守"的那个

数学上对应:




L^{CLIP}(\theta) = \mathbb{E}_t\left[\min(r_t(\theta) A_t,; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) A_t)\right]




为什么取 min? 因为我们要做的是最小化负的 loss(即最大化目标),所以取两个负项的 max(也就是更小的目标值)。这就是”取更保守的更新”。

示意图(用文字表达):

情况1: A > 0 (这个 token 是好的)
    ├─ r ↑ → 鼓励生成 → 但 r > 1+ε 时被截断,梯度=0
    └─ r ↓ → 不鼓励   → 无截断,正常下降

  情况2: A < 0 (这个 token 是坏的)
    ├─ r ↑ → 强化坏 token → 无截断,正常上升 loss
    └─ r ↓ → 抑制         → 但 r < 1-ε 时被截断,梯度=0

核心思想:只在”想往坏方向走”的时候才允许大幅更新,“已经往好方向走得够多”的时候就截断,避免一步走太远。

2.6 Value Loss(critic)

critic 学习目标是让 V_\phi(s_t) 拟合实际 return R_t = A_t + V(s_t)_{old}。最朴素的形式是 MSE:




\mathcal{L}^{VF} = \mathbb{E}t[(V\phi(s_t) - R_t)^2]




但 PPO 给 value 也加了 clip,防止 critic 一步更新太多:




\mathcal{L}^{VF}{clipped} = \mathbb{E}t[\max((V\phi - R_t)^2, (V\phi^{clipped} - R_t)^2)]




其中 V_\phi^{clipped} = V_\phi^{old} + \text{clip}(V_\phi - V_\phi^{old}, -\epsilon_v, +\epsilon_v)。

verl 实现:

# core_algos.py:1832
  vpredclipped = verl_F.clip_by_value(vpreds, values - cliprange_value, values + cliprange_value)
  vf_losses1 = (vpreds - returns) ** 2
  vf_losses2 = (vpredclipped - returns) ** 2
  clipped_vf_losses = torch.max(vf_losses1, vf_losses2)        # 取更大的(更保守)
  vf_loss = 0.5 * agg_loss(loss_mat=clipped_vf_losses, ...)

注意 vf 这里取 max 不是 min:因为 value loss 本身是个正数(MSE),取 max 等价于”对悲观的预测更狠地惩罚”,防止 critic 单步飘太远。

2.7 Entropy Bonus

熵奖励是 RL 老套路了:鼓励策略不要过早 collapse 成一个 delta 分布。




\mathcal{S}\pi_\theta (s_t) = -\sum_a \pi_\theta(a|s_t) \log \pi_\theta(a|s_t)




verl 把 entropy 计算和应用拆开。计算在 compute_entropy_loss:

# core_algos.py:1782
  def compute_entropy_loss(logits, response_mask, loss_agg_mode="token-mean"):
      token_entropy = verl_F.entropy_from_logits(logits)        # (bs, response_len)
      entropy_loss = agg_loss(loss_mat=token_entropy, loss_mask=response_mask,
                              loss_agg_mode=loss_agg_mode)
      return entropy_loss

应用在 actor 训练循环:

# verl/workers/actor/dp_actor.py:634
  if calculate_entropy and entropy is not None:
      entropy_agg = agg_loss(loss_mat=entropy, loss_mask=response_mask, loss_agg_mode=loss_agg_mode)
      if entropy_coeff != 0:
          policy_loss -= entropy_agg * entropy_coeff

注意是 policy_loss -= entropy_agg * coeff —— 熵在目标函数里是要最大化的(鼓励探索),所以在 loss(最小化)里要减去。

2.8 verl 里的”双 clip”小彩蛋

继续看 compute_policy_loss_vanilla:

# core_algos.py:1229
  pg_losses3 = -advantages * clip_ratio_c          # clip_ratio_c=3.0 默认
  clip_pg_losses2 = torch.min(pg_losses3, clip_pg_losses1)
  pg_losses = torch.where(advantages < 0, clip_pg_losses2, clip_pg_losses1)

这是 Dual-clip PPO(论文 https://arxiv.org/pdf/1912.09729),解决一个边角问题:当 advantage 是负的、且 ratio 很大时,-A \cdot r 会变成巨大的正数,产生异常梯度。Dual-clip 用 \text{clip_ratio_c}=3 在下方再加一层硬截断。

pg_losses1 = -advantages * ratio        # 这是 Loss 的一部分，不是 Objective

工程上的微小细节,但在长 CoT 或推理模型训练时很救命。

2.9 PPO 在 verl 怎么跑
# examples/ppo_trainer/run_deepseek7b_llm.sh 简化版
  python3 -m verl.trainer.main_ppo \
      algorithm.adv_estimator=gae \
      algorithm.gamma=1.0 \
      algorithm.lam=0.95 \
      actor_rollout_ref.actor.policy_loss.loss_mode=vanilla \
      actor_rollout_ref.actor.clip_ratio=0.2 \
      actor_rollout_ref.actor.use_kl_loss=False \
      ...

  adv_estimator=gae + loss_mode=vanilla 就是经典 PPO。
2.10 PPO 完整公式及理解

PPO-Clip 的核心目标函数：

L^{\text{CLIP}}(\theta) = \mathbb{E}_t \left[ \min \left( r_t(\theta) A_t,\; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) A_t \right) \right]

其中：

r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)} \quad \text{（新旧策略概率比）}

A_t = 优势函数（advantage）

\epsilon = clip 范围，通常 0.1~0.2

加上价值函数 loss 和熵正则化后的完整 PPO 损失：

L^{\text{PPO}}(\theta) = \mathbb{E}_t \left[ L^{\text{CLIP}}(\theta) - c_1 L^{VF}(\theta) + c_2 S[\pi_\theta](s_t) \right]

其中：

L^{VF}(\theta) = \left( V_\theta(s_t) - V_{\text{target}} \right)^2 \quad \text{（价值函数回归 loss）}

S[\pi_\theta](s_t) = 策略熵（鼓励探索）

一个形象的例子是，假设你是一个学生，正在学习写作文。给定一个题目 x（prompt），你需要写出一段回答 y （response）。

教科书：\pi_{\text{ref}}（SFT 初始模型，永远不变的标准参考）
你当前的写作习惯：\pi_\theta（策略模型，正在优化）
昨天的你：\pi_{\text{old}}（上一次更新前的版本，用于限制变化幅度）

PPO 策略就是，每次你写完一篇作文，老师会：

给一个分数：r(x, y)（来自 Reward Model）
指出哪里写得好、哪里写得差：A_t（优势函数，告诉你在某个词的位置是加分还是扣分）
允许你调整习惯，但有严格限制：对比“今天的你”和“昨天的你”，每个词的写作习惯最多改变 \epsilon = 10\%

老师不允许你突然从一个习惯跳到另一个习惯：

r_t(\theta) = \frac{\pi_\theta(\text{这个词} \mid \text{上下文})}{\pi_{\text{old}}(\text{这个词} \mid \text{上下文})} \in [0.9,\; 1.1]

如果 r_t 想跳出这个区间，老师会强行 clip 回来。

L^{\text{CLIP}}(\theta) = \mathbb{E}_t\left[ \min\left(r_t A_t,\; \text{clip}(r_t, 0.9, 1.1) \cdot A_t\right) \right]

如果某个词写得好（A_t > 0）：鼓励你多用，但最多增加 10%
如果某个词写得差（A_t < 0）：惩罚你少用，但最多减少 10%
同时，不能偏离教科书太远：\text{KL}(\pi_\theta \| \pi_{\text{ref}}) \leq \delta
3. DPO: 把 RL 变成监督学习
3.1 DPO 要解决什么问题

PPO 太贵 —— 4 个模型同时在线, 显存爆炸,工程复杂度高。能不能不显式训练 reward model, 直接从偏好数据学策略?

DPO(Direct Preference Optimization, Rafailov et al., 2023)的答案是:可以。

3.2 数学推导(简化版)

PPO 的目标可以写成约束优化:

\max_\pi \mathbb{E}{x, y \sim \pi}[r(x, y)] - \beta \cdot \text{KL}(\pi(\cdot|x) | \pi{ref}(\cdot|x))

这个约束优化问题有闭式解:

\pi^*(y|x) = \frac{1}{Z(x)} \pi_{ref}(y|x) \exp\left(\frac{1}{\beta} r(x, y)\right)




反解出 reward:

r(x, y) = \beta \log \frac{\pi^*(y|x)}{\pi_{ref}(y|x)} + \beta \log Z(x)




把这个 reward 代入 Bradley-Terry 偏好模型 P(y_w \succ y_l) = \sigma(r(x, y_w) - r(x, y_l)),\log Z(x) 项会神奇地抵消,得到:

\mathcal{L}{DPO} = -\mathbb{E}{(x, y_w, y_l)} \left[\log \sigma\left(\beta \log\frac{\pi_\theta(y_w|x)}{\pi_{ref}(y_w|x)} - \beta \log\frac{\pi_\theta(y_l|x)}{\pi_{ref}(y_l| x)}\right)\right]




核心观察: reward model 隐式包含在 \log \pi_\theta / \pi_{ref} 这个比值里。这就是 DPO 的精髓 —— 最优策略本身就是 reward 的充分统计量, 不需要单独的 RM。

继续上面的例子，对于 DPO 策略来说，老师从不打分，只给你看两份你自己写的作文，然后告诉你：

“这一份比那一份好。自己琢磨为什么，然后改进。”

你拿到的学习材料是：(x, y_w, y_l)

同一道题 x （prompt）
y_w：写得更好的那份 （response1）
y_l：写得更差的那份 （response2）

你学到的核心原则

“相对于教科书，我应该在好作文上提升更多，在坏作文上提升更少（甚至降低）。”

数学上，你要让这个差值尽可能大：

\log\frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \log\frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)} > 0

最终的教学目标

\mathcal{L}_{\text{DPO}} = -\log \sigma\left(\beta \cdot \underbrace{\left[\log\frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \log\frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}\right]}_{\text{好作文的相对优势}}\right)

\sigma 是 sigmoid 函数，把差值转成“好作文更优”的概率
\beta 控制对偏好的敏感度（\beta 越大，越严格遵循偏好）
DPO 从数学上等价于 RLHF 的闭式最优解,只是优化的路径不同。它确实把 RL 问题转化成了监督学习形式,但说它”不是真正的 RL”会让人误以为它放弃了 RL 的某些性质,事实上它和 PPO RLHF 解的是同一个目标函数,只是 PPO 用采样+梯度上升、DPO 用闭式解+监督学习。
3.3 verl 支持跑 DPO 吗？

verl 主线训练流程是 on-policy RL(rollout → reward → advantage → update), DPO 是 off-policy 的偏好学习。

不过在 verl 仓库里提供支持 DPO 的扩展和 online DPO 的实现，当然也可以参考 TRL 中的实现：

• HuggingFace TRL:https://github.com/huggingface/trl(DPOTrainer)

@ray.remote(num_cpus=1)
def main_task(config):
    # construct SampleGenerator
    resource_pool = RayResourcePool(process_on_nodes=[8] * 2)  # 16 GPUs
    ray_cls = RayClassWithInitArgs(SampleGenerator, config=config)
    # put SampleGenerator onto resource pool
    sample_gen = RayWorkerGroup(resource_pool, ray_cls)

    # construct reference policy
    ray_cls = RayClassWithInitArgs(ReferencePolicy)
    ref_policy = RayWorkerGroup(resource_pool, ray_cls)

    # construct actor
    ray_cls = RayClassWithInitArgs(DPOActor)
    dpo_policy = RayWorkerGroup(resource_pool, ray_cls)

    dataloader = DataLoader()

    for data in dataloader:
        # generate data
        data = sample_gen.generate_sequences(data)
        # generate scores for each data
        data = generate_scores(data)
        # generate pairwise data using scores
        data = generate_pairwise_data(data)
        # generate ref_log_prob
        data.batch['ref_log_prob'] = ref_policy.infer(data)
        # update using dpo
        dpo_policy.update(data)
        # logging

3.4 DPO 的隐藏陷阱

虽然 DPO 简单,但实际用起来有几个坑:

长度偏置: DPO 会倾向于生成更长的回答(因为更长的回答 \log \pi 累加项数多,容易拉大差距)→ 衍生出 IPO、KTO、SimPO 等改进
过拟合 reference model: \beta 太大会锁死在 SFT 附近,\beta 太小会偏离过多
依赖高质量偏好数据: offline 数据的分布偏移没法在训练中纠正
4. GRPO: DeepSeek 的”省钱小能手”
4.1 GRPO 要解决什么问题

PPO 的 4 个模型里, critic 是个老大难:

• 训练 critic 需要单独的 value head 和反向传播,显存翻倍; • value function 学不准就会拖累 advantage 估计,雪上加霜; • 在 LLM 这种稀疏奖励(只有回答结束才给分)场景下,critic 学习信号极少,估值噪声巨大。

DeepSeek 在 DeepSeekMath 论文里提出 GRPO(Group Relative Policy Optimization):干掉 critic, 用同一 prompt 下多次采样的组内相对得分当 baseline。

4.2 GRPO 的数学公式

对同一个 prompt x,采样 G 个回答 {y_1, ..., y_G},得到组内 reward {r_1, ..., r_G}。

每个回答的 advantage:

A_i = \frac{r_i - \text{mean}({r_j})}{\text{std}({r_j})}

(可选项) 再把这个标量 advantage 广播到该回答的每个 token 上:

\hat{A}{i,t} = A_i \cdot \text{mask}{i,t}




policy loss 用普通的 PPO clip:

L^{GRPO} = \mathbb{E}t\left[\min(r{i,t}(\theta) \hat{A}{i,t},; \text{clip}(r{i,t}(\theta), 1-\epsilon, 1+\epsilon) \hat{A}_{i,t})\right]

这一次，老师不再给你单独打分，也不直接给两份作文比较。而是：

一次给你布置 G=4 道相同的题目 x，你写出 4


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-166762cf2e286787215c211c1961fa5d_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-cab132bcbb54363d3a84664c28de24e1_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-ed8a349182ac1b1eb131f3c6d4b0a285_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-166762cf2e286787215c211c1961fa5d_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://picx.zhimg.com/v2-10b20470e80a6274affe25aeba407dce_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-c99cdc3629ff004f83ff44a952e5b716.png)

![图片](https://picx.zhimg.com/5d43a39255b96b59f17c353066ad35c2_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-53e091aa9f23d170583110b0a6fbb32b_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-75b4ad260809e60e4feeff71661c3ef2_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-694cac2ec9f3c63f774e723f77d8c840.png)

![图片](https://picx.zhimg.com/v2-166762cf2e286787215c211c1961fa5d_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-419a1a3ed02b7cfadc20af558aabc897.png)

![图片](https://picx.zhimg.com/v2-32d78529c5caf98d2feef100695ce251_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-706c240b0f8b7d2e637fbc3421b1583f_250x0.jpg?source=172ae18b)
