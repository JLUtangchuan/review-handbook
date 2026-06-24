---
title: "考古OpenAI，Anthropic论文2 : Scaling Laws for Reward Model Overoptimization"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/3654680219
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 考古OpenAI，Anthropic论文2 : Scaling Laws for Reward Model Overoptimization

> @swtheking | https://zhuanlan.zhihu.com/p/3654680219

---

这次我们考古一篇很著名的论文：Scaling Laws for Reward Model Overoptimization [1]，这篇论文可以说是RLHF基石之作。基本上能完全理解和复现这篇论文，就能达到chatGPT或者instructGPT的RLHF水平。但国内现状比较残酷，能真正完全复现这篇论文的公司十分少。尽管很多公司宣称模型能达到GPT4甚至4o水平，但实际上，可能国内技术水平并没有达到了ChatGPT时候OpenAI的技术能力。（当然除了北美三强以外，似乎也没有哪家一定复现出来了。）

Motivation

这篇论文探索的是RL和RM阶段的Scaling Law：

RLHF(包括BON & PPO)利用RM作为proxy objective，会有overoptimization的问题，也就是reward hacking问题。那么是否增加数据量或者模型参数可以缓解这个问题，以及这个增加方式是否符合scaling law就是这篇论文主要讨论的问题。

主要结论

d = 
𝐾
𝐿
 distance

这个结论说明：

RL是一个消耗KL distance的产物，当KL前期增长时， 
𝑅
𝑏
𝑜
𝑛
 和 
𝑅
𝑅
𝐿
 都是先随KL变化上升，然后下降。
但 
𝑅
𝑏
𝑜
𝑛
 下降更快。

画个图看看

超参数：

alpha_bon = 2.5 beta_bon = 0.05 alpha_rl = 2.5 beta_rl = 0.5

import numpy as np
import matplotlib.pyplot as plt

# 设置参数值
alpha_bon = 2.5
beta_bon = 0.05
alpha_rl = 2.5
beta_rl = 0.5

# 定义d的范围
d_values = np.linspace(1, 100, 400)

# 计算两个公式的值
R_bon_values = d_values * (alpha_bon - beta_bon * d_values)
R_rl_values = d_values * (alpha_rl - beta_rl * np.log(d_values))

# 创建图形
plt.figure(figsize=(12, 6))

# Best-of-n (BoN) 采样图
plt.subplot(1, 2, 1)
plt.plot(d_values, R_bon_values, label=r'$R_{\text{bon}}(d) = d (\alpha_{\text{bon}} - \beta_{\text{bon}} d)$')
plt.title('Best-of-n (BoN) Sampling')
plt.xlabel('d')
plt.ylabel(r'$R_{\text{bon}}(d)$')
plt.legend()
plt.grid(True)

# 强化学习 (RL) 图
plt.subplot(1, 2, 2)
plt.plot(d_values, R_rl_values, label=r'$R_{\text{RL}}(d) = d (\alpha_{\text{RL}} - \beta_{\text{RL}} \log d)$')
plt.title('Reinforcement Learning')
plt.xlabel('d')
plt.ylabel(r'$R_{\text{RL}}(d)$')
plt.legend()
plt.grid(True)

# 展示图形
plt.tight_layout()
plt.show()

真实的图片：

其余结论：

BON比RL随着KL增长更容易optimization和over-optimization。
随着模型参数增长，\alpha和\beta 参数也是跟着增长。
Policy的大小不影响最终gold reward效果。（有点问题）
KL penalty对于这些结果并不影响。（有点问题）

问题在于

合成reward的分数分布未必和现实reward分布一致。没有考虑真实reward的噪音问题。
因为研究的是over-optimization，测试的是train reward的gold reward，没有考虑泛化和OOD。
Setting
使用和Instruct GPT一样的setting。
所有RM使用了加scalar head方式输出rm score。
RL使用PPO，KL penalty设置为0.

4. 6B模型作为3B reward model的gold reward：这个setting其实很有问题，因为模型给的label，3B模型更好学，且不存在很多的噪声。

处理流程

5. 利用validation set来帮助gold reward重新renormalization&recalibration：这个细节好像很多repo没有做过。

The RM scores are translation-invariant, so to ensure comparability across different reward models, we recenter each RM such that the average reward of the initial policy is 0. We also unit normalize the variance of the gold RM scores. Because our hard thresholding synthetic data setup produces labels that are miscalibrated (since they do not incorporate the gold RM’s confidence), we recalibrate the proxy RMs by rescaling the logits to minimize cross-entropy loss using a validation set of soft labels. All renormalization and recalibration is applied after the experiments; this does not affect BoN at all, and likely has no impact on RL because Adam is loss scale invariant, though it is possible that there are slight differences due to algorithmic details.


