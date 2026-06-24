---
title: "百面LLM-48"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/701251673
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-48

> @swtheking | https://zhuanlan.zhihu.com/p/701251673

---

提问：为什么长文本训练中需要高频外推，低频内插？

回答：

了解背景知识先看，百面LLM-47

高频

低频内插的原因有两点：

1）低频的旋转角 
𝜃
 比较小，能保持信息丢失掉少。

2）高频内插后，会和低频碰撞，比如上图内插4份以后就和低频下图碰撞。

3）低频外推不了，保证不了远程衰减性。

高频外推的原因：

1）仍然能保证远程衰减，所以外推是可以的。（更正：高频不能保证远程衰减，高频一直震荡）Lamma-7B-4k从0到8k都是震荡。只有低频才有远程衰减性质。

低频

后面附未来两个问题：

为什么高频一直震荡
低频不能保证远程衰减？
什么算高频，什么算低频？

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-6d28eb3223bcca6a47d993039d86b295_1440w.jpg)

![图](https://pic3.zhimg.com/v2-b6f1fd0048ba6c94b39e9463ee397256_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

