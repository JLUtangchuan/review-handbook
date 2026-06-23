---
id: fnd-week02-norm
title: LayerNorm/RMSNorm/DeepNorm/Pre-LN vs Post-LN 归一化技术演进
type: foundation
week: 2
topics:
- normalization
tags:
- name: LayerNorm
  initial_weight: 1.2
- name: RMSNorm
  initial_weight: 1.4
- name: 归一化
  initial_weight: 1.1
difficulty: 3
status: pending
rating: 0
created_at: '2026-06-22'
updated_at: '2026-06-22'
recommendations:
- fnd-week02-activation
- fnd-week01-transformer-block
sources:
- platform: xiaohongshu
  url: https://www.xiaohongshu.com/explore/650c5d97000000001f00701d
  title: 大模型NLP面试题：LLaMA模型结构
  saved_at: '2026-06-22'
---

# LayerNorm/RMSNorm/DeepNorm/Pre-LN vs Post-LN 归一化技术演进

## 来源
- [xiaohongshu] [大模型NLP面试题：LLaMA模型结构](https://www.xiaohongshu.com/explore/650c5d97000000001f00701d)

## 内容
归一化（Normalization）技术是Transformer训练稳定性的关键。演进路线：
**1. BatchNorm → LayerNorm**： - BatchNorm沿batch维度归一化，不适用于变长序列和batch size小的场景 - LayerNorm沿feature维度归一化，独立于batch size，适合NLP
**2. LayerNorm → RMSNorm**（LLaMA）： - RMSNorm只计算均方根（RMS），去掉了均值中心化 - RMSNorm(x) = x / RMS(x) · γ，其中RMS=√(mean(x²)) - 计算量约为LayerNorm的60-70%，效果相当 - 几乎所有现代LLM（LLaMA/Mistral/Qwen/DeepSeek）都用RMSNorm
**3. DeepNorm**（DeepNet，千层Transformer）： - 在残差连接前对输入做缩放：x + α·Sublayer(LN(x)) - 初始化时α<1，控制残差方差 - 使1000+层Transformer稳定训练成为可能
**4. Pre-LN vs Post-LN**： - Post-LN（原始Transformer）：x + LN(Sublayer(x))，梯度容易发散 - Pre-LN（现代Transformer）：x + Sublayer(LN(x))，梯度流经残差直接传播 - 几乎所有现代LLM使用Pre-LN（实际上Pre-RMSNorm + Residual）
**5. 其他归一化技术**： - QK Norm（Gemma/某些VLM）：对Q、K单独做LayerNorm，防止attention logits过大 - Sandwich Norm（Pre+Post）：Pre-LN + Post-LN组合，一些大模型使用


## 关键要点
- {'LayerNorm': 'y = (x-μ)/σ · γ + β，两个统计量+两个可学习参数'}
- {'RMSNorm': 'y = x/√(mean(x²)+ε) · γ，只有RMS统计量+一个可学习参数（无β bias）'}
- RMSNorm去掉re-centering的原因：实证表明中心化对性能影响极小，去掉减少计算量
- {'DeepNorm': 'x_{l+1} = x_l + α·F(LN(x_l))，α在初始化时<1控制方差'}
- Pre-LN优势：梯度从顶层通过残差直达底层，训练更稳定，允许更大学习率
- {'QK Norm': '对Q和K的head维度做归一化，防止attention logits过大导致softmax饱和'}
- 层归一化位置影响：Pre-LN对Sublayer输入做归一化，Post-LN对输出做归一化

## 自测问题
- RMSNorm相比LayerNorm去掉了什么？为什么不影响性能？
- Pre-LN vs Post-LN的训练稳定性差异的根本原因？
- DeepNorm如何解决千层Transformer的训练问题？
- QK Norm的使用场景？什么时候需要？

## 图片
![LLaMA结构中的RMSNorm](http://sns-webpic-qc.xhscdn.com/202606222257/07c548f48af47a52f60cddafcf98c8df/1040g00830p9old0ojs005n1f8vhhntdmqgeebuo!nc_n_webp_mw_1)
*LLaMA结构中的RMSNorm*

## 相关笔记
- [[fnd-week02-activation]]
- [[fnd-week01-transformer-block]]
