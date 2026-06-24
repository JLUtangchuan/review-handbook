---
title: "百面LLM-54"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/708015195
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-54

> @swtheking | https://zhuanlan.zhihu.com/p/708015195

---

提问：现有的VLM的模态对齐方式是如何做的？

回答：现有的主流方案是将图片的模态表示投射到语言空间内，完成模态的对齐。主流的做法是将图片表征模型，如VIT或者CLIP + 一个模态转换模块（MLP in LLaVA [1]，Q-Former in BLIP2 [2] & Qwen-VL [3]）。

MLP
Q-Former

现在主流还是MLP，原因是比较简单，需要的对齐数据比较少。Q- former有多个对齐模块，参数较多，容易overfit训练数据。

[1] Liu H, Li C, Wu Q, et al. Visual instruction tuning[J]. Advances in neural information processing systems, 2024, 36.

[2] Li J, Li D, Savarese S, et al. Blip-2: Bootstrapping language-image pre-training with frozen image encoders and large language models[C]//International conference on machine learning. PMLR, 2023: 19730-19742.

[3] Bai J, Bai S, Yang S, et al. Qwen-vl: A frontier large vision-language model with versatile abilities[J]. arXiv preprint arXiv:2308.12966, 2023.

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-4988c28a3c01f8165ac453d24973e0d0_1440w.jpg)

![图](https://pica.zhimg.com/v2-1b4760f93a3a38f7c348a1fd9a4f2026_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

