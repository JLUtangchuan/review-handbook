---
title: "🌊 LangFlow: 连续扩散语言模型，首次匹敌离散"
author: "nealchen"
source_url: https://zhuanlan.zhihu.com/p/2029889047666091791
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 🌊 LangFlow: 连续扩散语言模型，首次匹敌离散

> 作者: nealchen | 来源: https://zhuanlan.zhihu.com/p/2029889047666091791

---

扩散语言模型一定要扩散！

Arxiv: https://arxiv.org/abs/2604.11748

GitHub: https://github.com/nealchen2003/LangFlow

HuggingFace: https://huggingface.co/papers/2604.11748

TL; DR：在扩散语言模型领域，连续扩散首次追平离散扩散，为后续构建低延迟、高可控、原生多模态的新一代语言模型打下基础。

本文旨在澄清扩散语言模型（Diffusion Language Model, DLM）领域中一个长期存在的偏见：“连续扩散在语言建模上天生弱于离散扩散”。

扩散语言模型简史
TL; DR：扩散语言模型越像自回归，表现就越好。而最早出现的连续扩散，一般认为存在先天劣势。
扩散语言模型发展脉络

当今大语言模型（不论是 ChatGPT 还是 DeepSeek）的基础是自回归（Autoregressive, AR）架构，也就是常说的“预测下个词元”。

随着 Stable Diffusion 等先进生成模型的发布，Diffusion 在图像和视频生成中确立了统治地位，2022-2023年，大家自然想把它迁到文本上，从而达成大一统。但结果似乎是负面的，而且规模越大，差距越明显。比如，唯一做大的连续扩散 Plaid，扩展到 1B 参数才勉强打平 100M 的 AR Transformer [1]。而像 Diffusion-LM [2] 这样的模型，连无条件生成通顺句子都困难。

传统扩散在语言上的碰壁，促使大家转向一种“离散 Diffusion”，也就是从初态（全 [MASK] 或者词表中均匀随机）出发，每步以一个小概率替换部分 token。随后2024年，离散 Diffusion 果然在离散的语言模态上攻城掠地。其中，初始为全 [MASK] 态的 Masked Diffusion 家族的表现最为突出：SEDD Absorb [3] 首次把与 AR 的 PPL 差距缩到 10 以内，MDLM [4] 不但简化了训练，而且进一步缩小了差距。近期的里程碑是 Block Diffusion（BD3-LM）[5]，它是一个过渡状态，把数据每 4–32 个 token 分一块，块内是 MDLM，块间是 AR，PPL 只比 AR 差 3 左右。

截至 2025 年中，DLM 的演进路线是很明确的：

（连续）Diffusion → 离散 Diffusion → Masked Diffusion → Block Diffusion

趋势十分清晰：Diffusion 越像 AR，性能就越接近 AR。 这成了工业界的共识：大家在把 DLM 做到更大规模时 [6,7,8]，无不采用 Block Diffusion，平均每次 forward 能预测接下来 32 个 token 中的 4 个。这其实与 DeepSeek-V3 的 multi-token prediction 不谋而合。

然而，Masked Diffusion 在逼近 AR 性能的同时，也弱化了 Diffusion 的特色，牺牲了两大核心潜力：

1) 快速生成。 （连续）Diffusion 的概率流 ODE，每个随机初态确定性地对应一个终点，训练充分后可一步生成，如 Consistency Models [19]。但 Masked Diffusion 初始为单一的全 [MASK] 态，通过逐步注入随机性，才能生成多种不同的结果；如果一步同时解码多个 token，其间的对应关系是捕捉不到的。因此，Masked Diffusion 深陷并行解码困境（parallel decoding dilemma） [9]，也就是随着生成步数的减少，多种可能的目标句交叉混叠，质量不可避免地走向爆炸 [10]，如下图：

Masked Diffusion 的“并行解码困境”

2) 可控性。 图像/视频 Diffusion 能通过操控连续潜变量实现语义级别的可控生成[11]。相对地，Masked Diffusion 主要限于完形填空式的 token 级编辑（如对联填空）。

Masked Diffusion 的得失引出一个核心问题：如果 Diffusion 必须靠模仿 AR 才能出成绩，那它作为独立语言模型家族的意义何在？

