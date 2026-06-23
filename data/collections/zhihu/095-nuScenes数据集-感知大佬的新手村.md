---
title: "nuScenes数据集: 感知大佬的新手村"
author: "forward"
source_url: https://zhuanlan.zhihu.com/p/5421536116
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# nuScenes数据集: 感知大佬的新手村

> 作者: forward | 来源: https://zhuanlan.zhihu.com/p/5421536116

---

无论是在某个算法领域深耕多年的行业巨擘，还是正在新手村嗷嗷待哺的0级冒险家，当他跨行学习新算法时，直接看内部是不对的，应该先研究它的输入和输出，先宏观再微观，快速排序，动态规划，递归分解，循环递进，由浅入深，才能深入浅出，黑箱变白箱。倘若一口吃个胖子，消化不良还好，就怕因噎废食，始乱终弃。知识的深度让大佬登峰造极收获鲜花和掌声固然令人向往，但知识的广度才是小白安身立命的本钱，顺序错了，就怕是钻牛角尖走火入魔。所以新手村第一个boss：先熟练学会配环境跑demo，然后是理解数据流转。

nuScenes数据集是很多BEV感知的常见数据集，是很多e2e/大模型/感知新手梦开始的地方。而且如果我们想用自己的数据训练开源模型，比起重写DataLoader,把我们的数据改成nuScenes数据集格式会更简单。这一篇我总结一下nuScenes数据集的个人学习笔记，欢迎评论区批评指正，转载请私信。

传感器

在他们的官方简介里，他说他们纯手工臻选了1000个scenes，每个scene有20s的数据，包含23个object classes，3D bounding boxes为2Hz，2*20*1000=40k个关键帧。传感器为6 cameras, 1 LIDAR, 5 RADAR, GPS, IMU。lidarseg会对每个关键帧的所有lidar点标记label(32种)。

下面这个传感器布置图对于SLAM领域的大佬们，尤其是外参标定的大佬们而言，就非常熟悉了。每一帧的位姿，都是车体ego系在w系下表示的，即T_world_ego，每个传感器的外参都是各自坐标系相对于ego系的表示，即T_ego_sensor。任意传感器之间的相对外参就可以获得：T_sensor2_sensor1 = (T_ego_sensor2)^-1 * T_ego_sensor1。

逻辑结构
scene

场景。官网提供的流程图对于新手而言可谓是剪不断理还乱，好在他们提供了官方demo帮我们理解，是不是没看懂这个图家人们，没关系，我们先跳过这个图，接下来跟着我走不迷路。

所有数据(结构)都有一个token，可以理解为全局唯一的id或者指针，所以凡是出现token的地方，都是指的是某个数据的指针，而不是数据本身。这个数据集最大的逻辑结构是scene，一个scene持续20s包含大概40个sample，每一个sample用我们SLAM的话说就是keyframe。在官方演示里，它打印了v1.0-mini的第一个scene：

{'token': 'cc8c0bf57f984915a77078b10eb33198',
 'log_token': '7e25a2c8ea1f41c5b0da1e69ecfa71a2',
 'nbr_samples': 39,
 'first_sample_token': 'ca9a282c9e77460f8360f564131a8af5',
 'last_sample_token': 'ed5fc18c31904f96a8f0dbb99ff069c0',
 'name': 'scene-0061',
 'description': 'Parked truck, construction, intersection, turn left, following a van'}

所以站在数据结构的角度看，scene是一个包含4个指针的结构体，或者用python的话来说是字典，分别是自身的指针，log指针，下属第一个和最后一个sample的指针。

log

日志。这个就不解释了吧，就需要注意一点，一个log可能会涉及多个scenes的信息。

{'token': '7e25a2c8ea1f41c5b0da1e69ecfa71a2',
 'logfile': 'n015-2018-07-24-11-22-45+0800',
 'vehicle': 'n015',
 'date_captured': '2018-07-24',
 'location': 'singapore-onenorth',
 'map_token': '53992ee3023e5494b90c316c183be829'}
map

俯视图。它是俯视2D图，包含类别，自己的指针，文件路径，相关的log指针。

{'category': 'semantic_prior',
 'token': '53992ee3023e5494b90c316c183be829',
 'filename': 'maps/53992ee3023e5494b90c316c183be829.png',
 'log_tokens': ['0986cb758b1d43fdaa051ab23d45582b',...],
 'mask': <nuscenes.utils.map_mask.MapMask at 0x7fa24b926150>}
sample

关键帧。在搞懂了scene的含义后，sample的意思也就明朗了：它也是一个包含若干指针的结构体，分别自身指针，下一帧指针，所属scene的指针，当前帧时刻的各个传感器数据的指针，和各个标注数据的指针。

