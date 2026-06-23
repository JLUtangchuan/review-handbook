---
title: "完整GRPO训练流程：一个具体例子"
author: "菠菜大帝"
source_url: https://zhuanlan.zhihu.com/p/2010761168512368956
platform: zhihu
collection: "学习收藏"
collection_url: https://www.zhihu.com/collection/713057152
topic: ""
subtopic: ""
status: pending
---

# 完整GRPO训练流程：一个具体例子

> 作者: 菠菜大帝 | 来源: https://zhuanlan.zhihu.com/p/2010761168512368956

---

场景设定

\begin{array}{|l|l|} \hline \text{项目} & \text{内容} \\ \hline \text{Prompt} & \text{“解方程：$2x + 6 = 14$，求x”} \\ \hline \text{采样数} & K = 4 \text{（每个prompt生成4个回答）} \\ \hline \text{超参数} & \epsilon = 0.2 \text{（裁剪范围）}, \beta = 0.01 \text{（KL惩罚系数）} \\ \hline \text{学习率} & \alpha = 10^{-5} \\ \hline \end{array}

Step 1: 旧策略采样4个回答

从旧策略 \pi_{\text{old}} 对同一prompt采样4个回答，并计算奖励（规则奖励：正确+1.0，过程完整+0.2）：

样本	内容	正确性	过程分	总奖励 r_i
o_1	“2x = 14-6 = 8，所以 x = 4”	✓	+0.2	1.2
o_2	“x = (14+6)/2 = 10”	✗	+0.2	0.2
o_3	“2x = 14-6 = 8，x = 8⁄2 = 4”	✓	+0.2	1.2
o_4	“3”	✗	0	0.0
Step 2: 计算组内统计量与优势

均值 \mu = \frac{1.2+0.2+1.2+0.0}{4} = 0.65
标准差 \sigma = \sqrt{\frac{(1.2-0.65)^2+(0.2-0.65)^2+(1.2-0.65)^2+(0.0-0.65)^2}{3}} \approx 0.6403

优势（整个序列共享）：

A_i = \frac{r_i - \mu}{\sigma}




A_1 = \frac{1.2-0.65}{0.6403} \approx 0.859
A_2 = \frac{0.2-0.65}{0.6403} \approx -0.703
A_3 \approx 0.859
A_4 = \frac{0.0-0.65}{0.6403} \approx -1.015
Step 3: 记录每个回答的token级旧策略log概率与参考策略log概率

为简洁，每个token的log概率用数值示例（实际中由模型前向得到）。

回答 o_1（10个token）
token	旧策略logπ_old	参考策略logπ_ref
“2x”	-0.223	-0.511
“=”	-0.105	-0.223
“14-6”	-0.357	-0.693
“=”	-0.105	-0.223
“8”	-0.288	-0.357
“,”	-0.357	-0.511
“so”	-0.511	-0.693
“x”	-0.223	-0.357
“=”	-0.105	-0.223
“4”	-0.223	-0.357
回答 o_2（9个token）
token	旧策略logπ_old	参考策略logπ_ref
“x”	-0.357	-0.511
“=”	-0.105	-0.223
“(”	-0.693	-0.916
“14+6”	-0.511	-0.693
“)”	-0.693	-0.916
“/”	-0.511	-0.693
“2”	-0.357	-0.511
“=”	-0.105	-0.223
“10”	-0.223	-0.357
回答 o_3（11个token）
token	旧策略logπ_old	参考策略logπ_ref
“2x”	-0.223	-0.511
“=”	-0.105	-0.223
“14-6”	-0.357	-0.693
“=”	-0.105	-0.223
“8”	-0.288	-0.357
“,”	-0.357	-0.511
“x”	-0.223	-0.357
“=”	-0.105	-0.223
“8/2”	-0.693	-0.916
“=”	-0.105	-0.223
“4”	-0.223	-0.357
回答 o_4（1个token）
token	旧策略logπ_old	参考策略logπ_ref
“3”	-0.693	-1.204
Step 4: 新策略前向，得到每个token的新log概率

假设新策略 \pi_\theta 更新后（基于当前梯度）产生如下log概率：

o_1 新log概率

[-0.105, -0.051, -0.223, -0.051, -0.182, -0.223, -0.357, -0.105, -0.051, -0.105]

o_2 新log概率

[-0.511, -0.223, -0.916, -0.693, -0.916, -0.693, -0.511, -0.223, -0.357]

o_3 新log概率

[-0.105, -0.051, -0.223, -0.051, -0.182, -0.223, -0.105, -0.051, -0.511, -0.051, -0.105]

o_4 新log概率

[-1.204]

Step 5: 计算每个token的重要性采样比 \rho_{i,t}

\rho_{i,t} = \exp\big(\log\pi_\theta(o_{i,t}) - \log\pi_{\text{old}}(o_{i,t})\big)

结果如下（部分保留两位小数）：

样本	token	\rho_{i,t}
o_1	所有token	[1.13, 1.06, 1.14, 1.06, 1.11, 1.14, 1.17, 1.13, 1.06, 1.13]
o_2	所有token	[0.86, 0.89, 0.80, 0.83, 0.80, 0.83, 0.86, 0.89, 0.88]
o_3	所有token	[1.13, 1.06, 1.14, 1.06, 1.11, 1.14, 1.13, 1.06, 1.20, 1.06, 1.13]
o_4	“3”	0.60
Step 6: 计算每个token的clipped surrogate损失

对每个token应用PPO-Clip：