2025年，前沿研究开始反思：退回到多初始态的架构，找回丢失的 Diffusion 特性。代表作 Duo [9] 改进了基于均匀随机噪声的离散 Diffusion，虽然在 OpenWebText 上未能超过 Masked Diffusion，但在少步蒸馏后仍保持生成质量，并采用专为离散 Diffusion 设计的引导机制 [12]。近期研究 [13] 甚至表明，在 GSM8K（数学基准）的扩大规模测试中，Duo 击败了 Masked Diffusion 和 AR。这有力反驳了“一味模仿 AR”的趋势。

在我们的最新工作中，我们比 Duo 更彻底地回归——直接回到最传统的 Diffusion。我们证明：连续 DLM 以前表现差，不是先天缺陷，而是训得不好、测得不准。 经优化后，同样在 GPT-2-small 规模下，连续 Diffusion 追平了离散 Diffusion，甚至可与 AR 相当。具体来说，我们发布的模型 LangFlow，在 7 个零样本迁移测试中，有 3 个超过 AR。

下文说明具体做法。

怎么训？
Embedding 空间上的 Diffusion
TL; DR：输入带噪的 embedding，预测干净 token 的概率分布，然后手动算出 diffusion 的去噪目标。
不同 DLM 的训练

我们先阐明 Embedding 空间上的 Diffusion 框架。设 \mathbf{E} \in \mathbb{R}^{V \times D} 为词表大小 V 的 embedding matrix。类似常见的 LLM embedding，每个序列 \mathbf{x} 映射为连续的 embedding \mathbf{z}，而扩散模型所学的就是这个 \mathbf{z} 了。

扩散路径与图像等模态无异，仍定义为 \mathbf{z}_t = \alpha_t \mathbf{z} + \sigma_t \epsilon，其中 \epsilon 服从标准正态分布，\alpha_t 从 0 增长到 1，\sigma_t 从 1 衰减到 0，一种常见的做法是线性插值 \alpha_t = t, \sigma_t = 1 - t（称为 Flow Matching）。已知 \mathbf{z}_t 的情况下，所有可能的 \mathbf{z} 的期望 \mathbb{E}[\mathbf{z} \mid \mathbf{z}_t]，就是去噪目标 \hat{\mathbf{z}}_\theta(\mathbf{z}_t, t)。

这里我们发现，\hat{\mathbf{z}}_\theta 可以通过期望性质拆解成 token 的后验分布：\hat{\mathbf{z}}_\theta^{(i)}(\mathbf{z}_t, t) = \mathbf{E}^\top \hat{\mathbf{x}}_\theta^{(i)}(\mathbf{z}_t, t)，其中 \hat{\mathbf{x}}_\theta^{(i)}(\mathbf{z}_t, t) 的第 j 个元素表示的是已知 \mathbf{z}_t 时，第 i 个 token 为 j 的概率。

训练：不同于直接用 MSE 回归去噪目标，我们引入 Bregman 散度，通过训练离散概率 \hat{\mathbf{x}} 来逼近连续的 \hat{\mathbf{z}} [15]，而交叉熵 (CE) 正是 Bregman 散度在凸函数 f(p) = \sum_x p(x)\log p(x) 下的特例。因此，我们可以直接用 CE loss 训练：

\mathcal{L}_\text{CE}(\theta) = \mathbb{E}_{t, \mathbf{z}_t}\left[-\sum_{i=1}^L \log \hat{\mathbf{x}}_\theta^{(i, x^{(i)})}(\mathbf{z}_t, t)\right]

这么做主要有两点原因：

防止趋同。不同于图像的 Latent Diffusion，我们的 embedding 参与联合训练。直接训练 \hat{\mathbf{z}}_\theta 容易导致不同 token 的 embedding 趋同，从而发生 mode collapse。用 CE loss 训练 \hat{\mathbf{x}}_\theta 可以避免这个问题。
架构对齐。输入 embedding、输出 token 概率分布，这套逻辑和离散 Diffusion [3,4,12] 完全一致，可以用统一的网络结构，达成公平比较。

生成：为了保留少步生成的能力，采用概率流 ODE。在传统的 Diffusion Solver 的基础上，把最后一步改为直接取 \arg\max\hat{\mathbf{x}}_\theta，就得到最终的 token 序列了。