{'token': 'ca9a282c9e77460f8360f564131a8af5',
 'timestamp': 1532402927647951,
 'prev': '',
 'next': '39586f9d59004284a7114a68825e8eec',
 'scene_token': 'cc8c0bf57f984915a77078b10eb33198',
 'data': {'RADAR_FRONT': '37091c75b9704e0daa829ba56dfa0906',
 'RADAR_FRONT_LEFT': '11946c1461d14016a322916157da3c7d',
 'RADAR_FRONT_RIGHT': '491209956ee3435a9ec173dad3aaf58b',
 'RADAR_BACK_LEFT': '312aa38d0e3e4f01b3124c523e6f9776',
 'RADAR_BACK_RIGHT': '07b30d5eb6104e79be58eadf94382bc1',
 'LIDAR_TOP': '9d9bf11fb0e144c8b446d54a8a00184f',
 'CAM_FRONT': 'e3d495d4ac534d54b321f50006683844',
 'CAM_FRONT_RIGHT': 'aac7867ebf4f446395d29fbd60b63b3b',
 'CAM_BACK_RIGHT': '79dbb4460a6b40f49f9c150cb118247e',
 'CAM_BACK': '03bea5763f0f4722933508d5999c5fd8',
 'CAM_BACK_LEFT': '43893a033f9c46d4a51b5e08a67a1eb7',
 'CAM_FRONT_LEFT': 'fe5422747a7d4268a4b07fc396707b23'},
 'anns': ['ef63a697930c4b20a6b9791f423351da',...]}
sample_data

帧数据。以图片数据为例，它包含：自身指针，所属的关键帧指针，该时刻位姿指针，该传感器外参指针，时间戳，图片信息，图片路径，上一图片数据指针和下一图片数据指针。

{'token': 'e3d495d4ac534d54b321f50006683844',
 'sample_token': 'ca9a282c9e77460f8360f564131a8af5',
 'ego_pose_token': 'e3d495d4ac534d54b321f50006683844',
 'calibrated_sensor_token': '1d31c729b073425e8e0202c5c6e66ee1',
 'timestamp': 1532402927612460,
 'fileformat': 'jpg',
 'is_key_frame': True,
 'height': 900,
 'width': 1600,
 'filename': 'samples/CAM_FRONT/n015-2018-07-24-11-22-45+0800__CAM_FRONT__1532402927612460.jpg',
 'prev': '',
 'next': '68e8e98cf7b0487baa139df808641db7',
 'sensor_modality': 'camera',
 'channel': 'CAM_FRONT'}
ego_pose

位姿。这是SLAMer最熟的内容了，某一时刻车体在世界坐标系下的位姿：T_world_ego，它的数量和sample_data完全一样且一一对应。

{'token': '5ace90b379af485b9dcb1584b01e7212',
 'timestamp': 1532402927814384,
 'rotation': [0.5731787718287827,
 -0.0015811634307974854,
 0.013859363182046986,
 -0.8193116095230444],
 'translation': [410.77878632230204, 1179.4673290964536, 0.0]}
sensor

传感器。1 x LIDAR, 5 x RADAR, 6 x cameras，它记录了每一个传感器的指针，channel和种类。

[{'token': '725903f5b62f56118f4094b46a4470d8',
 'channel': 'CAM_FRONT',
 'modality': 'camera'},
 {'token': 'ce89d4f3050b5892b33b3d328c5e82a3',
 'channel': 'CAM_BACK',
 'modality': 'camera'},
 {'token': 'a89643a5de885c6486df2232dc954da2',
 'channel': 'CAM_BACK_LEFT',
 'modality': 'camera'},
 {'token': 'ec4b5d41840a509984f7ec36419d4c09',
 'channel': 'CAM_FRONT_LEFT',
 'modality': 'camera'},
 {'token': '2f7ad058f1ac5557bf321c7543758f43',
 'channel': 'CAM_FRONT_RIGHT',
 'modality': 'camera'},
 {'token': 'ca7dba2ec9f95951bbe67246f7f2c3f7',
 'channel': 'CAM_BACK_RIGHT',
 'modality': 'camera'},
 {'token': 'dc8b396651c05aedbb9cdaae573bb567',
 'channel': 'LIDAR_TOP',
 'modality': 'lidar'},
 {'token': '47fcd48f71d75e0da5c8c1704a9bfe0a',
 'channel': 'RADAR_FRONT',
 'modality': 'radar'},
 {'token': '232a6c4dc628532e81de1c57120876e9',
 'channel': 'RADAR_FRONT_RIGHT',
 'modality': 'radar'},
 {'token': '1f69f87a4e175e5ba1d03e2e6d9bcd27',
 'channel': 'RADAR_FRONT_LEFT',
 'modality': 'radar'},
 {'token': 'df2d5b8be7be55cca33c8c92384f2266',
 'channel': 'RADAR_BACK_LEFT',
 'modality': 'radar'},
 {'token': '5c29dee2f70b528a817110173c2e71b9',
 'channel': 'RADAR_BACK_RIGHT',
 'modality': 'radar'}]
