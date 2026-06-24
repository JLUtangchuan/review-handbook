---
title: "百面LLM-73"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/721727175
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-73

> @swtheking | https://zhuanlan.zhihu.com/p/721727175

---

提问：BT model存在一个问题就是训练平移不变性，举个例子 pos = 0.7, neg = 0.4 和 pos = 0.4, neg = 0.1这两种情况loss是一样的，因此BT model训练的reward model，一个response因为训练不同，可能训出reward = 0.7 或者 reward = 0.4。那么对于后续的RLHF非常不友好，我们该如何解决这个问题呢？

回答：利用L2 regularized 的方式可以解决这个问题：

这样pos = 0.7 和 neg =0.4的loss就会比 pos = 0.4 和 neg = 0.1 loss大，那么收敛完了，pos只能是0.4。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-ed2bd693b6da6b5a8b9d8594b1beb97e_1440w.jpg)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

