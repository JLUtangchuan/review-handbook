---
title: "一文搞懂Flow matching(Reflow),Consistency model,Meanflow,Shortcut model的关系"
author: "MachThink"
source_url: https://zhuanlan.zhihu.com/p/1912650149282447445
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 一文搞懂Flow matching(Reflow),Consistency model,Meanflow,Shortcut model的关系

> 作者: MachThink | 来源: https://zhuanlan.zhihu.com/p/1912650149282447445

---

视频版放在

首先理一下，Flow matching相比于传统Diffusion模型提出什么新框架

Yang Song在Score-Based Generative Modeling through Stochastic Differential Equations提出以下扩散模型的反向ODE形式 dx=[f(x,t)-\frac{1}{2}g^2(t)\nabla_xlog\ p_t(x)]dt

表示x分布随时间的变换，学习目标是那个分数函数 \nabla_xlog\ p_t(x) ，相当于学那个噪声。

Flow Matching: 假设 x_1 服从噪声分布， x_0 服从数据分布，构建 x_1\to x_0 的变换

\frac{d x_t}{dt}=v_{\theta}(x_t,t)

从学噪声变成直接学等号右边的东西，速度场!

将t看成时间， x_t 看成位移， \frac{dx_t}{dt} 为瞬时速度，对瞬时速度场建模

学出 v_{\theta}(x_t,t) 后就可以求积分来得到 x_1\to x_0 的变换

x_1=x_0+\int_{0}^{1}v_{\theta}(x_t,t)dt




我们希望一步生成，只需要 v_{\theta}(x_t,t) 是个常数，一个简单的想法就是从 x_1\to x_0 走匀速直线运动

即简单的线性插值: x_t=(1-t)x_0+tx_1 ,则 \frac{d x_t}{dt}=x_1-x_0=v_{\theta}(x_t,t)

据上式为目标构造速度场学习Loss

E_{t,x_0,x_1}\| v_{\theta}(x_t,t)-(x_1-x_0)\|^2

以上是Flow matching常用的线性插值思路和学习方法

但这里并不知道 x_0,x_1 如何正确配对(随机配对), 因此如果 v_{\theta}(x_t,t),\forall x_t,t 学成 \overline{x_1}-\overline{x_0} 怎么办?

不会！虽然由于随机配对学出的确实是marginal flow(对同一 x_t 处不同 v 的平均),但有约束条件

x_t=(1-t)x_0+tx_1 ，即不是所有 (x_0,x_1) 配对都会经过 x_t ,可以类比电荷形成电场的思路来理解

Remark:1)本质上还是学的一个平均场，不可能像想的那么直，一步生成

2)它会比较直，会找比较近的路线传输(类比电场线的形成,速度类比电场力，两者均和距离相关)

还不够直! 1步生成 FID不能看。原因 x_0,x_1 随机配对，导致不够直.

Reflow! 再做一次。

先训练一次网络，然后用已知 x_1 预测 x_0 ,得到配对好的 x_0,x_1 ,再训练一次新网络，如此循环，轨迹越来越直，可以一步生成

也可以直接蒸馏出一个一步模型

\min_{\theta} E\|v_{\theta}(x_1,1)-(x_1-x_0)\|^2

Reflow配对 \to 一步蒸馏

Consistency model.

Noise schedule略有不同， x_t=x_0+tx_1

\min E\|f_{\theta}(x_1,1)-x_0\|

不行，否则 f_{\theta}(x_1,1)=E(x_0), 得分段预测，利用 x_t=x_0+tx_1 的约束条件形成场

这里假设边界条件 f_{\theta}(x_0,0)=x_0

\|f_{\theta}(x_1,1)-x_0\| 被上界约束，上界足够小，则其也小

相当于让 f_{\theta}(x_0,0)=x_0 ，然后之后不同t时刻的 f_{\theta}(x_t,t) 之间都足够接近，那么最后的 f_{\theta}(x_1,1)\approx x_0

我们思考一下Diffusion loss 也可直接预测原图 x_0 ，有什么区别

\frac{1}{n}\sum_{x_t,t}\|f_{\theta}(x_t,t)-x_0\| ，平均意义下逼近 x_0 ,无法控制上式的上界

Reflow可以看成一种蒸馏方法

