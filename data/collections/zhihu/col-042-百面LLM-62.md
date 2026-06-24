---
title: "百面LLM-62"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/712361198
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-62

> @swtheking | https://zhuanlan.zhihu.com/p/712361198

---

提问：ROPE后的embedding，是低频部分保持远程衰减，还是高频部分保持远程衰减？

回答：

低频

在Llama-2-4k中第一层中，我们随机取了两个token，观测positional distance和 attention score的关系

在低频32维度，attention score变化如下：

在高频32维度，attention score变化如下：

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-397173f0f7c17a7069d728b9106a402e_1440w.jpg)

![图](https://pic1.zhimg.com/v2-5cc2caa448eb32802fdafb6b38cdbf90_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

