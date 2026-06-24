---
title: "百面LLM（综一）：大模型lr退火阶段的模型变化和启示"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/693076242
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM（综一）：大模型lr退火阶段的模型变化和启示

> @swtheking | https://zhuanlan.zhihu.com/p/693076242

---

minicpm[1]的实验结果：

在lr退火阶段，模型的loss会迅速下降。
在lr退火阶段，引入高质量数据，模型效果会提升。
A-1: 2.4B model, decay using only pre-training data, followed by 4B token SFT.
A-2: 2.4B model, decay using the aforementioned high-quality data unlabeled data and SFT data mixed into pre-training data, also followed by 4B token SFT.
B-1: 1.2B model, decay using only pre-training data, followed by 6B token SFT.
B-2: 1.2B model, decay using only pre-training data, followed by 12B token SFT.
B-3: 1.2B model, annealing using the aforementioned high-quality data + SFT data mixed into pre-training data, also followed by 6B token SFT.

以上现象说明：大模型的lr退火阶段非常特殊（区别于模型lr未退火阶段），模型内部参数此时的变化会影响最终模型的效果。那我们想问一个问题：

模型退火阶段，模型参数的变化到底是如何的？和退火前的模型参数变化有何不同？

分析现象：

在lr比较小阶段整体loss迅速下降，反而在lr大的时候loss下降速度不快。这个现象应该和loss的landscape相关，我们可以假设loss的landscape是下面的形式：
loss，纵轴是loss，横轴是step（有点丑，用chatgpt画了两次表达不了我的意思）

那么这个loss图片里存在两个sharp minimum，当lr比较大的时候，会跳过这些sharp minimum，所以整体下降速度不快，但当lr比较小，退火的时候会进入sharp minimum，下降速度比较快。当然真实的loss landscape是多维度且更加复杂。（打个比喻，可能退火的时候类似进行了一种洞形式的空间，而loss landscape大体上看是个平原）。

在退火阶段加入更多高质量数据能获得loss更低点。

在这个“洞空间”内，由于minimum更加sharp，需要的gradient需要更加准确，配合着小lr才能获得红色的最低点。而更加高质量的数据可以提升gradient的准确性。

问题回答：

模型退火阶段，模型参数的变化到底是如何的？和退火前的模型参数变化有何不同？

猜测：模型预测中某些特定context的特定位置塌缩成长尾分布。

Loss迅速下降代表Cross Entropy迅速下降，压缩过程剧烈。那么猜测在这段lr下降过程中，说明有一些位置的token快速overfit了训练集合里的token分布，而形成长尾分布。也就是说对于下一个词预测更加确定，某些context后的next word prediction预测空间塌缩成只有几个词占据90%以上，其余词占据10%左右的概率空间。对于lr退火前，我个人猜测这些特定位置的词仍然保持着和别的位置一样的非长尾分布，具体而言，就是可能100-200个词占据90%以上。（斜体的几个和100-200这些数字都是猜测，需要真实实验观测）。

进一步的思考和猜测：

这些特定位置大概是表达什么的位置？猜测：大概是一些事实型的答案和知识类的答案。

相比于无意义的形容词和语言结构的变化，更大概率塌缩的是事实型的答案，比如2024年的美国总统拜登，那么预计拜登这个词会迅速塌缩，然后成为事实型答案。

用这个理论解释为什么sft模型无法学习新知识？

相比于pre-train未退火阶段，大量位置的token还未塌缩，退火后的模型想在sft阶段学习新知识比较困难，因为一般sft阶段设置lr = 退火后的lr，那么这些token很难被修改，如果多次训练，强行修改容易把整个预训练学到的知识打乱。（这里的知识特指常识类别的知识。对于一些新的领域的知识或许能看到泛化性，但记忆和泛化效果应该不如，re-warmup然后退火这种post-train。）

那么想压缩新知识进入模型应该怎么办？

借用之前一篇post-train论文[2]的方法, 需要我们混合一部分新数据加上老数据训练模型（老数据防止遗忘）。

要经历re-warm up，让模型从之前的“洞穴”内出来，也就是图上红色的sharp minimum出来。
然后经历高lr，寻找新的洞穴。
在新的洞穴开始重新塌缩某些位置的概率空间。

[1] Hu S, Tu Y, Han X, et al. MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies[J]. arXiv preprint arXiv:2404.06395, 2024.

[2] Ibrahim A, Thérien B, Gupta K, et al. Simple and Scalable Strategies to Continually Pre-train Large Language Models[J]. arXiv preprint arXiv:2403.08763, 2024.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-d36d83ddf64bfb00bae788a3e12c4815_1440w.jpg)

![图](https://picx.zhimg.com/v2-1a1073199d1694d95ac62ca0ec447f69_1440w.jpg)

![图](https://pic3.zhimg.com/v2-6f5dbe2c7e8dd27216ce36ec4aae403e_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-fc20705a7fb7b81fb83182e6131ebe99.webp)

