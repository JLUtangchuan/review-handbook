---
note_id: 69abe811000000001b015ffe
title: "图解Claude Code 新出的 /loop 命令"
author: "奥森木"
source_url: https://www.xiaohongshu.com/explore/69abe811000000001b015ffe
platform: xiaohongshu
date: 2026-03-07
likes: 96
collects: 168
tags: ["ClaudeCode", "AI编程", "开发效率", "CodingAgent", "定时任务", "loop", "Anthropic", "开发工具", "自动化", "AgenticEngineering"]
topic: ""
subtopic: ""
status: pending
---

# 图解Claude Code 新出的 /loop 命令

> 作者: @奥森木 | 👍 96 | ⭐ 168
> 来源: https://www.xiaohongshu.com/explore/69abe811000000001b015ffe

---

Claude Code 最近加了定时任务功能，核心就一个命令：/loop。一行话设好，Agent 自己定时重复执行你给的 prompt，不用你盯着。
	
最基本的用法：/loop 5m check if the deployment finished。意思是每 5 分钟自动检查部署状态，有结果了告诉你。时间写法很灵活，前置后置都行，不写默认 10 分钟一次。支持秒、分、时、天四种单位。
	
还能套娃：/loop 20m /review-pr 1234，每 20 分钟自动跑一次 PR review。任何命令和 skill 都能被定时调用。
	
不需要循环的场景可以用一次性提醒，直接说人话：remind me at 3pm to push the release branch，或者 in 45 minutes check whether the integration tests passed。Claude 自己解析时间，生成 cron 表达式，跑完自动删。
	
底层是三个工具：CronCreate 创建任务，CronList 查看任务，CronDelete 取消任务。每个任务有 8 位 ID，每个 session 最多 50 个。管理也不用记命令，直接问 Claude "我有哪些定时任务"或者"取消那个部署检查"就行。
	
几个细节值得注意。第一，有 Jitter 机制，循环任务最多延迟周期的 10%（上限 15 分钟），防止所有人同时打 API。第二，循环任务 3 天自动过期，防止忘了的任务无限跑。第三，定时任务在你的对话间隙触发，Claude 正在回复时不会打断，等当前轮结束再跑。所有时间按本地时区算。
	
最重要的限制：/loop 是 session 级的，关掉终端就没了，不会持久化。如果需要重启不丢、无人值守的定时任务，官方给了两个方案：Desktop Scheduled Tasks（图形化，本地持久）和 GitHub Actions（云端，cron trigger）。
	
简单说就是：临时盯部署、看 PR、等测试、设提醒，用 /loop 就够了。需要长期跑的自动化，走 Desktop Tasks 或 Actions。
#ClaudeCode[话题]# #AI编程[话题]# #开发效率[话题]# #CodingAgent[话题]# #定时任务[话题]# #loop[话题]# #Anthropic[话题]# #开发工具[话题]# #自动化[话题]# #AgenticEngineering[话题]#


**标签**: #ClaudeCode #AI编程 #开发效率 #CodingAgent #定时任务 #loop #Anthropic #开发工具 #自动化 #AgenticEngineering

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232207/d54720d4d9b6ac4bafdf02715618e0f2/1040g00831tdi93s7m25g5pjdpov3cmhnp6sqd40!nd_dft_wlteh_webp_3)
*1529×2048*

![图片2](http://sns-webpic-qc.xhscdn.com/202606232207/ae91dd2aeab6c0094abc10f8d25b06a3/1040g00831tdi93s7m2205pjdpov3cmhnl7s3fv8!nd_dft_wlteh_webp_3)
*1529×2048*

![图片3](http://sns-webpic-qc.xhscdn.com/202606232207/119762642b75dfaf92abc144257e7b72/1040g00831tdi93s7m2605pjdpov3cmhna16s98o!nd_dft_wlteh_webp_3)
*1529×2048*

![图片4](http://sns-webpic-qc.xhscdn.com/202606232207/b31d1ee1c433f73fcb9a47bfc562db62/1040g00831tdi93s7m2505pjdpov3cmhn3rd93f8!nd_dft_wlteh_webp_3)
*1529×2048*

![图片5](http://sns-webpic-qc.xhscdn.com/202606232207/6fa8f82b0444b60251ee17a901d72148/1040g00831tdi93s7m2405pjdpov3cmhnumfdre0!nd_dft_wlteh_webp_3)
*1529×2048*

![图片6](http://sns-webpic-qc.xhscdn.com/202606232207/ce99544500e3ef2833a66c446f1c8af2/1040g00831tdi93s7m22g5pjdpov3cmhnauvs438!nd_dft_wlteh_webp_3)
*1529×2048*

![图片7](http://sns-webpic-qc.xhscdn.com/202606232207/47d72b0f3bf04b0908e0bb8bb3440434/1040g00831tdi93s7m2305pjdpov3cmhncn26kdo!nd_dft_wlteh_webp_3)
*1529×2048*

![图片8](http://sns-webpic-qc.xhscdn.com/202606232207/ca9f26444b9935eb022d36c92496d7dd/1040g00831tdi93s7m26g5pjdpov3cmhn5dhgdao!nd_dft_wlteh_webp_3)
*1529×2048*