calibrated_sensor

外参。包括自身指针，所属sensor的指针，外参数据，相机内参(若有)。这个外参是将该传该器坐标系转到车体坐标系的相对变换：T_ego_sensor。

{'token': 'f4d2a6c281f34a7eb8bb033d82321f79',
 'sensor_token': '47fcd48f71d75e0da5c8c1704a9bfe0a',
 'translation': [3.412, 0.0, 0.5],
 'rotation': [0.9999984769132877, 0.0, 0.0, 0.0017453283658983088],
 'camera_intrinsic': []}
sample_annotation

标注。它是一个个3D框的标注数据，包含：自身指针，所属的关键帧指针，被它框住的实例instance的指针，visibility标签，attribute指针，w系的位姿，尺寸，上一标注数据指针，下一标注数据指针，范围内lidar点和radar点数量，分类名称。

{'token': '83d881a6b3d94ef3a3bc3b585cc514f8',
 'sample_token': 'ca9a282c9e77460f8360f564131a8af5',
 'instance_token': 'e91afa15647c4c4994f19aeb302c7179',
 'visibility_token': '4',
 'attribute_tokens': ['58aa28b1c2a54dc88e169808c07331e3'],
 'translation': [409.989, 1164.099, 1.623],
 'size': [2.877, 10.201, 3.595],
 'rotation': [-0.5828819500503033, 0.0, 0.0, 0.812556848660791],
 'prev': '',
 'next': 'f3721bdfd7ee4fd2a4f94874286df471',
 'num_lidar_pts': 495,
 'num_radar_pts': 13,
 'category_name': 'vehicle.truck'}
visibility

可见度。他指某个annotation在图片中可见的程度。

[{'description': 'visibility of whole object is between 0 and 40%',
 'token': '1',
 'level': 'v0-40'},
 {'description': 'visibility of whole object is between 40 and 60%',
 'token': '2',
 'level': 'v40-60'},
 {'description': 'visibility of whole object is between 60 and 80%',
 'token': '3',
 'level': 'v60-80'},
 {'description': 'visibility of whole object is between 80 and 100%',
 'token': '4',
 'level': 'v80-100'}]
instance

实例。是需要被感知模块监测到的物体，例如车辆或行人，一个instance包含：自身指针，分类指针，标注数量，第一个标注的指针和最后一个标注的指针。

{'token': '9cba9cd8af85487fb010652c90d845b5',
 'category_token': 'fedb11688db84088883945752e480c2c',
 'nbr_annotations': 16,
 'first_annotation_token': '77afa772cb4a4e5c8a5a53f2019bdba0',
 'last_annotation_token': '6fed6d902e5e487abb7444f62e1a2341'}
category

类别。它描述了一个instance所属的类别。一个instance可能有多个annotation，一个instance只属于一个category。

{'token': '653f7efbb9514ce7b81d44070d6208c1',
 'name': 'movable_object.barrier',
 'description': 'Temporary road barrier placed in the scene in order to redirect traffic. Commonly used at construction sites. This includes concrete barrier, metal barrier and water barrier. No fences.',
 'index': 9}

官方举了几个例子，意思是说category是instance不会发生变化的那些属性，比如说一个instance是大人，他不会变成小孩。

