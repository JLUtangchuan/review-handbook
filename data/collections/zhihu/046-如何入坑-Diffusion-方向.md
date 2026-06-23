---
title: "如何入坑 Diffusion 方向？"
author: "cameron"
source_url: https://www.zhihu.com/question/658056360/answer/3526228476
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 如何入坑 Diffusion 方向？

> 作者: cameron | 来源: https://www.zhihu.com/question/658056360/answer/3526228476

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
如何入坑 Diffusion 方向？
关注问题
​
写回答
计算机
研究生
数据模型
diffusion model
如何入坑 Diffusion 方向？
计算机的 Diffusion 方向如何去入坑呢？就不知道从哪里下手，基础又不是很好，然后去看论文的时候，那些公式看不懂？该怎么办？目的是写出论文。显示全部 ​
关注者
1,587
被浏览
476,302
他们也关注了该问题
关注问题​
写回答
​
邀请回答
​
好问题 54
​
添加评论
​
分享
​
查看全部 53 个回答
cameron
为机器立心
​
 关注
科技猛兽 等 3033 人赞同了该回答

1. Tutorial

零基础入门
普渡大学Stanley Chan写个本科生和研究生初学者的tutorial(Chan et al.)，内容基础，很容易看懂。
谷歌Calvin Luo的工作(Luo et al.)，作者不仅对各种公式进行了汇总，还阐明了和其他已有生成模型如VAE的关系。可能需要有一定基础。
苹果的工作(Nakkiran et al.)，从deterministic sampler出发，不太关注随机的部分，进而讲到了最新的技术flow matching，兼具基础和前沿。
Huggingface的tutorial，前面三个都是理论，这个手把手教怎么写diffusion代码。
2. Basics:
这部分关注diffusion model基本概念是哪几篇论文构建的
大家公认的第一篇是Ho et al.的Denoising Diffusion Probabilistic Model(DDPM)，搞CV一般搞懂DDPM就差不多。这篇的想法并不是作者原创，而是来自于2015年斯坦福一个学物理的博士后(Sohl-Dickstein et al.)，这是最早提出diffusion这个idea的文章。DDPM的贡献在于把diffusion调出较好效果。
同时期Song et al.写了Noise Conditional Score Network(NCSN)，通过score matching的方式来估计数据分布概率密度的梯度。
然后Song et al.在这两篇的基础上用随机微分方程把Diffusion Model的理论框架统一，提出了Score-SDE。
Nvidia在noise schedule上做改进，提出了EDM(Karras et al.)。很多人都用这篇的代码，因此看懂这个的代码可能就能更轻松地理解很多baseline的代码了。除此之外，本文阐述的diffusion理论框架也是之前几篇很好的补充。
3. Diffusion model改进
这部分的论文是针对diffusion model各方面的改进，如采样、模型架构、理论等。
Song et al.针对NCSN的各种问题提出了各种tricks，在这篇Improved Techniques for Training Score-Based Generative Models当中。很全面的改进，不知道放到下面哪一类里。

Sample& distillation:

Song et al.提出了DDIM，加速了diffusion采样速度。
DPM-Solver(Lu et al.)用另一种方法改进了diffusion采样算法，这是清华朱军组的工作。
也有工作研究了为什么DDIM能在加快采样算法的同时保持较好的采样结果(Salimans et al.)。经过冗长的推导发现DDIM是probability flow ODE的一阶离散解。
最早Distillation的工作(Saliman et al.)

Diffusion model on latent space: Progressive Distillation for Fast Sampling of Diffusion ModelsDiffusion model on latent space:

Latent Diffusion(Vahdat et al.): 把encoder-decoder与diffusion process结合，在latent space上做文章。有了隐空间采样过程更快，能刻画非简单二维图片空间的分布，这个方法被很多生物化学的组采用。
Stable Diffusion的原始论文，也是latent space上的diffusion model(Rombach et al.)。相较于上一篇的改进是把encoder，decoder和diffusion的训练过程拆开。最终把图片生成的分辨率提高。
4. Diffusion model性质研究
如题。

Memorization & Generalization:

Gu et al.参考EDM给出了score/denoiser的最优解。指出如果使用最优的score function，diffusion只会sample训练集中的图片。同时empirically分析了diffusion model memorize data的因素。
Kadkhodaie et al.

Score function:

