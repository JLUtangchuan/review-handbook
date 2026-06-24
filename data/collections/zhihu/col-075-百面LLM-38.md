---
title: "百面LLM-38"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/694266481
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-38

> @swtheking | https://zhuanlan.zhihu.com/p/694266481

---

提问：对于两个100B的数据集1 & 2（假设分布差距比较大），那么如果需要顺序训练数据集，也就是在数据集1训完以后post-train数据集2，我们应该怎么做能达到几乎合并训（数据集1&2）的效果：

回答：从数学的角度来建模这个问题：

假设LLM是个memory，它在同分布时候不会忘记之前的数据，在见过m个不同分布的数据后再看见原分布的数据也不会遗忘原先的数据（遗忘曲线假设），但是如果连续见过n(>m)个不同分布的数据以后会遗忘 
1
−
𝛾
𝑚
−
𝑛
 的之前见过的数据。

那么如果我们希望模型完全记住两种分布，

在混合的训练的时候（假设每个数据集的数据量是N），这个概率应该是 
！
（
）
1
−
(
2
𝑁
−
𝑚
)
！
（
2
𝑁
）
!
 。假设 
𝑁
>>
𝑚
, 这个应该等于 
1
−
𝑂
(
1
(
2
𝑁
)
𝑚
)
 。 这个几乎为1.0. （这里使用的是捆绑法计算概率）。
在顺序训练的时候，我们需要准备数据replay，假设replay的数量是T，那么完全可以记住两种分布的概率是 
1
−
(
𝑁
+
𝑇
−
𝑚
)
!
(
𝑁
+
𝑇
)
!
 。假设 N >> m or T >> m, 那么这个应该等于 
1
−
𝑂
(
1
(
𝑁
+
𝑇
)
𝑚
)
 。如果想完全和混合训练一致，那么需要 
𝑇
=
𝑁
 ，当然这个跟重新训练没有区别。假设 
𝑇
=
𝛼
⋅
𝑁
 , 那么这两个概率差值应该是 
𝑂
(
1
(
1
−
𝛼
)
𝑚
𝑁
𝑚
)
 ，因为N很大，因此这个数可以接近为0.

结论：当replay的数据量和原始数据量成正比时，几乎等同于混合训练。

这个结论在论文 Simple and Scalable Strategies to Continually Pre-train Large Language Models [1]证实，当然它列举了三要素：

rewarm-up (但好像实验结论反而是是否warm up不重要)。
re-decay。
当分布差异不是特别大的时候replay 5%原始数据，当分布差异特别大的时候10%-20%原始数据。

最终实验结果如下：

405M模型对比,左图是分布差距不大的两个数据集，右图分布差距较大
405M v.s. 10B模型对比
Bench mark效果，差距不大

[1] Ibrahim A, Thérien B, Gupta K, et al. Simple and Scalable Strategies to Continually Pre-train Large Language Models[J]. arXiv preprint arXiv:2403.08763, 2024.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-1608ed307a7558678360f8dbb2852641_1440w.jpg)

![图](https://pic3.zhimg.com/v2-b98a9efe6fef1c08b9694883449cd190_1440w.jpg)

![图](https://picx.zhimg.com/v2-c4ba2af43e8f5f7685fe840d03aa8995_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