Detail Result
Scaling RM参数获得的Scaling Law
Scaling with RM Data Size
2000 pair以下，效果scaling不明显。
2000 pair以上，效果可以scaling。
里面有个有趣的点：虽然更大的奖励模型（Reward Models，RMs）总体上能够得到更好的评分，但它们在达到某个关键阈值方面并没有比较小的模型更早表现出显著优势。说明这个gold reward还是非常的model specific，连大模型也需要去拟合那个优化方向。
为了证明optimization = generalization，他们画了在training reward上的BON和reward model上的validation loss的关系, 但这个结论也存疑问～。
Scaling with Policy Size



结论：policy size增大，模型能力并不能提升。这个结论就很诡异了，因为这说明，rm 模型完全dominate policy，但这个应该是不可能的。

RL v.s BON

RL is far less KL-efficient than BoN. 包括RL也是不如Rejection sampling的KL efficient。

Intuitively, BoN searches very locally around the initial policy, and thus KL_{bon} increases with roughly log(n). For RL on the other hand, each step modifies the policy from the policy of the previous step—KL increases approximately quadratically with step in the absence of KL penalty (Figure 16, Figure 14). An implication of this result is that KL distance is an inadequate metric for quantity of (over)optimization; we discuss this further in section 4.1.



这个应该是整片论文最重要的一段话：KL是一个消耗资源。BON的优势是在SFT模型周围搜索，因此KL相比于RL消耗较少。在更少的KL消耗下获得更高的reward，这个也是o1的构建初衷吧，细节可以看我的blog：O1 Inception Part-1: Exploring the Motivation Behind O1 。

RL随着KL增长可以获得更好的Pass@1 相比于BON：

这个结果也是和最近的Test time scaling的理念相违背。按道理BON应该是RL的上界，但这个论文结果不太一致，这个结果存疑问。

Effect of KL Penalty


KL-Penalty相当于early stopping。RL加上KL-Penalty，等于early stopping。这里的问题是至少没有测试泛化上的效果。

当然early stopping也有一定好处，帮助模型不过度锐化。

还有个有趣的观点：PPO内部有个隐形的KL约束，文章认为这个隐形的约束是更重要避免over-optimization的关键。而KL-Penalty不是。




Discuss
KL

However, because it’s clear that different methods of optimization spend KL very differently (section 3.5), it should not be used to compare the amount of optimization between different optimization algorithms. There exist pertubations to a policy that are orthogonal to the reward signal that would result in increases in KL that do not increase either gold or proxy reward; conversely, extremely small but well targeted perturbations could substantially change the behavior of the policy within a small KL budget. 但是，由于不同的优化方法在消耗KL散度方面有显著差异（见第3.5节），因此它不应被用来比较不同优化算法之间的优化程度。存在一些对策略进行的微扰，它们与奖励信号正交，这些微扰会导致KL散度增加，但却不会提升gold reward或proxy reward；相反，极其微小但针对性很强的微扰可能在一个小的KL预算内显著改变策略的行为。


Implications for iterated RLHF


Iterated RLHF可以根据按照 \sqrt{KL} 持续增长gold reward。这个结果也有点问题，因为会有policy 锐化的问题。

Limitation & Future Work

这些点真的很值得后续研究：

合成label的问题，刚刚我也提过，label中存在太多的model inner correlation，现实世界也许不存在，而且噪音会很大。
怎么构造rm，使得它更加robust to optimization。
Policy Size的Scale在这里研究太少了。
多轮RLHF很值得继续深入研究。

[1] Gao L, Schulman J, Hilton J. Scaling laws for reward model overoptimization[C]//International Conference on Machine Learning. PMLR, 2023: 10835-10866.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic2.zhimg.com/v2-754d67f4b322ce4149811b6eff2d2b2f_1440w.jpg)

![图](https://pic2.zhimg.com/v2-614881b9de275a69d72554dfe20dae1b_1440w.jpg)

![图](https://picx.zhimg.com/v2-d7aa076ded02d71b64eb5bbb32372101_1440w.jpg)

![图](https://pic1.zhimg.com/v2-544c257be6d20eaa6af8473e82739366_1440w.jpg)

![图](https://pica.zhimg.com/v2-bf048f3ed84e99277c909ae606182a92_1440w.jpg)

![图](https://pic4.zhimg.com/v2-a2cb3de3a9d1093fea6193c11443499b_1440w.jpg)

![图](https://pic2.zhimg.com/v2-c1f71d377b5464d2d5c569cd9f5520ff_1440w.jpg)

![图](https://pic1.zhimg.com/v2-2a2272136ec75d4f4f9a7255ce4518dc_1440w.jpg)