Wang et al.在假设data分布是gaussian的情况下解出score function，发现是一个linear function
EDM也有explicit解出score function的推导

Loss:

Song et al.证明了score-matching loss和DDPM用的ELBO loss在某种意义上等价。
内容同上(Huang et al.)
谷歌的Ruiqi Gao和Kingma深入研究了ELBO加weighting的问题(Gao et al.)
5. 应用
解反问题，有条件的生成，图文模型等等。水平有限，这里只贴了一小部分。

Survey:

不同人有不同的关注点。因为diffusion model的应用实在是太广了。如果想了解不同方面的应用总结，可以看看这篇综述(Yang et al.)，这是宋飏和北大崔斌组合作的工作。

Inverse problem solver:

改进diffusion sample算法来进行后验采样。Diffusion相较其他生成模型而言一大优势在于其采样算法能更好适用于下游任务，这篇文章DPS(Chung et al.)便是开了这样一个新坑，从此反问题这一领域变成一大热门。在此之前人们大多通过求解优化问题的方法来解反问题。这个韩国组有一系列工作都基于此。
Caltech组(Feng et al.)从bayesian inference角度把diffusion model看成一个prior，引入了normalizing flow model来解反问题。

Guidance:

Classifier guidance(Dhariwal et al.)
Classifier-free guidance(Ho et al.)

Text-2-image Diffusion: Diffusion Models Beat GANs on Image SynthesisText-2-image Diffusion: Classifier-Free Diffusion GuidanceText-2-image Diffusion: Diffusion Models Beat GANs on Image SynthesisText-2-image Diffusion:

太多了，业界几个大模型都是，贴个我之前的总结。肯定不全，欢迎补充。

Controlnet(Zhang et al.)

RLHF: Adding Conditional Control to Text-to-Image Diffusion ModelsRLHF:

有大模型就有对齐，最常用的对齐算法就是rlhf。

Diffusion+DPO(Wallace et al.)
Diffusion+KTO(Li et al.)
6. Beyond diffusion model
Diffusion model不可能一直dominate生成模型领域，这部分论文关注人们在diffusion之后的生成模型做出过哪些探索。
Flow matching(Lipman et al.)
Rectified flow(Liu et al.)
Rectified flow改进(Lee et al.)
Text-to-image版的rectified flow(Liu et al.)
DiffusionSchrödinger Bridge(Chen et al.)
Consistency model(Song et al.)

编辑于2024-09-17 08:06
・美国
​
赞同 3033​
​
55 条评论
​
7059
​
122
​
分享
​
​
收起​
如何学好abaqus？
导读：本文作者江丙云，分享了他从Abaqus新手小白到大神的学习经验，希望对你有所帮助。仿真高研院致力于帮助零基础小白掌握企业级仿真能力，推出「abaqus结构仿真双证班」，让你不用再重复江博士...
仿真秀App
100+热议
更多回答
周弈帆

其实学懂扩散模型不需要完全理解公式推导。在学习计算机知识时，知识由浅到深的顺序是思想、代码实现、数学原理。学习包括扩散模型在内的多数知识时，其实最重要的是要搞懂为什么这么做，不同工作之间有什么联系。在此之后，如果想完全搞懂某一篇工作的做法，再去深入学习并复现代码。只有当目前阅读的文献用到了过多的理论知识，或者你的研究方向就是做理论，这时候才需要认真推公式。

我对图像生成相关的扩散模型知识比较熟悉。下面我将围绕我自己的之前学习路线，讲一下学扩散模型时入门、熟悉、创新这三个学习阶段该怎么学习、会读到哪些文献、需要学到多深的程度。

入门

在入门扩散模型的时候，最重要的是围绕 DDPM 这篇扩散模型的奠基之作，明白扩散模型究竟在做什么。扩散模型可以从很多个角度去理解，我个人比较推荐的一种容易上手的学习方式是先理解自编码器，并稍微了解 VAE （变分自编码器）。在此之后，你会发现扩散模型就是一个加强版的自编码器。

