---
title: "Sparse4D，以一文带你了解稀疏的BEV感知"
author: "Malignus"
source_url: https://zhuanlan.zhihu.com/p/15362624581
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Sparse4D，以一文带你了解稀疏的BEV感知

> 作者: Malignus | 来源: https://zhuanlan.zhihu.com/p/15362624581

---

许久没有更新了，自从开始工作以后愈发的困在了Corner Case和各种各样的琐事，闲言少叙，这篇文章将用尽可能简洁的语言，帮助各位大佬了解地平线的Sparse 4D系列工作。（PS：对于Sparse4D中，不同帧间的信息不再依赖各自帧内的ego2global部分就不做介绍了，大佬工作的代码写的很清晰，有这样一个概念即可~）

Summary
环视障碍物的检测，将不依赖显式的稠密BEV特征进行学习。
基于K-Means的初始化Anchor, 让模型拥有更快的收敛速度，且Query的可解释性更好
引入去噪过程，模型可更快收敛。
考虑3D检测特点，引入质量估计
以检测结果为基础，可出Tracking结果，不依赖BEV下的多目标追踪后处理
Methods

接下来，我们将分开两部分介绍模型结构部分；分开两部分的原因，是因为Denoising并不影响整体模型训练的pipeline，拆开两部分，可更好帮助各位大佬理解整体工作。

介绍模型整体的forward流程，包括Loss的设计
介绍Denoising的使用
Overall Pipeline

一言以蔽之：模型将基于query_based的instance_feature和anchor，进行整体的稀疏BEV感知；图像特征将不进行显式的深度信息编码，模型基于anchor的中心点，通过offset的学习，将图像特征引入至instance_feature。

接下来将基于开源的代码，进行尽可能简短的模型forward pipeline介绍。




instance_feature和anchor起始存储于instance_bank内。anchor( [N_{query}, 11])的初始化，是基于GT的kmeans计算得到。对应的11维信息： [x,y,z,l,w,h,sin_{yaw},cos_{yaw},v_x,v_y,state] . 其中, 所有anchor的速度为0，yaw角为0，最后一维信息可不关注，仅与denoise相关。模型在训练过程中，anchor会伴随着模型的学习更新。但在每一个iter的forward开始，instance_bank内取到的初始化当前帧instance_feature都是全0（即instance_feature永远依赖于当前图像特征的提取，和后续的注意力计算）。
在通过Transformer进行forward过程中，operation主要包括：deformable, ffn, norm, refine, temp_interaction, interaction在内的六部分。其中，ffn, norm很好理解，重点介绍deformable, refine, temp_interaction, interaction四部分。

模型整体包括两类decoder：

单帧decoder: deformable+FFN+Norm+Refine
多帧decoder: temp_interaction+interaction+norm+deformable+ffn+norm+Refine

其中，Deformable模块负责将图像特征引入;Refine模块负责基于instance_feature获取感知结果;temp_interaction负责对当前帧特征信息与历史特征信息进行融合; interaction负责将当前帧特征进行自注意力计算。




deformable(图像特征引入)：前面提到，Sparse4D中，模型将不在学习稠密的显式BEV特征。图像特征的使用主要依赖该module。该模块的作用，是将图像特征基于anchor和采样点，对instance_feature进行更新（即引入图像特征）。

deformable依赖的输入包括instance_feature, anchor, anchor_embed, feature_maps与projection_mat. 最终输出的结果将用于更新instance_feature.

