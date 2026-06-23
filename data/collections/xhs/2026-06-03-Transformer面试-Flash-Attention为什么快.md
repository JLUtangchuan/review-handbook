---
note_id: 6a1ee1e2000000003701e18f
title: "Transformer面试:Flash Attention为什么快?"
author: "盒子里的agent"
source_url: https://www.xiaohongshu.com/explore/6a1ee1e2000000003701e18f
platform: xiaohongshu
date: 2026-06-03
likes: 88
collects: 175
tags: ["transformer", "attention", "LLM", "大模型入门", "深度学习", "大模型", "NLP", "大模型面试", "ai面试", "算法"]
topic: ""
subtopic: ""
status: pending
---

# Transformer面试:Flash Attention为什么快?

> 作者: @盒子里的agent | 👍 88 | ⭐ 175
> 来源: https://www.xiaohongshu.com/explore/6a1ee1e2000000003701e18f

---

面试问 Flash Attention 快在哪，别答"分块算不存矩阵"——面试官要听三层👇
	
1️⃣ 标准注意力的瓶颈不是 O(N²) 算力，是 N×N 中间矩阵在 HBM 里反复读写。GPU 算一次矩阵乘法只要一瞬，但把 4M
个数写进再读出 HBM 要 10 倍时间——内存受限
	
2️⃣ Flash Attention 分块（Br×Bc 塞进 192KB SRAM）+ 在线 softmax（用累计 m、l、衰减因子修正旧输出，数学严格等价）+
反重算（前向不存 P，反向 SRAM 重算比 HBM 读还快——因为算力带宽比~500）
	
3️⃣ IO 从 O(N²)→O(N)，N=2048 省 30×，N=8192 省 120×。没这一手，8K+ 长文本训练在硬件上不可行。NeurIPS 2022bestpaper——不是颁给加速技巧，是颁给"改写一个基础算子复杂度下限"的工作#transformer[话题]# #attention[话题]# #LLM[话题]# #大模型入门[话题]# #深度学习[话题]# #大模型[话题]# #NLP[话题]# #大模型面试[话题]# #ai面试[话题]# #算法[话题]#


**标签**: #transformer #attention #LLM #大模型入门 #深度学习 #大模型 #NLP #大模型面试 #ai面试 #算法

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232206/83a0ca1f46d0313cafe92ac9c52b24b4/spectrum/1040g0k0320tr60cv74005qg5ccv0g701acacr48!nd_dft_wlteh_webp_3)
*1090×1443*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232206/a7b7798172375861cdee268ef0bb8ac2/spectrum/1040g0k0320tr60cv740g5qg5ccv0g7011frko8g!nd_dft_wlteh_webp_3)
*1090×1443*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232206/89f00011e654ca74aa286dcf65e3e446/spectrum/1040g0k0320tr60cv74105qg5ccv0g701hi6grao!nd_dft_wlteh_webp_3)
*1090×1443*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232206/96ca6d3a868153ea43694463c9e18fee/spectrum/1040g0k0320tr60cv741g5qg5ccv0g70144idqj8!nd_dft_wlteh_webp_3)
*1090×1443*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232206/10250c5fc63488257a9c497780485ffc/spectrum/1040g0k0320tr60cv74205qg5ccv0g701godc5l0!nd_dft_wlteh_webp_3)
*1090×1443*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232206/7160db0b48fdf10c8787b9bca4058447/spectrum/1040g0k0320tr60cv742g5qg5ccv0g701qmn5hc8!nd_dft_wlteh_webp_3)
*1090×1443*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232206/e9a1d60ea2ba4975330fcce64cca060f/spectrum/1040g0k0320tr60cv74305qg5ccv0g7018nub7v8!nd_dft_wlteh_webp_3)
*1090×1443*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232206/8579dd54b3be86ed910a61c5467b2d9e/spectrum/1040g0k0320tr60cv743g5qg5ccv0g701cb9tlfg!nd_dft_wlteh_webp_3)
*1090×1443*

![图片9](http://sns-webpic-qc.xhscdn.com/202606232206/f1e53e42d5686332a4f1a4cecf7c8c49/spectrum/1040g0k0320tr60cv74405qg5ccv0g7017io0aug!nd_dft_wlteh_webp_3)
*1090×1443*

![图片10](http://sns-webpic-qc.xhscdn.com/202606232206/9e070e2fb70f12c8ff0f0c19e7e56c85/spectrum/1040g0k0320tr60cv744g5qg5ccv0g70104mupu0!nd_dft_wlteh_webp_3)
*1090×1443*

