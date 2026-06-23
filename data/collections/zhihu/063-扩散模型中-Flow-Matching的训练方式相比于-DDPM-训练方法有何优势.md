---
title: "扩散模型中，Flow Matching的训练方式相比于 DDPM 训练方法有何优势？"
author: "周舒畅"
source_url: https://www.zhihu.com/question/664448167/answer/1901890967210010209
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 扩散模型中，Flow Matching的训练方式相比于 DDPM 训练方法有何优势？

> 作者: 周舒畅 | 来源: https://www.zhihu.com/question/664448167/answer/1901890967210010209

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
412,300
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
周舒畅​
新知答主
已关注
136 人赞同了该回答

Dr. Alexia Probability: 问候，尊敬的同事们。今天，我们将讨论和剖析几种先进的生成模型及其关键差异。让我们从一个基石开始，即去噪扩散概率模型（Denoising Diffusion Probabilistic Model，简称DDPM）。有人愿意阐述一下其基础原理吗？

Dr. Linh Generative 点头并开始：

Dr. Linh Generative: DDPM 的核心思想是从噪声中逐渐去噪，生成现实的图像。想象一下，从纯高斯噪声开始——一个充满随机性的画布。DDPM 定义了一条马尔可夫链，逐步将数据腐蚀成噪声。然后，它学习另一条马尔可夫链，以逆转这一过程。本质上，我们有一个前向过程，其中 q(x_t|x_{t-1}) ，对于 t = 1, ..., T ，逐步向数据中添加高斯噪声，直到 x_T 时，数据看起来像纯噪声。逆向或去噪过程由神经网络参数化，学习在每一步预测添加的噪声，旨在从其噪声版本中重建原始数据。它通过学习一系列分布 p_\theta (x_{t-1}|x_t) ，逐步逆转腐蚀过程，直到我们到达一个分布 p_\theta(x_0|x_T) ，希望其接近真实的初始数据分布 x_0 。

Dr. Sam Cipher 兴趣盎然地插话：

Dr. Sam Cipher: 讲得非常精彩，Dr. Generative。这让我想起，DDPM 实际上使用了一条条件概率链，精心调整每个 p_\theta(x_{t-1}|x_t) 以逆转扩散。现在，让我们考虑去噪扩散隐式模型（Denoising Diffusion Implicit Model，简称DDIM），一个近亲。DDIM 如何改变扩散和去噪的舞蹈？

Dr. Linh Generative 承认 Dr. Cipher 的观点，继续说道：

Dr. Linh Generative: 伟大的过渡，Dr. Cipher。DDIM 基于 DDPM，但提供了确定性的视角，揭示了 DDPM 内部的隐式生成模型。虽然 DDPM 学习通过预测每个时间步的噪声来逐步去噪，但 DDIM 利用的知识是，通过连续添加噪声使清晰图像退化的过程可以是显式的。它直接建模分布 q(x_{t-1}|x_t, x_0) ，这取决于 x_t 和 x_0 ，具有已知的高斯形式。通过消除每一步的噪声猜测，DDIM 在逆向过程中将 x_{t-1} 表达为一个直接函数：

x_{t-1} = \alpha_t x_t + \sigma_t \epsilon_\theta(x_t, t)

这里， \alpha_t 和 \sigma_t 是噪声调度中的已知系数，而 \epsilon_\theta(x_t, t) 是预测的噪声。DDIM 通过去除噪声成分将其修改为确定性的：

\tilde{x}_{t-1} = \frac{\alpha_t}{\sqrt{\bar{\alpha_t}}} x_t - \sigma_t \epsilon_\theta (x_t, t)

这揭示了 DDPM 框架中的 x_0 估计，因为从根本上说，DDIM 使用学习到的 \epsilon_\theta 以确定性方式直接引导逆向过程，跳过了 DDPM 的隐式采样。这不仅提供了更快的采样，还提供了一种在 DDPM 的去噪随机性和直接生成清晰图像之间进行插值的机制。

