---
title: "百面LLM，综八，Leveraging Web-Crawled Data for High-Quality Fine-Tuning"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/721406132
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综八，Leveraging Web-Crawled Data for High-Quality Fine-Tuning

> @swtheking | https://zhuanlan.zhihu.com/p/721406132

---

这是我们最近中的一篇EMNLP findings的论文，是一篇主要focus在数学合成数据生成的方法上。

具体的motivation如下，我们在有少量高质量的合成数据的时候如何去自动生成更多的高质量合成数据？在我们的方法里分为三步，1.利用百度搜索数据寻找合适的Q-A pair，2. 利用少量高质量合成数据训练一个改写的model，帮助我们可以把低质量数据改写成模型认为的高质量数据，3.利用这个model对这些Q-A pair进行answer改写，生成高质量数据。这里的主要insight是，我们应该多对pre-train数据（因为百度搜索中的数据基本都是中文互联网数据也在pre-train data中）进行挖掘合适的数据，进行合成数据生成。（这个方向，我也写了一篇blog后续会放出来）。

TL;DR: Most large language models are fine-tuned using either expensive human-annotated data or GPT-4 generated data which cannot guarantee performance in certain domains. We argue that although the web-crawled data often has formatting errors causing semantic inaccuracies, it can still serve as a valuable source for highquality supervised fine-tuning in specific domains without relying on advanced models like GPT-4. To this end, we create a paired training dataset automatically by aligning web-crawled data with a smaller set of high-quality data. By training a language model on this dataset, we can convert web data with irregular formats into high-quality ones. Our experiments show that training with the model-transformed data yields better results, surpassing training with only high-quality data by an average score of 9.4% in Chinese math problems. Additionally, our 7B model outperforms several open-source models larger than 32B and surpasses well known closed-source models such as GPT-3.5, highlighting the efficacy of our approach.

绝大多数的大型语言模型都是利用昂贵的人工标注数据或GPT-4生成的数据进行微调的，但这些方法在特定领域的表现无法得到保证。我们认为，尽管爬取自网络的数据通常存在格式错误从而导致语义不准确，它仍然可以作为高质量监督微调的有价值来源，而不需要依赖像GPT-4这样的高级模型。为此，我们通过将网络爬取的数据与一小部分高质量数据进行对齐，自动创建了一个配对训练数据集。通过在该数据集上训练语言模型，我们可以将格式不规范的网络数据转换为高质量的数据。实验结果显示，使用模型转换的数据进行训练的效果更好，在中文数学问题上比仅使用高质量数据训练的平均得分高出9.4%。此外，我们的7B模型在表现上优于许多超过32B的开源模型，并且超越了知名的闭源模型如GPT-3.5，突显了我们方法的有效性。

Code：GitHub - zhouj8553/Web_to_SFT: official code for the paper "Leveraging Web-Crawled Data for High-Quality Fine-Tuning"

Paper：https://arxiv.org/pdf/2408.08003

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

