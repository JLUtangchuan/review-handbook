---
title: "十分钟理解Sampler：从DDPM到Rectified Flow"
author: "梦想成真"
source_url: https://zhuanlan.zhihu.com/p/720151915
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 十分钟理解Sampler：从DDPM到Rectified Flow

> 作者: 梦想成真 | 来源: https://zhuanlan.zhihu.com/p/720151915

---

前言

最近学习 diffusion 的时候，看到几种比较popular的sampler方案，这里进行总结：

1、ϵ-prediction 噪声预测型，直接预测在每个时间步添加的噪声，属于DDPM类型

2、v-prediciton 速度预测型，重点在于预测数据如何在时间序列中演变，属于DDPM类型

3、rectified flow 不同于前两者的DDPM类型，这种方法直接建模数据如何流动，关注的是数据从初始分布变换到目标分布的路径。属于 flow matching型。

（挖坑， score based method有空再写）




DDPM回顾

如果对DDPM不了解，可以参考之前写过的文章

简单来说，DDPM 加噪过程

\bm x_t = \sqrt{\overline \alpha_t} \bm x_0 + \sqrt{(1-\overline \alpha_t)} \bm \epsilon

DDPM 去噪过程，我们学习的就是 \epsilon_{\theta}(x_t, t)

\bm x_{t-1} = {\mu_{\theta}}(\bm x_t, t) + \sqrt \beta_t N(0,I ) = \frac {1} {\sqrt{{\alpha}_t}} (\bm x_t - \frac {\beta_t} {\sqrt{1-\bar{\alpha}_t}} {\epsilon_{\theta}}(\bm x_t, t) ) + \sqrt \beta_t N(0,I )

那DDPM这一个派系那，就可以称作 ϵ-prediction的方法。ϵ-prediction就是数据从一些真实样本，通过添加高斯噪声生成的潜在空间中逐渐变得模糊，最终到达纯噪声的状态。

与之相对应的还有v-prediction这个流派。v-prediction是通过计算数据在潜在空间中的“梯度”或“方向”预测下一步的数据分布，也可以看作是对数据分布的偏导数进行预测。

下面的章节，我会尽可能简单的展开说明DDPM这类 ϵ-prediction方法和v-prediction方法他们的物理意义，也就是他们到底在学习什么。

从ϵ-prediction到v-prediction

从加噪的过程看，干净图像和高斯噪声的权重平方是 \overline \alpha_t + (1-\overline \alpha_t) = 1，那么就可以用单位向量来理解干净图像和高斯噪声的关系。借助"PROGRESSIVE DISTILLATION FOR FAST SAMPLING OF DIFFUSION MODELS" 中的插图，y轴就是干净图像，x轴是高斯噪声，z就是\bm x_t，我们可以这么理解DDPM加噪的物理意义，即：从干净图像开始，以一定的步长，混合一定比例的高斯噪声，直到最后完全变成高斯噪声。







还是可以参考上图，其实就是对角度求导就能得到\bm v_t。另外加上DDPM本身的加噪公式，

\begin{cases} \bm v_t = \frac {d \bm x_t} {d \phi} = \frac {d\ cos\phi} {d\ \phi} \bm x_0 + \frac {d\ sin\phi} {d\ \phi} \bm \epsilon = \sqrt{ \overline \alpha_t} \bm \epsilon - \sqrt{1-\overline \alpha_t} \bm x_0 \\ \bm x_t = \sqrt{\overline \alpha_t} \bm x_0 + \sqrt{1- \overline \alpha_t} \bm \epsilon \end{cases}

组合化简可以得到 \bm v_t 到 \bm x_0的映射关系。

\bm x_0 = \sqrt{\overline \alpha_t} \bm x_t -\sqrt{1- \overline \alpha_t} \bm v_\theta(\bm x_t)

v-prediction就是通过预测 \bm v_\theta(\bm x_t) 来预测干净的图像。v的物理意思就是所加噪声变化的速度。

为了进一步理解v-prediction相比ϵ-prediction的区别，需要理解SNR（信噪比），SNR一般如下定义，套进DDPM的加噪过程 \bm x_t = \sqrt{\overline \alpha_t} \bm x_0 + \sqrt{(1-\overline \alpha_t)} \bm \epsilon ，就可以得到DDPM过程的信噪比，

\text{SNR} _{ddpm}= \frac{\| x_{\text{signal}} \|^2}{\| x_{\text{noise}} \|^2} = \frac {\overline \alpha_t} {1-\overline \alpha_t}

