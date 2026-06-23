---
title: "自动驾驶OccupancyNetwork 20230624前信息综述-4"
author: "Kong"
source_url: https://zhuanlan.zhihu.com/p/645177895
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 自动驾驶OccupancyNetwork 20230624前信息综述-4

> 作者: Kong | 来源: https://zhuanlan.zhihu.com/p/645177895

---

前言

这一篇讲一下CVPR Occupancy workshop中的前三名,这个前三名的做法就和上一篇学术界之前发表的论文很不一样了,之前的论文的主要核心在于如何在计算量层面将2D空间的特征转换到3D时尽量压缩,模型结构就主要核心区域不同.而这三篇却是有各种很不一样的操作在里面,我觉得还是挺牛的.

NVOCC(FB-OCC)

报告链接:

这篇文章主要分两个点来进行展开,一个点是网络结构的设计,另外一个点是他如何做模型的scale up(也就是做大做强,自chatgpt以来,大家都想做一下大模型).

我们先从网络结构开始,他的网络名称叫做FB-OCC,FB的含义是Forward-Backward.我们知道在bev检测中有两种常见的将图片特征转移到bev空间的方法,一种叫做LSS(利用在2D空间预测的深度来将2D特征放置到BEV空间),另外一种是attention(利用bev空间中的锚点反向来2D空间query特征.这篇文章中所说的Forward就是指LSS,Backward就是指attention,所以和别的paper不同的是他直接把两者给结合了.他的做法是

先使用LSS的方法来获得第一版3D空间的特征
将该特征压缩到2D BEV空间,作为attention的基础query
利用该query再进行一次attention,再获取一份BEV空间的特征
将两种特征结合起来

如图所示你会发现Forward的时候得到的是3D空间的特征,而Backward的时候却只是BEV空间的,这里可能还是考虑了计算量?(在Forward的过程中,他就没有之前那些paper做的一些操作了,直接就捅过去了)

在这个网络结构上使用R50作为backbone,性能如下

A: baseline
B: follow BEVDepth使用深度监督
C: 将camera mask(数据集中提供的表示在图像中看不到的区域)不进行学习
D: fix 一些严重的bug
E: 增加时序往前 16帧
F: 使用深度和语义分割预训练(这件事等会儿会在讲他如何扩展模型的时候展开讲)
G: 优化loss funtion,使用3D 空间的align,应该是讲多帧时序的时候,之前可能只是bev空间的align
H: 测试时数据增强

接下来我们来讲一下他对于模型尺寸的扩展,便于和上面的数字连得上一点,先看一下性能

模型扩大了20倍,效果提升了10个点还是立竿见影的,但是这个并不是简简单单就换个backbone就好了,作者为了能够扩大模型做了一些事情.

首先,作者发现扩大模型之后很容易就overfit了,因为nuscenes occupancy数据集一共训练集只有28K左右,为了避免overfit,他们就准备把backbone先用pertrain做到比较通用.

1. 他们使用了Object365开源数据集进行了语义分割的pretrain,但是这里存在domain gap,没有深度信息呀

2.使用nuscenes数据(除了occupancy数据,nuscenes还有别的图像帧可以用)进行pretrain,nuscenes可以用lidar生成深度,但是没有semantic

3.为了同时能够训练depth和semantic(感觉是为了和Occupancy中的backbone干一样的事情),他们就生成了nuscenes上的分割结果,如何生成呢,使用Segment Anything. Segment Anything不是可以通过prompt来生成分割结果吗,对于nuscenes数据集,对于运动障碍物,他们利用标注的检测框来作为prompt,对于非物体,使用lidar 语义分割中取一些点来作为prompt,由此生成了GT

4.然后就可以联合训练了

虽然讲了,但是让人比较难受的是没有将说之前overfit是怎样的情况,增加pretrain之后的提升如何之类的,导致好像看懂了,但是好像有点不够.

这篇技术报告的核心就是说首先网络上LSS和attention可以一起用,这个说实话我之前没有太想过,确实是有点傻了,咋这都没想....,其次是好的pretrain和大模型还是有显著收益的,也是现在很多业界在跟进的内容,紧跟潮流.

42dot(MiLO)

报告链接:

这篇文章的基础模型来自于BEVDET4D-OCC,这是一个开源的模型(这里我想为作者打个广告,我不认识这个作者(或者说他不认识我),但我觉得他的工作真的很好很强,能够一直持续不断的更新workspace follow前沿,有机会想交个朋友,GitHub - HuangJunJie2017/BEVDet: Official code base of the BEVDet series .),这个模型基本已经包含了Occupancy的所有骨架,他采用的是LSS的方案,将bev空间放到3D空间,然后进行一些3D卷积,最后接head.

这篇文章在他的基础上额外增加了一些内容,我们可以直接对着表和他的网络结构来谈.

表中的baseline就不谈了

semantic表示网络图中的左上角部分,他增加了一个图像空间的语义分割监督,这个监督信号是由LidarSeg生成的,且只学这些点,这样就为图像提供了一个更短路径的监督.
loss表示类别平衡,因为在occupancy中其实很大的区域都是可形式区域或者空,而像bicycle之类的就很少(他们的比例可能有10000倍),于是他们增加了class balanced loss,具体公式我就不在这里展开了(他引用了一篇别的论文,我这边主要也是讲概念,如果想要真的实现还是推荐大家去读原文哈)
Arch&ASPP就不展开了,就是对网络做了一些基础的拓展,没有什么架构上的变化
High-Res表示高分辨率,Longterm表示用更多历史帧(5帧,相比于上一篇的16帧有点不够给力呀)
pseudo,这个是他的另外一个特点,他先训练一个模型,然后使用inference结果(高置信度)作为监督,然后原文中说为了避免overfit,他们还学习了测试数据的伪camera mask,然后最后训练了一个epoch.这里我稍微质疑一下,意思是说把测试集给inference了来学吗?虽然是没有GT,但这也稍微有那么一点不太好吧,可以说是确实把数据用到极致了.
Localization: 这个又是一个非常精细化的trick,一般来说大家的模型训练完,就会根据这个voxel的上各个类别(包括free类)的得分,选个最高的赋上去,而作者发现说因为是通过视觉检测的,小物体在远处经常因为深度不准导致出一大片,把mIOU都拉下去了,如下图中红色部分,那么怎么来缓解一下这个问题呢,那就对远处的小物体阈值卡高一点,要是不到阈值就算free,这个算是一个后处理吧
TTA: 测试时数据增强

通过上述的trick,把性能做上来了拿到了第二名,这篇文章相比于上一篇感觉是两个体系,这一篇把能用的性能用到了极致,告诉我们不一定要有大的突破,积少成多也就可以了.(但是对于用了测试集与否还是有点耿耿于怀)

UniOcc

报告链接:

这篇文章相比于上面两篇更加特别一点,他引入了两个新的组件用于训练(他的baseline也是BEVDET-OCC,也就是上一篇中提到的作者开源的内容,不然选择的开源模型略有不同,他选择的是BEVSTEREO-OCC.对于baseline就不展开了,大家可以去上一篇中给的链接里面找).

他引入的两个新的组件分别是NeRF监督和DTS(Depth-aware Teacher Student Framework).我们先来看NeRF的,概念.说道NeRF如果有的朋友印象深刻的话可能记得在Tesla的PPT中其实也引入了NeRF辅助进行监督,这篇文章的方法就是类似的.

我们看一下他的网络结构图,对于上面部分就是基础的Occupancy相关的网络部分,有差别的是别的网络都是把free当作一类加入到semantic类别中用一个head一起学,最后看哪个类得分高,这个voxel就属于哪个类别.而他为了引入NeRF,将head分成了两个部分,分别是density和semantic,类似于nerf中的density和rgb.他不是直接学习rgb,而是学习semantic(可以理解,semantic的语义更加高级更加稳定更加不容易受到图像质量/天气的影响,比如下雨啥的).

然后除了正常的监督以外,会通过渲染的方式进行NeRF层面的学习,NeRF的核心是对一条射线进行采样,然后将采样点的密度和rgb组合起来渲染出这条射线的颜色.他其实也是构造了一些射线,然后对这些射线渲染的semantic进行学习,不过他额外还引入了深度的学习,有点像DSNeRF.标准的NeRF是通过输入坐标和角度来获取对应点的density和rgb,他是直接在已经生成好的空间中获取,比较像是Plenoxel的做法.

那么接下来就是说学习的这些射线是怎么来的了,在NeRF中是要有一些已经知道位姿的摄像头,然后根据像素进行采样得到射线的.而这篇的作者是通过对历史帧和当前帧的图像中的射线进行采样的(这些图像是知道相机位姿的),以及为了得到深度的监督,他还做了一个约束,就是他只用lidar能打到的点形成的射线进行约束,以及因为图像上没有semantic,所以他选择的是lidarseg的作为semantic的label,通过这个方式引入NeRF,其实就是又丰富了他的监督,因此性能就可以有所提升.

以及他发现只用NeRF进行监督也可以得到很好的性能

第二个概念是DTS,引入这个结构其实是为了很好的利用上nuscenes中大量的没有标注的帧

Teacher Model是Student Model的EMA的结果,然后student model一方面对于有label的data会有正常的训练,另外一方面对于没有label的data,Teacher模型会先inference出来一个结果作为pseudo label给student学习,为了让student模型学习的pseudo label的质量更好,在Teacher模型利用深度投影到3D空间的时候会把深度GT放进去,也就是右下角的内容,可以认为对于有深度GT的点,Teacher模型放的深度会更好,所以叫做Depth-aware Teacher model,通过引入这个的方式将更多的数据引入学习也提升了性能.(stronger setting就是分辨率更高,网络更大,就不展开了)

对比于上两篇文章,这一篇还是挺别出心裁的,通过引入NeRF进行学习,还对比了不使用Occupancy的情况,这一点可能是未来节约标注资源的一大重点呀,occupancy真的挺吃标注资源的,而且还不好标注.我比较看好.

结语

到这里为止,这个系列基本上终于写的告一段落了,把自己觉得看到的该写的内容都写了一下.上面的三篇技术我觉得真的是各有各的特点,第一篇展现了大模型,预训练模型的力量(谁让他是nvidia呢),第二篇是精细化极致调优(日本朋友确实细),第三篇是引入了NeRF(业界对Tesla方法的追逐).


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/e83288ce84340f04a9870769861263a5_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic4.zhimg.com/v2-72105b20fe551b9b16e9bb46471b1edf_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-eb611197bd7740bd0884056a5985955d_1440w.jpg)