在这个阶段，最重要的论文是 Denoising Diffusion Probabilistic Models (DDPM)，它是最早提出扩散模型的 Deep Unsupervised Learning using Nonequilibrium Thermodynamics 的简化版和改进版。当然，直接看论文会比较吃力，建议先读一些更友好的入门级教程，比如我写的 Diffusion Model 详解，以及苏剑林扩散模型系列文章的前两篇文章 生成扩散模型漫谈（一）：DDPM = 拆楼 + 建楼、生成扩散模型漫谈（二）：DDPM = 自回归式VAE。很多人会推荐 What are diffusion models 一类比较严谨详细的文章，但我觉得这些文章应该等对扩散模型基本原理有了一定的了解后再去读。

在这个阶段，为了打好基础，我建议不仅要把 DDPM 的原理弄懂，还应该完全搞清其代码实现。可以参考我写的 Diffusion Model 详解，我在文章里详细讲解了如何从头用 PyTorch 实现 DDPM。

其实入门扩散模型学完 DDPM 就够了，但我还建议学习扩散模型中另一篇十分重要的基础工作：Denoising Diffusion Implicit Models (DDIM)。虽然 DDIM 在现在会被当成一种过时的加速 DDPM 的方法，但它提出的两种思想已经融入了目前绝大多数扩散模型的工作中：

训练 DDPM 要 1000 步，但生成图像时我们可以只用 20、50、100 步。
DDPM 在图像生成的两处有随机性：随机初始噪声、随机去噪过程。而 DDIM 提出了一种决定性（没有随机性）的去噪过程。

学习 DDIM 同样可以参考苏剑林的文章 生成扩散模型漫谈（四）：DDIM = 高观点DDPM 或者我的文章 DDIM 简明讲解与 PyTorch 实现。

熟悉

DDPM 只是扩散模型的根基，后续有许多工作从各个角度改进了 DDPM。我建议这个阶段围绕 Stable Diffusion (SD) 进行学习。这是因为 SD 及其建模思想已经用到了目前几乎所有 CV + Diffusion 的工作中，而且学习 SD 的过程中也能顺便接触到其他和扩散模型相关的使用方法。

SD 是一种 Latent Diffusion Model，它在论文 High-Resolution Image Synthesis with Latent Diffusion Models 中被提出。当然，SD 中 DDPM 只占了一半的基础知识。为了掌握另一半基础知识，还需要学习 Neural Discrete Representation Learning (VQVAE) 系列工作。等弄懂了这两部分的基础知识后，学 SD 会非常轻松。这里推荐我写的 SD 系列教程：Stable Diffusion 解读（一）：回顾早期工作、Stable Diffusion 解读（二）：论文精读、Stable Diffusion 解读（三）：原版实现及Diffusers实现源码解读。我对 SD 做了一个非常系统的讲解，具体的学习路线及需要熟悉的早期工作都写在第一篇文章里。

在这一阶段，学习的重点依然是理解文章的思想，知道 DDPM 和 VQVAE 是怎样被组合起来，构成 SD 的。同时，理解 SD 的代码实现也很重要。由于从头训练 SD 的难度较大，我建议直接去学习目前最流行的扩散模型库 Diffusers 的模型推理代码，不用学训练代码，也不要去看 SD 官方仓库。我在上面的第三篇介绍 SD 的文章里详细介绍了 SD 的代码该怎么看。

SD 就像一个十字路口，串起了所有和扩散模型相关的知识。这其中比较重要的工作有：

Classifier-Free Diffusion Guidance: 如何让扩散模型更加符合约束条件。比如让 SD 生成的图片更符合文本描述。
如果你之前没有学过 Transformer，可以趁机去看一下 Attention Is All You Need。SD 的去噪模型中用到了 Transformer。
Diffusion Models Beat GANs on Image Synthesis: 这篇文章提出了 classifier guidance，一种向已经训练好的扩散模型加约束条件的方法。它虽然没有 classifier-free guidance 常见，但适用范围更广。
Adding Conditional Control to Text-to-Image Diffusion Models (ControlNet): 一种通过新增模块并训练新模块来给 SD 加入新约束的方法。通过 ControlNet，我们能够让模型根据边缘图、深度图或人体姿态图来生成图片。
LoRA 是一种快速微调预训练大模型的方法。LoRA 在 SD 中最常见的应用是改变输出风格。参见 LoRA 在 Stable Diffusion 中的三种应用：原理讲解与代码示例
更改 SD 中 Transformer 的自注意力输入是一种很常见的编辑方法。参见 Stable Diffusion 中的自注意力替换技术与 Diffusers 实现