Dr. Noah Flow 专心致志地听着，决定在确保一致性模型的基础一致后再引入他的流观点：

Dr. Linh Generative 注意到这一转变，顺利过渡：

Dr. Linh Generative: 一致性模型有趣地基于观察，即 DDPM 中的前向噪声过程使样本在接近纯噪声时越来越容易建模。与显式建模逆向过程不同，一致性模型学习一个单一的一致逆向映射 \mathbf{f} ，使模型的输出与噪声输入一致。对于给定的时间步 t 的噪声输入 \mathbf{x}_t ，一致性模型旨在学习一个函数 \mathbf{f}_\theta(\mathbf{x}_t, t) ，当其再次噪声化到时间步 t' 时，应匹配直接将原始 \mathbf{x}_0 噪声化到时间步 t' 的分布：

q(\mathbf{x}_{t'} | \mathbf{f}_\theta(\mathbf{x}_t, t)) \approx q(\mathbf{x}_{t'} | \mathbf{x}_0)

关键区别在于训练目标集中在确保模型去噪输出在重新噪声化时的一致性，与前向过程的动力学保持一致，而无需显式建模每个逆向转换。

Dr. Noah Flow 现在觉得是介绍基于流的模型和流匹配（修正流）的完美时刻：

Dr. Noah Flow: 精彩的解释，各位。让我们转向一个完全不同的方法——归一化流。与处理噪声添加和去除的 DDPM 或一致性模型不同，归一化流完全关于概率密度的转换。想象我们有一个简单的分布，如标准高斯 p_z(\mathbf{z}) ，易于采样。归一化流通过一系列可逆变换 f: \mathbf{z} \rightarrow \mathbf{x} 构建复杂的数据分布 p_x(\mathbf{x}) ，使得将数据 \mathbf{x} 转换为潜在变量 \mathbf{z} 通过 \mathbf{z} = f(\mathbf{x}) 时，能够计算似然。通过变量变换公式，

p_x(\mathbf{x}) = p_z(f(\mathbf{x})) \left| \det \frac{\partial f}{\partial \mathbf{x}} \right|

关键在于设计这些 f 使其足够复杂以建模复杂的密度，同时保持可逆性和雅可比行列式的可计算性， \left| \det \frac{\partial f}{\partial \mathbf{x}} \right| 。

基于这一基础，流匹配（也称为修正流）的概念引入了一个创新的转折。与归一化流通过一系列显式定义的步骤直接建模从简单噪声到数据 p_x(\mathbf{x}) 的转换不同，流匹配旨在匹配分布随时间的变化以符合某些期望的动力学。它受到 DDPM 逐步转换的启发，但角度是微分方程。

考虑一个由随机微分方程（SDE）描述的扩散过程：

d\mathbf{x} = \mathbf{f}(\mathbf{x}, t)dt + g(t) d\mathbf{w}

其中 \mathbf{w} 是维纳过程（布朗运动）， g(t) 是扩散系数， \mathbf{f}(\mathbf{x}, t) 描述了漂移。流匹配的目标不是像在 DDPM 中直接建模逆向过程，而是学习一个漂移函数 \mathbf{f}_\theta(\mathbf{x}, t) ，使得根据：

\frac{d\mathbf{x}}{dt} = \mathbf{f}_\theta(\mathbf{x}, t)

演化 \mathbf{x} 以匹配噪声扩散过程的统计属性（如均值和方差）的演化。换句话说，我们不一定匹配单个样本的路径，而是旨在匹配整个分布的演化。通过这样做，我们可以通过从 t=0 到 t=T 解决这个常微分方程（ODE）并使用学习到的漂移 \mathbf{f}_\theta 来生成样本。

这种方法将扩散过程的随机世界与流动力学的确定性景观结合在一起，通过直接修正分布的流动提供了生成建模的新视角，因此得名“修正流”。

