---
title: "百面LLM-76"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/2580189549
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-76

> @swtheking | https://zhuanlan.zhihu.com/p/2580189549

---

提问：为什么reward model在code和math上使用Dense Reward会比0-1准确得分好？以及Dense Reward的优势在哪里？, （来自Post-Training Hub的讨论）。

回答：在DeepSeekCoderV2 [1]和Qwen-Math [2]中都发现了一个点，GRPO和Dense Reward更配，反而给了0-1这种相对的更准的reward效果不好了。之前有个粗浅的认识是，可能是因为相对于PPO，GRPO缺少了value network，所以效果会变差， 来自@王小惟 Weixun。

今天进行了深刻的讨论后，总结了有两个点，组合了一个比较comprehensive的答案：

来自Qwen-Alignment@郁博文 的答案：因为用NN训练一个Dense Model可以去除一些math上只看答案的噪音，也就是去除了一些坏的cot，但答案正确的情况。NN确实本身有一定去燥能力。同时， @墨云沧 提到code上test case由于不够多，也可能和math一样的问题。
我个人的理解如下：因为在群聊中 @郁博文 提到，如果不使用Dense Reward，reward会涨不动，那么这个信息表明，说明模型不仅要对抗有噪声的样本，而且连更多的reward都获取不到。非Dense reward会引发稀疏奖励的问题，当我们同时做简单题和难题的时候，简单题一直可以做对，获得reward，难题一直做不对，获得不了reward（为0），当没有value network或者value network学习不充分的时候，模型会过度拟合简单题，导致模型很多token概率过度增长，然后模型不会探索难题的解法。但如果是Dense Reward，哪怕难题做不对，也会获得一些相应解题的分数，模型依然会继续探索难题解法。

因此建议，GRPO还是配Dense Reward甚至PRM更好。其实把PRM或者Reward Model初始化PPO value network也很好， @初七123334 提议。

[1] Zhu Q, Guo D, Shao Z, et al. DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence[J]. arXiv preprint arXiv:2406.11931, 2024.

[2] Yang A, Zhang B, Hui B, et al. Qwen2. 5-math technical report: Toward mathematical expert model via self-improvement[J]. arXiv preprint arXiv:2409.12122, 2024.

## 图片

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

