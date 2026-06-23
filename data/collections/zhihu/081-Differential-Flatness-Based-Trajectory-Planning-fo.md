---
title: "Differential Flatness-Based Trajectory Planning for Autonomous Vehicles 论文解读"
author: "老司机"
source_url: https://zhuanlan.zhihu.com/p/590353744
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# Differential Flatness-Based Trajectory Planning for Autonomous Vehicles 论文解读

> 作者: 老司机 | 来源: https://zhuanlan.zhihu.com/p/590353744

---

大家好，我又来了。

今天给大家解读的是高飞老师组的一篇关于微分平坦轨迹规划的文章。代码有开源的计划，但是目前可能因为文章还没录用，所以还未开源。

在讲之前，需要稍微提一下微分平坦，具体的定义我就不啰嗦了大家可以去维基上看看相关内容，总体来说，已经经过证明：自动驾驶中的二自由度自行车模型是符合微分平坦特性的。

也就是说可以用车辆的绝对位置坐标x,y及其对时间t的导数，就可以显示的表达自行车模型中的状态量。

如下图所示，只要能够保证轨迹中的位置 \sigma_x,\sigma_y ，及其对时间的二阶导数存在，那么就可以显示的表达以下状态量。话句话说，我们在规划轨迹时可以只规划 \sigma_x,\sigma_y ，不再去关注横摆角，曲率这些因素。举个例子，如果 \sigma_x,\sigma_y 可以用多项式或者spline来表示，那么我们只需要确定多项式的参数，找到轨迹的解析解。这样做法的好处就是可以大大的减小规划中的configuration space，我只需要关注两个维度及其对时间的导数就可以了。

废话不多说，我们进入正文。


## 图片

![图片](https://picx.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-dcd2a2afb1e884bd1e1cbc66013c6ecb_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-63cb117a20669df1864755929b6b5b12_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-16e009c58e99d61fc7ca39e4fcb061d5_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-3c9e5d0ee5dd8be080abb226fe8a79b2_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-5baa2729f518baf19f0c09d9524c7143_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-6e7272f9d2a9fe570ee6012a10bbe8ce_1440w.jpg)

![图片](https://pic3.zhimg.com/v2-98de416dcc571722d44837cdfcdb0114_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-81eed672560b900281a45db59b81917d_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-3115f7bc471da7cac1f308afa05e43c9_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-bbaa0b77d3af1dc757de6d11dca26628_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-b2bf4b7d8b6615d743add5549394a673_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-2d984d95bd8eae449f267881f8482635_1440w.jpg)

![图片](https://pic2.zhimg.com/v2-351175c06da442d6e02eb0a558e68cd1_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-30b663e49f3afc9c1ac5c51a40c73b0c_1440w.jpg)

![图片](https://pic1.zhimg.com/v2-9018b58755c4af710637c0e2bc567590_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-5aa7e9cb60e9d163a2d713d620d7d397_1440w.jpg)

![图片](https://picx.zhimg.com/v2-e2d220a30f165264fb11d14227a34a5d_1440w.jpg)

![图片](https://pica.zhimg.com/v2-5ecafa40f457e86483caf1ac886d75fc_1440w.jpg)

![图片](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

