---
title: "百面LLM，综十二， Pre-SFT: Let Models Decide on Supervisory Data for Fine-Tuning"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/21158431008
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综十二， Pre-SFT: Let Models Decide on Supervisory Data for Fine-Tuning

> @swtheking | https://zhuanlan.zhihu.com/p/21158431008

---

这次介绍一种我们曾经一起验证过的大规模SFT的方式，能避免SFT对齐税的同时，减少大量人工成本。

TL;DR: In this blog, we introduce an innovative Supervised Fine-Tuning (SFT) method called the Pre-SFT method, which integrates traditional SFT with Rejection Sampling Fine-Tuning (RFT) techniques. The Pre-SFT method begins by fine-tuning the model using the original SFT dataset. We then use the BLEU score to evaluate how well the model has learned each prompt-response pair by comparing the original responses with the model-generated responses. For prompt-response pairs that the model struggles to learn, we generate high-quality responses using the fine-tuned model and replace the original responses in the dataset with these model-generated ones. This approach enhances the model’s performance by leveraging its own generated responses while also reducing the computational overhead typically associated with multiple sampling in RFT.

简要总结：在本博客中，我们介绍了一种创新的监督微调（SFT）方法，称为Pre-SFT方法，该方法结合了传统SFT和拒绝采样微调（RFT）技术。Pre-SFT方法首先使用原始SFT数据集对模型进行微调。然后，我们使用BLEU得分来评估模型学习每个提示-响应对的效果，通过比较原始响应和模型生成的响应系统地进行评估。对于模型难以学习的提示-响应对，我们使用微调后的模型生成高质量的响应，并用这些模型生成的响应替换数据集中的原始响应。这种方法通过利用模型自身生成的响应来增强模型性能，同时减少了通常与RFT中的多次采样相关的计算开销。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic4.zhimg.com/v2-de413490dad1347bbb63ebfa56b1722a.webp)