当反向去噪的时候，开始的时候SNR很小，甚至为0，虽然后续t变得小的时候会修正到正确的预测轨道，但是初始的状态的噪声预测和信号基本上没有关系。

v-prediciton的loss如下，带入 \bm x_0 = \sqrt{\overline \alpha_t} \bm x_t -\sqrt{1- \overline \alpha_t} \bm v_\theta(\bm x_t) 可以等效转化为 \bm v_t 和干净图像 \bm x_0 的关系：

\begin{align*} L_\theta &= || \bm v - \bm v_\theta(\bm x_t, t) ||^2 \\ &= ||\frac{1} {1-\overline \alpha_t} (\bm x_0 - \bm x_\theta(\bm x_t , t))||^2 \\& = ||(\text{SNR} _{ddpm} +1) (\bm x_0 - \bm x_\theta(\bm x_t , t))||^2 \end{align*}

我们可以看到前面的系数不就是DDPM的SNR吗，v-prediction 的loss weight 刚好比DDPM的SNR多一个1，缓解 在去噪前期的信号弱问题。

实际上作者还尝试了如下形式的loss，同样也是避免SNR为0的情况。最后实验发现两种形式的loss都差不多。

\begin{align*} L_\theta &= ||\text{max}(\text{SNR} _{ddpm}, 1) (\bm x_0 - \bm x_\theta(\bm x_t , t))||^2 \end{align*}

总结下，v-prediction 可以看作 ϵ-prediction的一个变种，学习的是噪声变化的速度，训练相对稳定一些。

Min-SNR weighting strategy

之所以提到这个工作，是因为带给了我一些有趣的启发。作者在不同的timestep区间微调diffusion，发现除了微调的区间，微调区间周围的timestep也会变得好一些，而远一些的timestep loss仍然比较大。这说明多个timestep的训练任务是有冲突的，因此作为多任务学习的视角，这个paper提出了一个简单有效的损失函数。上面的结论非常make sense，作者也用实验结果帮我们佐证了。

那么，我们现在继续看v-prediction 方法的loss funciton 有什么问题

L_\theta = ||\text{SNR} _{v-pred}(t)(\bm x_0 - \bm x_\theta(\bm x_t, t)) ||^2

当t比较大的时候，信号比例小，前面的weight 比较小，但是后面的MSE比较大，而当t比较小的时候，信号比例大，前面的weight 比较大，但是后面的MSE比较小。对于多任务学习，这似乎得到了一种平衡，但是，t比较大的时候，多任务训练会更加难啊，所以理论上应该给予更大的关注，这点有很多针对难易样本的训练的paper都指出了。

Min-SNR weighting用了一个非常简单的方法，设置一个超参数 \gamma，默认是5。对于比较简单的case（t比较小），权重最大为5，迫使网络不要关注简单case。而对于比较难的case，权重保持不变，以此让网络关注难样本。

L_\theta = ||min(\text{SNR}(t), \gamma) (\bm x_0 - \bm x_\theta(\bm x_t, t)) ||^2

Rectified Flow 和 LogNorm sampler [SD3]

LogNorm sampler 和Rectified Flow是 SD3（Scaling Rectified Flow Transformers for High-Resolution Image Synthesis） 中看到的方法。LogNorm sampler 和Min-SNR一样，同样关注到了难样本学习。Lognorm sampler 在扩散模型中用于调整时间步 t 的采样分布，从而影响信噪比（SNR）。与均匀分布相比，lognorm 分布使采样更倾向于低信噪比区域，增强模型在噪声较多阶段的学习。

再看LogNorm sampler之前，我们先看看 rectified flow，不同于DDPM/score matching的方法，rectified flow 看起来非常简单！rectified flow 属于flow matching的方法，意在解决两个分布的传输问题。如下图，有两个分布X_0 \sim \pi_0，X_1 \sim \pi_1。

映射T通过连续运动系统（也叫常微分方程ODE、流模型）来隐式定义。对于X_0,X_1在图像/视频生成领域，X_0就是高斯噪声，X_1就是clean image或者clean video。ODE方法就想直接从X_0传输到X_1，但是有个问题啊，X_1的分布在测试的时候不知道啊。所以ODE方法就想学一个速度v（注意区分v-prediction的v，不是一个v）直接学习从X_0传输到X_1，非常的直接！

其中X_t = t X_1 + (1-t) X_0就是一个线性插值的建模。

那么 v_t = \frac{dX_t} {dt} = X_1 - X_0

则损失函数一下子就跃然纸上，如下：

L_\theta = || (X_1-X_0) - v_\theta(X_t, t)||^2

