---
note_id: 699e8567000000001d02407b
title: "如何把ClaudeCode牛马压榨到极致"
author: "continus"
source_url: https://www.xiaohongshu.com/explore/699e8567000000001d02407b
platform: xiaohongshu
date: 2026-02-25
likes: 312
collects: 507
tags: ["vibecoding大赏", "开发", "claude", "claudecode", "claudecode技巧", "Mac", "vibecoding"]
topic: ""
subtopic: ""
status: pending
---

# 如何把ClaudeCode牛马压榨到极致

> 作者: @continus | 👍 312 | ⭐ 507
> 来源: https://www.xiaohongshu.com/explore/699e8567000000001d02407b

---

可以通过 ClaudeCode 的 Notification hooks 添加一段自定义脚本，让它在完成or需要review的时候主动发系统通知/弹框提醒我们。
	
发系统通知的脚本(MacOS)：osascript -e 'display notification "牛马需要你！" with title "老板" sound name    "default"'
	
发系统通知的脚本(Windows)：powershell.exe -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')"
	
发系统通知的脚本(Linux): notify-send 'Claude Code' 'Claude Code needs your attention'
	
弹框的脚本：osascript -e 'display dialog "牛马需要你！" with title "老板" buttons {"这就来"} default button 1'
	
以上脚本的自定义部分按自己需要来修改即可。
#vibecoding大赏[话题]# #开发[话题]# #claude[话题]# #claudecode[话题]# #claudecode技巧[话题]# #Mac[话题]# #vibecoding[话题]#


**标签**: #vibecoding大赏 #开发 #claude #claudecode #claudecode技巧 #Mac #vibecoding

## 图片

![图片1](http://sns-webpic-qc.xhscdn.com/202606232208/27c6f0cf6ac6a7743d8cd762a17dc6d3/spectrum/1040g0k031t121482le005o0pgivg8ndjvauhot0!nd_dft_wlteh_webp_3)
*1011×1348*

