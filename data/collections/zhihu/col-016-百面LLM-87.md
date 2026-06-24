---
title: "百面LLM-87"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/17858209308
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-87

> @swtheking | https://zhuanlan.zhihu.com/p/17858209308

---

提问：为什么在RLHF中，加大KL penalty等同于early stopping？

回答：

在OAI论文 Scaling Laws for Reward Model Overoptimization 中，曾经提出一个观点，加大KL penalty等同于early stopping：

这里KL penalty指的是：

具体实现是：

def compute_rewards(
        self,
        scores: torch.FloatTensor,
        logprobs: torch.FloatTensor,
        ref_logprobs: torch.FloatTensor,
        masks: torch.LongTensor,
    ):
        """
        Compute per token rewards from scores and KL-penalty.
        """
        rewards, non_score_rewards, kls = [], [], []
        for score, logprob, ref_logprob, mask in zip(scores, logprobs, ref_logprobs, masks):
            # compute KL penalty (from difference in logprobs)
            kl = self._kl_penalty(logprob, ref_logprob)
            kls.append(kl)
            non_score_reward = -self.kl_ctl.value * kl
            non_score_rewards.append(non_score_reward)
            reward = non_score_reward.clone()
            last_non_masked_index = mask.nonzero()[-1]

            # reward is preference model score + KL penalty
            reward[last_non_masked_index] += score
            rewards.append(reward)
        return torch.stack(rewards), torch.stack(non_score_rewards), torch.stack(kls)
    
def _kl_penalty(self, logprob: torch.FloatTensor, ref_logprob: torch.FloatTensor) -> torch.FloatTensor:
    if self.config.kl_penalty == "kl":
        return logprob - ref_logprob

加大kl penalty就是提升 
𝛽
 的值。

由于最终PPO的更新是来自于advantage对每个token概率的改变，而计算advantage是由以下GAE公式完成：

实现为：

for t in reversed(range(gen_len)):
    nextvalues = values[:, t + 1] if t < gen_len - 1 else 0.0
    delta = rewards[:, t] + self.config.gamma * nextvalues - values[:, t]
    lastgaelam = delta + self.config.gamma * self.config.lam * lastgaelam
    advantages_reversed.append(lastgaelam)
advantages = torch.stack(advantages_reversed[::-1]).transpose(0, 1)

returns = advantages + values

当 \beta 提升以后， r(s_t, a_t) 变小， V(S_t) 也变小。但由于最后的<eos>的 r(s_t) 没有改变。

因此有同样prompt的不同resp的r(s_t) reward diff不变的情况下，整体的A(s_t, a_t) 预期变小，那么模型更新速度会变慢，当 A(s_t, a_t) = 0 的时候模型停止更新。

当 reward diff > T 的时候模型还在更新，反之模型停止更新。 T 随着 \beta 的变大而变大。因此kl_penalty变大，模型等于early stopping。其实更准确说，是数据筛选，把policy更新中 diff < T 的数据在训练中去除。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-acbba778d5120d88871368edcb0410a4_1440w.jpg)

![图](https://picx.zhimg.com/v2-a1eff43bd83356dcf53f6050f78d7867_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-af44a822404e37ad65ac72e0b3f2b5c4.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