\ell_{i,t} = \min\big( \rho_{i,t} A_i,\; \text{clip}(\rho_{i,t}, 1-\epsilon, 1+\epsilon)\, A_i \big)

其中 \epsilon=0.2，clip区间 [0.8, 1.2]，A_i 对整个序列相同。

然后对每个序列的token损失取平均（避免长度影响），再对组内所有序列平均，得到 actor损失项（注意：优化时我们通常最小化负的该项，所以最终actor损失为负的平均值）。

序列 o_1 (A_1=0.859)

所有 \rho 均 ≤1.2，因此 clip 后即本身。 token损失均值 ≈ \frac{1}{10}\sum \rho_{1,t} \times 0.859
\sum \rho_{1,t} \approx 11.13，均值=1.113，序列损失 = 1.113×0.859 ≈ 0.956

序列 o_2 (A_2=-0.703)

所有 \rho 均 ≥0.8，clip后即本身。 \sum \rho_{2,t} \approx 7.64，均值=0.849，序列损失 = 0.849×(-0.703) ≈ -0.597

序列 o_3 (A_3=0.859)

所有 \rho 均 ≤1.2，clip后即本身。 \sum \rho_{3,t} \approx 12.22，均值=1.111，序列损失 ≈ 0.954

序列 o_4 (A_4=-1.015)

\rho=0.6，clip后为0.8。 原 \rho A = 0.6\times(-1.015) = -0.609，clip后 0.8\times(-1.015) = -0.812，取 min → -0.812

组内平均actor损失

\bar{L}_{\text{actor}} = \frac{0.956 - 0.597 + 0.954 - 0.812}{4} = \frac{0.501}{4} = 0.12525

最终用于梯度下降的actor损失部分为 -\bar{L}_{\text{actor}} = -0.12525（因为我们要最大化 \bar{L}_{\text{actor}}）。

Step 7: 计算KL散度惩罚（token级别）

使用蒙特卡洛估计：对每个token，计算 \log\pi_\theta - \log\pi_{\text{ref}}，然后对序列求和并平均，得到每个序列的平均KL，再对组平均。

序列 o_1

各token的 \log\pi_\theta - \log\pi_{\text{ref}}： [0.406, 0.172, 0.470, 0.172, 0.175, 0.288, 0.336, 0.252, 0.172, 0.252]
求和=2.695，长度10，平均KL₁ = 0.2695

序列 o_2

差全为0（因为新策略log概率与参考相同），平均KL₂ = 0

序列 o_3

差：[0.406, 0.172, 0.470, 0.172, 0.175, 0.288, 0.252, 0.172, 0.405, 0.172, 0.252]
求和=2.936，长度11，平均KL₃ ≈ 0.2669

序列 o_4

差=0（新log概率-1.204，参考-1.204），平均KL₄ = 0

组内平均KL

\bar{KL} = \frac{0.2695 + 0 + 0.2669 + 0}{4} = 0.1341

KL惩罚项 = \beta \times \bar{KL} = 0.01 \times 0.1341 = 0.001341

Step 8: 总损失与参数更新

总损失（最小化）：

\mathcal{L}_{\text{total}} = -\bar{L}_{\text{actor}} + \beta \bar{KL} = -0.12525 + 0.001341 = -0.123909




使用梯度下降更新策略网络参数：

\theta \leftarrow \theta - \alpha \nabla_\theta \mathcal{L}_{\text{total}}

（实际更新时 \nabla_\theta \mathcal{L}_{\text{total}} 通过反向传播计算）

Step 9: 预期效果分析
正优势样本 o_1, o_3：其token的 \rho>1，但被clip在1.2内，因此概率适度提升。
负优势样本 o_2：\rho<1但被clip在0.8以上，概率适度降低。
最差样本 o_4：\rho=0.6被clip到0.8，概率下降幅度受控，避免过于剧烈。
KL惩罚项防止新策略偏离参考策略过远，保持生成稳定性。




为了便于理解，这里有些部分简化了计算过程，不一致的部分以原论文为准即可。
搭配食用效果更佳：


## 图片

![图片](https://pica.zhimg.com/v2-ddf658f2e6ef81ef4a5c8a6a53e2abf9_l.jpg?source=32738c0c&needBackground=1)

![图片](https://pic1.zhimg.com/v2-d156bff4447fb424169aac60ba719a74_l.jpg?source=32738c0c&needBackground=1)

![图片](https://picx.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/v2-abed1a8c04700ba7d72b45195223e0ff_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-28ed4e0922902c016eabd45299097a9d_l.jpg?source=06d4cd63)

![图片](https://pic2.zhimg.com/v2-419a1a3ed02b7cfadc20af558aabc897.png)

![图片](https://picx.zhimg.com/v2-9071f1f4bb45487ffc187af6eaf0210d_l.jpg?source=06d4cd63)

![图片](https://pic1.zhimg.com/f0c84682f5945f3253c34a6dadefe15d_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/008f88faabd5f88ec9286e50dce32a96_l.jpg?source=06d4cd63)

![图片](https://picx.zhimg.com/v2-fc789708be56ae1ded9f8571713afcae_l.jpg?source=06d4cd63)

![图片](https://pic4.zhimg.com/v2-bffb2bf11422c5ef7d8949788114c2ab.png)

![图片](https://pica.zhimg.com/v2-94919ad395a0f19788b0cbcffd8a3429_250x0.jpg?source=172ae18b)

![图片](https://picx.zhimg.com/v2-47324e29989090c4b4a3115ffd2b58cb_250x0.jpg?source=172ae18b)