instance_feature $$[B, N_{query}, 256]$$ : 当前帧的instance feature, 模型在每一轮forward时，第一次进入deformable中的instance_feature结果都是全0，是通过若干次调用deformable module的过程中，图像特征的不断引入堆叠才得到最终的instance_feature.
anchor $$[B, N_{query}, 11]$$ : 当前帧的anchor，即可能会存在于当前帧的框体的位置和对应大小的预设。
anchor_embed $$[B, N_{query}, 256]$$ : 当前帧anchor对应的position_embedding。
feature_maps(List, len= $$B$$ , [N_{cams}, 256, \frac{16}{H}, \frac{16}{W}] ): 基于Batch_idx下的图像特征（为方便理解，先用single-level的feature map）。
projection_mat $$([B, N_{cams}, 4, 4])$$ : 对应ego2img的转换矩阵。
图像特征引入模块的forward流程五步走：
获取key_points $$[B, N_{query}, N_{pts},3]$$ : 基于anchor_embed求解anchor中心点的对应位置偏移量，与anchor相加后得到key_points。此处的 $$N_{pts}$$ 指代的是anchor中心点对应采样在图像中采样点的个数，论文中 $$N_{pts}=8$$ .
获取多尺度图像特征采样的权重weights $$[B, N_{query}, N_{cams}\times N_{pts}, N_{groups}]$$ ：对已有的instance_feature分别引入框体的位置编码信息(anchor_embed)和相机参数的编码信息(基于ego2img的全连接层进行的编码信息). 并通过全连接层和softmax层，以及15%的随机掩码，得到weights。论文中 $$N_{pts}=8,N_{groups}=8$$ （ N_{groups} 的引入理解为multi-head attention就好）。
获取采样后的图像特征features $$[B, N_{query}, N_{cams}\times N_{pts}, 256]$$ : 基于ego2img, 将key_points的点投影到图像特征中的归一化位置(在[0, 1]位置内)。通过grid_sample采样每个key_points在图像上的对应特征。对于采样点经ego2img投影后不在图像范围内的情况，对应features为0。
将特征与weights进行加权融合, 得到features $$[B, N_{query}, N_{pts}]$$ ：feature基于weights进行加权， $$N_{groups}$$ 用于对图像本身的embedding维度进行group划分，最终结果通过 $$N_{cams} \& N_{pts}$$ 的sum，构成features。
引入图像特征的instance_feature将与原特征concat，得到最终instance_feature。

2. refine(基于instance_feature和anchor，基于全连接层得到感知结果)：


整体输入依赖instance_feature, anchor与anchor_embed，最终的输出结果包括：经过refine后的anchor $$[B, N_{query}, 11]$$ ，对应anchor的类别分类 $$[B, N_{query}, N_{cls}]$$ ，质量分析(quality) $$[B, N_{query}, 2]$$ (值范围在[0,1]区间内)
refine模块流程三步走：

基于已有instance_feature和对应的anchor位置编码信息相加, 得到instance_feature
instance_feature通过全连接层得到anchor的偏移量，相加后更新anchor。
quality, cls全连接层得到对应的质量结果和分类结果。

3. temp_interaction(基于当前帧特征和历史特征，进行交叉注意力学习)：输入包括instance_feature(当前帧特征 $$[B, N_{query}, 256]$$ ), temp_instance_feature(历史帧特征 $$[B, N_{query}^{history},256]$$ ), 对应的位置编码信息anchor_embed&temp_anchor_embed。

4. interatcion(基于当前帧特征，进行自注意力学习)：输入包括instance_feature(当前帧特征 $$[B, N_{query}, 256]$$ )。对应位置编码信息anchor_embed

历史特征(temp_instance_feature)，历史anchor(temp_anchor)及当前帧anchor、当前帧特征的获取(get)，是从instance_bank内获取，在Det_head每一轮forward的起始去做，获取的过程中，会基于历史特征和当前帧特征的时间间隔，进行mask判断；历史帧的anchor会基于ego2global信息进行基础的运动补偿，统一至当前帧下。
基于历史特征，历史anchor和当前帧的anchor，当前帧的特征及对应confidence对当前帧特征和anchor的更新，是在模型经过单帧decoder forward后进行的，是通过concat当前帧的top $$N_{query}^{now}$$ 与历史帧的 $$N_{query}^{history}$$ 得到。即instance_feature在基于采样点引入对应图像特征后，选取对应topk的当前帧特征，与历史帧特征融合，作为新的instance_feature&anchor，随后进行多帧decoder的forward。
基于完整forward后instance_feature, anchor及对应的confidence，对instance_bank内的特征进行更新。选择confidence最高的top $$N_{query}^{history}$$ 作为新的历史特征(temp_instance_feature)和历史anchor(temp_anchor)。
Loss

Loss部分将仅针对Quality部分进行讲解

cns_target: 预测与真值在x,y,z上面的l2距离误差:dist，最小值为0，最大值为无穷，所对应的 $$e^{-dist}$$ ,值域为(0, 1].即误差越大，对应值越接近0。
yns_target: 预测与真值在sin(yaw)和cos(yaw)的余弦相似度，若相似度大于0，yns_target为1.0，反之为0。反映的是预测与真值在yaw角的预测上是否可保证是在同一方向上。
模型输出的cns和yns与对应target进行loss计算，其中cns用交叉熵损失计算，yns用高斯focal loss计算