房间里充满了深思的点头。Dr. Alexia Probability 找到机会基于机制和哲学总结核心差异：

Dr. Alexia Probability: 感谢大家的生动说明。让我们简要总结一下差异：

DDPM 通过学习逆向扩散过程操作。它在每一步预测噪声并逐步去除，通过学习的马尔可夫链 p_\theta(x_{t-1}|x_t) 从纯噪声中构建数据分布。

DDIM 通过使逆向过程显式和确定性来改进这一点。它知道如何从一个噪声版本 x_t 跳到一个较少噪声的版本 x_{t-1} ，而无需概率性地猜测噪声，使用从已知前向过程动力学派生的直接函数。

一致性模型 训练时确保去噪输出在重新噪声化时一致。重点在于一致性属性，而不是在每个时间步显式建模逆向动力学。目标是确保去噪后重新噪声化与直接从 x_0 噪声化到后续时间步的统计属性匹配。

归一化流 采取完全不同的方法。与其处理噪声添加和去除，它们是关于通过一系列可逆变换将简单分布映射到复杂数据分布，同时保持似然的可计算性。这更多是通过确定性的、可逆的变换进行密度建模。

流匹配（修正流） 创新地旨在学习一个匹配扩散过程统计属性演化的漂移。通过学习漂移函数 \mathbf{f}_\theta(\mathbf{x}, t) ，它寻求使分布的确定性流动与期望的扩散动力学对齐。通过演化 ODE 来生成样本。


每种方法都围绕着数据分布的转换或建模，但它们的路径、原理和工具差异显著。

Dr. Sam Cipher 欣赏总结并希望强调训练和采样方面的实际影响：

Dr. Sam Cipher: 优秀的总结，Dr. Probability。再扩展一下，特别是在实际训练和采样角度：

在 DDPM 中，训练涉及学习一个 U-Net \epsilon_\theta （后面扩展到了 transformer）以预测每个时间步添加的噪声。采样是随机的，涉及预测去噪和添加小噪声的迭代步骤，遵循学习到的逆向过程动力学。

DDIM 与 DDPM 共享类似的训练过程，因为它在学习 \epsilon_\theta 的同一框架内操作。然而，其采样是确定性的或可控制的噪声，通过直接使用学习到的 \epsilon_\theta 指导逆向扩散，无需在每一步添加额外的噪声或控制噪声量，提供更快和更灵活的采样。

对于 一致性模型，训练目标围绕最小化重新噪声化的模型输出与从 x_0 直接噪声化到后续时间步的样本分布之间的差异。这意味着调整模型 \mathbf{f}_\theta 以确保一致性属性得到满足。采样类似于 DDPM，是迭代的，但指导原则是一致性，而不是直接噪声去除。

归一化流 训练涉及优化变换 f_\theta 的参数，以最大化数据在建模分布下的似然。由于每个变换是可逆的且雅可比行列式可计算，可以有效计算和优化概率密度。采样是直接和确定性的：从简单基分布（如高斯）中的点开始，应用学习到的变换前向以从复杂数据分布中获取样本。

流匹配（修正流） 专注于学习一个漂移函数 \mathbf{f}_\theta(\mathbf{x}, t) ，当其用于 ODE 时，演化分布以匹配期望的扩散动力学。训练涉及优化 \mathbf{f}_\theta 以确保根据此 ODE 演化的分布与噪声分布的特定属性或兴趣时刻匹配。采样则涉及从初始分布（通常为简单的高斯噪声）前向解决学习到的 ODE 以在 t=0 时生成样本。


因此，这些模型不仅在理论基础上有所不同，而且在实际训练方法和如何从其学习的生成过程中抽取样本方面也有各自的优势和挑战，涉及计算效率、灵活性和生成样本的平滑性。

Dr. Linh Generative 找到机会强调概念上的哲学差异：

