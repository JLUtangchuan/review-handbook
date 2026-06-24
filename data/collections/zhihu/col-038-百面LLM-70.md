---
title: "百面LLM-70"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/718823663
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-70

> @swtheking | https://zhuanlan.zhihu.com/p/718823663

---

提问：在longcontext的继续训练中，短文本能力会损失，为什么？以及该怎么做，能补回模型的短文能力？

回答：

1）只训练长文本的时候，短文本的能力会被遗忘。但由于长文本一般数据量不多，所以这个原因比较弱。

2）由于在训练长文本的时候，我们需要修改rope base，那么整体模型的attention score会因为rope的变化而变化。具体而言，变化趋势是远程衰减减弱，也就是模型比较难分辨近距离和远距离的token。那么对于代码，数学这种很依赖近距离token做reasoning的task，掉点明显。

举个例子，为什么代码数学很依赖远程衰减。比如if C, D .... if A, B。当远程衰减变弱，模型基本在预测到B的时候，区分不了前置条件是A还是C，那么预测就会失败。

那么我们需要做的就是混合短文本对，整体长文本进行继续训练，那么最好混合的短文本就是代码数学等文本。因为他们对短程依赖较多，比较能帮助模型维持短文本能力。具体细节可以看我们的论文：https://huggingface.co/papers/2409.00509。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