Category stats for split v1.0-mini:
human.pedestrian.adult      n= 4765, width= 0.68±0.11, len= 0.73±0.17, height= 1.76±0.12, lw_aspect= 1.08±0.23
human.pedestrian.child      n=   46, width= 0.46±0.08, len= 0.45±0.09, height= 1.37±0.06, lw_aspect= 0.97±0.05
human.pedestrian.constructi n=  193, width= 0.69±0.07, len= 0.74±0.12, height= 1.78±0.05, lw_aspect= 1.07±0.16
human.pedestrian.personal_m n=   25, width= 0.83±0.00, len= 1.28±0.00, height= 1.87±0.00, lw_aspect= 1.55±0.00
human.pedestrian.police_off n=   11, width= 0.59±0.00, len= 0.47±0.00, height= 1.81±0.00, lw_aspect= 0.80±0.00
movable_object.barrier      n= 2323, width= 2.32±0.49, len= 0.61±0.11, height= 1.06±0.10, lw_aspect= 0.28±0.09
movable_object.debris       n=   13, width= 0.43±0.00, len= 1.43±0.00, height= 0.46±0.00, lw_aspect= 3.35±0.00
movable_object.pushable_pul n=   82, width= 0.51±0.06, len= 0.79±0.10, height= 1.04±0.20, lw_aspect= 1.55±0.18
movable_object.trafficcone  n= 1378, width= 0.47±0.14, len= 0.45±0.07, height= 0.78±0.13, lw_aspect= 0.99±0.12
static_object.bicycle_rack  n=   54, width= 2.67±1.46, len=10.09±6.19, height= 1.40±0.00, lw_aspect= 5.97±4.02
vehicle.bicycle             n=  243, width= 0.64±0.12, len= 1.82±0.14, height= 1.39±0.34, lw_aspect= 2.94±0.41
vehicle.bus.bendy           n=   57, width= 2.83±0.09, len= 9.23±0.33, height= 3.32±0.07, lw_aspect= 3.27±0.22
vehicle.bus.rigid           n=  353, width= 2.95±0.26, len=11.46±1.79, height= 3.80±0.62, lw_aspect= 3.88±0.57
vehicle.car                 n= 7619, width= 1.92±0.16, len= 4.62±0.36, height= 1.69±0.21, lw_aspect= 2.41±0.18
vehicle.construction        n=  196, width= 2.58±0.35, len= 5.57±1.57, height= 2.38±0.33, lw_aspect= 2.18±0.62
vehicle.motorcycle          n=  471, width= 0.68±0.21, len= 1.95±0.38, height= 1.47±0.20, lw_aspect= 3.00±0.62
vehicle.trailer             n=   60, width= 2.28±0.08, len=10.14±5.69, height= 3.71±0.27, lw_aspect= 4.37±2.41
vehicle.truck               n=  649, width= 2.35±0.34, len= 6.50±1.56, height= 2.62±0.68, lw_aspect= 2.75±0.37
attribute

属性。它描述了一个instance所属的属性。和category不同的是，一个instance在不同sample里的attribute会发生变化，比如说一个人在这一帧里是躺平的，下一帧可能就在跑路。官方也举了几个例子：

cycle.with_rider: 305
cycle.without_rider: 434
pedestrian.moving: 3875
pedestrian.sitting_lying_down: 111
pedestrian.standing: 1029
vehicle.moving: 2715
vehicle.parked: 4674
vehicle.stopped: 1545
小结

你会发现nuscence数据集的逻辑结构完全体现了我们学习《数据结构》的内容，不同类别的数据之间是通过双向指针连接的图结构，具有时序关系的同一类别的数据之间是通过双向指针连接的链表结构。在搞懂了nuscence数据集的逻辑以后，现在，我们再回过头来看开头官方提供的流程图，这里同时提供了我总结的流程图供参考：

顺便再总结一下nuscence数据集各个数据之间的关系，一切都清晰明朗起来：

nuscenes数据集包含多个场景scene，因为scene之间相互独立所以可以用数组管理。在一个scene里有大概40个关键帧sample，由于sample之间是有时间先后关系的，所以scene只记录它包含的首尾sample，sample之间由双向指针依次连接。对于一个关键帧sample，它有成员变量data，它是一个字典，包含了6*cam，1*lidar，5*Radar的帧数据sample_data。一个sample_data是某个channel传感器在当前时间戳下的数据，它包括当前时刻的位姿ego_pose，帧数据存储路径，和对应传感器外参calibrated_sensor。calibrated_sensor包含对应传感器信息sensor，虽然sensor和sample_data之间没有指针连接，但sample_data可以通过channel找到对应的sensor。sample除了拥有sample_data，还有anns，它存储了不同实例instance在当前sample上的标注/观测annotation，对于某一sample而言annotation之间没有先后关系，所以anns是annotation的数组，由于某个annotation可能出现在图片边缘，所以还需要记录它在图片中的完整度visibility。对于一个实例instance而言，它的种类category是唯一的(在这一帧里是人就不可能在别的帧变成狗)，但是它的属性attribute可能会在不同关键帧sample下的观测annotation里发生变化(这一帧躺平下一帧可能卷起来)，所以attribute跟着annotation走。对于一个instance而言，它的观测annotation的数量是知道的，并且annotation之间有时间先后，所以instance会记录它的首尾annotation，annotation之间由双向指针连接。一个log会记录一个map和一个scene，但是一个map可能会出现在多个log里。