补充说明：我们知道 DDPM 生成时每步都注入一次正态的噪声；DDIM 支持噪声为 0 的采样，样本全由初态决定。简单来说，SDE 就是 DDPM 的连续时间版本，概率流 ODE 就是 DDIM 的连续时间版本。ODE 又叫 流（Flow），概率流 ODE 等价于一般意义上的流匹配（Flow Matching）。连续时间的好处在于，它允许我们根据需求调整步数，达到效率和质量的平衡，同时也为严谨的 PPL 分析（见下）打下基础。

使用 LangFlow 生成文本
噪声的 Schedule
TL; DR：调准噪声 schedule，是 DLM 的生死线。与图像不同的是，DLM 必须偏重极高噪声区，才能学得有效信息。
标准噪声 Scheduler 的局限

Scheduler 是训练 Diffusion 的重要模块，负责控制不同加噪程度在训练中的占比，以及生成时的离散化。

图像扩散模型通常将训练重心放在中等噪声区（信噪比 [0.5, 2]），因为图像的 loss 曲线随时间 t 分布得很均匀。

但文本完全不同。用均匀的 t 训练文本，在 t \in [0.2, 1.0] 时 CE loss 几乎为零。也就是说，所有有效信息全在扩散路径的前 20% 生成。所以，沿用标准的图像 scheduler 白白浪费了 80% 的算力。

Loss-t 曲线图，表明 loss 集中在 t≤0.2 的区域。

既然 loss 只在极高噪声区剧烈变化，我们干脆弃用 t，改用对数噪声-信号比 (logNSR) 作为时间条件：

\gamma_t = \log\!\left(\frac{\sigma_t^2}{\alpha_t^2}\right)

纯噪声 \gamma \to +\infty；干净数据 \gamma \to -\infty。用 \gamma 的好处是：NSR 翻倍时，\gamma 只需要平移。这抹平了 NSR 剧增时的曲线突变，让我们能在极高噪声区也保持足够的分辨率。

让 Schedule 匹配信息增量

把每个 \gamma 上的 CE loss 画出来，有个值得注意的现象：无论训练多久（50k 到 1M 步），这条曲线几乎不再下降，而是停在某条包络附近。 这并非偶然。设 p 是真实的后验分布，根据以下分解：

\mathbb{E}_{x^{(i)} \sim p}\left[-\log {\hat{\mathbf{x}}}_\theta^{(i, x^{(i)})}\right] = \mathrm{KL}(p \,\|\, \hat{\mathbf{x}}_\theta^{(i)}) + H(p),

随着训练进行，KL 项很快收敛归零，loss 由不可约的后验熵 H_\gamma = \mathcal{H}(x^{(i)} \mid \mathbf{z}_\gamma) 主导。也就是说，loss 曲线刻画了每个 \gamma 下的剩余信息量——这主要反映数据本身的性质，而非模型的好坏。

Loss-γ 曲线，表明信息量集中在 γ∈[3, 7] 的区域。

首先我们观察到 H_\gamma 是单调递增的。这是很自然的：加噪是一个逐步抹除信息，也就是增大不确定性的过程。

反过来说，去噪扩散是一个逐步确定信息的过程。这说明了：如果某处的导数 H'_\gamma 比较大，就说明这个部分的信息量很大，理应增大训练时的比重，生成时也应该在这个区域多走几步；反之亦然。

因此，我们在训练时，按照正比于 H'_\gamma 的权重来采样 \gamma；生成时，所取的离散化点的 H_\gamma 也均匀增加。这就是我们的均匀信息 schedule 原则。

信息量服从 Gumbel 分布

对比不同 checkpoint 的 H'_\gamma，发现导数单峰且正偏。我们惊喜地发现，Gumbel 分布可以很好地拟合：

H_\gamma = H_{+\infty} \cdot \exp\!\left(-\exp\!\left(-\frac{\gamma - P_\mu}{P_\beta}\right)\right)

于是，我们用 H'_\gamma \propto \mathrm{Gumbel}(\gamma; P_\mu, P_\beta) 参数化曲线，把 P_\mu, P_\beta, H_{+\infty} 设为可训练参数。

总结：训练时，按这个 Gumbel 分布采样 \gamma 加噪；ODE 生成时，也按 Gumbel 分布的 1/N, 2/N, \ldots, (N-1)/N 分位数离散化——把算力精准投放在信息增量最大的地方。

