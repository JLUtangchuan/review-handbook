---
title: "考古OpenAI，Anthropic论文4: A General Language Assistant as a Laboratory for Alignment"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/14868353997
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 考古OpenAI，Anthropic论文4: A General Language Assistant as a Laboratory for Alignment

> @swtheking | https://zhuanlan.zhihu.com/p/14868353997

---

这是Anthropic的RLHF开山之作，很有意思，不知道很多结论现在还对不对，我会带着批判的眼光看这篇论文。

而且Anthropic的论文一个特点，乱，但每个点都很干！所以我尽量能写清楚一些。

这个论文明显很RL，很多RL术语来描述alignment。

Questions
最原始的Prompt方式是一个很好的alignment方式吗？
这个方式如何Scale？（这是我来做LLM最关注的事情，大道至简，简单可扩展！！）
这个方式和SFT有啥区别？
我们如何利用这种形式的优势

我们发现提示在各种与对齐相关的评估中引发了令人满意的扩展，对大模型几乎不产生“税负”，并且可以通过“上下文蒸馏”回到原始模型中。

2. 何时以及在多大程度上偏好建模优于模仿学习？（偏好学习指的是reward modeling，模仿学习是rejection sampling这种）

我们发现，当偏好是排名层次或连续体的一部分（例如，将这些响应按有用性排序）而不是与二元选择相关联（例如，这个 Python 函数是否通过测试）时，偏好建模比模仿学习表现得更好并且扩展性更佳。（所以现在二元关系这种大家更愿意用verifier？）

3. 我们怎么提preference modeling的sample efficiency？

我们发现，通过训练中的“偏好模型预训练”（PMP）阶段，可以显著提高样本效率。在此阶段，我们首先在包含人类偏好信息的大型公共数据集（如 Stack Exchange、Reddit 和 Wikipedia 编辑）上进行预训练，然后在包含更具体人类偏好的较小数据集上进行微调。

对于使用强化学习（RL）进行对齐的工作来说，最后两点尤为重要，在这种工作中，奖励信号是由偏好模型预测的。具体而言，我们预计bandit-type RL 性能将大致与偏好模型的能力成比例地提高，因为偏好模型对高性能行为的识别应该与 RL agent实现它的能力密切相关。我们预期这种策略在某些问题上可以优于模仿学习，特别是那些解决方案处于排名层次中的问题。

Contribution
Prompt是一种有效的alignment，context distillation behave similarly to prompting。（这个就是RFT或者Self- Distillation的变种）
binary discrimination scaling相比于imitation learning scaling并没有提升很多。（这个setting得看细节。）而Ranked preference modeling scaling相比于imitation learning scaling会提升很多。这个结论值得未来细细研究。
Preference Model Pretraining显著提升sample efficiency。即使PMP data和最终的dataset很不一样。与前文提到的PM（偏好模型）在分层排序数据集上表现最佳的扩展结果相比，我们发现PMP（偏好模型微调）的训练阶段更适合关注二元判别。二元PMP表现更佳的一个解释可能是，偏好层次在微调过程中难以迅速消除，而二元判别训练可以在不建立强烈模型偏好的情况下，教会模型正确的特征。我们通过图33中的快速合成数据实验对此解释进行了验证。（这个做法可以通过west of N方法替换。）
实验settings

从10M到52B的模型，8192 token长度，2^16 token vocabulary。

是在common crwal data 400B，网络书籍以及10%的python code数据上训练的。

文章中的Number of Parameters指的是非embedding参数。

Code模型是在此基础上继续训100B python code，包括大概45B独立tokens，训练了两轮多。

Context Distillation

SFT 用人来选择模型的resp当标准答案。

In the small data limit, prompting a generative language model may be qualitatively different from and superior to finetuning, since prompting imposes a prior, while fine-tuning alters the model’s expectations for the underlying data distribution.

为什么RFT和Prompt方式优于人写的SFT方式：因为RFT和Prompt对模型内在的数据分布影响很小，但SFT会很大的改变。这是我一直以来做LLM的核心观点，所有能力来自pre-train，你需要激发pre-train的能力，就得顺着模型本身的数据分布，而不是改变！

Context Distillation的重要性：（这里prompt应该就是类似ICL）

