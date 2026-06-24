---
title: "百面LLM-85"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/15102794242
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-85

> @swtheking | https://zhuanlan.zhihu.com/p/15102794242

---

提问：当我们持续在一个训练集合上，进行RL训练的时候，我们发现train reward持续在涨，但是在测试集合上人工测试效果会下跌，那么在此训练过程中有哪些问题会导致了test集合上人工测试的效果下降？

回答：

Reward hacking问题：当train reward在增长的时候，但reward model被hack了，因此看似train reward增长，但其实人工评估的时候效果在下降。
Generalization问题：当train reward在增长的时候，假如train dataset的人工评估依然在上涨，那么reward hacking没有发生。此时此刻如果测试集合上效果却在下降，那么就是模型overfit训练集合，泛化问题发生。

如何分辨模型是reward hacking还是generalization的问题呢？

最好的方式是测试test reward增长，如果test reward增长，但人工测试下降，就是reward hacking。否则test reward不涨或者下降就是generalization问题。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