我们还可以对比下DDPM类型方法，此时X_0就是高斯噪声\epsilon，X_1就是clean image或者clean video \bm x_0，我们就可以发现rectified flow到底和DDPM有什么联系。

\begin{cases} \bm x_t = \sqrt{\overline \alpha_t} \bm x_0 + \sqrt{(1-\overline \alpha_t)} \bm \epsilon， DDPM \\ \bm x_t = t \bm x_0 +(1-t) \epsilon，RF \end{cases}

可以看到从插值的角度，DDPM建模的是相对比较复杂的曲线运动，而RF建模的就是非常简单的直线运动。

再说回 LogNorm sampler，我们都知道 正常的均匀分布概率密度函数如下：

f(x) = \begin{cases} \frac{1}{b-a} & \text{if } a \leq x \leq b \\ 0 & \text{otherwise} \end{cases}

作者主观认为，当 timestep 位于 中间值时，预测的难度增加。这是因为在 t=T 时，模型的最佳预测是基于高斯分布的均值，而在 t=0 时，最佳预测则是基于最终干净图像/视频分布的均值。而在中间状态，模型需要同时考虑两个分布的信息，因此从统计和概率上来看，预测更加复杂。

为了采样更多的中间步长，SD3采用了对数正态分布，任意随机变量的对数服从正态分布,则这个随机变量服从的分布称为对数正态分布。

f(x) = \begin{cases} \frac{1}{x \sigma \sqrt{2\pi}} e^{-\frac{(\ln x - \mu)^2}{2\sigma^2}} & \text{for } x > 0 \\ 0 & \text{otherwise} \end{cases}

x 是随机变量
μ 是对数的均值
σ 是对数的标准差

SD3没有开源，但是说了参数：μ =0，σ =1。
SD3的图示如右图橙色部分分布，突出中间时间轴。

我自己的实现，应该是OK的

from torch.distributions import LogisticNormal
self.normlog_sampling = LogisticNormal(torch.tensor([0.]), torch.tensor([1.]))
self.sample_t = lambda x: self.normlog_sampling.sample((x,))[:, 0]

# sample it!
self.sample_t(samples) # int
# 附录可视化分布的脚本
def visualize_distribution(sample_data:List[int], bins=50, title="Sample Distribution"):
    """
    Visualize the distribution of sample data using a histogram and kernel density estimation.
    
    :param sample_data: List or array of sampled numbers
    :param bins: Number of bins for the histogram (default: 30)
    :param title: Title for the plot (default: "Sample Distribution")
    """
    # Convert sample_data to numpy array if it's a list
    if isinstance(sample_data, list):
        sample_data = np.array(sample_data)

    # Create the plot
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Plot histogram
    n, bins, patches = ax.hist(sample_data, bins=bins, density=True, alpha=0.7, color='skyblue')
    
    # Calculate kernel density estimation
    kde = stats.gaussian_kde(sample_data)
    x_range = np.linspace(sample_data.min(), sample_data.max(), 200)
    ax.plot(x_range, kde(x_range), color='darkblue', lw=2)
    
    # Set labels and title
    ax.set_xlabel("Value")
    ax.set_ylabel("Density")
    ax.set_title(title)
    
    # Add grid
    ax.grid(True, linestyle='--', alpha=0.7)
    
    # Show the plot
    plt.savefig("dist.jpg", dpi=300)
Next Section

To be continue




Relation Blog




Reference

https://zhuanlan.zhihu.com/p/629334231

https://zhuanlan.zhihu.com/p/678942992

https://civitai.com/articles/4452

https://zhouyifan.net/2023/07/07/20230702-DDIM/


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-874cd265ad89141dce295a7b09c893cd_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic3.zhimg.com/v2-fcf787d1ffb3ce939fe5374bd3174768_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-295d1b627630eeaf98317c94e52d255f_1440w.jpg)

![图片](https://pica.zhimg.com/v2-a82498953d7504709a4691e1e0c27256_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-5b5f6c5652825e21ed789c4124ebd2b3_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-b14df3c0b4b6ad9c9484bb536a023af7_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-f2a6b07a8128f04638490a0d5f26b466_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-874cd265ad89141dce295a7b09c893cd_l.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://pica.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/d066c9dc8f74ad38e564c359f8fb99cd_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-643d6ee743c81b471d1f31680c491123_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-57886daf6b7f1e9d95bb57f24a3bff08_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-6cee780b6ff73c59ba4c74a6ca764691_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-874cd265ad89141dce295a7b09c893cd_l.jpg?source=06d4cd63)