消融实验表明，单靠 Gumbel 分布，LangFlow 的 Gen. PPL（下文解释）即可下降约一个数量级（约 7 倍）。这是连续扩散生成质量追平离散扩散的关键因素之一。

怎么测？
关键指标解释

根据以往的 DLM 工作，我们采用以下两项指标（都是越低越好）：

PPL（困惑度） / NLL（负对数似然）：衡量模型 p 对真实数据分布 \mathcal{D} 的感知，公式为
\mathrm{PPL}=\exp(\mathrm{NLL/Token}),\ \mathrm{NLL/Token} = \mathbb{E}_{x \sim \mathcal{D}}\left[-\frac{\log p(x)}{|x|}\right].
Gen. PPL（生成困惑度）：让模型 p 生成一组文本，用基准模型 p_{\rm ref}（取 GPT-2-Large）衡量真实度，即
\mathrm{Gen.~PPL}=\exp \mathbb{E}_{x \sim p}{\left[{-\frac{\log p_{\rm ref}(x)}{|x|}}\right]}.
Self-Conditioning
TL; DR：关掉 Self-Conditioning 来评测连续 DLM 是不公平的。
Self-conditioning 流程图。

Self-Conditioning [17] 是扩散模型里的一项成熟技术，普遍认为能提升生成质量。具体来说，它把上一步的预测作为辅助输入送入网络。训练时，我们以一定概率开启 Self-Conditioning，让模型学会利用自己的历史预测；采样时则全程开启（首步置零，后续用上一步的预测）。

尽管这一技术广泛有效，但以前的离散 DLM 在评估 PPL 时，通常不会考虑 Self-Conditioning。不幸的是，这种评估协议被直接搬到了连续 DLM 上。比如在 Duo 论文里，他们报告的 Plaid（一个连续 DLM）就没有开启 Self-Conditioning（结果高达 89.9，与 Duo 的 43.0 差距显著，这常被当作连续 DLM 不行的“证据”）。

但我们发现，把这种评估协议套在连续扩散上有失公允。对比 MDLM（离散）和 LangFlow（连续）：

模型	Self-Conditioning	Gen. PPL ↓	PPL ↓
MDLM	✗	103.9	31.0
MDLM	✓	94.9 (-9.0)	32.7 (+1.7)
LangFlow	✗	154.2	49.0
LangFlow	✓	81.5 (-72.7)	30.0 (-19.0)
MDLM（离散）：开启 Self-Conditioning，Gen. PPL 降 9.0，但 PPL 升 1.7。这事后证明了为什么离散扩散测 PPL 时要关掉它。
LangFlow（连续）：开启 Self-Conditioning，Gen. PPL 降 72.7，PPL 降 19.0。

这直接抹平了连续与离散扩散的 PPL 差距。至于为什么 Self-Conditioning 在不同形式的扩散中效果差异这么大，仍然是一个未解之谜，但显然它是 LangFlow 追平离散扩散的关键环节。

ODE 生成的 PPL 估计
TL; DR：LangFlow 的 ODE 生成需要更适配的 PPL 上界。

若 PPL 度量不准，就难以公平比较。AR 逐 token 计算似然；离散扩散用变分推导一个上界。我们注意到，虽然之前的工作早已给出了一个变分上界，但其生成过程是 SDE（随机微分方程），不适用于 LangFlow 所用的 ODE 生成。因此，我们在这里推导一个更适配的 PPL 上界。

根据 Flow Matching [14] 论文所述，我们得出以下 NLL 上界，按序列长度平均并取指数后即为 PPL：

-\log p(\mathbf{x}) \le \mathbb{E}_{\mathbf{z}} \Bigg[\frac{\|\mathbf{z}_b\|^2}{2\sigma_b^2} - \int_a^b \frac{\alpha_\gamma}{2} \nabla \cdot \hat{\mathbf{z}}_\theta(\mathbf{z}_\gamma, \gamma)\, d\gamma - \sum_{i=1}^L \log \hat{\mathbf{x}}_{\theta}^{(i, x^{(i)})}(\mathbf{z}_a, a) \Bigg] -\frac{LD}{2}

