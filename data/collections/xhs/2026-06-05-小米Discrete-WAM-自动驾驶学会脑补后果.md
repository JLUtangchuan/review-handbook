---
note_id: 6a2290e300000000350236b1
title: "小米Discrete-WAM：自动驾驶学会脑补后果"
author: "AI先声"
source_url: https://www.xiaohongshu.com/explore/6a2290e300000000350236b1
platform: xiaohongshu
date: 2026-06-05
likes: 65
collects: 82
tags: ["小米", "自动驾驶", "世界模型", "AI", "论文", "大模型", "人工智能", "机器人", "具身智能"]
topic: ""
subtopic: ""
status: pending
---

# 小米Discrete-WAM：自动驾驶学会脑补后果

> 作者: @AI先声 | 👍 65 | ⭐ 82
> 来源: https://www.xiaohongshu.com/explore/6a2290e300000000350236b1

---

小米 EV 团队提出 Discrete-WAM，全名是《Discrete-WAM: Unified Discrete Vision-Action Token Editing for World-Policy Learning》。它瞄准的是自动驾驶里一个很关键的问题：车不能只看到路况就直接给动作，还要能理解“如果我这么开，周围世界会怎么变”。
	
过去很多端到端自动驾驶，更像是从画面直接映射到轨迹，学到的是相关性；而 Discrete-WAM 想把视觉、决策、动作和未来场景放进同一个离散 token 空间里建模。简单说，车看到的画面、准备做的动作、接下来可能发生的场景，都被统一成可编辑的 token，再用离散扩散模型一起推演。
	
它的核心不是“生成一段未来画面”这么简单，而是把世界模型和驾驶策略绑在一起。模型既能做 action-conditioned world modeling，也能生成驾驶动作，还能通过高层 decision skeleton 先决定大方向，再细化具体轨迹。这样做的好处是，它不只会模仿人类开车，还能比较不同动作带来的不同后果。
	
数据上，Discrete-WAM 在 NAVSIM v2 上拿到 90.4 EPDMS，在 NAVSIM v1 上拿到 92.2 PDMS；世界生成质量上，FID 是 6.6，FVD 是 80.0，都表现得很强。论文还提到，训练用到了 nuPlan 数据，后续再在 NAVSIM 上做 SFT 和 RL 后训练。
	
比较有意思的是反事实能力。它会尝试改变横向动作，看世界模型里的“惊讶值”怎么变。当轨迹导致碰撞或驶出可行驶区域时，surprise 会明显上升，说明模型不只是画路面，而是在学动作和风险之间的关系。
	
但也不能把它直接等同于“自动驾驶更安全了”。NAVSIM 仍然是 benchmark，离真实道路闭环还有距离；它目前更偏短时域推演，复杂长时交互、极端交通博弈、传感器异常，仍然是难点。离散 token 也会带来一个问题：世界被切成符号后，连续驾驶里的微小变化会不会被压掉？
	
所以 Discrete-WAM 真正抛出的问题是：未来自动驾驶拼的不是谁更会模仿老司机，而是谁能在行动前先想清楚——这一步开出去，世界会变成什么样。
	
#小米[话题]# #自动驾驶[话题]#  #世界模型[话题]# #AI[话题]# #论文[话题]#  #大模型[话题]# #人工智能[话题]# #机器人[话题]# #具身智能[话题]#


**标签**: #小米 #自动驾驶 #世界模型 #AI #论文 #大模型 #人工智能 #机器人 #具身智能

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232206/668f3b046a7fa05e4f2570995e939842/notes_pre_post/1040g3k032118sp0k72405n669jc5utsot4g4kgo!nd_dft_wlteh_webp_3)
*1354×1798*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232206/6e727050d2c37a67ec5f38f89b240db1/notes_pre_post/1040g3k032118sp0k72205n669jc5utsoqmb18ro!nd_dft_wgth_webp_3)
*1294×828*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232206/0fcf899920e1b11ca927fd574b3b6508/notes_pre_post/1040g3k032118sp0k726g5n669jc5utsoqmlqu6g!nd_dft_wgth_webp_3)
*1344×618*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232206/fa79715c70c2b63490390b44c86253b3/notes_pre_post/1040g3k032118sp0k722g5n669jc5utsolcmp840!nd_dft_wgth_webp_3)
*1336×844*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232206/1a35e04f72e60bbedba0bc63b9e16f06/notes_pre_post/1040g3k032118sp0k725g5n669jc5utsobfod6ug!nd_dft_wgth_webp_3)
*1336×560*