Prompt优于少量数据的FT。
这个提示上下文 'C' 可以被提炼成一种新的语言模型，该模型模拟分布 P(X∣C)P(X∣C)，而不是 P(X)P(X) ；这可以通过简单地使用由 P(X∣C)P(X∣C) 和提炼模型预测之间的KL散度给出的损失进行微调来实现。与直接在提示上进行微调相比，这种方法有更显著的效果。（给个讯息， OAI在23年年中，禁止了模型的续写，之前我们搞的一个科研计划因此中断）。
大模型不需要prompt激发能力，小模型才需要。

Context Distillation or Prompt的缺点：

只会学表象，模型能力永远达不到training set上demonstration的能力。这个就是Imitation Learning的缺点!
后续会用 generative modeling, supervised learning （RFT）, reinforcement learning, and other techniques. 解决。

Context Distillation 细节：

利用HHH作为prompt加在两类数据前面：

Pre-trained Data
Stack Overflow Question

这是RLCD算法的前身，RFT的变体：Forward KL。

这里原始pre-train里，prompting方法下64 65的loss比较低，但FT以后的模型64，65的loss比较高，后续的数字反而效果能合prompting一致




这章我做个总结，写得真的很深刻，ICL -> SFT -> RLHF其实是一个事情，就是Alignment，后面的工作都是理解前面的工作基础上完成的。我之前写了一个专门的blog写了几方面的关系：

Evaluation & Alignment Taxes

这个互信息指标还蛮好的，之前在别的论文上也看过，是alignment重要指标

alignment就是把两段pre-train训练的数据，联系起来，P(a) 越大，P(a|q)越小，越应该alignment。（rm， sft， RL都该看看）

The mutual information metric tends to be useful when responses differ greatly in length, and it makes a significant difference in performance on our evaluations.


左图发现：

任何能力，都随着模型扩大，prompt出来。

右图可以发现以下几点（这里是用互信息，sum logprobs等方式来筛选resp，现在一般都是greedy测试？）：

resp的概率不存在在大模型变大。（Truthful QA）
但对齐能力在随着大模型能力提升, 因为互信息在提升。
对齐以后的互信息更加高，说明对齐做得很好。

这是个更精细的指标对比：mean log prob好于sum log prob


Human Preferences and Model Performance

anthropic有一些weak的证据证明HHH prompt其实比context distillation效果好。也就是说只要改变模型的结构，就会影响模型的效果。

Alignment Taxes/Bonuses：

Prompting的方式在小模型上效果不好，会降低整体效果，但大模型上可以不伤害整体的效果。这些结果都是在code-finetuned model做的，说明大模型在code模型上不会丢失处理自然语言的能力。（这和deepseek以及codex认知相近）。

在Lambada数据上效果：

alignment多少带来alignment tax，在小模型上，context distillation带来更多alignment tax，在大模型上，prompt带来更多。


Imitation Learning，Preference Modeling and Binary vs Rank-Ordered Preferences

这章很有意思，居然对比的是模仿学习，Binary Preference 和学习Rank-Ordered （RL）的Scaling能力

Imitation Learning: 就是 Here we simply train language models to imitate ‘good’ behavior via supervised learning with the usual cross-entropy loss.

Binary Discrimination就是二元对比学习: Given a sample of ‘correct’ behavior and a sample of ‘incorrect’ behavior, train the model to distinguish between the two.


Ranked Preference Modeling就是直接学rank结果：Given a dataset of samples whose overall ‘quality’ is ranked in some way, we train models to output a scalar quality score10 for each sample whose value matches the ranking as closely as possible. 用BT model来学习。


结论： Binary Preference和Rank-Ordered Preference相对比不能scalable。

这里我想强调一下结论：

Ranked preference models tend to improve greatly on imitation learning, but binary discrimination typically provides little benefit.

这里Anthropic是想说明Ranked preference model的重要性。

在某些方面，这一结论显得相当直观：要将模仿学习应用于偏好建模，要么只能在最优质的数据上进行训练（限制了数据集的规模），要么就需要训练以模仿大量较低质量的例子。不过，增益的幅度还是相当显著的。(这里强调了负例子的重要性)，如果只有正负两个结果，只要知道正的结果就够了，但如果有负的加入，就需要知道负的中间哪些是相对好的。

PM建模

Loss：BT Loss

组合方法： Given any context C with a binary label A/B (e.g., ‘True/False’, ‘Good/Bad’), we create a preference modeling pair C:A > C:B, where B denotes the incorrect label, and the colon denotes concatenation.
除此之外C<EOC>:A效果会更好：加入<EOC>以后sample efficiency效果更好。

