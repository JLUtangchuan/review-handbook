---
title: "百面LLM-57"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/708990463
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-57

> @swtheking | https://zhuanlan.zhihu.com/p/708990463

---

提问：什么是LLM中的MOE模型？

回答：

1）主流LLM的MOE都是通过对FFN层降低维度来节省激活参数的。也就是原来FFN层是M * N的矩阵，可以拆分成M * k + k * N两个矩阵来降维度，当k选择越小，FFN层越小。

2）但当k降低时，整体模型表达能力变差，效果变坏，那么我们可以使用，N个M * k个FFN层ensemble的形式来弥补效果损失。

3）再进阶一些，可以用weighted sum来完成ensemble，那么可以加入一个router来计算整体的weight分配。

4）在实验中我们也发现weight大多数是稀疏的，也就是对于某个token来说，只有几个小FFN层的weight比较大，其余接近于0。因此我们开始主动sparse，也就是寻找top k个FFN层激活。那么好处是，在forward阶段，可以继续节省激活参数。

最后摘录deepseek-moe [1] 的具体做法：

MOE前的Transformer layer：

MOE后的：

[1] Dai D, Deng C, Zhao C, et al. Deepseekmoe: Towards ultimate expert specialization in mixture-of-experts language models[J]. arXiv preprint arXiv:2401.06066, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-672c20f66a5fed7be6b41c93ed24e6a2_1440w.jpg)

![图](https://picx.zhimg.com/v2-17236d16bc432406d87affeb061e6411_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

