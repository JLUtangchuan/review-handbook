---
title: "百面LLM-86"
author: "swtheking"
source_url: https://zhuanlan.zhihu.com/p/15337163035
platform: zhihu
column: c_1747590116120698880
topic: "attention-arch"
status: pending
---

# 百面LLM-86

> @swtheking | https://zhuanlan.zhihu.com/p/15337163035

---

提问：什么是PagedAttention？

回答：

分页注意力（PagedAttention）是一种专门设计用来提高Transformer模型中传统注意力机制效率的方法，特别是用于处理长序列数据。在传统的自注意力机制中，计算和内存的复杂度随序列长度呈二次方增长，这使得处理非常长的序列变得不切实际。分页注意力通过将输入序列分割成可管理的“小页”或块来解决这个问题。每一页单独使用注意力进行处理，然后将结果进行组合，以一种近似于完全注意力的方法减少计算需求。

以下是关于分页注意力工作原理的更详细解释：

1. 分页分割：将输入序列分割成若干个更小的、非重叠的段，称为页或块，每个页的长度为固定长度 
𝑃
 。例如，如果序列总长度为 
𝐿
 ，并且我们将其分为 
𝑁
 个页，那么 
𝑃
=
𝐿
𝑁
 。

2. 页内局部注意力：在每个页内分别进行自注意力计算。这意味着在一个页内，每个token都仅与同页的其它token进行注意力计算，而不与其它页中的token进行计算。这将计算复杂度从 
𝑂
(
𝐿
2
)
 减少到 
𝑂
(
𝑁
⋅
𝑃
2
)
 。

3. 跨页通信：为了确保不同页之间的信息能够共享，采用了以下机制：

跨页token：引入一组特殊的token，这些token可以与所有页进行注意力计算，并且所有页都可以与这些token进行注意力计算。这允许全局信息交换。

稀疏注意力模式：使用稀疏或分段注意力技术，使得某些页内的token可以与相邻页的token进行注意力计算（允许通过多个注意力层扩展更大的感受野）。

4. 结果合并：将每页内计算得出的注意力结果进行组合以形成最终的输出序列。这个合并步骤可能涉及进一步的处理，如连接输出并应用附加的变换。

数学表述

设 
𝑋
 为长度为 
𝐿
 的输入序列，各个页记为 
𝑋
𝑖
 ：

𝑋
=
[
𝑋
1
,
𝑋
2
,
…
,
𝑋
𝑁
]

其中 
𝑋
𝑖
 是长度为 
𝑃
 的子序列。

每页内的注意力计算公式为：

𝐴
𝑖
=
Softmax
(
𝑄
𝑖
𝐾
𝑖
𝑇
𝑑
𝑘
)
𝑉
𝑖

其中 \mathbf{Q}_i, \mathbf{K}_i, \mathbf{V}_i 分别为第i页的查询矩阵、键矩阵和值矩阵， d_k 为键向量的维度。

组合输出为：

\[ \mathbf{Y} = [\mathbf{Y}_1, \mathbf{Y}_2, \ldots, \mathbf{Y}_N] \]

这种机制确保分页注意力能够处理非常长的序列，而不会导致计算和内存复杂度呈指数增长。

## 图片

![图](https://pica.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=32738c0c&needBackground=1)

![图](https://picx.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)

![图](https://picx.zhimg.com/v2-0e3b67907df149b1c63c67940e2959bb_l.jpg?source=172ae18b)

![图](https://pica.zhimg.com/v2-2ddc5cc683982648f6f123616fb4ec09_l.png?source=32738c0c)

![图](https://pica.zhimg.com/v2-ba83c35a01d8832d0df01f2cef806714.webp?source=7e7ef6e2&needBackground=1)

![图](https://pic4.zhimg.com/v2-d0f434e541f7e583d3255b64da1a5a77.webp)

