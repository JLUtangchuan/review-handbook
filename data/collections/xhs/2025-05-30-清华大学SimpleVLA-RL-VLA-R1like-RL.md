---
note_id: 683918530000000022024f9f
title: "清华大学SimpleVLA-RL: VLA + R1like RL"
author: "展的36次方"
source_url: https://www.xiaohongshu.com/explore/683918530000000022024f9f
platform: xiaohongshu
date: 2025-05-30
likes: 387
collects: 516
tags: ["VLA", "强化学习", "科研论文", "具身智能", "DeepseekR1", "机器人操作", "机器人", "大模型", "科研"]
topic: ""
subtopic: ""
status: pending
---

# 清华大学SimpleVLA-RL: VLA + R1like RL

> 作者: @展的36次方 | 👍 387 | ⭐ 516
> 来源: https://www.xiaohongshu.com/explore/683918530000000022024f9f

---

重磅推荐我们的新工作——SimpleVLA-RL！[超喜欢R]
将DeepseekR1的强化学习方法应用至VLA[棒R]效果逆天[棒R]
	
🎯只需要每个任务一条演示轨迹，只用最简单的 0/1结果奖励，使用SimpleVLA-RL在线强化学习，就可实现超越用全部轨迹数据监督微调（SFT）的性能！
🌟例如在 LIBERO-10 上，在用单条轨迹SFT后，使用SimpleVLA-RL将成功率从 17% 提升到 91%！
	
🔥SimpleVLA-RL，也即R1这类在线强化学习方法有望解决机器人操作数据稀缺这一关键问题。
	
目前大多数 VLA 模型通过行为克隆（SFT）来学习。
[失望R]问题： 过度依赖高质量轨迹数据，而这些数据极其昂贵且难以获取。
[大笑R]解决： 将成功的在线强化学习方法（例如 DeepSeekR1 的RL方法）引入 VLA 模型
	
✨SimpleVLA-RL 的三大关键点：
1.只需要 0/1 的结果奖励信号，就能实现稳定高效的在线强化学习！
2.VLA只用单条演示数据即可学会对应任务！ RL 能帮VLA将潜在能力挖掘出来，显著提高成功率，并泛化模型。
3.鼓励VLA探索是SimpleVLA-RL高成功率的关键。
	
[清单R]特点：
SimpleVLA-RL 是一个针对VLA的简单有效的强化学习方法，基于 GRPO 和 0/1 奖励信号：
1.高效训练： 动态采样机制，用更少的训练步数实现同样的提升效果。
2.探索增强： 提高 rollout 温度，调整 clipping 范围，无 KL 约束。
3.基于veRL实现： 易于扩展模型、环境和 RL 算法，支持 Hybrid Parallel 和 FSDP 加速训练与推理！
	
[派对R]实验结果：
SOTA！SimpleVLA-RL 在 LIBERO 上实现了 98.4% 的平均成功率！
数据稀缺实验：每个任务只用 1 条轨迹数据SFT。
LIBERO-Avg：48.9% → 94.1%
LIBERO-Long：17.1% → 91.8%
	
🔥代码已开源，更多敬请期待！
🔗Github: https://github.com/PRIME-RL/SimpleVLA-RL
#VLA[话题]# #强化学习[话题]#  #科研论文[话题]#  #具身智能[话题]# #DeepseekR1[话题]#  #机器人操作[话题]# #机器人[话题]# #大模型[话题]# #科研[话题]# #VLA[话题]#+RL


**标签**: #VLA #强化学习 #科研论文 #具身智能 #DeepseekR1 #机器人操作 #机器人 #大模型 #科研

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232210/2050baa64aea6d0e334c9df32f28450c/notes_pre_post/1040g3k831i3cl9sencc05p2cpc7ah51ogjv89ho!nd_dft_wlteh_webp_3)
*1200×1600*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232210/3041203e6a8903b99cfb18b95fb5f12f/notes_pre_post/1040g3k031i3cl9se7c905p2cpc7ah51o8do7blg!nd_dft_wgth_webp_3)
*3582×2167*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232210/5adc9bae4912695968031d04c6b3bf5e/notes_pre_post/1040g3k031i3cl9se7c9g5p2cpc7ah51o138s7i0!nd_dft_wgth_webp_3)
*2040×1620*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232210/790006ea8ff6aeeab7e6e869fbdf0c9b/notes_pre_post/1040g3k031i3cl9se7cb05p2cpc7ah51o687aigg!nd_dft_wgth_webp_3)
*3446×1168*