个人理解，该部分的loss学习，本质上是强调模型对于目标障碍物的中心点（特别是深度）和yaw角的预测，因为本质上对于图像进行3D检测的ill-posed问题，yaw角和深度的预测就是最关键，最难的问题。（个人也有一些瞎想，即现有的learning-based prediction&planning, 也在强调在一味的模仿学习基础上，要学习人类的判别逻辑/或提供奖励函数等等；此处的quality是否也可作此理解呢？）

Denoising

一言以蔽之：Denoising中在loss计算部分，与正常anchor的loss计算一摸一样；Denoising的作用，在于绕过了匈牙利匹配，在去噪的过程中，直接优化检测头。李峰：[CVPR 2022 Oral]DN-DETR: 去噪训练加速DETR收敛 评论区大佬的这个解释让我茅塞顿开

其实detection任务可以类比成image domain到box domain的机器翻译问题。自然语言的翻译问题通常需要在两种语言上都有预训练才能work的比较好。ImageNet预训练的backbone使得我们有了很好的image domain预训练模型，但box domain我们是没有预训练模型的，只能利用image-box pair在训练过程中强行拟合。本文利用GT生成的noisy query更像是在box domain构造了一个自监督task，有效地缓解了box domain没有预训练模型的问题。类似思路在Pix2seq中也有体现。
Denoising部分只在训练过程中引入，并不会影响模型的infer阶段
获取denoising的相关信息，

最终得到的输出包括：

dn_anchor $$[B, N_{dn}^{groups} \times N_{gt}^{dn} \times 2, 10]$$ (加了噪声的anchor输入)
dn_reg_target [B, N_{dn}^{groups} \times N_{gt}^{dn} \times 2, 10](对应的无噪声anchor的结果，其中所有的negative噪声和batch_idx数量不到最大max denoising GT的对应样本，其reg_target应该是全0)
dn_cls_target $$[B, N_{dn}^{groups} \times N_{gt}^{dn} \times 2]$$ (对应的无噪声cls_gt，对于batch_idx数量取不到max denoising GT进行补零的样本, cls_target值为-1；对于negative噪声的样本，对应的cls_target值为-3)，
dn_attn_mask $$[N_{dn}^{groups} \times N_{gt}^{dn} \times 2, N_{dn}^{groups} \times N_{gt}^{dn} \times 2]$$ (对应样本的attention_mask， 同一个group内，样本与样本mask为False，不同group间，样本和样本的mask为True)
valid_mask $$[B, N_{dn}^{groups} \times N_{gt}^{dn} \times 2]$$ (样本的valid_mask，对于batch_idx数量取不到max denoising GT进行补零的样本，valid_mask为False，其余均为True，在该过程中，不考虑本身加的noise是positive还是negative。)




Forward pipeline

