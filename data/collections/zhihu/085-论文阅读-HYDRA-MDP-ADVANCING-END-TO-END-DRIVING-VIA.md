---
title: "论文阅读：HYDRA-MDP++: ADVANCING END-TO-END DRIVING VIA EXPERT-GUIDED HYDRA-DISTILLATION"
author: "Malignus"
source_url: https://zhuanlan.zhihu.com/p/21030385239
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 论文阅读：HYDRA-MDP++: ADVANCING END-TO-END DRIVING VIA EXPERT-GUIDED HYDRA-DISTILLATION

> 作者: Malignus | 来源: https://zhuanlan.zhihu.com/p/21030385239

---

各位大佬蛇年愉快，在这里首先预祝各位大佬新的一年指标涨点多多，论文投递顺利。bug少少，上线顺利，量化不掉点，回灌无问题~

Hydra-MDP与Hydra-MDP++的工作上整体是非常一致的，我个人读下来感觉++的版本故事写的更清楚，整体的format也整理的比较清晰，故以此为基准，整理论文内容和个人理解于此，还望大佬们多交流多沟通。

Methods
hydra-mdp++论文框架
Transfuser整体框架

1. 感知网络


在Hydra-MDP中感知网络沿用了Transfuser这篇工作的整体设计，即通过Lidar的Backbone&图像特征的backbone，通过共同输入至Transformer，编码后的特征与原特征相加作为中融合的过程，得到作者提到的env-tokens，作为perception head的输入，进行BEV下的车道线和障碍物检测。Hydra-MDP++去掉了lidar branch，而是修改为基于时序的history token&当前帧的图像token。感觉感知网络整体设计的较为简单，这也不是本篇工作的重点。

2. 轨迹解码


作者参照VAD v2的做法，构建了一个固定的的轨迹预测词典（也可理解为轨迹树）： 通过在nuplan中采样70w条轨迹，通过k-means聚类得到轨迹树。每一条轨迹40帧(4s)构建得到。整体的轨迹Transformer中由编码器和解码器两部分组成，其中：

