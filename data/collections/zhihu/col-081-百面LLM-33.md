---
title: "百面LLM-33"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/690982810
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-33

> @swtheking | https://zhuanlan.zhihu.com/p/690982810

---

提问：如何处理reward model中的噪声数据？来自 @OpenLLMAI ～

回答：这个问题首先需要回答reward model的噪声来自哪几个方面：

如果reward model的pair数据来自人标注的，那么人类的preference的倾向性以及标注人员的专业性会带来一定的bias，也就是之前广泛研究的众包系统的Noise。
如果reward model的pair数据来自AI，例如GPT4，那么这种倾向性也很严重，比如length bias。（严格来说，这属于bias，不能算噪声。）

那么如何去噪，这里可以使用一些古早的方式：

预测阶段去噪声：

Ensumble model去噪声，也就是ensemble多个rm model的checkpoint进行预测减少噪声的影响（model merge）。
Margin 去噪声，只有预测的pair的分数大于一定阈值的时候，进行预测减少噪声。

数据阶段去噪声：

Multiview去噪声，用多个模型进行训练，然后预测训练集合，全部可以预测正确pair保留下来，有对有错的可以丢弃或者交给人标注。
Active Learning思路去噪声，训练一个模型，然后把margin小于一定阈值的送给标注人员去噪声。

最后这些思路我没有真正实践过，也没有刻意比较过哪种方法好坏，但基本这些方法在之前的对话系统工作中和 @王焱 一起实践过，都比较有效。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-dcb91f12e5449d3e96e77108e81196f8.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-c2912b6260220412d836b46ebc037483.webp)

