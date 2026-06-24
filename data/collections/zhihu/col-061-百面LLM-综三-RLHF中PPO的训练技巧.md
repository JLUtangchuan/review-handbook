---
title: "百面LLM，综三，RLHF中PPO的训练技巧"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/704546071
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM，综三，RLHF中PPO的训练技巧

> @swtheking | https://zhuanlan.zhihu.com/p/704546071

---

之前从TRL PPO踩坑到切换到OpenRLHF，今天TRL终于把我抱怨了很久的Policy和Value network共享问题给改了。最近一个月我和OpenRLHF作者，联合了一些RL的小伙伴，一起把PPO在LLM中的training tricks全部列了出来，可以保证PPO有效稳定的运行，希望能对大家有帮助。

TLDR: In this blog, we will summarize a series of practical techniques for training Large Language Models using Proximal Policy Optimization (PPO).

Notion – The all-in-one workspace for your notes, tasks, wikis, and databases.
difficult-link-dd7.notion.site/eb7b2d1891f44b3a84e7396d19d39e6f?v=01bcb084210149488d730064cbabc99f

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pic4.zhimg.com/v2-6db8ac0c4b232287eb50f0028f449de8.webp)

