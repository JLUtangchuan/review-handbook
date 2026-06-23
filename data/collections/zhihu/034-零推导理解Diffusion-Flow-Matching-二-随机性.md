---
title: "零推导理解Diffusion和Flow Matching（二）：随机性"
author: "王峰"
source_url: https://zhuanlan.zhihu.com/p/1947597090311090928
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 零推导理解Diffusion和Flow Matching（二）：随机性

> 作者: 王峰 | 来源: https://zhuanlan.zhihu.com/p/1947597090311090928

---

上一篇文章（零推导理解Diffusion和Flow Matching）中遗留了一个小尾巴：对于DDIM公式，我们只画了它的确定形式，把随机性那项给省略掉了：

x_{t-1}=\sqrt{\alpha_{t-1}}(\frac{x_t-\sqrt{\beta_t}\epsilon_t}{\sqrt{\alpha_t}})+\sqrt{\beta_{t-1}}\epsilon_\theta.

在DDIM原文中，有它的完整形式：

\bm{x}_{t-1} = \sqrt{\alpha_{t-1}} \underbrace{\left(\frac{\bm{x}_t - \sqrt{1 - \alpha_t} \epsilon_\theta^{(t)}(\bm{x}_t)}{\sqrt{\alpha_t}}\right)}_{\text{ predicted } \bm{x}_0 } + \sqrt{1 - \alpha_{t-1} - \sigma_t^2} \cdot \underbrace{\epsilon_\theta^{(t)}(\bm{x}_t)}_{\text{predicted noise}} + \underbrace{\sigma_t \epsilon_t}_{\text{random noise}}

可以看到，完整形式引入了一项新的噪声项： \sigma_t \epsilon_t ，它的标准差为 \sigma_t ，表示新引入的噪声幅度。当 \sigma_t = 0 时，这个公式就是DDIM确定性版本，当 \sigma_t = \sqrt{(1 - \alpha_{t-1}) / (1 - \alpha_t)} \sqrt{1 - \alpha_t / \alpha_{t-1}} 时，上边这个公式就变成了DDPM的采样公式。

在引入新的噪声之后，为了不影响当前步骤总的噪声强度，要在预测噪声的系数上减去对应的幅度，由于两个独立高斯分布之和的标准差为 \sqrt{\sigma_1^2+\sigma_2^2} ，所以减去的噪声幅度也要以平方差的形式来减，也就是上边公式里第二项的系数 \sqrt{1 - \alpha_{t-1} - \sigma_t^2} 。

那这个公式该怎么画呢？在上一张图中:

这就是上一篇文章的图

我们利用了随机噪声与其他向量几乎都垂直的特性，这次新引入的噪声 \epsilon_t 其实也一样，与前边两项都是垂直的：

三坐标轴上的圆弧太难画了，调整了半天

这张图也非常直观： \sqrt{1 - \alpha_{t-1} - \sigma_t^2} \cdot \epsilon_\theta + \sigma_t \epsilon_t 这两个噪声项前的系数是符合圆形公式的，所以也可以画成一个圆弧，其半径为 \sqrt{1 - \alpha_{t-1}} ，也就是采样后下一步的总噪声幅度。所以，引入随机性的DDIM采样器，就是在每一步采样之后，像上图一样“左跳右跳”一下，减少一下原始噪声幅度，增加一点新的噪声，但总的噪声幅度保持不变，这样就可以采样出具有多样性的样本了。

介绍完Diffusion，当然也不能少了Flow Matching，对于Flow Matching我们也可以画一副类似的图：

基本就是上边那张图的圆弧变直线

其实就只有斜着的圆弧变成斜线了而已，对于两个高斯噪声项，它们之间的关系仍然是圆形。

这张图对应的公式也非常简单：

\bm{x}_{t-\Delta t} = \left(1-(t-\Delta t)\right) \hat{\bm{x}}_0 + \sqrt{(t-\Delta t)^2 - \sigma_t^2}\hat{\bm{x}}_1+ \sigma_t\bm{\epsilon},

其中 \hat{\bm{x}}_0 和 \hat{\bm{x}}_1 是在每一步预测出来的样本和噪声，可以用当前网络的输入 \bm{x}_t 和网络的输出 \hat{\bm{v}} 来表示：

\hat{\bm{x}}_0 = \bm{x}_t - t\hat{\bm{v}},\ \ \hat{\bm{x}}_1 = \bm{x}_t + (1-t)\hat{\bm{v}}.

这俩公式的意思其实就是从当前位置沿斜线走到两端，从图上也很容易看出来。

至此，我们通过画图介绍了DDIM采样过程中引入随机性的方式，也将其推广到了Flow Matching上。并没有什么特别之处，仍然是圆圈变直线就搞定了。

下期预告：最近我在进行Diffusion-RL的研究，RL的第一步就是要能够采样到多样化的样本，这个带有随机性的Flow Matching采样公式也会在其中有重要作用，具体内容敬请期待下一篇文章。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a.jpg?source=88ceefae)

![图片](https://pic3.zhimg.com/v2-040169094c0f290250b053eccc21cb1a_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-5510205b9d029d4087f7084fc2093884_1440w.jpg)

![图片](https://picx.zhimg.com/v2-057336f367a32a28755b3ff3626db449_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-4a07bc69c4bb04444721f35b32125c75_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-d21a479efc1beccef3f4d0f109b4a203.webp)

![图片](https://picx.zhimg.com/e8301204e153afeacfb17835176347cd_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-3bb879be3497db9051c1953cdf98def6.png)

![图片](https://picx.zhimg.com/v2-a0b700190d6d0215c716cfb56d34ae5f_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/f9b62596cbdc1162483666249c0791c0_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-a0b700190d6d0215c716cfb56d34ae5f_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-9e2806e8eac8afd7111df65decce2a1c_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-0942128ebfe78f000e84339fbb745611.png)