nuscene数据集是若干个场景scene的集合；
1个scene包含约40个有时间先后关系的关键帧sample(20s*2Hz=40)；
1个sample包含该时刻12个传感器的帧数据sample_data和其观测到的若干个标注数据annotation；
1个sample_data包括它的位姿，外参和帧数据对应的文件路径；
1个annotation是一个实例instance在当前帧上的一个观测，对应一个属性值attribute；
1个instance可能被不同sample观测且状态变化(位置移动/躺着变成趴着)，所以它有多个annotation和attribute，但只有1个类别category(人不会变成狗)；
如何拿数据？

利用官方提供的python API，可以从文件数据集中拿到想要的东西，首先是加载：

from nuscenes.nuscenes import NuScenes
nusc = NuScenes(version='v1.0-mini', dataroot='/data/sets/nuscenes', verbose=True)

如果想到要某个任意数据(的字典)，套路都是一样的，从nusc.get()拿，第一个参数是该数据的类别，第二个数据是该类别下，你想要的数据的指针，例如，我想从sample_annotation拿到指针为'ef63a697930c4b20a6b9791f423351da'的那个数据，则输入：

XX = nusc.get('sample_annotation', 'ef63a697930c4b20a6b9791f423351da')

当然了，这个API还有很多高级用法，但是都不重要，也都不用记，用的时候肯定是有base代码的，直接看该代码是怎么用的就可以了。

文件结构

在搞懂了逻辑结构，它的经纬脉络也就呼之欲出且索然无味了。下载v1.0-mini并打开，共有4个文件夹。

map文件夹保存了2D俯视图，按照token进行命名。

samples和sweeps保存的都是传感器的帧数据，并且下一级目录都是一样按照channel命名，区别在于samples只保存了关键帧对应的帧数据，而sweeps保存了所有帧数据。

比较关键的是v1.0-mini，它保存了上面刚刚讲的不同数据之间的逻辑关系，这也是nusc = NuScenes(version='v1.0-mini', dataroot='/data/sets/nuscenes', verbose=True)会加载到电脑内存里的内容。索引内容内存不大，可以加载到内存里去，各个帧数据内存很大，只在被需要的时候根据路径加载，阅后即焚。这个路径下会保存很多json，和上面讲的逻辑结构内容几乎完全一致，各位大佬打开一看就能马上明白，这里就不重复了。唯一让我感到费解的就是calibrated_sensor.json，按道理说里面的元素数量应该和sensor.json的数量一样(12个)，为啥里面那么多，而且有很多重复的数据，有没有懂的大佬，我提前献上卑微的膝盖。我猜可能的原因是同一个scene里面的那些sample_data可能是由不同的采集车采的，所以迫不得已每一个sample_data都得配一个外参。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-aa02d1ba27a57a5e24685bfffd4f985e_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图片](https://pic4.zhimg.com/v2-30180ff016fe359bd026aaae3c0995df_b.jpg)

![图片](https://pic4.zhimg.com/v2-fa8e7b17c65620d42c582153ff8ffbe5_b.jpg)

![图片](https://pic1.zhimg.com/v2-e6b76ceeb9661384eca0b9690d68fc5e_1440w.jpg)

![图片](https://pica.zhimg.com/v2-6af1a9141ff7dcda95412d540b3918b8_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-bd2599de96ae094f015f204a1de1ae28_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-a4f5881060c8f2d0babfa839ddee2794_b.jpg)

![图片](https://pic4.zhimg.com/v2-a3413f8f58fbbcb3ad192bc1d163ceb5_1440w.jpg)

![图片](https://pica.zhimg.com/v2-f63389dd00c7505c9c22df964528c0e6_b.jpg)

![图片](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-aa02d1ba27a57a5e24685bfffd4f985e_l.jpg?source=172ae18b)

![图片](https://pic4.zhimg.com/v2-69f3e97db2a89a72c1e60e3653e2573f.webp)

![图片](https://picx.zhimg.com/v2-744c3a4e7ccabbefbaabc84a4bfe43a7_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-767eccc635ecc30ee3a80d0596c37748_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-419a1a3ed02b7cfadc20af558aabc897.png)

![图片](https://picx.zhimg.com/v2-aa02d1ba27a57a5e24685bfffd4f985e_l.jpg?source=06d4cd63)

![图片](https://pica.zhimg.com/v2-11d9b8b6edaae71e992f95007c777446.png)

![图片](https://pic1.zhimg.com/de56e29ed44be1ec47590cbf37c86d4e_l.jpg?source=06d4cd63)

