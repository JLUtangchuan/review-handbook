---
note_id: 68afc155000000001d018e4a
title: "Long-VLA：释放机器人 VLA 长视野能力"
author: "AI椰青"
source_url: https://www.xiaohongshu.com/explore/68afc155000000001d018e4a
platform: xiaohongshu
date: 2025-08-28
likes: 57
collects: 83
tags: []
topic: ""
subtopic: ""
status: pending
---

# Long-VLA：释放机器人 VLA 长视野能力

> 作者: @AI椰青 | 👍 57 | ⭐ 83
> 来源: https://www.xiaohongshu.com/explore/68afc155000000001d018e4a

---

论文核心问题是现有视觉-语言-动作（VLA）模型多针对短视野机器人操作任务，在长视野多步操作中受技能链问题（子任务过渡依赖、误差传播）限制，现有统一模型无法处理技能链，分解模型破坏端到端训练且仍难解决该问题，目标是提出端到端模型，在保留VLA规模化与数据效率的同时解决长视野操作技能链难题，并构建对应评估基准。硬件条件方面，真实实验用UR系列机械臂，配备RealSense L515相机与Microdia USB相机（分别提供全局视角与夹爪视角），训练依赖4台80GB显存的NVIDIA A100 GPU服务器，无云端算力依赖，部署为桌面环境（含碗、立方体、玉米、水槽等操作对象）。算法设计上，提出Long-VLA端到端模型，将任务分解为移动、交互两阶段，新增相位标识符区分阶段，采用相位感知掩码策略（为输入token分配二进制掩码，控制注意力计算范围），移动阶段聚焦第三人称相机视图，交互阶段聚焦夹爪相机视图；模型用ResNet-18编码观测、冻结CLIP编码目标、LoRA微调Grounding DINO获取检测特征并通过FiLM策略融合，多模态编码器为GPT-2风格Transformer，动作解码器用条件扩散模型（DDIM采样）；训练损失为扩散损失（带噪动作去噪L2损失）与InfoNCE目标对齐损失加权和（超参数0.1），还构建L-CALVIN基准（任务序列从5步扩至10步，34个任务独立分类，相位级数据集含372条指令）。可复现性方面，未明确提及提供代码，数据集基于CALVIN扩展（L-CALVIN构建方法详细），实验配置含训练 epoch（L-CALVIN 40轮、真实任务800轮）、学习率（1e-4）、 batch size（128）等细节，依赖的UR机械臂、NVIDIA A100 GPU、普通相机较常见，但需手动分解训练数据，部署有一定复杂度，复现难度中等。贡献为提出首个长视野端到端VLA模型Long-VLA、构建L-CALVIN基准，实证效果上，L-CALVIN仿真中D→D场景10步任务完成率0.20（较基线MDT提升81%），真实排序任务随机定位下8步完成率0.45（基线为0），清洁任务随机定位下4步完成率11/20（较基线提升226%），消融实验验证分解策略、输入适配、统一模型结合的有效性，且模型具架构无关性，可集成到现有VLA模型。


## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232210/08b6125cd70736ca3abfeba5de1ac934/spectrum/1040g34o31lnahsii4s105p2ie6c527nl058nnd0!nd_dft_wlteh_webp_3)
*1185×1491*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232210/559590baef97e31dfbc4bfe4d6c8240d/spectrum/1040g0k031lnahvr4l0005p2ie6c527nlmc2iti0!nd_dft_wgth_webp_3)
*983×538*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232210/13efe3ad80e223621e25c04d8d63ddf8/spectrum/1040g34o31lnai38p4s105p2ie6c527nluc42ujo!nd_dft_wgth_webp_3)
*1055×814*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232210/9f8cacfc94bd2c4b9b17504ef5cce9f5/spectrum/1040g34o31lnai6m4ku105p2ie6c527nl0thg1bo!nd_dft_wgth_webp_3)
*945×553*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232210/2c844e7dc3b9c1586dfe35492b8a4faa/spectrum/1040g34o31lnai9fi50105p2ie6c527nlsdgt7q8!nd_dft_wlteh_webp_3)
*1074×1252*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232210/90cb6d7c2356eb5f16adf42d7065f393/spectrum/1040g0k031lnaid224u005p2ie6c527nl398rddg!nd_dft_wgth_webp_3)
*972×780*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232210/c9e4f88ff4f7dbe226ce94afa247ba8d/spectrum/1040g34o31lnaifm1ks105p2ie6c527nlnc5o1ug!nd_dft_wgth_webp_3)
*1001×645*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232210/5d1366c91ebe659b563d759ee0b3a810/spectrum/1040g0k031lnaii5g4s005p2ie6c527nluc2h10g!nd_dft_wlteh_webp_3)
*1148×1477*

