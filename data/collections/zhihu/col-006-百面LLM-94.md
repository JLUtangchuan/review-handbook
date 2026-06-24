---
title: "百面LLM-94"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1929942910620640998
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-94

> @swtheking | https://zhuanlan.zhihu.com/p/1929942910620640998

---

提问：是不是LLM on-policy训练以后就不需要任何的clip操作？如果不clip后面会遇到什么问题？

回答：在这篇知乎，百面LLM-90中笔者已经介绍了clip的作用，按照John Schulman的论文里的话概述地说：就是clip本质不是为了on-policy，或者说on-policy一直不是clip的原因。一切是否关于on or off policy相关的问题都可以靠importance sampling解决。clip的本质是为了避免模型的参数更新过大，使得你的state distribution变化过大，从而遇到state distribution shift问题。

Tips：在LLM中，具体而言，有两种token变化会让模型的state的分布变化比较大，个人感觉小概率的token变大也许并没有太大问题，大概率的token突然变小可能会引发很多问题。这个里面又是跟entropy相关的问题，后续有机会讨论。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic3.zhimg.com/v2-f56b92fcb63f7bfb2fd8aa75da7b0075_bh.webp?source=d6434cab)

![图](https://pic2.zhimg.com/v2-25d9de2e2b8d4971d2c24574387ab4c0_xl.webp?source=d6434cab)

