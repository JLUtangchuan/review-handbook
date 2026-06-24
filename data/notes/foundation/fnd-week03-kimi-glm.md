---
id: fnd-week03-kimi-glm
title: Kimi-MoE与GLM-4技术架构对比
type: foundation
week: 3
topics:
  - llm-architecture
tags:
  - name: MoE
    initial_weight: 1.4
  - name: 技术报告
    initial_weight: 1.2
  - name: Kimi
    initial_weight: 1.3
  - name: GLM
    initial_weight: 1.2
difficulty: 3
status: completed
rating: 1
created_at: '2026-06-22'
updated_at: '2026-06-24'
recommendations:
  - fnd-week03-deepseek
sources:
  - platform: xiaohongshu
    url: https://www.xiaohongshu.com/explore/6772845b000000000b00fc8d
    title: 年度最牛逼论文：DeepSeek-V3技术报告
    saved_at: '2026-06-22'
---

# Kimi-MoE与GLM-4技术架构对比

## 来源
- [xiaohongshu] [年度最牛逼论文：DeepSeek-V3技术报告](https://www.xiaohongshu.com/explore/6772845b000000000b00fc8d)

## 内容
## 来源
- [xiaohongshu] [年度最牛逼论文：DeepSeek-V3技术报告](https://www.xiaohongshu.com/explore/6772845b000000000b00fc8d)

## 内容
国内三强大模型技术路线对比：
**DeepSeek V3**： - 架构：MLA + DeepSeekMoE（细粒度+共享专家） - 参数：671B总/37B激活 - 创新点：FP8训练、Multi-Token Prediction、DualPipe、Aux-loss-free load balance - 成本：$5.5M训练，推理成本极低（MLA的KV压缩）
**Kimi（Moonshot）— MoE路线**： - 架构：Transformer + MoE，重点在大规模长上下文（支持128K→1M tokens） - Kimi K2采用MoE架构，总参数量达1T级别 - 核心创新：长上下文扩展技术（Long2Short、位置编码优化）、高效MoE路由 - 与DeepSeek对比：更侧重长上下文能力，MoE路由策略不同
**GLM-4（智谱）— All-Task路线**： - 架构：标准Dense Transformer（非MoE），注重通用能力 - GLM-4-Plus版本对标GPT-4 - 核心创新：RLHF后训练（ChatGLM的技术积累）、多模态扩展（CogView+CogVLM） - 与MoE路线对比：Dense模型推理更简单（无专家调度），但模型容量受限
**三条路线的核心trade-off**： - DeepSeek：极致效率（训练+推理成本最低），技术最激进 - Kimi：长上下文优先（应用场景差异化），MoE规模化 - GLM：通用能力优先（All-task），稳健迭代


## 关键要点
- DeepSeek独占MLA技术，KV Cache效率领先同行2-5倍
- Kimi长上下文技术栈：位置编码外推+注意力改造+长文本训练策略
- GLM坚守Dense路线，强调通用能力与多模态融合
- MoE vs Dense的核心trade-off：专家容量/路由偏差 vs 参数效率
- 三家训练数据来源与配比差异显著（DeepSeek强调数学/代码数据）
- 开源策略：DeepSeek完全开源→推动社区生态，GLM开源部分版本

## 自测问题
- 为什么DeepSeek采用MoE而GLM坚持Dense？各自的考量是什么？
- Kimi的超长上下文（128K+）技术栈包含哪些关键组件？
- 三家模型的技术路线反映了对大模型发展的什么判断差异？

## 图片
![DeepSeek V3技术报告精华](http://sns-webpic-qc.xhscdn.com/202606222257/e8e1c256229729de7bbbcfed18acc416/notes_pre_post/1040g3k031c1gqskkh0005no10lvg8f4hia26e1o!nc_n_webp_mw_1)
*DeepSeek V3技术报告精华*

## 相关笔记
- [[fnd-week03-deepseek]]

## 相关笔记
- [[fnd-week03-deepseek]]
