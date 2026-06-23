---
title: "Trajectory prediction中的uncertainty"
author: "Sakura"
source_url: https://zhuanlan.zhihu.com/p/18931072813
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Trajectory prediction中的uncertainty

> 作者: Sakura | 来源: https://zhuanlan.zhihu.com/p/18931072813

---

背景——为什么要用MDN作为轨迹解码器？

在诸多轨迹预测论文中，最终的轨迹解码器中均使用了MDN网络，即将未来轨迹参数化为拉普拉斯分布，模型最终输出的参数为拉普拉斯分布的尺度参数 \mu 及位置参数 b ；最终的回归损失基于该参数下的NLL

这种做法的论文有：

HiVT: Hierarchical Vector Transformer for Multi-Agent Motion Prediction

GATraj: A Graph- and Attention-based Multi-Agent Trajectory Prediction Model

A Fast and Map-Free Model for Trajectory Prediction in Traffics

Query-Centric Trajectory Prediction

相反的，也有不少研究中直接回归未来的轨迹点坐标，回归损失采用SmoothL1loss

论文有

ADAPT: Efficient Multi-Agent Trajectory Prediction with Adaptation

Efficient Motion Prediction: A Lightweight & Accurate Trajectory Prediction Model With Fast Training and Inference Speed

在自己的学习过程中，虽然发现了上述不同类型的解码器的应用，但并未对其有很深的认识及理解。

这两种方式背后的核心差距在于uncertainty

笔者认为对于uncertainty的学习可分为三个阶段：

承认uncertainty——>认识uncertainty——>利用uncertainty

承认Uncertainty

回答背景中的问题，一些研究直接将模型回归的数据作为预测轨迹，同轨迹真值计算SmoothL1loss，其实本质是没有承认/看到隐藏在轨迹真值的uncertainty；

数据集中的轨迹真值均是从真实的物理世界中采样的，必然是充满噪声的，这些噪声可能来自于传感器，后期的处理等等各方面。

因此，我们必须要承认uncertainty的存在！

思路1：将轨迹真值视为一个真实的点；用轨迹真值同预测值计算SmoothL1 loss

这种做法隐式地忽略了轨迹真值中的uncertainty；或者说，这种做法认为未来轨迹点的真值是真实的，无噪声的；这肯定是不切实际的；

思路2：将轨迹真值认为是以该点为均值的高斯分布

我们的模型并不直接预测这个点，而是预测这些分布的参数；根据这些分布的参数计算NLL；这种做法考虑了真值轨迹中的uncertainty；必然是更加贴近现实的

承认uncertainty的存在就会让模型的表现更好！下面的研究就是基于此思路

Producing and Leveraging Online Map Uncertainty in Trajectory Prediction——CVPR 2024

http://arxiv.org/abs/2403.16439

该研究的背景：该研究旨在将在线构图模块同下游轨迹预测模块更紧密地结合在一起；

一种做法是直接使用在线构图的结果作为轨迹预测中的高精度地图；

另一中做法是考虑在线构图模块输出结果的不确定性；不仅仅输出地图元素的坐标，同时输出不确定性；将两者同时作为下游轨迹预测模块的输入，实验证明这种做法相较于第一种做法更加优异！

做法1中只会将在线构图模块中构建的地图元素的坐标传递给下游；做法2中输出的结果为拉普拉斯分布的参数；其中尺度参数 b 就代表了uncertainty

以下是量化实验结果

考虑uncertainty不仅提高了下游预测模块的表现，同时极大提高了收敛速度！

认识Uncertainty

承认uncertainty之后，必须要充分认识uncertainty；换言之，知道uncertainty的存在后，应该去探究uncertainty的来源，有哪些因素影响uncertainty等等方面

参考资料

What Uncertainties Do We Need in Bayesian Deep Learning for Computer Vision?

https://arxiv.org/abs/1703.04977

https://zhuanlan.zhihu.com/p/110687124

https://zhuanlan.zhihu.com/p/166617220

数据不确定性和模型不确定性

根据What Uncertainties Do We Need 一文中的阐述，不确定性可以分为两种，

随机不确定度(也称数据不确定度)Aleatoric uncertainty(i.e. data uncertainty)

认知不确定度(也称模型不确定度)Epistemic uncertainty(i.e. model uncertainty)

我认为数据不确定性和模型不确定性的称谓更加利于理解

数据不确定性表明这种不确定性是来自于数据，如数据的label不够细致或物体在图像中过远过小导致

模型不确定性表明的是模型预测不好的地方；换句话说认知不确定性测量的，是我们的input data是否存在于已经见过的数据的分布之中（此句来自上述第二个网址）

下图就是不确定性的可视化；d和e分别为数据不确定性和模型不确定性（来自上述第三个网址）

模型不确定性可以通过增加数据降低

数据不确定性来自于数据中的噪声，无法通过增加数据解决

对于两种不确定性的建模

模型不确定性

图片来自于参考资料中的第三个网址

数据不确定性

图片来自参考资料中的第三个网址

图片来自于参考资料中的第三个网址

回到最开始的问题，在轨迹预测中使用MDN回归分布的参数并计算NLL，实际上就是用Probabilistic Deep learning的方式建模轨迹真值中数据不确定性

利用Uncertainty

承认与认识完uncertainty之后，最重要的是如何利用uncertainty；笔者重点关注于uncertainty在轨迹预测领域的应用

有以下几篇论文供参考

Entropy-Based Uncertainty Modeling for Trajectory Prediction in Autonomous Driving

http://arxiv.org/abs/2410.01628

Collaborative Uncertainty in Multi-Agent Trajectory Forecasting

http://arxiv.org/abs/2110.13947

Collaborative Uncertainty Benefits Multi-Agent Multi-Modal Trajectory Forecasting

https://ieeexplore.ieee.org/document/10173747

论文2及3是延续的工作并且为同一个课题组完成的工作，两者均为利用uncertainty提高模型的预测表现

论文1看的懵懵懂懂的，每个单词都认识组合成句子和段落之后不理解了

此文记录笔者对于uncertainty的认识历程，希望能够抛砖引玉；后续继续学习！


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-cd1104546c907b4f82309e3605dc2950_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic4.zhimg.com/v2-d825247512855b0c2128945e5ce20481_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-f194bd446810c0a109b60f5fb2ca2bfb_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-518bc3c239e03cabfe3f435202855620_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-e89dbe7b193866c4031e631a5774088d_1440w.jpg)

![图片](https://pica.zhimg.com/v2-c78a28e281bdf276c19d662d02bb2f18_1440w.jpg)

![图片](https://picx.zhimg.com/v2-f5e1d83bbb76dbc5a1c2a88766a4e557_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-009934965f285a888f12deed37b67ee6_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://pica.zhimg.com/v2-cd1104546c907b4f82309e3605dc2950_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://picx.zhimg.com/v2-2b0cb70251065a10ba75c128e80168fd_l.jpg?source=06d4cd63)

![图片](https://pic3.zhimg.com/v2-4e4870fc6e57bb76e7e5924375cb20b6.png)

![图片](https://pic1.zhimg.com/v2-cd1104546c907b4f82309e3605dc2950_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-694cac2ec9f3c63f774e723f77d8c840.png)

![图片](https://picx.zhimg.com/v2-ad51c305851af37317311ded4e2e5f71_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-cd1104546c907b4f82309e3605dc2950_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-c96dd18b15beb196b2daba95d26d9b1c.png)

![图片](https://picx.zhimg.com/v2-96f645ac91d92bee8c3c84c629b039c0_l.jpg?source=06d4cd63)