这里和普通BT不太一样，普通BT是EOS以后加一个线性层，然后输出结果。这里首先用token预测代替线性层（GenRM），第二加了<EOC>，EOC主要提升sample efficiency。

Imitation Learning

用SFT的方式学positive samples，用平均的token概率作为正负样本的打分分数。

实验的setting：

对于这些实验，我们从公开的 GitHub 仓库中收集了大约 50 万个具有测试覆盖的 Python 函数，并将这些函数划分为训练集和测试集。对于每个函数，我们丢弃了原始实现（仅保留函数定义和文档字符串），并从每个参数量高达 130 亿的代码模型中生成了 8 个样本，并使用所有可用的测试来测试这些样本。然后，我们为每个函数创建了正确和不正确样本的对，以避免将代码正确性与人类模型区分任务混淆。我们比较了两种训练过程：正确函数的模仿学习，以及比较正确和不正确函数的偏好建模。

然后我们通过以下方式评估测试集的性能。我们为每个函数生成了 100 个样本（使用预训练的代码模型），并根据 IL 模型的每个标记的平均对数概率和偏好模型生成的分数对它们进行排名。然后我们评估了按任一方法排名的前 k 个样本中是否正确的概率（我们基于 [CTJ+21] 中的 pass@k 估计，在附录 B.6 中推导了一个无偏公式）。为此，我们在训练和测试集生成以及样本排名时使用了相同的模型大小。一些结果显示在图 11 和图 12 中。

这个实验表明：

IL : SFT or RFT后的模型本身有reward的能力，也就是大模型有self-reward的能力。
越大的模型PM效果越高于ILSFT。
越大的模型的RM泛化更好，可以在尾部不掉，但小模型泛化能力不行。
IL在大模型和小模型都能有很好的BON的泛化能力。

实验缺点：

没有特别多的测试ood的难题，后续我们会想办法比较一下。

Lambada的实验

实验结果：

唯一有趣的是：在小模型上greedy测试的重要性，哪怕pass@100 不一定能beat greedy。（当然，pretrain可能次了点）

Rank-Ordered Preference

Preference Model Pre-Training

这个PMP不是第一次听到，之前也做过一些实验，好像没啥用，但不知道是不是实验做的有问题，或者数据有问题。具体使用Stack Exchange, Reddit, and reverted vandalism4 of Wikipedia. 数据来Pre-Training。

结论：

PMP提升PM的sample efficiency
每个 PMP 数据集都能够转移到各种微调数据集，其效果随着模型大小的增加而增长，尽管这些数据集之间可能没有明显的相似性。
对于 PMP 阶段的训练，训练在二元区分数据上比训练在排序偏好上更有利。我们怀疑这是因为排序偏好在微调过程中往往需要“反学习”，这对迁移构成了负担，正如在第 4.3 节中解释的那样。特别是，对于 PMP，我们应用了一种简单的“二值化”方法，将任何排序的 PM 数据集转换为二元区分，如第 4.1 节所述。

PMP格式：

这段写得有点无厘头，我猜测是：

Good == 请给我一个<问题>的正确的resp

BAD == 请给我一个<问题>的错误的resp >

Human-Human vs Human-Model

方式：

我们首先微调了一个语言模型，使其模仿我们评级预训练数据集中的“好”样本（例如，StackExchange、Reddit 或 Wikipedia）。 •

对于评级预训练数据集中的每对样本，我们保留“好”序列，但将“坏”序列替换为从微调语言模型生成的样本。

结果：

整体效果比Human-Human的效果好～～说明on-policy的resp效果好啊。




## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c7346bb0079e60433a480053cd02c77e_1440w.jpg)

![图](https://pic4.zhimg.com/v2-e1838fa310fe8bb920574d41bd4a76eb_1440w.jpg)

![图](https://picx.zhimg.com/v2-d28c2e54b6b9905a964bae76a0bec5c7_1440w.jpg)

![图](https://picx.zhimg.com/v2-728b6f86829b0e89cb0bf746f940fd85_1440w.jpg)

![图](https://pic4.zhimg.com/v2-b7e4b1a5552825fc5db6e49524025f05_1440w.jpg)

![图](https://pic3.zhimg.com/v2-41cd46cddec10658bf386c681720716c_1440w.jpg)

![图](https://pic4.zhimg.com/v2-d03b3084814f022e3ceb3bee6509a317_1440w.jpg)

![图](https://pic1.zhimg.com/v2-aaac6b945450f3d2bb70884fe5698fa6_1440w.jpg)