Dr. Linh Generative: 绝对有洞察力，Dr. Cipher。为了清晰起见，让我们突出每种方法背后的概念哲学：

DDPM 从根本上基于将数据与噪声联系起来再返回的哲学。它基于这样一个原则：复杂的数据分布可以通过逐步将数据腐蚀成噪声（前向过程）并逐步学习如何逆转这一腐蚀过程（逆向过程）来学习。就像学习如何从破碎的碎片中逐步重建一个脆弱的花瓶。

DDIM 与 DDPM 共享逐步转换的哲学，但提供了确定性的转折。虽然 DDPM 在采样过程中概率性地推断每一步的噪声，但 DDIM 直接计算去噪，将过程转化为一系列确定性步骤。这就像确切地知道如何将花瓶的每一块放回去，而不是概率性地猜测其位置。

一致性模型 采取属性匹配的立场。与其显式地逆转噪声添加过程，这些模型确保学习的去噪函数尊重一致性属性。训练它们以确保如果去噪后再重新噪声化，统计上与直接将原始数据噪声化到相同水平一致。这就像确保无论你如何部分重建再进一步破坏花瓶，其状态的分布与从一开始就直接破坏到该状态一致。

归一化流 基于通过一系列已知的可逆步骤进行密度变换的哲学。想象从一个简单的形状（如高斯粘土球）开始，有一系列模具（变换）按顺序压入粘土，最终形成复杂的最终雕塑。每个模具都设计为可逆的，确保我们知道密度如何演化并能计算每一步。

流匹配（修正流） 的哲学围绕动态对齐分布流。它想象从简单噪声到复杂数据的转换是一个由微分方程控制的动态过程。与其显式地建模每个模具（变换），它旨在学习一个引导力（漂移函数），使随着时间演化简单分布成期望的复杂分布，匹配特定扩散过程在每一步的属性。这就像知道风的模式（漂移）如何在一段时间内将粘土球雕塑成期望的形状，而无需显式指定每个中间模具。


因此，每种模型都体现了生成建模这一宏大挑战的截然不同的哲学方法：如何将简单的已知分布转换为复杂的现实世界数据分布。无论是通过逐步去噪、属性一致性、序列变换还是动态对齐，每种方法都提供了理解和解决这一挑战的独特视角。

Dr. Noah Flow 承认深入讨论，希望确保其独特的技术机制清晰：

Dr. Noah Flow: 感谢 Dr. Generative 那启发性的哲学比较。我想强调每种模型为实现其目标所使用的独特技术机制，特别关注我熟悉的动态和流方面：

