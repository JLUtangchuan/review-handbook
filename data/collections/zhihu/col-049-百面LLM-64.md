---
title: "百面LLM-64"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/712805065
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-64

> @swtheking | https://zhuanlan.zhihu.com/p/712805065

---

提问：为什么能对attention score保持远程衰减对position embedding是重要的，以及除了保持远程衰减以外还需要保持什么能提升长文本的能力？感谢 @十七-蝉衣少年 提问

回答：

Attention score保持远程衰减是重要的，原因是，人类语言在叙述的时候更focus在最近的n个tokens上。如果不能保持远程衰减，那么会导致你的注意力过度关注非常远的token，而忽略你刚输入的token，那么会破坏语意连续性。比如写代码的时候，"import numpy ....., if ...., el <pre>", 你需要继续预测<pre>，正常的modle会focus在el上，然后预测后面是se，组成else。如果不远程衰减，会focus在 numpy上，那么预测啥就不知道了。

如果只做到远程衰减，最差可以得到一个接近Slide window的做法：也就是我只关注最近n个tokens，其余变为0。这种做法有个问题，那就是不能召回远端相关的tokens（也就是检索任务会不好）。那么除了远程衰减以外，position embedding需要保证attention score远程震荡为0，而不一直为0。这样就可以保证能召回非常相关的tokens，这也是RoPE的优点之一。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

