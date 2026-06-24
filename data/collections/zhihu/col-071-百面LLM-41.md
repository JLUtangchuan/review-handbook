---
title: "百面LLM-41"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/696655327
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-41

> @swtheking | https://zhuanlan.zhihu.com/p/696655327

---

提问：为什么我们一直要追求更大的模型，更大的模型到底会带来什么？

回答：

在经典论文scaling law [1]中，提出更大的模型可以得到更低的test loss，也就是更好的泛化能力，或者说是更高效的压缩能力。

2. 在Codex [2]中提出更大的模型可以得到更低的systax error. 这个应该算是test loss更低的副产物。以及更受instruction中error影响的问题，这可能是由于更大的模型中transformer predictor的拟合能力更强，更能受context的影响。

3. 自我评估能力（self-reward）随着模型变大涌现出来的能力 [3].

在小模型中几乎等于随机猜测，等模型接近Large水平（62B），自我评估达到60以上。

[1] Kaplan J, McCandlish S, Henighan T, et al. Scaling laws for neural language models[J]. arXiv preprint arXiv:2001.08361, 2020.

[2] Chen M, Tworek J, Jun H, et al. Evaluating large language models trained on code[J]. arXiv preprint arXiv:2107.03374, 2021.

[3] Luo L, Lin Z, Liu Y, et al. Critique ability of large language models[J]. arXiv preprint arXiv:2310.04815, 2023.

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-ff7f297a985edb19bbddff96740e32d6_1440w.jpg)

![图](https://picx.zhimg.com/v2-0506a2fde9468cd6f4d2e6c4ca76f731_1440w.jpg)

![图](https://pic1.zhimg.com/v2-b6dab0cb259ff0fd0f44c90e2e7cfc78_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