在熟悉扩散模型这一阶段时，除了学习 SD 外，有余力的话可以关注一个和 SD 平行的领域：用新的数学模型来解释扩散模型。这其中比较有代表性的两篇工作是 Score-Based Generative Modeling through Stochastic Differential Equations 和 Elucidating the Design Space of Diffusion-Based Generative Models (EDM)。前者把扩散模型和数学里的随机微分方程（SDE）关联了起来，而后者试图建立一种更一般的扩散模型的数学模型。这里同样推荐苏剑林的系列文章，如 生成扩散模型漫谈（五）：一般框架之SDE篇。我建议在学习这些文章时，除了看其中的数学推导外，还需要着重思考这些新模型的意义是什么，它们能够怎样提升现有模型的性能。

与扩散模型相关另一个比较热门的领域是加速扩散模型的生成。这方面我了解的不多，仅能大概介绍一下。早期大家在加速扩散模型时，一般会把扩散模型的采样建模成某种数学方程的求解，再用更加强大的数学工具来加速方程求解。而近期有一种叫做 Consistency Models 的建模扩散模型的方式，它希望模型在训练时就能以一步完成生成为目标。Consistency Models 可以以蒸馏的方式融合进已经训练好的模型中，比如将其用到 SD 上的 Latent Consistency Models: Synthesizing High-Resolution Images with Few-Step Inference.

创新

在这个阶段中，我们就要开始阅读最前沿的论文，并提出创新了。当然，由于上一阶段涉及的论文较多，这一阶段可以和上一阶段同时进行。

具体在哪个领域做怎样的研究，就取决于你的导师和你自己了。由于这个问题侧重于问如何学习，我们仅讨论在这个阶段如何继续学习，而不谈怎么去找 idea 写论文。

我建议这个阶段直接去读该方向最前沿的论文。碰到了之前没见过的概念，再回头去补充阅读相关论文。在学习时，重点还是学习怎各个工作是怎么关联起来的，不比去过度在意每一篇工作的细节。举个例子，我在学习视频生成模型 Stable Video Diffusion（SVD）时，我发现作者在训练和采样时用到了上面提到的 EDM 模型。为了更好地理解 SVD，我大概学习了扩散模型与 SDE 的关系、EDM 是怎么样对扩散模型的建模的，之后把补充学习的重点放到了 EDM 的训练和采样方法上。

总结一下，要从头开始学习扩散模型并在该领域进行科研，大概要经过入门、熟悉、创新三个阶段。我建议一开始学习简明的 DDPM 教程并动手实现 DDPM，之后学习 Stable Diffusion 并着重熟悉 Diffusers 库，最后根据自己所在具体方向来看前沿论文并查缺补漏。

如正文所述，我分享了不少和扩散模型相关的文章，欢迎阅读。从稀有度而言，这些文章里价值较大的是 Diffusers 的代码解读与开发指南。以后有时间我还会分享更多和 Diffusers 开发相关的文章。

阅读全文​
​
赞同 1309​
​
20 条评论
​
2965
​
63
​
分享
​
YaqiLYU
你相信光吗

透过现象看本质，一切如此简单，跟我一起看完这5篇经典论文你就通关了。

1. DDPM: Denoising Diffusion Probabilistic Models
Ho J, Jain A, Abbeel P. Denoising diffusion probabilistic models. NeurIPS, 2020.
https://github.com/hojonathanho/diffusion （官方TensorFlow代码）
https://github.com/lucidrains/denoising-diffusion-pytorch （第三方PyTorch代码）

DDPM来自UC Berkeley，第一次让扩散模型的生成质量接近GAN，避免了GAN训练不稳定的问题，是这一波AIGC爆火的起点。

模型结构采用PixelCNN（OpenAI, 2017），GN代替WN，16x16分辨率加Self-Attn。

整体结构是典型的UNet，输入256x256x3的噪声图像，输出256x256x3的去噪图像，简洁明了，方便我们更直观的了解扩散模型原理。搞懂这个，再看后面的latent或cascade结构就容易了，so easy。

前向过程

逐渐向图像中添加高斯噪声，直到图像被彻底破坏，变成高斯噪声。由于独立高斯噪声线性可加，不管第几步的加噪图像，都可以一步得到。每一步的加噪图像是这么计算的：

