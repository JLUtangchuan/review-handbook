---
title: "为什么stable diffusion训练要1000 timesteps，推理却只用几十步就可以？"
author: "kekekeke"
source_url: https://www.zhihu.com/question/582968704/answer/3605091653
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 为什么stable diffusion训练要1000 timesteps，推理却只用几十步就可以？

> 作者: kekekeke | 来源: https://www.zhihu.com/question/582968704/answer/3605091653

---

关注
推荐
热榜
专栏
圈子
AI Works
Beta
故事
​
直答
消息
私信
99+
创作中心
为什么stable diffusion训练要1000 timesteps，推理却只用几十步就可以？
关注问题
​
写回答
深度学习（Deep Learning）
Stable Diffusion
AIGC
为什么stable diffusion训练要1000 timesteps，推理却只用几十步就可以？
看了下diffusers的stable diffusion，训练时scheduler配置为timesteps，但推理的时候推25或50步就基本能达到不…显示全部 ​
关注者
183
被浏览
133,325
关注问题​
写回答
​
邀请回答
​
好问题 23
​
添加评论
​
分享
​
查看全部 14 个回答
kekekeke
留学狗
​
 关注
139 人赞同了该回答

训练的时候还是用的ddpm的方式，但是backward process的时候就有很多种方式了。有几篇很重要的paper，score based generative model，DDIM，EDM，然后后面的就是把diffusion的过程看成一个stochastic differential equation。既然是differential equation那就可以用各种solver等等。强烈推荐看Elucidating the Design Space of Diffusion-Based Generative Models的视频，基本上把这个大体的脉络都讲了一遍。

发布于2024-08-25 01:51
・美国
​
赞同 139​
​
2 条评论
​
206
​
3
​
分享
​
​
收起​
更多回答
泛墨
持心如衡，一往无常

先问是不是

Diffusion 训练中并没有用1000steps per sample. l，而是每一步随机采样一个噪声强度作为训练目标，1000只是一个可以看作充分大以至于step之间的Lipschitz 约束可以将其近似为局部线性问题的离散阶数，这也正是score based model的真正巧妙之处

阅读全文​
​
赞同 61​
​
1 条评论
​
12
​
1
​
分享
​
TNotes
CS，计算机视觉，生成式AI
收录于 · CV/CG/AI科研

理解SD为啥推理比训练所需要的timestamp少，确实得先理解DDIM。而理解DDIM，需要先对DDPM有个基本的了解，DDPM可以参考我之前的回答：

好，DDPM有什么问题呢？推理过程生成图像的速度慢。DDPM推理过程中，需要从时间T到时间T-1的所有过去的去噪步骤来获得时间T的下一个去噪图像。

正式基于这个问题，才有了DDIM。下面这个回答就以不断提问的方式（同时也适合面试时候使用，可以面试前自测），来介绍、帮助理解DDIM，特别是注意理解：为什么DDIM可以不加随机噪声，使其变成确定性采样？

DDPM的问题：推理过程生成图像的速度慢。DDPM推理过程中，需要从时间T到时间T-1的所有过去的去噪步骤来获得时间T的下一个去噪图像。

DDIM的原理/逻辑
DDPM慢本质原因是对马尔科夫链假设的依赖。但DDPM只是前向过程用到了这个假设，并且前向过程只是为了造数据集。后向去噪优化并没有用到这个假设

后向过程 每一步去噪的过程本质上是求分布 $$q(x_{t-1}|x_t,x_0)$$

DDIM希望构建这样的分布，并且这个采样分布不依赖马尔可夫假设
这个分布在DDPM推导出的公式中，可以写成更通用的形式

DDIM就是希望构造一个类似形式的分布。但这个分布有3个自由变量，有无穷多解。

我们观察到，DDPM后向去噪/推理过程中还用到了q(xt|x0)这个分布。DDIM希望自己的推理分布也满足这个条件（这样的话可以复用DDPM的去噪模型）。

因此，在这个推理分布的约束下，通过待定系数法求解k和lamda，得到DDIM的分布 $$q(x_{t-1}|x_t,x_0)$$ 为

然后根据重参数化，对这个分布进行采样，并代入x0，得到

调节 $$\sigma_t$$ 实现快速采样

采样过程包含一个可以调节的参数 $$\sigma_t$$ ，通过选取的不同的值，我们可以得到一簇不同的采样过程
当 \sigma_t=0 时，采样过程中添加的随机噪声项为0. 此时，采样过程是确定的，此时的生成模型是一个隐概率模型(implicit probabilstic model)
当下面 $$\eta$$ 取1时，就是DDPM
DDIM的采样过程？
从标准高斯分布中采样一个噪声（初始噪声图像 $$x_{T_t}$$ ）
遍历采样序列（从大到小排序）的中时间Tt
Unet模型根据当前时刻Tt和噪声图像 $$x_{T_t}$$ ，预测出来的噪声