设置了max denoising GT=24，如果当前batch_idx下的GT中周边障碍物数量大于该数量，则取前24个，否则取全量的GT。获取的GT信息包括分类信息和对应的框体信息(x,y,z,l,w,h,yaw,vx,vy)。
统计当前batch_size中最多的GT数量，上限为max denoising_GT的数量。
对cls_target和box_target中，batch_idx中不足最大GT数量的样本进行补齐。其中，cls_target补-1， box_target进行对应的全零补齐。
基于num_dn_groups，对已有的cls_target和box_target进行copy, box_target: $$[B, N_{gt}^{dn}, 10]$$ -> $$[B \times N_{dn}^{groups}, N_{gt}^{dn}, 10]$$ ，cls_target $$[B, N_{gt}^{dn}]$$ -> $$[B \times N_{dn}^{groups}, N_{gt}^{dn}]$$
对于box_target进行noise设置，首先初始化值域在 $$[-1, 1]$$ 噪声信息，并基于 $$scale_{x,y,z}=2，scale_{others}=0.5$$ 进行噪声放缩。并与box_target相加后，得到dn_anchor。dn_anchor本质上是box_target引入噪声信息后得到的结果。
类似e中操作，进行negative的噪声设置，negative的噪声初始化值域在 $$[-2, -1]\cup [1,2 ]$$ .随后与box_target相加，并与dn_anchor进行concat。此时, dn_anchor( $$[B \times N_{dn}^{groups}, N_{gt}^{dn} \times 2, 10]$$ )中的前 $$N_{gt}^{dn}$$ 为positive noise，值域在 $$[-1, 1]$$ , 后 $$N_{gt}^{dn}$$ 为negative noise，值域在 $$[-2, -1]\cup [1,2 ]$$ ，二者的区分取决于与box_target的相似度。
求解box_cost，对应得到每一个加入噪声后的dn_anchor, 其去噪后最接近的box_target。
基于box_cost得到的匈牙利匹配结果，构建dn_box_target和dn_cls_target。其中，positive的部分由于添加的噪声较小，对应的target就是GT的cls_target和box_target，而negative部分，对应的box_target为全0，cls_target为全部-3。
将相关输出进行reshape，从 $$[B \times N_{dn}^{groups}, N_{gt}^{dn} \times 2, ...]$$ -> $$[B ,N_{dn}^{groups} \times N_{gt}^{dn} \times 2, ...]$$ 。
构建valid_mask, 判断denoising的目标GT是否可见。由于denoising由pos+neg两部分组成，而只有batch_idx内，本身GT数量不足，进行当前Batch最大GT补齐的样本(即cls_target == -1)被认为是非valid，且不考虑加的noise是positive还是negative。
构建attn_mask, 在同一个group内的 $$N_{gt}^{dn}$$ 元素内，对应的attn_mask全False，其余为True
原有的anchor中包括的11维的输入，其中最后一维本身是没用的，可能是作为dn_anchor和anchor的区分位置
dn_anchor补齐最后一维的shape，最后一个remain_state_dim为0。并与anchor进行concat。此时的anchor_shape，为 $$[B,N]$$
构建attn_mask, 在计算自注意力机制时，对不同的query之间的attention进行mask。最终的目的，在于正常的query进行进行self_attention时，不会看到各个group的denoising query信息（防止GT信息泄漏）。同时各个denoising query在进行self_attention计算时，也不会看到正常的query和其他group的query信息（防止one-to-one的assignment，变成了n to one）。此处的信息泄露，是指denoising_query中的信息，是在GT基础上加小幅度扰动得到的，把近乎百分之百准确的投影点投回到图像中拿的query肯定很准，用这样的信息给原有的query看到属于泄题，会完全影响模型学习。
Thinking

个人在初次读完Sparse4D的系列工作，第一感觉是好屌，而且代码的工程量开发好大。但后续再阅读了DAB-DETR，DN-DETR和DINO在内的三篇工作后，发现Sparse4D的系列工作更多是踩在巨人的肩膀上，进一步完善了环视障碍物的BEV检测任务。在这里也推荐作者本人在知乎进行的论文分享~李峰：DINO: 让目标检测拥抱Transformer 李峰：[CVPR 2022 Oral]DN-DETR: 去噪训练加速DETR收敛

有一些美中不足的地方和可能可以去改进的点，一方面在于，由于没有显式的深度信息学习，导致基于anchor的中心及对应offset往回投影学习图像特征时，无法考虑到目标车辆部分被前车遮挡的情况。能想到的一些解决思路，是通过GT提供分割结果，一定程度上约束图像特征投影点学的是统一的instance。

碎碎念

由于自己的懒惰，导致大半年的时间长期没有进行认真系统的论文阅读。在读Sparse4D的工作时，需要结合开源的代码逐行阅读，一点一点厘清思路。但当最近系统化的再次阅读了DETR系列的相关工作，会发现Sparse4D更多的是站在了巨人的肩膀上，将BEV障碍物检测的性能再次拔高了一个台阶。

年底了，在这里也立个小flag，尽量保证至少两周一次的更新频率维护我的论文分享，也希望各位大佬不吝指正赐教。个人能力有限，很多分享难免会有纰漏，也欢迎各位大佬进行指正


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-5c8fda69a1c96a56bb8ae6d8e49cbb60_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic4.zhimg.com/v2-fe72a4beed98f2f4a6c52e6258ff05ed.webp)

![图片](https://picx.zhimg.com/v2-7584621022f9f4261d5cbddbe25b89d2_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-5c8fda69a1c96a56bb8ae6d8e49cbb60_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-06fd9be883edc28b48e929bd2353ddde_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-067eb7e89acf9a5e24f5974617993bf8_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-3adc144ae87ce687895ccda6f0414161_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-fa40ec95a40c10a05293a848e7e7444a_250x0.jpg?source=172ae18b)

