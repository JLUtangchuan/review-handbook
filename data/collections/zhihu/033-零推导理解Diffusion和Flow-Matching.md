---
title: "零推导理解Diffusion和Flow Matching"
author: "王峰"
source_url: https://zhuanlan.zhihu.com/p/11228697012
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 零推导理解Diffusion和Flow Matching

> 作者: 王峰 | 来源: https://zhuanlan.zhihu.com/p/11228697012

---

一、前言

相信点进来看这篇文章的读者都对这两个算法有所耳闻，它们正是如今大红大紫的AI生成图像、生成视频所使用的方法。而且很多人可能跟我一样，接触初期也曾尝试过去阅读、理解、推导它们的公式，比如看苏神的生成扩散模型系列（生成扩散模型漫谈（一）：DDPM = 拆楼 + 建楼），结果读着读着就从入门到放弃了...

这主要是因为这俩算法的公式实在太多了，对习惯了看一个流程图就了解一篇论文的CVer来说实在是太困难。本文为了照顾懒散惯了的CVer，我决定除了最终loss，不写一个多余的公式，争取做到零推导还能帮助大家建立对这两个算法的直观印象，破除大家的恐惧，下面我们开始。

二、DDPM与DDIM

这两个也就是最常见的Diffusion的算法了，一个用于训练，一个用于测试。

其中DDPM的公式相信大家也看过不少次了，下面贴出来：

x_t=\sqrt{\alpha_t}x_0+\sqrt{\beta_t}\epsilon, \\ \beta_t=1-\alpha_t,

其中 x_0是原始图像， \epsilon 是随机噪声， \alpha_t 和 \beta_t 是根据采样器采出来的一组数字，x_t 是加噪后的图像，也就是网络的输入。网络的输出也很简单，就是噪声 \epsilon。

这公式是什么意思呢？口述不太好讲，直接上图：

Diffusion训练过程

这里把 x_0 和 \epsilon 画成正交的了，其实在高维空间中随机采一个噪声，几乎就是会与另一个向量正交的，所以这么画没什么毛病。注意到 \sqrt{\alpha_t}^2 + \sqrt{\beta_t}^2=1，这就是个圆形公式，所以 x_t 恰好就是在上图的圆弧上进行采样的。这里可能有人会说那x_0 和 \epsilon 不一样长怎么办啊？其实也就是正圆变椭圆而已，并不影响后面的结论。

所以总结一下：DDPM的训练过程，就是从圆弧上采样一个 x_t，带上 t 这个参数，经过一个很大的网络，预测噪声 \epsilon（也就是横轴），就这么简单。

说完训练我们再来说说测试，测试的时候大家都知道的，随机生成一个噪声，然后一步一步去噪最终得到 x_0，怎么去噪呢？最直观的理解当然就是怎么加的噪声就怎么去除，加噪时我们是沿弧线采样，那反过头来去噪也应该是沿弧线走。这里原始的DDPM要走高达1000步，并没有人真的把网络推理1000次，而是用DDIM加速这个过程，自己定义走多少步：

DDIM沿弧线从噪声恢复原图

那这其中每一步是怎么走的呢？这里我们也是省去所有推导，直接上DDIM公式（确定性版本，令方差为0）：

x_{t-1}=\sqrt{\alpha_{t-1}}(\frac{x_t-\sqrt{\beta_t}\epsilon_t}{\sqrt{\alpha_t}})+\sqrt{\beta_{t-1}}\epsilon_t,

这里大部分符号都跟上边一样，但注意到这里的 \epsilon 变成了 \epsilon_t，它代表在t时刻网络预测出来的那个 \epsilon，不是加噪的时候加的那个噪声了。

这个公式是什么意思呢？同样我们也画一个图：

DDIM推理过程

这一步我们的目标是从 x_t 走到 x_{t-1}，本身 x_{t-1} 是有表达式的，但因为此时 x_0 是未知的不能用，所以我们得绕一圈。首先我们获得红色虚箭头的表达式：x_t-\sqrt{\beta_t}\epsilon_t ，然后注意到绿箭头与红箭头长度之比为 \sqrt{\alpha_{t-1}}:\sqrt{\alpha_t}，所以绿色虚箭头的表达式为： \frac{\sqrt{\alpha_{t-1}}}{\sqrt{\alpha_t}}(x_t-\sqrt{\beta_t}\epsilon_t)，这恰好与DDIM公式的第一项相同，它代表纵轴坐标。而横坐标轴 \sqrt{\beta_{t-1}}\epsilon本身就不包含 x_0 ，所以可以直接用，两项加在一起就跟上边DDIM 的 x_{t-1} 公式一模一样了，是不是非常清晰直观呢？其实并没有什么弯弯绕绕，把图画出来，本来需要大篇幅推导的DDIM公式就被我们轻松得到了。

三、Flow Matching

我们趁热打铁，顺便把Flow Matching也讲了，首先上公式：

x_t = (1-t)x_0 + tx_1,

注意我们修改了Rectified Flow里的定义，为了与Diffusion一致，我们令 x_0代表真实图像， x_1 代表噪声。这个公式就非常简单了，就是一个线性插值：

Flow Matching训练过程

这里不再像DDPM一样是走圆弧，改走直线了。回归目标也有所不同，不再是回归噪声，而是 v = x_1 - x_0，其实就是图上那根斜线，也非常直观。

至于Inference过程，因为不再走圆弧改走斜线，公式也简单得令人发指：

x_{t-\Delta t} = x_{t} - v_t\Delta_t ,

其实都不用解释，\Delta_t 就是两个时间间隔，乘上预测的 v_t 就是要走多远。画图也特别简单，我都懒得多画辅助线了：

Flow Matching推理过程

可以看到，Flow Matching比DDPM和DDIM容易理解得多也直观得多，但本质上没有太大差别，走圆弧与走直线的差别可能就跟 L2 loss和 L1 loss差不多，都是类似的目的，效果上也不会有什么太大差别。现在大家都说Flow Matching效果好，但也说不出什么所以然，大概就是人看起来简单，网络学起来也能简单一些吧。（走直线是不是能少走几步？）

四、后记

本文在没有用一个公式推导的情况下，通过小学二年级水平的平面几何介绍了Diffusion和Flow Matching两大算法。希望能给对公式有恐惧的同学一些帮助，有了这些直观印象，相信再回过头去推导公式也会更加轻松。

转载请向我私信申请，转载时请带上我的名字。

下期：本文中的DDIM为确定性形式，下期将介绍在过程中加噪的形式（也即DDIM的SDE版本）：零推导理解Diffusion和Flow Matching（二）：随机性 。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://picx.zhimg.com/v2-2162b8371f7f55f02c35b62212d63a43_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-ccb47a2f4e854c2143c336998c1d7f2b_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-09b04edd5aacf6886a9420c9d0886df9_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-f256c124f6e41a5458967750cfb3eb93_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-d3cf59eee50bde590d298e21a4f55622_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://pic1.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-6558ca50578916708daa98779d79d86f_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

![图片](https://pic4.zhimg.com/v2-3bb879be3497db9051c1953cdf98def6.png)

![图片](https://pic1.zhimg.com/v2-c7c78dbbc7171e5364fb22a7b5be79f5_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-5c9b7521eb16507c9d2f747f3a32a813.png)