把当前图像 $$x_{T_t}$$ 减去噪声，得到图像 $$x_{T_{t-1}}$$

DDIM怎么实现的加速采样？
DDIM 实现逆向递推公式优化，减少逆向推理步骤，进而减少推理过程的时间
DDPM的递推公式是 $$q(x_{t-1}|x_t,x_0)$$ ，DDIM推导出了确定性的变化公式 $$q(x_{t_2}|x_{t_1},x_0)$$ （t2<t1)
通过间隔采样Stride Sampling，允许跳过去噪过程中的步骤，而不需要在当前状态之前访问所有过去的状态
为什么可以间隔采样？

DDPM里面的本质是求采样分布 $$q(x_{t-1}|x_t,x_0)$$ ，并在这个分布上采样。而这个采样过程只与这个分布，以及q(xt|x0)有关，不管是这个分布还是采样过程，都于马尔可夫假设无关。因此，DDIM将扩散过程定义为非马尔科夫过程，然后没有通过马尔可夫假设推导出这个采样分布 $$q(x_{t-1}|x_t,x_0)$$

DDIM是确定性采样，在每一步没有引入随机噪声
这样，我们可以从原本采样序列中构建一个子序列，然后按照优化后的递推公式进行采样
DDIM是确定性生成/采样吗？为什么？
DDIM 是确定性生成。DDIM在生成过程中不再依赖随机噪声的采样，而是通过确定的公式逐步去噪，从而实现确定性生成。
也即给定一个初始的随机噪声，通过DDIM 进行采样，不管采样多少次，最终的结果是一样的，这意味着每次生成相同的输入噪声，DDIM都会生成相同的输出数据。而原始的 DDPM 采样是随机采样，即便初始噪声一致，最终结果也可能不一致
为什么DDPM要在采样的时候加入随机噪声，使其变成非确定性采样？
DDPM采样加入随机噪声是为了保证生成结果的多样性
为什么DDIM可以不加随机噪声，使其变成确定性采样？
【ODE求解】DDIM的方法可以被视为在扩散模型的逆过程中的一种ODE求解。具体来说，DDIM通过确定性变换来逼近由扩散过程定义的潜在数据分布，从而实现确定性采样。而DDPM是SDE求解（随机微分方程）
DDIM去掉随机噪声，实现确定性采样，是加速采样的关键
DDIM需要在DDPM基础上重新训练吗？
不用，DDIM只是在采样/推理过程作了优化
训练目标和训练方式没有变化
参考资料：
https://www.cnblogs.com/myhz/p/18265650
微信：https://mp.weixin.qq.com/s/baEdDCOQP--NxvojGgBXJQ
数学推导：https://zeqiang-lai.github.io/b
阅读全文​
​
赞同 13​
​
添加评论
​
31
​
2
​
分享
​
查看全部 14 个回答
关于作者
kekekeke
留学狗
回答
55
文章
0
关注者
213
​
关注他
​
发私信
大家都在搜
换一换
英国首相斯塔默辞职
396 万
热
刘强东说将来根本不需要快递员
300 万
热
2026 上海高考分数线
297 万
新
人民日报批烂梗泛滥
293 万
热
懂车帝京沪续航测试
287 万
多品牌婴幼儿纸尿裤检出甲酰胺
283 万
14岁国少球员遭成年队围殴骨折
280 万
法国3-0伊拉克
265 万
13岁女孩称遭强奸未被立案
255 万
恋与深空新男主致大规模退游
241 万
 
帮助中心
服务热线：400-919-0001
帮助与客服
联系我们
更多
 
举报中心
违法和不良信息举报：010-82716601
我的举报
更多
 
关于知乎
知乎个人信息保护指引
知乎协议
下载知乎
Investor Relations
网站资质信息
更多
京ICP证110745号 · 京ICP备13052560号-1 · 京公网安备 11010802020088 号 · 京网文[2025]0422-132 号 · 药品医疗器械网络信息服务备案（京）网药械信息备字（2022）第00334号


## 图片

![图片](https://pic1.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=2c26e567)

![图片](https://pica.zhimg.com/v2-7b7a41e5cf0f84f85885068b8432c31a_l.jpg?source=1def8aca)

![图片](https://pic1.zhimg.com/v2-dcc5c617796da9770bcabe91523054ea_l.jpg?source=1def8aca)

![图片](https://pica.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pica.zhimg.com/80/v2-ccdb7828c12afff31a27e51593d23260_720w.png)

