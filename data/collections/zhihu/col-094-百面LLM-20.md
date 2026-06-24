---
title: "百面LLM-20"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/688164780
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-20

> @swtheking | https://zhuanlan.zhihu.com/p/688164780

---

提问：DPO训练后的模型为什么会输出越来越长？

回答：并不是一定会越来越长。如果你尝试用所有正例子的response都比负例子的短，那么也会输出越来越短。究其原因，是由于数据构造原因导致的DPO后训练后的模型输出越来越长。因为，在短的response中一句话结束后&lt;EOS&gt;的概率会很大，但是在长的response中，“但是”，“而且”等细节描述词会接在一句话后，那么这些词语的概率会由DPO过程逐渐变大。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