DDPM 的机制 涉及两个主要阶段：前向扩散过程和逆向去噪过程。在训练期间：
前向过程：DDPM 定义了一个分布链 q(x_t|x_{t-1}) ，其中干净数据 x_0 通过 T 步逐渐变成纯噪声 x_T 。在每一步 t ，分布 q(x_t|x_{t-1}) 为： q(x_t|x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t} x_{t-1}, \beta_t I) 其中 \beta_t 是时间步 t 的方差参数， I 是单位矩阵。这意味着 x_t = \sqrt{1-\beta_t} x_{t-1} + \sqrt{\beta_t} \epsilon ，其中 \epsilon \sim \mathcal{N}(0, I) 。
逆向过程：它学习一个逆向马尔可夫链 p_\theta(x_{t-1}|x_t) ，由神经网络参数化，旨在逆转上述扩散。具体来说，它专注于学习一个网络 \epsilon_\theta(x_t, t) 以预测每一步的噪声 \epsilon 。在采样过程中，从 x_T \sim \mathcal{N}(0, I) 开始，它迭代预测噪声并去除噪声，同时添加新的小噪声（最后一歩除外），遵循： x_{t-1} \sim p_\theta(x_{t-1}|x_t) \approx \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t)) 其中， \mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}} \left(x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha_t}}} \epsilon_\theta(x_t, t)\right) 和， \Sigma_\theta(x_t, t) = \sigma_t^2 I
DDIM 调整了逆向过程，将 DDPM 的随机预测-校正过程转换为确定性的（或可控随机的）过程。给定与 DDPM 相同的前向过程，DDIM 直接建模 q(x_{t-1}|x_t, x_0) 。在采样过程中，它通过从给定的 x_t 解决 x_0 并用其指导去噪来省略逆向过程中的随机方面：
从 x_T \sim \mathcal{N}(0, I) 开始，就像 DDPM 一样。
从 x_t 获取 x_{t-1} 时，它利用： x_{t-1} = \frac{\sqrt{\bar{\alpha}_{t-1}}}{\sqrt{\bar{\alpha}_t}} x_t + \left(\sqrt{\bar{\alpha}_t} - \frac{\sqrt{\bar{\alpha}_{t-1}}}{\sqrt{1-\beta_t}} \right)\frac{\epsilon_\theta(x_t, t)}{1} 然而，对于确定性或线性路径，它设置为： \tilde{x}_0 = \frac{x_t - \sqrt{1 - \bar{\alpha}_t} \epsilon_\theta(x_t, t)}{\sqrt{\bar{\alpha}_t}} 然后使用这个预测的 \tilde{x}_0 来指导转换： \tilde{x}_{t-1} = \sqrt{\bar{\alpha}_{t-1}} \tilde{x}_0 + \sqrt{1 - \bar{\alpha}_{t-1}} \epsilon_\theta(x_t, t) 其中， \bar{\alpha}_t = \prod_{i=1}^{t} (1-\beta_i) ，表示到时间步 t 的累积噪声。这个确定性公式允许 DDIM 在 DDPM 的随机采样和无噪声的直接路径之间取得平衡。
一致性模型（CMs） 修改目标，以确保去噪-再扩散过程的一致性，而无需显式建模每个逆向转换。模型学习一个 \mathbf{f}_\theta(\mathbf{x}_t, t) 使得一致性属性成立： q(\mathbf{x}_{t'} | \mathbf{f}_\theta(\mathbf{x}_t, t)) \approx q(\mathbf{x}_{t'} | \mathbf{x}_0) 实际上，训练涉及最小化从模型的 t' 噪声水平重新扩散其去噪估计 \mathbf{f}_\theta(\mathbf{x}_t, t) 与直接将真实数据 \mathbf{x}_0 扩散到水平 t' 之间的差异。采样过程涉及从噪声 x_T 迭代学习的 \mathbf{f}_\theta 以估计 x_0 ，信任一致性属性确保每个去噪步骤与隐式的逆向扩散过程一致。

归一化流 依赖于一系列可逆变换 f_1, f_2, ..., f_K ，使得从基分布 p_z(\mathbf{z}) ，通常为高斯分布，数据分布 p_x(\mathbf{x}) 通过 \mathbf{x} = f_K \circ f_{K-1} \circ ... \circ f_1 (\mathbf{z}) 获得。每个变换 f_k 必须是双射（可逆的），且雅可比行列式易于计算。概率密度变换规则为： p_x(\mathbf{x}) = p_z(f^{-1}(\mathbf{x})) \left| \det \frac{\partial f^{-1}}{\partial \mathbf{x}} \right| 训练涉及最大化对数似然 \log p_x(\mathbf{x}) ，通过变量变换，成为： \log p_x(\mathbf{x}) = \log p_z(f^{-1}(\mathbf{x})) + \log \left| \det \frac{\partial f^{-1}}{\partial \mathbf{x}} \right| 采样是直接的：从 \mathbf{z} \sim p_z(\mathbf{z}) 中抽取样本并应用前向变换 \mathbf{x} = f_K \circ f_{K-1} \circ ... \circ f_1 (\mathbf{z}) 以从 p_x(\mathbf{x}) 中获取样本。