![图片](https://picx.zhimg.com/v2-d0489a9962a834ca409577a216359bdf_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-30febf33ca97128372bb98ff1b572c9e_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-34e8d4a8886196a61cb1ef684f71a190_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-45d4e7b5f3beb733a7dfa28879544dcc_1440w.jpg)

![图片](https://picx.zhimg.com/v2-1351f1b2d94c2d73e0fc919608272af7_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-f8279217b70f13c53e73bb30af7016f2_1440w.jpg)

![图片](https://pica.zhimg.com/v2-5c20383497019beec4b4c1b360451a48_1440w.jpg)

![图片](https://picx.zhimg.com/v2-d76ef02a6c137e60c7f0d26f6942b51d_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-dbb70fc13b7181c2291c06f34f7665c1_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-a8eae7d8ec4bf9db72ddff893f3cfb00_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-0575a15c8e2d8c75c6c9c6ce5d6b8892_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-123e365ed8e8f224dfd48778c40d04ba_1440w.jpg)

![图片](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/e83288ce84340f04a9870769861263a5_l.jpg?source=172ae18b)

![图片](https://pic1.zhimg.com/v2-f8a2e0ef60b8ecd0d4ca68a39939fd7c.webp?source=7e7ef6e2&needBackground=1)

![图片](https://pic4.zhimg.com/v2-e8953a94a8f82bdc95a10a2d51a14800.webp)

