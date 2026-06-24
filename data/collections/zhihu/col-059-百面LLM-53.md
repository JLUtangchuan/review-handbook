---
title: "百面LLM-53"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/707342878
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-53

> @swtheking | https://zhuanlan.zhihu.com/p/707342878

---

提问：同等MOE模型的loss能下降到和同等规模Dense模型的水准吗？由Llamafia群友提出～

回答：这是显然不能的，因为MOE在训练中每个token forward和backward的实际的激活参数是远少于同等规模的Dense 模型的（Btw，尽管Dense模型训练完也是个偏向sparse的模型，也就是有少量神经元被激活，但是在训练中，Dense模型是可以自由选择激活哪部分神经元的。而Sparse Moe，通过训练路由来控制哪个token激活哪部分的expert，本质差距还蛮远的。）。那么从DeepseekV2-MOE-236B [1]来看，激活21B，总参 236B，等效一个 90B 的Dense，从Deepseek-Coder-MOE-16B [1]，激活2.4B，总参数16B，等效于一个7B模型。（等效计算是和激活参数，总参数都挂钩的函数计算出来的。）

最后推荐一下deepmind的moe scaling law，这个是群内skywork的小伙伴推荐的。

[1] Zhu Q, Guo D, Shao Z, et al. DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence[J]. arXiv preprint arXiv:2406.11931, 2024.

[2] Clark A, de Las Casas D, Guy A, et al. Unified scaling laws for routed language models[C]//International conference on machine learning. PMLR, 2022: 4057-4086.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