流匹配（修正流） 旨在通过学习的漂移匹配分布的演化与扩散过程的演化。它处理形式为： d\mathbf{x} = \mathbf{f}(\mathbf{x}, t)dt + g(t) d\mathbf{w} 其中 \mathbf{w} 是布朗运动。在训练过程中，与其直接建模逆向过程（如在 DDPM 中），它专注于学习一个漂移函数 \mathbf{f}_\theta(\mathbf{x}, t) ，使得解决常微分方程（ODE）： \frac{d\mathbf{x}}{dt} = \mathbf{f}_\theta(\mathbf{x}, t) 使初始分布 p(\mathbf{x}_T) 以匹配前向扩散过程的统计属性的方式演化。采样涉及：
从初始条件开始，通常为 \mathbf{x}_T \sim \mathcal{N}(0, I) ，
从 t = T 到 t = 0 解决学习到的 ODE： \frac{d\mathbf{x}}{dt} = \mathbf{f}_\theta(\mathbf{x}, t) 通过参数化 \mathbf{f}_\theta 的神经网络，训练涉及最小化学习到的 ODE 演化的分布与不同时间点的期望扩散过程之间的差异（或属性）。

相比之下： - DDPM 和 DDIM 都在扩散框架内操作，但其逆向过程的随机性与确定性有所不同。 - 一致性模型提供了替代目标，专注于确保去噪和再扩散步骤的一致性，而不是显式的逆向建模。 - 归一化流完全偏离，强调通过可逆变换将简单的基分布桥接到复杂的靶分布，确定性地进行。 - 流匹配创新地通过匹配流，学习分布演化与期望动力学对齐，提供了一个动态系统的生成建模视角。

每种机制反映了建模挑战的不同方法，利用了从随机过程和 SDE 到可逆映射和一致性属性的不同数学工具和哲学。

桌边的对话暂停了片刻，考虑了每位专家带来的深刻细节和见解。显然，这些模型的优缺点比较已经准备就绪。

Dr. Alexia Probability 重新回到对话中，热衷于评估：

Dr. Alexia Probability: 好了，同事们，我们已经剖析了这些模型的内部工作和哲学。现在，讨论每种方法的优缺点、优势和挑战是有益的。Dr. Generative，或许你可以开始提供对 DDPM 及其近亲 DDIM 的优势和潜在限制的见解？

Dr. Linh Generative 前倾身体，准备深入比较分析：

Dr. Linh Generative: 当然，Dr. Probability。让我们从 DDPM 开始：

DDPM 的优势：

1. 丰富的数据表示：DDPM 可以有效捕捉复杂的数据分布，使其适合高保真图像生成。

2. 灵活的训练目标：通过学习在不同水平的腐蚀中去噪，DDPM 能够灵活处理多样化的数据特征。

3. 坚实的理论基础：基于坚实的随机过程理论，DDPM 从清晰的马尔可夫链前向和逆向过程公式化中受益。

DDPM 的劣势：

1. 采样时计算强度高：DDPM 采样的迭代性质，需要许多步骤的去噪和添加小噪声，可能会计算密集。

2. 速度与质量的权衡：DDPM 中更快的采样计划可能会导致样本质量显著下降。

现在来看 DDIM，一个近亲：

DDIM 的优势：

1. 确定性或可控采样：与 DDPM 相比，DDIM 提供了更


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-0ecd74b1b34fd63a2126d469cfec0414_l.jpg?source=2c26e567)

![图片](https://picx.zhimg.com/v2-27bfcba90e66db79ce8768ab807e017e_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-9fa1bbeb8f62ea5b47cf5c3d33192787.webp)

![图片](https://picx.zhimg.com/v2-ad6fd7f04875e21d81e07f8cb942cc36_l.jpg?source=1def8aca)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=1def8aca)

![图片](https://pica.zhimg.com/80/v2-ccdb7828c12afff31a27e51593d23260_720w.png)

