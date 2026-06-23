---
note_id: 68e888b20000000004017d8f
title: "首个非自回归多模态模型！Meta推出OneFlow"
author: "大模型知识分享"
source_url: https://www.xiaohongshu.com/explore/68e888b20000000004017d8f
platform: xiaohongshu
date: 2025-10-10
likes: 145
collects: 229
tags: ["ai", "大模型", "论文", "文生图", "多模态模型", "meta", "多模态人工智能", "深度学习", "人工智能发展"]
topic: ""
subtopic: ""
status: pending
---

# 首个非自回归多模态模型！Meta推出OneFlow

> 作者: @大模型知识分享 | 👍 145 | ⭐ 229
> 来源: https://www.xiaohongshu.com/explore/68e888b20000000004017d8f

---

今日大模型论文｜972
	
论文标题：OneFlow: Concurrent Mixed-Modal and Interleaved Generation with Edit Flows
	
主要内容：在这项工作中，Meta 推出了首个非自回归多模态模型——OneFlow，能够实现变长的、并发混合模态生成。
	
与在文本与图像生成之间强制施加严格因果顺序的自回归模型不同，OneFlow 将用于离散文本 token 的基于插入的编辑流（Edit Flow）与用于图像潜变量的流匹配（Flow Matching）相结合。OneFlow 通过分层采样（优先考虑内容而非语法）实现了并发的文本-图像合成。
	
通过对从 1B 到 8B 模型规模的受控实验，他们证明 OneFlow 在生成和理解任务上均优于自回归基线模型，同时使用的训练 FLOPs 能够减少 50%。
	
OneFlow 超越了自回归和基于扩散的方法，同时解锁了并发生成、迭代优化和类似自然推理式生成等新能力。
	
#ai[话题]# #大模型[话题]# #论文[话题]# #文生图[话题]# #多模态模型[话题]# #meta[话题]# #多模态人工智能[话题]# #深度学习[话题]# #人工智能发展[话题]#


**标签**: #ai #大模型 #论文 #文生图 #多模态模型 #meta #多模态人工智能 #深度学习 #人工智能发展

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232209/9d63e1deeeb0ea1d7a980300d6f18c99/spectrum/1040g34o31neorkpuku605nl74gag8laelockph8!nd_dft_wlteh_webp_3)
*1000×1390*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232209/65d4adb3b7121124f77a20d860826d2e/spectrum/1040g34o31neorkpuku6g5nl74gag8laelvq52pg!nd_dft_wlteh_webp_3)
*1000×1390*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232209/5423ed1f24ea0dcfcef5c5e97170aa40/spectrum/1040g34o31neorkpuku705nl74gag8laectocok0!nd_dft_wlteh_webp_3)
*1000×1390*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232209/4dbbe2105c2efe9d51a5140a00329559/spectrum/1040g34o31neorkpuku7g5nl74gag8laeq7np8po!nd_dft_wlteh_webp_3)
*1000×1390*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232209/783d138774bb210294921fda228a4663/spectrum/1040g34o31neorkpuku805nl74gag8lae46nq2ug!nd_dft_wlteh_webp_3)
*1000×1390*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232209/06e10290cf4936060998bb6c5af8560f/spectrum/1040g34o31neorkpuku8g5nl74gag8lae9cb3428!nd_dft_wlteh_webp_3)
*1000×1390*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232209/2fc12a7301eb5f5dadd83363667cadc8/spectrum/1040g34o31neorkpuku905nl74gag8laesvjvk50!nd_dft_wlteh_webp_3)
*1000×1390*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232209/f7e2a1f768ea6c5c2c49daa2239363f4/spectrum/1040g34o31neorkpuku9g5nl74gag8lae34997f8!nd_dft_wlteh_webp_3)
*1000×1390*

![图片9](http://sns-webpic-qc.xhscdn.com/202606232209/debb13116e9f4aaf558b4ad96dfdf238/spectrum/1040g34o31neorkpukua05nl74gag8laevi8godo!nd_dft_wlteh_webp_3)
*1000×1390*

![图片10](http://sns-webpic-qc.xhscdn.com/202606232209/e55eabd32755146ac99a06cc4c995c99/spectrum/1040g34o31neorkpukuag5nl74gag8laetjhhjbg!nd_dft_wlteh_webp_3)
*1000×1390*

![图片11](http://sns-webpic-qc.xhscdn.com/202606232209/39355e7e7bec9cc9c988dad08e854414/spectrum/1040g34o31neorkpukub05nl74gag8lae44i4pso!nd_dft_wlteh_webp_3)
*1000×1390*

![图片12](http://sns-webpic-qc.xhscdn.com/202606232209/a81e0d7473782e7315504f0a36b1a1db/spectrum/1040g34o31neorkpukubg5nl74gag8lae7126n4o!nd_dft_wlteh_webp_3)
*1000×1390*

![图片13](http://sns-webpic-qc.xhscdn.com/202606232209/97391e41c84538385055e2baed27b3ea/spectrum/1040g34o31neorkpukuc05nl74gag8lae39n9580!nd_dft_wlteh_webp_3)
*1000×1390*

![图片14](http://sns-webpic-qc.xhscdn.com/202606232209/0da7084f376da17c75fa529fa5b1bdf4/spectrum/1040g34o31neorkpukucg5nl74gag8laen19ek48!nd_dft_wgth_webp_3)
*1000×250*

![图片15](http://sns-webpic-qc.xhscdn.com/202606232209/45076244aa3be7693a64d902818a2eac/spectrum/1040g0k031neorkrp4s005nl74gag8laev82i52o!nd_dft_wlteh_webp_3)
*1000×1388*

![图片16](http://sns-webpic-qc.xhscdn.com/202606232209/3136b512e0189095935fb9941f72f14c/spectrum/1040g0k031neorkrp4s0g5nl74gag8laejvcq730!nd_dft_wlteh_webp_3)
*1000×1388*

![图片17](http://sns-webpic-qc.xhscdn.com/202606232209/016e79eb560fbc51509a9d89ad12a3bb/spectrum/1040g0k031neorkrp4s105nl74gag8lae270mv6g!nd_dft_wlteh_webp_3)
*1000×1428*

