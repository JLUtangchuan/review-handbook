---
title: "百面LLM-40"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/696175501
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-40

> @swtheking | https://zhuanlan.zhihu.com/p/696175501

---

提问：在PPO阶段为什么需要在把actor freeze 50步？模型这里在做什么？

回答：在internlm2 [1]和secret of RLHF [2]中都有提及，可以稳定value network的学习。

本质这个过程是在学习一个Dense reward model，或者说 token-wise reward model。在actor freeze 50步中，只有value network在被训练，且由于ref model和actor model一致，那么KL散度的那部分loss为0。因此模型只做了图中从actor model采集experience，然后用reward model计算sentence reward，然后通过GAE来分别计算A advantage函数，最后通过采样中的P(s_t, a_t, s_(t+1))来聚合v_t,计算出token wise的reward，最后训练value network。

其中GAE的计算如下, 参考[3]：

[1] Cai Z, Cao M, Chen H, et al. Internlm2 technical report[J]. arXiv preprint arXiv:2403.17297, 2024.

[2] Zheng R, Dou S, Gao S, et al. Secrets of rlhf in large language models part i: Ppo[J]. arXiv preprint arXiv:2307.04964, 2023.

[3] https://newfacade.github.io/notes-on-reinforcement-learning/17-ppo-trl.html

感谢 @OpenLLMAI 大神的RLHF群友提问～

## 图片

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic1.zhimg.com/v2-51e7c65b90d7310e02df1ff8e3d16c62_1440w.jpg)

![图](https://pic3.zhimg.com/v2-ed9c5622e52bf32cf9aa88d8e80b7a58_1440w.jpg)

![图](https://pic1.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://pic1.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-41440595138d36920c4e06b7f0b24683.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-687962a15a9d89abe256cee5b1bbb267.webp)