这个上界由三部分构成：第一项是从噪声中抽取轨迹起点的 NLL；第二项是 ODE 对概率密度的压缩或膨胀；第三项是从轨迹终点还原 token 的 NLL。最后的一项，是以上三项中的常数项相互抵消剩下的总和。

这个界完全适配 LangFlow 的 ODE 生成，彻底扫清了连续 DLM 的 PPL 评估的障碍。

效果拔群！
TL; DR：连续扩散在 LM1B 和 OWT 的 PPL/Gen. PPL 上整体匹敌离散扩散，并取得扩散模型中最强的零样本迁移表现。

我们在 LM1B（句子级）和 OpenWebText（OWT，类似 GPT-2 语料）上评估 LangFlow。模型都是 130M 参数的双向 DiT [16]，训练 1M 步。

语言建模
语言建模结果对比表。我们在扩散模型中取得了三项第一，其余一项与第一名只差 1 左右。

在 LM1B 上，LangFlow 生成 PPL 达 91.8，优于最强离散 DLM（Duo 97.6）6分以上。测试集 PPL（31.7）超过所有均匀随机噪声的离散 DLM，与 Masked Diffusion 的 SOTA MDLM（31.0）持平。在 OWT 上，LangFlow（24.3）与 MDLM（23.2）差距仅在 1 左右。这是连续 DLM 首次在标准语言建模基准上追平离散 DLM。

零样本迁移
零样本迁移结果对比表。7 个数据集中，我们在 3 个上超过 AR，在 4 个上名列扩散模型第一。

在 7 个零样本迁移测试中，LangFlow 在 3 个上超过 AR 基线，在 4 个上超过 MDLM。尤其在 Pubmed 和 Arxiv（充满结构化、专业术语）上，LangFlow 相对 AR 优势显著（36.45 vs 49.01，32.84 vs 41.73）。LangFlow 不仅放大了离散扩散对 AR 的相对优势，还在其弱势项目上补齐了短板。

讨论：DLM 的意义在于连续
TL;DR：Diffusion 的使命不是取代 AR，而是在可控性与多模态上与 AR 互补。连续 Diffusion 在这方面具有天然优势。

前面证明了连续 DLM 能打平离散 DLM。但坦率地说，跟 AR 比，Diffusion 整体上还是有差距。那我们继续做 DLM 的意义何在？

图生成效率？事实上并非如此。近期大规模对比 [7] 表明：DLM 只有在小 batch size 时吞吐量才高于 AR。道理很简单：AR 查一次 KV cache 吐一个 token；DLM 推理一次虽然预测所有位置，但解码出的 token 有限。DLM 解码同量 token 的算力底线，并不低于 AR。效率优势是有天花板的。

既然 AR 在效率与效果上已占优势，Diffusion 更现实的定位是针对AR的弱点进行补充：

1) 可控性。 AR 采样不用 Latent，难以精细控制。Diffusion 把带噪 Latent 映射为数据，轨迹完全可编辑。这让 Diffusion 能做可控生成（如引导机制），能给投机解码（Speculative Decoding）当可控起草器（Drafter）[18]，补足 AR 欠缺的可控性和可解释性。

2) 多模态。 真实世界的图像、视频、音频都是连续信号。AR 非要把它们切成离散 token，这在多模态交互时极不自然。Diffusion 在连续空间建模，是构建视觉中心世界模型等物理基础模型的合适底座。

诚然，这些潜力还需大规模验证。但我们坚信，语言模型的未来不是单一范式一统天下，而是各有所长的模型组合。DLM 不该为了刷榜，削足适履地去模仿 AR，反倒丢掉了自身的特色。

毫无疑问，我们应当停止将 Diffusion 硬性纳入 AR 的模板。让 Diffusion 回归 Diffusion。

这就是我们持续关注连续 DLM 的原因：它未必是榜单上的最优模型，但它最完整地保留了 Diffusion 作为一类生成模型的本质——这正是 DLM 存在的全部意义。

