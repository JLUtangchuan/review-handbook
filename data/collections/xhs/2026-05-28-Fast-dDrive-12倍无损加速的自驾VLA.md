---
note_id: 6a17dd55000000000702be22
title: "Fast-dDrive: 12倍无损加速的自驾VLA"
author: "Xiwen"
source_url: https://www.xiaohongshu.com/explore/6a17dd55000000000702be22
platform: xiaohongshu
date: 2026-05-28
likes: 80
collects: 68
tags: []
topic: ""
subtopic: ""
status: pending
---

# Fast-dDrive: 12倍无损加速的自驾VLA

> 作者: @Xiwen | 👍 80 | ⭐ 68
> 来源: https://www.xiaohongshu.com/explore/6a17dd55000000000702be22

---

🥳我们的新工作 Fast-dDrive 正式发布啦！
🚗⚡我们将 Block Diffusion 推进到自动驾驶 VLA 场景，面向“结构化推理 + 轨迹规划”的驾驶输出形式，重新探索高精度规划与高效推理之间的边界。
不同于 AR VLA 逐 token 生成，也不同于 full-sequence diffusion 对整段输出反复去噪，Fast-dDrive 将驾驶响应拆成 critical_objects、explanation、future_meta_behavior、trajectory 等语义 section：section 内双向 refine，section 间严格保持 perceive → reason → plan 的因果顺序。
同时，我们利用自动驾驶模型常见的 JSON-like 结构输出，将确定性的 keys / brackets / punctuation 等结构 token 固定为 frozen scaffold，只让模型生成真正需要预测的 value tokens，从而减少约 30% 解码负担，并保证输出结构天然合法。
我们进一步提出：
* Section-Aware Structured Diffusion：按语义 section 对齐 block，并对安全关键部分进行训练权重和噪声调度设计；
* Scaffold Speculative Decoding：自动接受 scaffold tokens，用 MDM head 并行 draft、AR head verify，在保持生成质量的同时大幅降低推理开销；
* Shared-prefix trajectory rollouts：共享前缀 KV cache，仅对 trajectory section 做低成本多轨迹采样与平均，进一步提升规划稳定性。
实验结果显示：
* 在 WOD-E2E test set 上达到 SOTA ADE@3s / ADE@5s；
* 在 diffusion-based VLAs 中取得最高 RFS；
* 相比 AR 和 full-sequence diffusion baseline，实现 4–6× 吞吐提升；
* 结合 SGLang 后最高达到约 12× throughput speedup；
* 在 nuScenes 上也展现出稳定的跨数据集泛化能力。
论文与项目页已公开，欢迎大家交流，也欢迎转发支持 (star & upvote)～
code: https://github.com/NVlabs/Fast-dLLM (star)
daily papers: https://huggingface.co/papers/2605.23163 (upvote)
project page: https://nvlabs.github.io/Fast-dLLM/fast_ddrive/
arxiv: https://arxiv.org/abs/2605.23163


## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232206/93f6c34b8872a8d571e48a3b1f504f85/notes_pre_post/1040g3k8320mvuf91m86g5pagkt80lf00ru84sng!nd_dft_wgth_webp_3)
*1796×1556*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232206/df7150de53064fccf1f4373d0bad8efc/notes_pre_post/1040g3k8320mvuf91m8605pagkt80lf0010kbc08!nd_dft_wgth_webp_3)
*1816×1222*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232206/089d3e5ca07c7680e310e5323cf9e0df/notes_pre_post/1040g3k8320mvuf91m80g5pagkt80lf00sk006u0!nd_dft_wgth_webp_3)
*1730×1036*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232206/310588107f8d7028b5903ba9ab39aaf6/notes_pre_post/1040g3k8320mvuf91m8105pagkt80lf00undacm0!nd_dft_wgth_webp_3)
*1758×728*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232206/fc22f3e6ab2e3d82c0e920299bc6450e/notes_pre_post/1040g3k8320mvuf91m8405pagkt80lf00b2p4kuo!nd_dft_wgth_webp_3)
*1696×584*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232206/6c980e37f53875110958fd513361e2cd/notes_pre_post/1040g3k8320mvuf91m84g5pagkt80lf00385uut8!nd_dft_wgth_webp_3)
*1756×486*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232206/faba45cc70e8620768682faed366a6ae/notes_pre_post/1040g3k8320mvuf91m81g5pagkt80lf00gg1g3n8!nd_dft_wgth_webp_3)
*1786×1278*

