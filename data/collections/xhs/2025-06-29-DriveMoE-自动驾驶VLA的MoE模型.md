---
note_id: 68610bcd000000000d02557f
title: "DriveMoE，自动驾驶VLA的MoE模型"
author: "OnnxV8"
source_url: https://www.xiaohongshu.com/explore/68610bcd000000000d02557f
platform: xiaohongshu
date: 2025-06-29
likes: 33
collects: 57
tags: ["大模型", "计算机视觉", "算法", "自动驾驶", "deepseek", "gpt"]
topic: ""
subtopic: ""
status: pending
---

# DriveMoE，自动驾驶VLA的MoE模型

> 作者: @OnnxV8 | 👍 33 | ⭐ 57
> 来源: https://www.xiaohongshu.com/explore/68610bcd000000000d02557f

---

设计了两个moe部分：
Scene-Specialized Vision MoE，让模型attention到合适的环视视图
	
Skill-Specialized Action MoE，建立在flow-matching trajectory transformer的基础上，为了让通过moe模型同时关注到高频和低频的行为决策，防止平均效应减弱rare但是正确的行为
	
闭环控制：The PID controller module takes as input the current vehicle speed and the future trajectory predicted by the model, consisting of 10 waypoints, and outputs throttle, brake, and steering angle commands.
desired vehicle speed来自 7th waypoint，steering angle来自10th waypoint.
	
VLM: pretrained weights of Paligemma-3b-pt-224
	
训练：
在第一阶段，vision和action MoE只选择真值专家，而router是联合训练的
在第二阶段，根据视觉和行动MoE路由器的输出选择专家，消除对专家GT的依赖，增强整体模型的泛化能力。
	
﻿#大模型[话题]#﻿ ﻿#计算机视觉[话题]#﻿ ﻿#算法[话题]#﻿ ﻿#自动驾驶[话题]#﻿ ﻿#deepseek[话题]#﻿ ﻿#gpt[话题]#﻿ ﻿#算法[话题]#﻿


**标签**: #大模型 #计算机视觉 #算法 #自动驾驶 #deepseek #gpt

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232210/d8be2b4c98f45c65ed79abba3cfb5d53/spectrum/1040g34o31jaeiv082a405nfokpf08au1pdstp3o!nd_dft_wlteh_webp_3)
*1290×1300*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232210/8f041d6bb12aa143152c1f7de29e89a0/spectrum/1040g34o31jaeiv082a4g5nfokpf08au13v52qsg!nd_dft_wgth_webp_3)
*2006×1036*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232210/382fb9a317a9af3e51946753c0f9b160/spectrum/1040g34o31jaeiv082a505nfokpf08au127pehe0!nd_dft_wgth_webp_3)
*1548×652*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232210/0f45b6c5029133cd2c9b105246094690/spectrum/1040g34o31jaeiv082a5g5nfokpf08au1s9et42g!nd_dft_wgth_webp_3)
*1416×596*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232210/cd53240f0407d7a91f5d2678929cd5d6/spectrum/1040g0k031jaetr1aii0g5nfokpf08au108opn28!nd_dft_wlteh_webp_3)
*1182×1332*

