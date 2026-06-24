---
title: "百面LLM-59"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/709988795
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-59

> @swtheking | https://zhuanlan.zhihu.com/p/709988795

---

提问：ROPE是无参数的position embedding，为什么继续训练以后能拓展模型的窗口？

回答：基于ROPE的拓展窗口训练（4k - 32k），本质是在让模型适应ROPE。具体而言，在LLama-2模型中，我们是计算ROPE（Q）& ROPE（K）的attention score，那么相对于4k的context，32k的context中的 attention score会更加平滑以及极小值会更多。因此模型在拓展过程中需要适应这种attention score分布的变化。

总结而言：模型是先通过loss，反应到 attention score分布上的变化，然后通过attention score的变化影响Q，K的变化，然后改变模型参数。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

