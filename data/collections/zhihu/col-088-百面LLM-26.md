---
title: "百面LLM-26"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/689304027
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-26

> @swtheking | https://zhuanlan.zhihu.com/p/689304027

---

提问：在预训练中的学到的代码数据和文本数据，在SFT中哪种数据的模式越难被改变，或者说知识注入越难？

回答：是代码数据，因为在预训练中代码数据的确定性更高，ppl更低，记忆越深刻，而文本数据变化更大，ppl更高，熵更高。在SFT过程中，改变文本数据比较容易，因为本身ppl就会高，但代码数据会比较难，因为本身ppl会比较低，或者说代码数据的生成确定性更高，少量样本很难对其内部改变，只能大段替换。

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