Consistency model 蒸馏 + 自训练都可以

CT:

CD：

这样做的理由也很简单，如果有了预训练好的扩散模型，那么我们就没必要在直线 x_t=x_0+tx_1

上找学习目标了，因为这是人为定义的，终究有交叉的风险，而是改为由预训练好扩散模型来预测轨迹

CD蒸馏好处:相比于Reflow蒸馏构建 (x_0,x_1) ,这里只需调用单步的teacher model

Meanflow 真正一步到位，效果接近多步sota

跟Reflow一样， z_t=(1-t)x_0+t \varepsilon , \frac{dz_t}{dt}=v(z_t,t)=\varepsilon-x_0

之前学瞬时速度场，现在直接学积分(平均速度场)

定义:平均速度场 ：

积分不方便处理，两边对t求导

v(z_t,t)=\varepsilon-x_0 已知，等号左边看成目标，右边看成约束

训练:

采样:

直接训练，无需蒸馏, x_0,x_1 随机配对

同时达成以下效果: 能够单目标从零训练，不需要对抗、蒸馏等额外手段；单步生成接近SOTA，可以通过增加步数提升效果

某种程度，只对瞬时速度场加了一个修正项， r=t 退化成flow matching,相当有flow matching在兜底

Shortcut model

为了一步生成，将步长d加入预测函数

如果让 d\to 0, 那么训练目标就退化为瞬时速度场(Flow matching)

如果有参数d,直接采样: x_0=x_1+s(x_1,1,1)*1

本质上和meanflow训练目标一样，d=t-r,都是在学那个平均速度场，不过shortcut model训练时没想到可以积分两边求导处理的思路

而转而利用了上面这个更好处理的隐含约束条件，来构造loss中的正则约束项

与Meanflow的区别:利用隐式约束条件，而非直接拟合平均速度场

联系:都是拟合平均速度场，都可以看成对原来flow matching的loss加了一些正则。

，端到端训练，有点类似于都不需要蒸馏flow matching之后再做蒸馏，不过将两个loss耦合起来

Consistency Models
ONE STEP DIFFUSION VIA SHORTCUT MODELS
Mean Flows for One-step Generative Modeling
X. Liu, C. Gong, Q. Liu. Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow. ICLR2023, arXiv:2209.03003
Song Y, Sohl-Dickstein J, Kingma D P, et al. Score-Based Generative Modeling through Stochastic Differential Equations. International Conference on Learning Representations.
苏剑林. (Dec. 18, 2024). 《生成扩散模型漫谈（二十八）：分步理解一致性模型 》[Blog post]. Retrieved fromhttps://kexue.fm/archives/10633
苏剑林. (May. 26, 2025). 《生成扩散模型漫谈（三十）：从瞬时速度到平均速度 》[Blog post]. Retrieved fromhttps://kexue.fm/archives/10958


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-ca70172fe286684736c369d5dd2c48ca_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic3.zhimg.com/v2-c71beb27ddf203c28beb629b2d1d2272_1440w.jpg)

![图片](https://picx.zhimg.com/v2-b4f6d67f9400542e2b2bd4ffa7099ad3_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-ad802fcc21e09599ac6d71d3a1820766_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c06a2cce3da43b08cf17da0b5c52ad13_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-d34d376998a0f7e9a18fe755714d2b90_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-7913a5d34db0296564deb846a54d77cc_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-4c938ccb9e760631c3757b14fa478a3b_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-0a1f44908764612c0b3f900fb173ce94_1440w.jpg)

![图片](https://picx.zhimg.com/v2-abc91feb0f3e2d8c88e31c0d296f4529_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-1c5a629667eb051678d5e523e6c4258f_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-b792ebe03c52d54b9f02fe43a620f38c_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-f95e52a24c73586c7bce0dce246a7a98_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-0e299472fb6c2bceeaa4a1fa28f24693_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-dcffa2b9a4cc8b6886ab64f56c9e36f7_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-9fe3b8e0351dfacc09226c6bd57cb02e_1440w.jpg)

![图片](https://pica.zhimg.com/v2-1d2b1dbe37fce8520dc1026b8d183cf2_1440w.jpg)

![图片](https://picx.zhimg.com/v2-ac4d153a373cf7869f4419c160ae736b_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