参考文献
Likelihood-based diffusion language models Gulrajani, I. and Hashimoto, T.B., 2023. NeurIPS.
Diffusion-LM improves controllable text generation Li, X.L., Thickstun, J., Gulrajani, I., Liang, P. and Hashimoto, T.B., 2022. NeurIPS.
Discrete diffusion modeling by estimating the ratios of the data distribution A. Lou, C. Meng, S. Ermon. ICML. 2024.
Simple and effective masked diffusion language models S. Sahoo, M. Arriola, Y. Schiff, A. Gokaslan, E. Marroquin, J.T. Chiu, A. Rush, V. Kuleshov. NeurIPS. 2024.
Block diffusion: Interpolating between autoregressive and diffusion language models M. Arriola, S. Sahoo, Y. Schiff, A. Gokaslan, V. Kuleshov. ICLR. 2025.
Large language diffusion models S. Nie, F. Zhu, Z. You, X. Zhang, J. Ou, J. Hu, J. Zhou, Y. Lin, J. Wen, C. Li. NeurIPS. 2025.
Sdar: A synergistic diffusion-autoregression paradigm for scalable sequence generation S. Cheng, Y. Bian, D. Liu, L. Zhang, Q. Yao, Z. Tian, W. Wang, Q. Guo, K. Chen, B. Qi, B. Zhou. arXiv preprint arXiv:2510.06303. 2025.
Llada2.0: Scaling up diffusion language models to 100b T. Bie, M. Cao, K. Chen, L. Du, M. Gong, Z. Gong, Y. Gu, J. Hu, Z. Huang, Z. Lan, C. Li. arXiv preprint arXiv:2512.15745. 2025.
The diffusion duality S.S. Sahoo, J. Deschenaux, A. Gokaslan, G. Wang, J. Chiu, V. Kuleshov. ICML. 2025.
Variational Autoencoding Discrete Diffusion with Enhanced Dimensional Correlations Modeling T. Xie, S. Xue, Z. Feng, T. Hu, J. Sun, Z. Li, C. Zhang. ICLR. 2026.
Diffusion models beat GANs on image synthesis P. Dhariwal, A. Nichol. NeurIPS. 2021.
Simple guidance mechanisms for discrete diffusion models Y. Schiff, S.S. Sahoo, H. Phung, G. Wang, A. Rush, V. Kuleshov, H. Dalla-Torre, S. Boshar, B.P. de Almeida, T. Pierrot. ICLR. 2025.
Scaling Beyond Masked Diffusion Language Models S.S. Sahoo, J. Lemercier, Z. Yang, J. Deschenaux, J. Liu, J. Thickstun, A. Jukic. arXiv preprint arXiv:2602.15014. 2026.
Flow matching for generative modeling Y. Lipman, R.T.Q. Chen, H. Ben-Hamu, M. Nickel. ICLR. 2023.
Exponential family variational flow matching for tabular data generation A. Guzman-Cordero, F. Eijkelboom, J. Van De Meent. arXiv preprint arXiv:2506.05940. 2025.
Scalable diffusion models with transformers W. Peebles, S. Xie. ICCV. 2023.
Analog bits: Generating discrete data using diffusion models with self-conditioning Chen, T., Zhang, R. and Hinton, G., 2023. ICLR.
DFlash: Block Diffusion for Flash Speculative Decoding Chen, J., Liang, Y. and Liu, Z., 2026. arXiv preprint arXiv:2602.06036.
Consistency Models Song Y., Dhariwal, P., Chen, M., and Sutskever, I. (2023).


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-00351ffc99bcbc871099c3c0738cfddc_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-3b0ec0d8517deecf452bdabc0017d717_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-8481b7a8a165b96fcccd0246b6f36e6a_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-060a74390ca6785536994713d7655fac_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-328189e6e163937ce064899882226768_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-9422e4cc51816e7624746b07a8c28cfa_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-8f8b8a4ea832abdf81b7fcb4f2faeafa_1440w.jpg)

![图片](https://picx.zhimg.com/v2-a2eed512e62e7908280e14370cabdd2b_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-562587481c9f0fb29c6cfff838131dd8_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-c150684d10133512c7a4aed0fab8056b_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-e8953a94a8f82bdc95a10a2d51a14800.webp)

![图片](https://pic1.zhimg.com/v2-47743957653fa89af720a9a89dbc2517_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/0edb9e2bfbc796ab97643d3acb6e9c5c_250x0.jpg?source=172ae18b)

![图片](https://pica.zhimg.com/v2-d6871f199831ff0873256da310f6599a_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-871ba38b30ce1019f410a7b9c5b842b0_250x0.jpg?source=172ae18b)

