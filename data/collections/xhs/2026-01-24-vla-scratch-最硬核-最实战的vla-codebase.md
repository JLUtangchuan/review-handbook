---
note_id: 6974965e000000000a03f3fa
title: "vla-scratch！最硬核、最实战的vla codebase"
author: "Leo Guo"
source_url: https://www.xiaohongshu.com/explore/6974965e000000000a03f3fa
platform: xiaohongshu
date: 2026-01-24
likes: 760
collects: 968
tags: ["具身智能", "vla"]
topic: ""
subtopic: ""
status: pending
---

# vla-scratch！最硬核、最实战的vla codebase

> 作者: @Leo Guo | 👍 760 | ⭐ 968
> 来源: https://www.xiaohongshu.com/explore/6974965e000000000a03f3fa

---

这可能是目前市面上最硬核、最贴近工业界实战的VLA codebase了[赞R]
	
现有的VLA框架普遍存在三个问题：代码臃肿、运行慢、多源数据混训（多模态、不同来源的数据的co-training）极其痛苦，所以并不能直接用来落地
	
我们组的茶园实习生 @翁颢洋 从零开始，手搓了一个全新的工具包：vla-scratch。它解决了目前具身模型研发的几个痛点：
	
[一R] 数据结构大一统（图5）
引入TensorClass定义统一的Data Model，把Dataset和Policy的边界拆解得很清晰。不管是多模态数据还是不同source的机器人数据，现在都能在一个统一的 code pass下丝滑进行co-training
	
[二R] 巨幅性能优化（图3、4）
很多框架过度依赖HF的通用实现和accelerate库，导致效率大打折扣。vla-scratch选择回归底层，重写forward pass和dataloader，最终相比现有的codebase实现了数倍的fps加速[赞R]
	
[三R] 真正的开箱即用
- 极简配置：支持 uv run 一键启动
- 多模型兼容：Qwen3-VL、PaliGemma、SmolVLM等主流backbone通通支持
- 自带checkpoint：已release LIBERO预训练权重，上手即跑
	
🔗 见图2或评论区
	
一点感想[吧唧R] echo一下最近很火的翁家翌的访谈，具身智能包括AI的门槛确实在从research idea转向infra and dirty works。像Haoyang这样左手手搓codebase、右手写paper的同学，才是推动行业落地的中坚力量。不得不感慨，现在的00后实在太强辣[赞R]
	
#具身智能[话题]# #vla[话题]#


**标签**: #具身智能 #vla

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232208/ebd201250125dcf827c0bb171b3dca3f/1040g00831rnfigo924305nue4l0g8ip5uuvsun0!nd_dft_wlteh_webp_3)
*1200×1600*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232208/2e2493babbcd91f779ed4483868c271d/1040g00831rnfigo9243g5nue4l0g8ip51ciavlg!nd_dft_wgth_webp_3)
*1866×682*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232208/73adf0ab8d93723fb1f4f0788d2f5aa3/1040g00831rnfigo924405nue4l0g8ip5dksas6o!nd_dft_wgth_webp_3)
*6034×1833*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232208/fcbf53bc17652b9c37370600ca1d9992/1040g00831rnfigo9244g5nue4l0g8ip5bmoe0mo!nd_dft_wgth_webp_3)
*2226×2161*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232208/a29ef2e690f9bdc25a6416bb4e493381/1040g00831rnfigo924505nue4l0g8ip5581ogi0!nd_dft_wgth_webp_3)
*4096×492*