编码器： $$V_{k}^{'}=Transformer(Q, K, V=mlp(V_{k}))+E$$ , 其中， $${E}$$ 为自车状态量， $$V_{k}$$ 是对自车轨迹进行编码得到的query。
解码器 $$V_{k}^{''}=Transformer(Q=V_{k}^{'}, K, V=F_{env})$$ , 基于自注意力学习后的自车轨迹，与周边环境特征进行cross-attention, 得到自车轨迹与周边环境interaction后的特征 $$V_{k}^{''}$$




关于整体的imitation_loss, 不再是基于轨迹树中最大预测概率的结果进行直接的L1/L2 imitation loss, 而是提出了一个基于距离的交叉熵损失函数：


L_{im} = - \sum\limits_{i=1}^{k} y_{i}log(S_{i}^{im})， y_{i}=\frac{e^{-({\hat{T}}-T_{i})^2}}{{\sum_{j=1}^{k}}e^{-(\hat{T}-T_{j})^{2}}} 其中， $$y_{i}$$ 基于当前预测轨迹和模态i的轨迹误差，计算得到的softmax概率， $$S_{i}^{im}$$ 是第 $$i$$ 个轨迹树对应的softmax score。即如果当前预测轨迹与轨迹树对应，其softmax score越高，对应的log值无限趋近于0， $$y_i$$ 无限趋近于1。而如果预测轨迹与轨迹树对应模态的距离远，则对应 $$y_i$$ 无限趋近于0， $$S_{i}^{im}$$ 对应值趋近于1.




3. 多目标知识蒸馏


对于不确定性的轨迹预测任务，单纯用imitation loss学出的轨迹不够好，在闭环测试中，会出现碰撞&驶出可行驶区域等情况。因此，模型需要通过对轨迹树的多模态学习类人的score打分。$$L_{kd} = -\sum_{m,i}\hat{\cal S}^m_i \log {\cal S}^m_i + (1 - \hat{\cal S}^m_i) \log (1 - {\cal S}^m_i)$$

其中，$$\hat{S}^{m}_{i}$$为轨迹i在评分系统m下对应真值的score。$$S_{i}^{m}$$为通过多头预测头，预测的轨迹i在评分系统m下的预测的score。基于一阶导和二阶导的推导，可知loss在$$\hat{S}_{i}^{m}==S_{i}^{m}$$时，loss最小。

个人理解，即模型不应该只关注最接近真值的轨迹树中对应模态的该条轨迹，其余的轨迹加对应offset其实也可以学习出该轨迹结果。模型最终对于轨迹树中每个模态的score预测，可以更好的反映出模型对于整体不确定的建模能力。




4. Inference+后处理


简单介绍下nuplan中的五个评分系统：


NC(No at-fault Collisions):表示在规划过程中，自动驾驶车辆没有发生因自身原因导致的碰撞的次数
DAC(Drivable Area Compliance)：表示自动驾驶车辆的行驶轨迹是否符合可行驶区域的要求，即是否始终在允许的道路区域内行驶。
TTC(Time to Collision)：表示自动驾驶车辆与潜在碰撞目标之间的预计碰撞时间，用于评估安全性。
C(Comfort)： 表示自动驾驶车辆的行驶舒适性，通常通过加速度、减速度和转向的平滑程度来衡量
EP(Ego Progress)：表示自动驾驶车辆在规划路径上的进展程度，通常用于评估车辆是否按预期前进。




$$\hat{f}(T_i, O) = - \left( w_1 \log S_i^{im} + w_2 \log S_i^{NO} + w_3 \log S_i^{DAC} + w_4 \log (5S_i^{TTC} + 2S_i^C + 5S_i^{EP}) \right)$$ 其中，作者提到在整体的cost计算过程中，loss通过四部分超参控制，最终计算下，0.01 ≤ w1 ≤ 0.1, 0.1 ≤ w2, w3 ≤ 1, 1 ≤ w4 ≤ 10。这意味着imitation loss整体在loss的占比相对较小，即规则化的score学习重要性大于imitation loss学习的重要性。（但本身如果模型的上限或评分本身就是基于闭环的这套仿真系统去搞的，这其实也正常。？）




5. 拓展的Rule-Based Teacher


hydra-mdp原本的教师行为仅包括nuplan中的5个评分系统，但是在NAVSIM上不够，作者额外提出了四部分。


交通灯遵守情况：如果自车在未来的时刻内会闯红灯，则认为不遵守交通灯
驾驶方向遵守情况：自车在未来时刻驾驶的方向差与对应自车所在车道中心线的方向差是否在一定的yaw角偏差内，若偏差较大，则认为未尊重驾驶方向一致性。
车道保持能力：评估车辆在车道横向偏差限制τD内保持行驶的能力。该子评分反映了车辆在导航过程中有效保持其预定路径的能力。在每个时间步i，通过计算自车（xi, yi）与附近车道段vj之间的最小垂直距离di来判断车道保持能力。
扩展舒适性：加速度、加加速度（jerk）、横摆角速度和横摆角加速度方面的差异与阈值的差别。如果满足阈值范围内，则对应舒适性高。







Experiment

整体实验指标对比




HydraMDP的这套方案，证明了backbone增加，对于模型的效果是有效的，指标上来看重点提升EP，即自车的运动是按照预期行进的，这个也是整体对模型来说学习更难的内容。




感知任务对于模型学习是起不到一点作用的。
时序建模也基本没用，虽然他说对于其中一个指标帮助有一些，但对于整体指标提升来讲，可以说帮助非常小。
在infer阶段加入权重对于指标提升帮助明显。
Thinking

在整体的实现上，会发现其实hydra-mdp与DTPP的工作有类似，又有不同。hydra-mdp对于imitation loss的学习定义也不是说要去学一个几乎完全一致的轨迹，而是基于已有的更大的轨迹vocabulary，找到其中最相似的轨迹树作为学习的目标。不同的点在于DTPP充分利用已有的建图信息实时构建轨迹树，而Hydra-MDP的方案则是基于大规模的已有轨迹固定下来了整体轨迹树。

另外一方面，就是关于score打分的学习，充分让模型学习这一整套nuplan&NAVSIM的rule-based方案中的方案，再来对轨迹树进行整体的剪枝。

额外需要注意的是，在论文中作者提到，感知任务对于模型学习完全无提升。以及imitation loss的权重占比较小，意味着模型其实更关注rule-based的规则化学习，而不是大规模数据下的模仿学习部分。这套Format的是否合理，这里还是浅浅的打个问号。


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-5c8fda69a1c96a56bb8ae6d8e49cbb60_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/v2-6fbb143cd73f8c9a8b402eaad350230e_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-7df479a6e3fb96991bfee93ce63266a1_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-db4ca886b9e7159c91c19ed36dc3370e_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-29d05aff87f4e163f2c0cc9df3c4cced_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

![图片](https://picx.zhimg.com/v2-5361ff5b3442cf554c82564b17ef576f_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-5c8fda69a1c96a56bb8ae6d8e49cbb60_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-e223b8e2f6477221a15012d77ba83a65_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-5c8fda69a1c96a56bb8ae6d8e49cbb60_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-b62e608e405aeb33cd52830218f561ea.png)

![图片](https://picx.zhimg.com/v2-b54ea64574737aaf06ccf00775d7cb2c_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-989fbc5200a2c0dc3c4e03a2915e8b5e_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-cc03843432783d14974d50ff78806ba5_250x0.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-1b067f998ae954aaa1af3a98192e3dd7_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-885f4aa1f8c416db1a36c522c2fe4e46_250x0.jpg?source=172ae18b)