t是timestep（时间步数），t=0, 1, 2, ..., T。注意，这里的随机噪声是前t步独立高斯噪声线性叠加的结果。为了方便，我们把原图x_0前面权重记为w_i_t (weight_image_timestep)，把噪声e前面权重记为w_n_t (weight_noise_timestep)。

由于Beta schedule可以确定beta，beta决定alpha，alpha决定前面这两个权重，那我们可以简单说：固定步数的Beta schedule具有确定的w_i_t 和w_n_t 。

DDPM采用1000步的linear schdule，那我们就可以把这两个确定的权重画出来，就是下图中的蓝线(横轴是时间步数，纵轴是权重)：

可以看到，随着时间步数的增加，图像权重逐渐从1减小到0，噪声权重逐渐从0增加到1。

换言之，前向过程就是随着时间步数增加，逐渐提高加噪图像中噪声的占比，从没有噪声到只有噪声。

反向过程

反向过程就是逐渐去掉噪声，从纯噪声开始，每一步去掉一些噪声，最后得到干净图像，这就实现了从噪声到图像的生成。

我们用一个UNet从前向过程中学习：加噪图像是输入，所加噪声是目标。是不是很眼熟？这个过程和我们训练图像去噪有点像！所以DDPM中第一个D是去噪，UNet就是名副其实的去噪网络。

球头麻袋！！！

这样训练的UNet，预测的是我们线性叠加后的高斯噪声，而不是每一步加入的高斯噪声，如果UNet太优秀，岂不是一步就去噪结束了？怎么体现迭代去噪的过程呢？

没事，我们就假装它预测是每一步的高斯噪声不就行了。反正高斯噪声都长得差不多，谁看的出来呢

所以推理过程每一步的去噪图像是这么计算的：

训练所用的总采样步数T一般是1000步，推理用的总采样步数可以不一样，通常小于1000，比如20、40、100都可以，步数越多质量越高，速度越慢，看你怎么取舍了。

相信你已经非常清楚DDPM了。

还迷糊？没事，我们还有图文版，往下看

训练过程可视化

随机采样一个t，按照权重前向加噪，提供自监督的训练样本对（加噪图像 | 目标噪声）：

UNet输入加噪图像，预测噪声：

计算预测噪声和真实噪声之间的损失，这里是MSE：（注意，这两个噪声不一样，这里不用假装一样）

再反向传播更新UNet参数。

重复以上过程，直到模型收敛。

推理过程可视化

输入噪声图像（第一步是纯噪声），用咱训练好的UNet预测一个噪声：

从输入噪声图像中减去预测噪声，得到预测的原始图像：

按照当前的下一步（t-1）的权重，给预测的原始图像加入一些噪声，得到新的噪声图像：（加入的噪声可以是预测噪声，也可以是随机噪声，还可以两种各来一点，看前面的推理公式DDPM就是最后一种）

将这个噪声图像作为下一步采样的输入。注意，最后一步就不要再往预测原图中加噪声了，拿结果就行

重复以上过程，直到图像清晰，没有噪声。

如果还有不清楚的，请看扩散模型Diffusion Model（一）：极简入门 - 知乎

2. DDIM: Denoising Diffusion Implicit Models
Song J, Meng C, Ermon S. Denoising diffusion implicit models. ICLR, 2021.
ermongroup/ddim: Denoising Diffusion Implicit Models

DDIM来自Stanford，是扩散模型加速采样的最常用方式。模型结构与DDPM一样，不用重新训练，其核


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/9c114f9e3df8b693fa7cc2e81c1019c2_l.jpg?source=c8b7c179)

![图片](https://picx.zhimg.com/v2-658b5ea6d9fae53e9f48ab1877bc8ab8_l.jpg?source=c8b7c179)

![图片](https://pic1.zhimg.com/v2-037be32fef38b131c434e594286d5ffb_l.jpg?source=2c26e567)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://pica.zhimg.com/v2-6586d3bbb0dcb5245584736590cea4d0_l.jpg?source=1def8aca)

![图片](https://picx.zhimg.com/v2-1b8bc96f476d3818cd1f503c6077d68a_l.jpg?source=1def8aca)

![图片](https://pic1.zhimg.com/v2-90fe30a27c0617c387156cb8772829ef_720w.webp?source=d6434cab)

![图片](https://picx.zhimg.com/v2-037be32fef38b131c434e594286d5ffb_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/80/v2-ccdb7828c12afff31a27e51593d23260_720w.png)

