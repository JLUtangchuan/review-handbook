---
title: "百面LLM-93"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/1928120137619338003
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-93

> @swtheking | https://zhuanlan.zhihu.com/p/1928120137619338003

---

提问：如何能将长思维链的能力转换到同底座短思维链的模型上？或者帮助短思维链能力的提升？

回答：

DeepseekV3给出了一个解决思路：采用监督微调（SFT）与强化学习（RL）相结合的训练流程，针对特定领域（如代码、数学或通用推理）开发专家模型，该模型将作为最终模型的数据生成器。​

Step 1：在训练过程中，为每个实例生成两种不同类型的 SFT 样本：第一种以 <问题、原始响应> 的格式将问题与其原始响应配对；第二种以 < 系统提示词、问题、R1 响应 > 的格式纳入系统提示词、问题和 R1 响应。​其中需要精心设计系统提示词，使其包含能引导模型生成具有反思和验证机制的响应的指令。​（这个点在claude也能完成）

Step 2：在强化学习（RL）阶段，模型利用高温采样生成响应，即便在没有明确系统提示词的情况下，也能整合 R1 生成的数据和原始数据中的模式。​

Step 3：经过数百个强化学习步骤后，中间的强化学习模型学会整合 R1 模式，从而有策略地提升整体性能。​

Step 4：强化学习训练阶段完成后，以专家模型作为数据生成来源，实施拒绝采样，为最终模型筛选高质量的 SFT 数据。​

Step 5：通过上述方法，确保最终的SFT训练数据既保留 DeepSeek-R1 的优势，又能生成简洁有效的响应。

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

