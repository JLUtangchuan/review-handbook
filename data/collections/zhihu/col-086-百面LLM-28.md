---
title: "百面LLM-28"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/689713446
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-28

> @swtheking | https://zhuanlan.zhihu.com/p/689713446

---

提问：In context learning中下面哪一项比较重要：

1）input distribution

2）output distribution

3）input-output mapping

4）the sample order

5）the formatting of the demonstrations

回答：1）2）4）5）比较重要，3）有的说比较重要，有的说不是特别重要。

1）2）重要来自下面实验 [1]：在使用gold label（正确的label）并不比random label的效果高多少，但是比无ICL高很多（无ICL就没有了input distribution和output distribution了）。

Figure: Min et al compare three different methods: 1) No-examples: the LM conditions on the test input only, with no examples. This is typical zero-shot inference, first done by GPT-2/GPT-3. 2) Examples with ground truth outputs: the LM conditions on the concatenation of a few in-context examples and the test input. This is a typical in-context learning method, and by default, all outputs in the prompt are ground truth. 3) Examples with random outputs: the LM conditions on in-context examples and the test input, but now, each output in the prompt is randomly sampled from the output set (labels in the classification tasks; a set of answer options in the multi-choice tasks).

4)实验来源于论文 [2]: 无论few shot有多少个shot，不同模型只要重新排列demonstrations，分类准确率效果variance很大。

5）的细节可以看swtheking：大模型的面试题系列-27：因为ICL和SFT同源，COT数据在ICL中可以prompt更好的reasoning数据 。

4）在[1]论文中看上去不是很重要，但是在openai的论文中有一些不一样的结论 [3],

Figure : Few-shot prompting becomes competitive with finetuning for large models; weak-to- strong learning is qualitatively similar in the prompting setting. (a) Average zero-shot (single dashed), 5-shot (double dashed) and finetuning (solid) accuracy with ground truth labels as a function of strong student size. (b) Average 5-shot with weak labels (colored dashed) accuracy as a function of student model size. Hue of line indicates size of weak supervisor. Zero-shot and 5-shot same as in panel a. (c) Average weak-to-strong performance for 5-shot prompting (dashed with crosses), naive finetuning (dashed thin) and finetuning with the confidence loss (solid with triangle) as a function of student model compute. Results are averaged across 7 NLP tasks. Few-shot weak- to-strong performance becomes competitive with or outperforms finetuning for the largest strong students, though finetuning with the confidence loss does better.

这里的中间图片发现，黑色的虚线是ICL中用了gold label，而蓝色的虚线是小模型用gold label finetune以后生成的weak label（准确率是90左右），但效果却差了很多。和[1]可能的区别是任务的难度，整体这里的任务难度会高一些（虽然都是classification，但是这里任务是 22 popular NLP classification datasets covering ethics, commonsense reasoning, natural language inference, sentiment analysis, and other domains. ）。

最后还有更多细节可以看我的blog：

[1]Sang Michael Xie and Sewon Min. "How does in-context learning work? A framework for understanding the differences from traditional supervised learning ".

[2]Lu Y, Bartolo M, Moore A, et al. Fantastically ordered prompts and where to find them: Overcoming few-shot prompt order sensitivity[J]. arXiv preprint arXiv:2104.08786, 2021.

[3]Burns C, Izmailov P, Kirchner J H, et al. Weak-to-strong generalization: Eliciting strong capabilities with weak supervision[J]. arXiv preprint arXiv:2312.09390, 2023.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic3.zhimg.com/v2-567bc490afffd326d55d20c62e1eff7e_1440w.jpg)

![图](https://pic1.zhimg.com/v2-abf797c943f735f7442fb35e9f4997fe_1440w.jpg)

![图](https://pic3.zhimg.com/v2-d90ac756918aa251fc1df572483c53a2_1440w.jpg)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

